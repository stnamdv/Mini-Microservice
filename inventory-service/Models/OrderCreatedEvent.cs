namespace InventoryService.Models;

public class OrderCreatedEvent
{
    public string OrderId { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public List<OrderItemEvent> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class OrderItemEvent
{
    public string ProductId { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
