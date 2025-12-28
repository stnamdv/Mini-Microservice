using MongoDB.Driver;
using OrderService.Models;

namespace OrderService.Services;

public class OrderService
{
    private readonly IMongoCollection<Order> _orders;

    public OrderService(IConfiguration config)
    {
        var settings = config.GetSection("MongoDbSettings").Get<MongoDbSettings>();
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _orders = database.GetCollection<Order>("orders");
    }

    public async Task<List<Order>> GetAsync() =>
        await _orders.Find(_ => true).ToListAsync();

    public async Task<Order?> GetAsync(string id) =>
        await _orders.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<Order> CreateAsync(Order order)
    {
        order.CreatedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;
        await _orders.InsertOneAsync(order);
        return order;
    }

    public async Task UpdateAsync(string id, Order orderIn)
    {
        orderIn.UpdatedAt = DateTime.UtcNow;
        await _orders.ReplaceOneAsync(x => x.Id == id, orderIn);
    }

    public async Task RemoveAsync(string id) =>
        await _orders.DeleteOneAsync(x => x.Id == id);
}
