const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Configuration
const services = {
  auth: { url: 'http://auth-service:3001/health', name: 'Auth Service' },
  product: { url: 'http://product-service:3002/health', name: 'Product Service' },
  order: { url: 'http://order-service:3003/health', name: 'Order Service' },
  apiGateway: { url: 'http://api-gateway:3000/health', name: 'API Gateway' }
};

const databases = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://mongodb:27017/health_check',
    name: 'MongoDB'
  }
};

const kafkaConfig = {
  brokers: (process.env.KAFKA_BROKERS || 'kafka:29092').split(','),
  name: 'Health Check Service'
};

// Health check functions
async function checkServiceHealth(serviceName, serviceUrl) {
  try {
    const response = await axios.get(serviceUrl, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Health-Check-Service/1.0'
      }
    });

    return {
      name: serviceName,
      status: response.status === 200 ? 'healthy' : 'unhealthy',
      responseTime: response.config.duration || 0,
      timestamp: new Date().toISOString(),
      details: {
        statusCode: response.status,
        url: serviceUrl
      }
    };
  } catch (error) {
    return {
      name: serviceName,
      status: 'unhealthy',
      responseTime: 0,
      timestamp: new Date().toISOString(),
      error: error.message,
      details: {
        url: serviceUrl
      }
    };
  }
}

async function checkMongoDBHealth() {
  try {
    const connection = await mongoose.createConnection(databases.mongodb.uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    const dbStats = await connection.db.stats();
    await connection.close();

    return {
      name: databases.mongodb.name,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      details: {
        collections: dbStats.collections,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize
      }
    };
  } catch (error) {
    return {
      name: databases.mongodb.name,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

async function checkKafkaHealth() {
  try {
    const kafka = new Kafka({
      clientId: kafkaConfig.name,
      brokers: kafkaConfig.brokers,
      requestTimeout: 5000,
      connectionTimeout: 3000,
    });

    const admin = kafka.admin();
    await admin.connect();

    const clusterInfo = await admin.describeCluster();
    const topics = await admin.listTopics();

    await admin.disconnect();

    return {
      name: 'Kafka',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      details: {
        brokers: clusterInfo.brokers.length,
        controller: clusterInfo.controller,
        topics: topics.length
      }
    };
  } catch (error) {
    return {
      name: 'Kafka',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

async function checkSystemHealth() {
  const startTime = Date.now();

  try {
    // Check all services
    const serviceChecks = await Promise.allSettled([
      checkServiceHealth(services.auth.name, services.auth.url),
      checkServiceHealth(services.product.name, services.product.url),
      checkServiceHealth(services.order.name, services.order.url),
      checkServiceHealth(services.apiGateway.name, services.apiGateway.url),
      checkMongoDBHealth(),
      checkKafkaHealth()
    ]);

    const results = serviceChecks.map(result =>
      result.status === 'fulfilled' ? result.value : {
        name: 'Unknown Service',
        status: 'error',
        error: result.reason.message,
        timestamp: new Date().toISOString()
      }
    );

    const overallStatus = results.every(result => result.status === 'healthy') ? 'healthy' : 'unhealthy';
    const responseTime = Date.now() - startTime;

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      uptime: process.uptime(),
      services: results,
      version: '1.0.0'
    };

  } catch (error) {
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      uptime: process.uptime(),
      version: '1.0.0'
    };
  }
}

// Routes
app.get('/health', async (req, res) => {
  try {
    const healthData = await checkSystemHealth();
    const statusCode = healthData.status === 'healthy' ? 200 :
                      healthData.status === 'unhealthy' ? 503 : 500;

    res.status(statusCode).json(healthData);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

app.get('/health/services', async (req, res) => {
  try {
    const serviceChecks = await Promise.allSettled([
      checkServiceHealth(services.auth.name, services.auth.url),
      checkServiceHealth(services.product.name, services.product.url),
      checkServiceHealth(services.order.name, services.order.url),
      checkServiceHealth(services.apiGateway.name, services.apiGateway.url)
    ]);

    const results = serviceChecks.map(result =>
      result.status === 'fulfilled' ? result.value : {
        name: 'Unknown Service',
        status: 'error',
        error: result.reason.message,
        timestamp: new Date().toISOString()
      }
    );

    res.json({
      status: results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: results
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/health/databases', async (req, res) => {
  try {
    const [mongoResult, kafkaResult] = await Promise.allSettled([
      checkMongoDBHealth(),
      checkKafkaHealth()
    ]);

    const results = [
      mongoResult.status === 'fulfilled' ? mongoResult.value : {
        name: 'MongoDB',
        status: 'error',
        error: mongoResult.reason.message,
        timestamp: new Date().toISOString()
      },
      kafkaResult.status === 'fulfilled' ? kafkaResult.value : {
        name: 'Kafka',
        status: 'error',
        error: kafkaResult.reason.message,
        timestamp: new Date().toISOString()
      }
    ];

    res.json({
      status: results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      databases: results
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/health/:service', async (req, res) => {
  const serviceName = req.params.service.toLowerCase();

  try {
    let result;

    switch (serviceName) {
      case 'auth':
        result = await checkServiceHealth(services.auth.name, services.auth.url);
        break;
      case 'product':
        result = await checkServiceHealth(services.product.name, services.product.url);
        break;
      case 'order':
        result = await checkServiceHealth(services.order.name, services.order.url);
        break;
      case 'api-gateway':
      case 'apigateway':
        result = await checkServiceHealth(services.apiGateway.name, services.apiGateway.url);
        break;
      case 'mongodb':
      case 'mongo':
        result = await checkMongoDBHealth();
        break;
      case 'kafka':
        result = await checkKafkaHealth();
        break;
      default:
        return res.status(404).json({
          error: `Service '${serviceName}' not found`,
          availableServices: ['auth', 'product', 'order', 'api-gateway', 'mongodb', 'kafka']
        });
    }

    res.json(result);

  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      '/health',
      '/health/services',
      '/health/databases',
      '/health/:service'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Health Check Service running on port ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
});

module.exports = app;
