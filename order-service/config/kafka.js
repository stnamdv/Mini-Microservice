const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'order-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const producer = kafka.producer();

const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('Kafka Producer connected');
  } catch (error) {
    console.error('Error connecting Kafka producer:', error);
    // Don't exit process, allow service to continue without Kafka
  }
};

const disconnectProducer = async () => {
  try {
    await producer.disconnect();
    console.log('Kafka Producer disconnected');
  } catch (error) {
    console.error('Error disconnecting Kafka producer:', error);
  }
};

const sendOrderCreatedEvent = async (orderData) => {
  try {
    const event = {
      orderId: orderData._id.toString(),
      customerId: orderData.customerId,
      items: orderData.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      createdAt: orderData.createdAt
    };

    await producer.send({
      topic: 'order-created',
      messages: [
        {
          key: orderData._id.toString(),
          value: JSON.stringify(event),
        },
      ],
    });

    console.log(`OrderCreated event sent for order ${orderData._id}`);
  } catch (error) {
    console.error('Error sending OrderCreated event:', error);
    // Continue execution even if Kafka fails
  }
};

module.exports = {
  producer,
  connectProducer,
  disconnectProducer,
  sendOrderCreatedEvent
};
