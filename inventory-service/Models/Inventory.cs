using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace InventoryService.Models;

public class Inventory
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("productId")]
    public required string ProductId { get; set; }

    [BsonElement("productName")]
    public required string ProductName { get; set; }

    [BsonElement("quantity")]
    public int Quantity { get; set; }

    [BsonElement("reservedQuantity")]
    public int ReservedQuantity { get; set; }

    [BsonElement("availableQuantity")]
    public int AvailableQuantity => Quantity - ReservedQuantity;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class MongoDbSettings
{
    public required string ConnectionString { get; set; }
    public required string DatabaseName { get; set; }
}

public class KafkaSettings
{
    public required string BootstrapServers { get; set; }
    public required string GroupId { get; set; }
    public required string Topic { get; set; }
    public required string AutoOffsetReset { get; set; }
}
