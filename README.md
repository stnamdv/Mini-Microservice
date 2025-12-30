# E-commerce Microservices Architecture

A microservices-based e-commerce system built with Node.js, .NET 9, MongoDB, and Apache Kafka.

## Architecture Overview

- **Frontend** (React) - User interface for the e-commerce system
- **API Gateway** (Ocelot) - Routes requests to appropriate services
- **Auth Service** (Node.js) - User authentication and authorization
- **Product Service** (Node.js) - Product CRUD operations with synchronous responses
- **Order Service** (Node.js) - Order processing with asynchronous event-driven inventory updates
- **Inventory Service** (.NET 9 Worker) - Background inventory management
- **Kafka** - Message broker for decoupling services
- **MongoDB** - Database (separate databases for each service)

## Services

### Frontend (Port 4000)
React-based user interface for the e-commerce system.

**Features:**
- Product catalog browsing
- Product details view
- Order placement form
- Order history tracking
- System health monitoring
- Authentication (login/logout)
- Product management (CRUD)
- Responsive design

### Product Service (Port 3002)
REST API for product management.

**Endpoints:**
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Order Service (Port 3003)
Handles order placement with asynchronous inventory processing.

**Endpoints:**
- `GET /api/orders` - Get all orders
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/{id}/status` - Update order status
- `DELETE /api/orders/{id}` - Delete order

### Inventory Service
Background worker that processes inventory updates from Kafka messages.

### Health Check Service (Port 3004)
Comprehensive monitoring service for all microservices.

**Features:**
- Real-time health checks for all services
- Database connectivity monitoring (MongoDB)
- Message queue monitoring (Kafka)
- Aggregated system health status
- Detailed health reports with response times
- RESTful API for health data
- Auto-refresh capabilities

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (optional, for local development)
- .NET 9 SDK (optional, for local development)

### Running the System

1. **Start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Services will be available at:**
   - Frontend: http://localhost:4000
   - API Gateway: http://localhost:3000
   - Auth Service: http://localhost:3001
   - Product Service: http://localhost:3002
   - Order Service: http://localhost:3003
   - Health Check Service: http://localhost:3004

## API Usage Examples

### Create a Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "Gaming Laptop",
    "price": 1299.99,
    "category": "Electronics",
    "stock": 50
  }'
```

### Get Products
```bash
curl http://localhost:3000/api/products
```

### Place an Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer_001",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "productName": "iPhone 15 Pro",
        "price": 1199.99,
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }'
```

## Health Check API

### System Health Overview
```bash
curl http://localhost:3000/api/health
```

### Service-specific Health Checks
```bash
# Check all services
curl http://localhost:3000/api/health/services

# Check databases and message queues
curl http://localhost:3000/api/health/databases

# Check specific service
curl http://localhost:3000/api/health/auth
curl http://localhost:3000/api/health/product
curl http://localhost:3000/api/health/order
curl http://localhost:3000/api/health/mongodb
curl http://localhost:3000/api/health/kafka
```

### Health Check Response Format
```json
{
  "status": "healthy|unhealthy|error",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "responseTime": "150ms",
  "uptime": 3600.5,
  "services": [
    {
      "name": "Auth Service",
      "status": "healthy",
      "responseTime": 45,
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "version": "1.0.0"
}
```

## Order Flow

1. **Order Placement**: Customer places order through Order Service
2. **Immediate Response**: Order Service saves order as PENDING and returns success
3. **Event Publishing**: OrderCreated event is published to Kafka
4. **Inventory Processing**: Inventory Service consumes the event and updates stock
5. **Stock Reservation**: Inventory is reserved and then confirmed

## Database Structure

Each service uses its own MongoDB database:
- `ecommerce_auth` - User authentication data
- `ecommerce_products` - Product catalog
- `ecommerce_orders` - Order information
- `ecommerce_inventory` - Inventory levels

## Development

### Local Development Setup

1. **Start infrastructure services:**
   ```bash
   docker-compose up mongodb kafka zookeeper
   ```

2. **Run services individually:**
   ```bash
   # Auth Service (Node.js)
   cd auth-service && npm install && npm run dev

   # Product Service (Node.js)
   cd product-service && npm install && npm run dev

   # Order Service (Node.js)
   cd order-service && npm install && npm run dev

   # Health Check Service (Node.js)
   cd health-check-service && npm install && npm run dev

   # Inventory Service (.NET)
   cd inventory-service && dotnet run
   ```

3. **Health Monitoring:**
   - Access health dashboard: http://localhost:4000/health
   - API health endpoint: http://localhost:3000/api/health
   - Direct service health: http://localhost:3004/health

### Adding Sample Inventory Data

Before placing orders, add inventory records for products:

```javascript
// MongoDB shell
use ecommerce_inventory
db.inventory.insertOne({
  productId: "507f1f77bcf86cd799439011",
  productName: "Laptop",
  quantity: 100,
  reservedQuantity: 0,
  updatedAt: new Date()
})
```

## Monitoring

- Check service logs: `docker-compose logs [service-name]`
- Kafka topics: The system uses `order-events` topic for order processing
- MongoDB: Connect to localhost:22017 to inspect databases

## Scaling Considerations

- **Horizontal Scaling**: Each service can be scaled independently
- **Database Scaling**: MongoDB can be configured for replication
- **Message Processing**: Multiple instances of Inventory Service can consume from Kafka
- **Load Balancing**: API Gateway can distribute requests across service instances
