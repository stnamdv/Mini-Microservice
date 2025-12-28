require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { connectProducer, disconnectProducer } = require('./config/kafka');

const app = express();

// Kết nối MongoDB
connectDB();

// Kết nối Kafka Producer
connectProducer();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/orders', require('./routes/orders'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Order Service is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Order Service API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      placeOrder: 'POST /api/orders',
      getOrders: 'GET /api/orders?customerId=...',
      getOrder: 'GET /api/orders/:id',
      updateOrderStatus: 'PUT /api/orders/:id/status',
      cancelOrder: 'DELETE /api/orders/:id'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await disconnectProducer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await disconnectProducer();
  process.exit(0);
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
