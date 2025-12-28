# Order Service

Microservice for handling order placement and management in the e-commerce platform.

## Features

- Order placement with automatic total calculation
- Asynchronous order processing (fire-and-forget)
- Kafka integration for order events
- Order status management
- Customer order history

## Key Behavior

When an order is placed:
1. Order is saved with PENDING status
2. Total amount is automatically calculated
3. OrderCreated event is sent to Kafka (asynchronous)
4. Success response is returned immediately (no waiting for inventory processing)

## API Endpoints

### Orders

#### POST /api/orders
Place a new order.

**Request Body:**
```json
{
  "customerId": "customer_123",
  "items": [
    {
      "productId": "product_456",
      "productName": "Product Name",
      "price": 99.99,
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "orderId": "...",
    "orderNumber": "ORD-ABC12345",
    "totalAmount": 199.98,
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "estimatedProcessingTime": "Processing will begin shortly"
  }
}
```

#### GET /api/orders
Get orders for a customer with pagination.

**Query Parameters:**
- `customerId` (string, required): Customer ID
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by order status

#### GET /api/orders/:id
Get order details by ID.

#### PUT /api/orders/:id/status
Update order status (admin/internal use).

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

#### DELETE /api/orders/:id
Cancel an order (only if status is PENDING).

## Order Status Flow

- **PENDING**: Order placed, waiting for processing
- **CONFIRMED**: Order confirmed by system
- **PROCESSING**: Order being prepared
- **SHIPPED**: Order shipped to customer
- **DELIVERED**: Order delivered successfully
- **CANCELLED**: Order cancelled

## Data Model

```javascript
{
  customerId: String (required),
  items: [{
    productId: String (required),
    productName: String (required),
    price: Number (required),
    quantity: Number (required),
    total: Number (calculated)
  }],
  totalAmount: Number (calculated),
  status: String (enum, default: 'PENDING'),
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Kafka Events

### OrderCreated Event
Sent when a new order is placed.

**Topic:** `order-created`

**Message:**
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "customerId": "customer_123",
  "items": [
    {
      "productId": "product_456",
      "quantity": 2
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Running the Service

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm install
npm start
```

### Seeding Data
```bash
npm run seed
```

## Environment Variables

- `PORT`: Service port (default: 3003)
- `MONGODB_URI`: MongoDB connection string
- `KAFKA_BROKERS`: Kafka broker addresses (comma-separated)
- `NODE_ENV`: Environment (development/production)

## Health Check

GET /health - Service health status
