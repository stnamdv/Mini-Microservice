# Health Check Service

A comprehensive health monitoring service for the e-commerce microservices architecture.

## Features

- **Service Health Checks**: Monitors HTTP endpoints of all microservices
- **Database Monitoring**: Checks MongoDB connection and statistics
- **Message Queue Monitoring**: Validates Kafka connectivity and cluster health
- **Aggregated Health Status**: Provides overall system health assessment
- **Detailed Reporting**: Returns comprehensive health information with response times

## API Endpoints

### GET /health
Returns overall system health status including all services, databases, and message queues.

**Response:**
```json
{
  "status": "healthy|unhealthy|error",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "responseTime": "150ms",
  "uptime": 3600.5,
  "services": [...],
  "version": "1.0.0"
}
```

### GET /health/services
Returns health status of all microservices only.

### GET /health/databases
Returns health status of databases and message queues.

### GET /health/:service
Returns health status of a specific service. Available services:
- `auth` - Auth Service
- `product` - Product Service
- `order` - Order Service
- `api-gateway` - API Gateway
- `mongodb` - MongoDB
- `kafka` - Kafka

## Configuration

Create a `.env` file based on `env.example`:

```bash
cp env.example .env
```

## Health Check Response Format

Each health check returns:

```json
{
  "name": "Service Name",
  "status": "healthy|unhealthy|error",
  "responseTime": 150,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": {
    // Service-specific information
  },
  "error": "Error message (if any)"
}
```

## Status Codes

- **200 OK**: All services are healthy
- **503 Service Unavailable**: Some services are unhealthy
- **500 Internal Server Error**: Health check service error

## Docker Health Check

The service includes a built-in health check that can be used by Docker:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Integration

This service is designed to work with:
- **API Gateway**: Routes health check requests to this service
- **Monitoring Systems**: Can be integrated with Prometheus, Grafana, etc.
- **Load Balancers**: Provides health endpoints for load balancer checks
- **CI/CD Pipelines**: Automated health verification during deployments
