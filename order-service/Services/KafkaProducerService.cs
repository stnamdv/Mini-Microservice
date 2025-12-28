using Confluent.Kafka;
using OrderService.Events;
using OrderService.Models;

namespace OrderService.Services;

public class KafkaProducerService
{
    private readonly IConfiguration _config;
    private readonly ILogger<KafkaProducerService> _logger;

    public KafkaProducerService(IConfiguration config, ILogger<KafkaProducerService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task PublishOrderCreatedEventAsync(OrderCreatedEvent orderEvent)
    {
        var kafkaSettings = _config.GetSection("KafkaSettings").Get<KafkaSettings>();

        var config = new ProducerConfig
        {
            BootstrapServers = kafkaSettings.BootstrapServers,
            Acks = Acks.All,
            EnableIdempotence = true,
            MessageTimeoutMs = 30000,
            RequestTimeoutMs = 30000,
            RetryBackoffMs = 500,
            ReconnectBackoffMs = 1000,
            ReconnectBackoffMaxMs = 10000
        };

        using var producer = new ProducerBuilder<Null, string>(config).Build();

        try
        {
            var message = new Message<Null, string>
            {
                Value = System.Text.Json.JsonSerializer.Serialize(orderEvent)
            };

            var result = await producer.ProduceAsync(kafkaSettings.Topic, message);

            _logger.LogInformation($"OrderCreated event published to Kafka. Topic: {kafkaSettings.Topic}, Offset: {result.Offset}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish OrderCreated event to Kafka");
            throw;
        }
    }
}
