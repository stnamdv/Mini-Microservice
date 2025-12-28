using MongoDB.Driver;
using InventoryService.Models;

namespace InventoryService.Services;

public class InventoryService
{
    private readonly IMongoCollection<Inventory> _inventory;

    public InventoryService(IConfiguration config)
    {
        var settings = config.GetSection("MongoDbSettings").Get<MongoDbSettings>();
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _inventory = database.GetCollection<Inventory>("inventory");
    }

    public async Task<List<Inventory>> GetAsync() =>
        await _inventory.Find(_ => true).ToListAsync();

    public async Task<Inventory?> GetByProductIdAsync(string productId) =>
        await _inventory.Find(x => x.ProductId == productId).FirstOrDefaultAsync();

    public async Task<Inventory> CreateAsync(Inventory inventory)
    {
        inventory.UpdatedAt = DateTime.UtcNow;
        await _inventory.InsertOneAsync(inventory);
        return inventory;
    }

    public async Task UpdateAsync(string productId, Inventory inventoryIn)
    {
        inventoryIn.UpdatedAt = DateTime.UtcNow;
        await _inventory.ReplaceOneAsync(x => x.ProductId == productId, inventoryIn);
    }

    public async Task<bool> ReserveStockAsync(string productId, int quantity)
    {
        var filter = Builders<Inventory>.Filter.Eq(x => x.ProductId, productId);
        var inventory = await _inventory.Find(filter).FirstOrDefaultAsync();

        if (inventory == null || inventory.AvailableQuantity < quantity)
        {
            return false; // Insufficient stock
        }

        var update = Builders<Inventory>.Update
            .Inc(x => x.ReservedQuantity, quantity)
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        var result = await _inventory.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> ConfirmStockReservationAsync(string productId, int quantity)
    {
        var filter = Builders<Inventory>.Filter.Eq(x => x.ProductId, productId);
        var inventory = await _inventory.Find(filter).FirstOrDefaultAsync();

        if (inventory == null || inventory.ReservedQuantity < quantity)
        {
            return false; // Not enough reserved stock
        }

        var update = Builders<Inventory>.Update
            .Inc(x => x.Quantity, -quantity)
            .Inc(x => x.ReservedQuantity, -quantity)
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        var result = await _inventory.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    public async Task ReleaseStockReservationAsync(string productId, int quantity)
    {
        var filter = Builders<Inventory>.Filter.Eq(x => x.ProductId, productId);
        var update = Builders<Inventory>.Update
            .Inc(x => x.ReservedQuantity, -quantity)
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        await _inventory.UpdateOneAsync(filter, update);
    }
}
