using InventoryService.Consumers;
using InventoryService.Services;
using InventoryService.Models;

IHost host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((context, services) =>
    {
        services.AddHostedService<OrderCreatedConsumer>();

        // MongoDB Configuration
        services.Configure<MongoDbSettings>(
            context.Configuration.GetSection("MongoDbSettings"));

        services.AddSingleton<InventoryService.Services.InventoryService>();
    })
    .Build();

await host.RunAsync();
