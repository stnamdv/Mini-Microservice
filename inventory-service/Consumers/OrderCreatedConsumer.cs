using Confluent.Kafka;
using InventoryService.Models;
using InventoryService.Services;

namespace InventoryService.Consumers;

public class OrderCreatedConsumer : BackgroundService
{
    private readonly ILogger<OrderCreatedConsumer> _logger;
    private readonly IConfiguration _config;
    private readonly InventoryService.Services.InventoryService _inventoryService;

    public OrderCreatedConsumer(
        ILogger<OrderCreatedConsumer> logger,
        IConfiguration config,
        InventoryService.Services.InventoryService inventoryService)
    {
        _logger = logger;
        _config = config;
        _inventoryService = inventoryService;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var kafkaSettings = _config.GetSection("KafkaSettings").Get<KafkaSettings>();

        var config = new ConsumerConfig
        {
            BootstrapServers = kafkaSettings.BootstrapServers,
            GroupId = kafkaSettings.GroupId,
            AutoOffsetReset = Enum.Parse<AutoOffsetReset>(kafkaSettings.AutoOffsetReset),
            EnableAutoCommit = true,
            AutoCommitIntervalMs = 5000,
            SessionTimeoutMs = 30000,
            HeartbeatIntervalMs = 3000,
            EnablePartitionEof = true
        };

        using var consumer = new ConsumerBuilder<Ignore, string>(config).Build();

        consumer.Subscribe(kafkaSettings.Topic);

        _logger.LogInformation($"Started consuming from topic: {kafkaSettings.Topic}");

        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var consumeResult = consumer.Consume(stoppingToken);

                    if (consumeResult.Message != null)
                    {
                        _logger.LogInformation($"Received message at offset: {consumeResult.Offset}");

                        var orderEvent = System.Text.Json.JsonSerializer.Deserialize<OrderCreatedEvent>(
                            consumeResult.Message.Value);

                        if (orderEvent != null)
                        {
                            await ProcessOrderCreatedEventAsync(orderEvent);
                        }
                    }
                }
                catch (ConsumeException ex)
                {
                    _logger.LogError(ex, "Error consuming message");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing message");
                }
            }
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("Consumer operation cancelled");
        }
        finally
        {
            consumer.Close();
        }
    }

    private async Task ProcessOrderCreatedEventAsync(OrderCreatedEvent orderEvent)
    {
        _logger.LogInformation($"Processing OrderCreated event for OrderId: {orderEvent.OrderId}");

        bool allItemsProcessed = true;

        foreach (var item in orderEvent.Items)
        {
            try
            {
                var success = await _inventoryService.ReserveStockAsync(item.ProductId, item.Quantity);

                if (!success)
                {
                    _logger.LogWarning($"Failed to reserve stock for ProductId: {item.ProductId}, Quantity: {item.Quantity}");
                    allItemsProcessed = false;

                    // Release any previously reserved stock for this order
                    foreach (var previousItem in orderEvent.Items)
                    {
                        if (previousItem.ProductId != item.ProductId)
                        {
                            await _inventoryService.ReleaseStockReservationAsync(previousItem.ProductId, previousItem.Quantity);
                        }
                    }
                    break;
                }
                else
                {
                    _logger.LogInformation($"Reserved {item.Quantity} units of ProductId: {item.ProductId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing inventory for ProductId: {item.ProductId}");
                allItemsProcessed = false;
                break;
            }
        }

        if (allItemsProcessed)
        {
            // Confirm all reservations (reduce actual stock)
            foreach (var item in orderEvent.Items)
            {
                await _inventoryService.ConfirmStockReservationAsync(item.ProductId, item.Quantity);
                _logger.LogInformation($"Confirmed stock reduction for ProductId: {item.ProductId}, Quantity: {item.Quantity}");
            }

            _logger.LogInformation($"Successfully processed inventory for OrderId: {orderEvent.OrderId}");
        }
        else
        {
            _logger.LogWarning($"Failed to process inventory for OrderId: {orderEvent.OrderId} - Insufficient stock");
        }
    }
}
