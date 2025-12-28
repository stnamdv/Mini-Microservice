using InventoryService.Consumers;
using InventoryService.Services;

IHost host = Host.CreateDefaultBuilder(args)
    .ConfigureServices(services =>
    {
        services.AddHostedService<OrderCreatedConsumer>();

        // MongoDB Configuration
        services.Configure<MongoDbSettings>(
            builder.Configuration.GetSection("MongoDbSettings"));

        services.AddSingleton<InventoryService.Services.InventoryService>();
    })
    .Build();

await host.RunAsync();
