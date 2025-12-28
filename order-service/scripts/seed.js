require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');

const orders = [
  {
    customerId: "customer_001",
    items: [
      {
        productId: "507f1f77bcf86cd799439011", // Will be actual product IDs after seeding
        productName: "iPhone 15 Pro",
        price: 1199.99,
        quantity: 1
      },
      {
        productId: "507f1f77bcf86cd799439012",
        productName: "Sony WH-1000XM5",
        price: 399.99,
        quantity: 1
      }
    ],
    status: "PENDING",
    shippingAddress: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    },
    notes: "Please handle with care"
  },
  {
    customerId: "customer_002",
    items: [
      {
        productId: "507f1f77bcf86cd799439013",
        productName: "Nike Air Max 270",
        price: 150.00,
        quantity: 2
      },
      {
        productId: "507f1f77bcf86cd799439014",
        productName: "Levi's 501 Jeans",
        price: 89.99,
        quantity: 1
      }
    ],
    status: "CONFIRMED",
    shippingAddress: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA"
    }
  },
  {
    customerId: "customer_003",
    items: [
      {
        productId: "507f1f77bcf86cd799439015",
        productName: "MacBook Pro 16-inch",
        price: 2499.99,
        quantity: 1
      }
    ],
    status: "PROCESSING",
    shippingAddress: {
      street: "789 Pine Rd",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      country: "USA"
    },
    notes: "Expedited shipping requested"
  },
  {
    customerId: "customer_001",
    items: [
      {
        productId: "507f1f77bcf86cd799439016",
        productName: "KitchenAid Stand Mixer",
        price: 449.99,
        quantity: 1
      },
      {
        productId: "507f1f77bcf86cd799439017",
        productName: "Dyson V15 Detect",
        price: 749.99,
        quantity: 1
      }
    ],
    status: "SHIPPED",
    shippingAddress: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    }
  },
  {
    customerId: "customer_004",
    items: [
      {
        productId: "507f1f77bcf86cd799439018",
        productName: "Canon EOS R5",
        price: 3899.99,
        quantity: 1
      }
    ],
    status: "DELIVERED",
    shippingAddress: {
      street: "321 Elm St",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA"
    },
    notes: "Delivered to front desk"
  }
];

const seedOrders = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_orders', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Xóa dữ liệu cũ
    await Order.deleteMany({});
    console.log('Cleared existing orders');

    // Thêm dữ liệu mới
    const createdOrders = await Order.insertMany(orders);
    console.log(`Seeded ${createdOrders.length} orders successfully`);

    // Hiển thị danh sách đơn hàng đã tạo
    console.log('\nSeeded Orders:');
    createdOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order.orderNumber} - Customer: ${order.customerId} - Status: ${order.status} - Total: $${order.totalAmount}`);
    });

  } catch (error) {
    console.error('Error seeding orders:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Chạy seed script
if (require.main === module) {
  seedOrders();
}

module.exports = seedOrders;
