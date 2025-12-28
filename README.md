# E-commerce Microservices Architecture

A microservices-based e-commerce system built with .NET 9, MongoDB, and Apache Kafka.

## Architecture Overview

- **Frontend** (React) - User interface for the e-commerce system
- **API Gateway** (Ocelot) - Routes requests to appropriate services
- **Auth Service** (Node.js) - User authentication and authorization
- **Product Service** (.NET 9) - Product CRUD operations
- **Order Service** (.NET 9) - Order processing with event-driven inventory updates
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

## Getting Started

### Prerequisites
- Docker and Docker Compose
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
    "customerId": "user123",
    "customerEmail": "user@example.com",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "quantity": 1
      }
    ],
    "shippingAddress": "123 Main St, City, State 12345"
  }'
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
   # Product Service
   cd product-service && dotnet run

   # Order Service
   cd order-service && dotnet run

   # Inventory Service
   cd inventory-service && dotnet run
   ```

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
