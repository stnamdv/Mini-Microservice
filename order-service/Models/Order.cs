using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace OrderService.Models;

public enum OrderStatus
{
    PENDING,
    CONFIRMED,
    SHIPPED,
    DELIVERED,
    CANCELLED
}

public class OrderItem
{
    [BsonElement("productId")]
    public required string ProductId { get; set; }

    [BsonElement("productName")]
    public required string ProductName { get; set; }

    [BsonElement("quantity")]
    public int Quantity { get; set; }

    [BsonElement("unitPrice")]
    public decimal UnitPrice { get; set; }

    [BsonElement("totalPrice")]
    public decimal TotalPrice { get; set; }
}

public class Order
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("customerId")]
    public required string CustomerId { get; set; }

    [BsonElement("customerEmail")]
    public required string CustomerEmail { get; set; }

    [BsonElement("items")]
    public required List<OrderItem> Items { get; set; }

    [BsonElement("totalAmount")]
    public decimal TotalAmount { get; set; }

    [BsonElement("status")]
    public OrderStatus Status { get; set; } = OrderStatus.PENDING;

    [BsonElement("shippingAddress")]
    public required string ShippingAddress { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class OrderRequest
{
    public required string CustomerId { get; set; }
    public required string CustomerEmail { get; set; }
    public required List<OrderItemRequest> Items { get; set; }
    public required string ShippingAddress { get; set; }
}

public class OrderItemRequest
{
    public required string ProductId { get; set; }
    public int Quantity { get; set; }
}

public class MongoDbSettings
{
    public required string ConnectionString { get; set; }
    public required string DatabaseName { get; set; }
}

public class KafkaSettings
{
    public required string BootstrapServers { get; set; }
    public required string Topic { get; set; }
}
