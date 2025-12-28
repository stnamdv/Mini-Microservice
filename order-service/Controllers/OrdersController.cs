using Microsoft.AspNetCore.Mvc;
using OrderService.Models;
using OrderService.Services;
using OrderService.Events;

namespace OrderService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly OrderService.Services.OrderService _orderService;
    private readonly KafkaProducerService _kafkaProducer;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(
        OrderService.Services.OrderService orderService,
        KafkaProducerService kafkaProducer,
        ILogger<OrdersController> logger)
    {
        _orderService = orderService;
        _kafkaProducer = kafkaProducer;
        _logger = logger;
    }

    [HttpGet]
    public async Task<List<Order>> Get() =>
        await _orderService.GetAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> Get(string id)
    {
        var order = await _orderService.GetAsync(id);

        if (order is null)
        {
            return NotFound();
        }

        return order;
    }

    [HttpPost]
    public async Task<IActionResult> Post(OrderRequest orderRequest)
    {
        try
        {
            // Calculate total amount
            decimal totalAmount = 0;
            var orderItems = new List<OrderItem>();

            foreach (var item in orderRequest.Items)
            {
                // Note: In a real scenario, you would fetch product details from Product Service
                // For now, we'll assume the unit price is provided or we need to call Product Service
                // For this demo, we'll use a placeholder price calculation
                var unitPrice = 10.00m; // This should come from Product Service
                var totalPrice = unitPrice * item.Quantity;

                orderItems.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    ProductName = $"Product {item.ProductId}", // Should come from Product Service
                    Quantity = item.Quantity,
                    UnitPrice = unitPrice,
                    TotalPrice = totalPrice
                });

                totalAmount += totalPrice;
            }

            // Create order
            var order = new Order
            {
                CustomerId = orderRequest.CustomerId,
                CustomerEmail = orderRequest.CustomerEmail,
                Items = orderItems,
                TotalAmount = totalAmount,
                Status = OrderStatus.PENDING,
                ShippingAddress = orderRequest.ShippingAddress
            };

            var createdOrder = await _orderService.CreateAsync(order);

            // Publish OrderCreated event to Kafka
            var orderEvent = new OrderCreatedEvent
            {
                OrderId = createdOrder.Id!,
                CustomerId = createdOrder.CustomerId,
                Items = createdOrder.Items.Select(item => new OrderItemEvent
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity
                }).ToList(),
                CreatedAt = createdOrder.CreatedAt
            };

            // Fire and forget - don't wait for Kafka
            _ = Task.Run(() => _kafkaProducer.PublishOrderCreatedEventAsync(orderEvent));

            _logger.LogInformation($"Order {createdOrder.Id} created successfully. Total: {totalAmount}");

            return CreatedAtAction(nameof(Get), new { id = createdOrder.Id }, new
            {
                orderId = createdOrder.Id,
                status = "Order placed successfully",
                totalAmount = createdOrder.TotalAmount,
                message = "Your order has been placed and will be processed shortly."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create order");
            return StatusCode(500, new { message = "Failed to create order", error = ex.Message });
        }
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] OrderStatus status)
    {
        var existingOrder = await _orderService.GetAsync(id);

        if (existingOrder is null)
        {
            return NotFound();
        }

        existingOrder.Status = status;
        await _orderService.UpdateAsync(id, existingOrder);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var order = await _orderService.GetAsync(id);

        if (order is null)
        {
            return NotFound();
        }

        await _orderService.RemoveAsync(id);

        return NoContent();
    }
}
