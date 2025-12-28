# E-commerce Frontend Demo

A React frontend application for demonstrating the microservices e-commerce system.

## Features

- **Product Catalog**: Browse all available products
- **Product Details**: View detailed information about products
- **Order Placement**: Place orders for products
- **Order History**: View all placed orders
- **Responsive Design**: Clean and modern UI

## API Integration

This frontend connects to the e-commerce API gateway at:
`http://mini-ecommerce.42genius.com/`

## Getting Started

### Option 1: Run with Docker (Recommended)

The frontend is included in the main docker-compose.yml file. To run the entire system including the frontend:

1. From the project root directory:
   ```bash
   docker-compose up --build
   ```

2. Open your browser and navigate to `http://localhost:4000`

The Docker container uses `serve` to serve the built React application.

### Option 2: Run Locally (Development)

#### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

#### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Available Routes

- `/` - Product list (home page)
- `/products/:id` - Product details
- `/order/:productId` - Order form for a specific product
- `/orders` - List of all orders

## Usage

1. **Browse Products**: Visit the home page to see all available products
2. **View Details**: Click "View Details" to see full product information
3. **Place Orders**: Click "Order Now" to place an order for a product
4. **Check Orders**: Visit the Orders page to see your order history

## Technologies Used

- React 18
- React Router DOM
- Axios for API calls
- CSS for styling

## API Endpoints Used

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders

## Notes

- This is a demo frontend for testing the microservices architecture
- All API calls are made to the production API gateway
- Orders are processed asynchronously through the event-driven system
- Make sure the backend services are running and accessible
