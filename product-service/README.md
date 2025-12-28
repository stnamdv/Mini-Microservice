# Product Service

Microservice for managing products in the e-commerce platform.

## Features

- CRUD operations for products
- Product search and filtering
- Category management
- Stock management
- REST API with validation

## API Endpoints

### Products

#### GET /api/products
Get list of products with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `category` (string): Filter by category
- `search` (string): Search in name and description
- `active` (boolean): Filter by active status (default: true)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET /api/products/:id
Get product details by ID.

#### POST /api/products
Create a new product.

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "Category",
  "stock": 100,
  "imageUrl": "https://example.com/image.jpg"
}
```

#### PUT /api/products/:id
Update an existing product.

#### DELETE /api/products/:id
Delete a product.

#### GET /api/products/categories/list
Get list of all product categories.

## Data Model

```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required, min: 0),
  category: String (required),
  stock: Number (required, min: 0),
  imageUrl: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
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

- `PORT`: Service port (default: 3002)
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment (development/production)

## Health Check

GET /health - Service health status
