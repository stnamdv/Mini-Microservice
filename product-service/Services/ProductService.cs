using MongoDB.Driver;
using ProductService.Models;

namespace ProductService.Services;

public class ProductService
{
    private readonly IMongoCollection<Product> _products;

    public ProductService(IConfiguration config)
    {
        var settings = config.GetSection("MongoDbSettings").Get<MongoDbSettings>();
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _products = database.GetCollection<Product>("products");
    }

    public async Task<List<Product>> GetAsync() =>
        await _products.Find(_ => true).ToListAsync();

    public async Task<Product?> GetAsync(string id) =>
        await _products.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<Product> CreateAsync(Product product)
    {
        product.CreatedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;
        await _products.InsertOneAsync(product);
        return product;
    }

    public async Task UpdateAsync(string id, Product productIn)
    {
        productIn.UpdatedAt = DateTime.UtcNow;
        await _products.ReplaceOneAsync(x => x.Id == id, productIn);
    }

    public async Task RemoveAsync(string id) =>
        await _products.DeleteOneAsync(x => x.Id == id);
}
