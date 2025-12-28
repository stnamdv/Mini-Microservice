require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
  {
    name: "iPhone 15 Pro",
    description: "Latest iPhone with advanced camera system and A17 Pro chip",
    price: 1199.99,
    category: "Electronics",
    stock: 50,
    imageUrl: "https://example.com/iphone15pro.jpg"
  },
  {
    name: "Samsung Galaxy S24",
    description: "Premium Android smartphone with AI features",
    price: 899.99,
    category: "Electronics",
    stock: 75,
    imageUrl: "https://example.com/galaxys24.jpg"
  },
  {
    name: "MacBook Pro 16-inch",
    description: "Powerful laptop for professionals with M3 chip",
    price: 2499.99,
    category: "Electronics",
    stock: 25,
    imageUrl: "https://example.com/macbookpro.jpg"
  },
  {
    name: "Nike Air Max 270",
    description: "Comfortable running shoes with advanced cushioning",
    price: 150.00,
    category: "Footwear",
    stock: 100,
    imageUrl: "https://example.com/nikeairmax.jpg"
  },
  {
    name: "Levi's 501 Jeans",
    description: "Classic straight fit jeans, timeless style",
    price: 89.99,
    category: "Clothing",
    stock: 200,
    imageUrl: "https://example.com/levis501.jpg"
  },
  {
    name: "Sony WH-1000XM5",
    description: "Premium noise-canceling wireless headphones",
    price: 399.99,
    category: "Electronics",
    stock: 40,
    imageUrl: "https://example.com/sonywh1000.jpg"
  },
  {
    name: "KitchenAid Stand Mixer",
    description: "Professional grade stand mixer for baking enthusiasts",
    price: 449.99,
    category: "Home & Kitchen",
    stock: 15,
    imageUrl: "https://example.com/kitchenaid.jpg"
  },
  {
    name: "Adidas Ultraboost 22",
    description: "High-performance running shoes with Boost technology",
    price: 180.00,
    category: "Footwear",
    stock: 80,
    imageUrl: "https://example.com/adidasboost.jpg"
  },
  {
    name: "Canon EOS R5",
    description: "Professional mirrorless camera with 8K video recording",
    price: 3899.99,
    category: "Electronics",
    stock: 10,
    imageUrl: "https://example.com/canoneosr5.jpg"
  },
  {
    name: "Dyson V15 Detect",
    description: "Cordless vacuum cleaner with laser dust detection",
    price: 749.99,
    category: "Home & Kitchen",
    stock: 20,
    imageUrl: "https://example.com/dysonv15.jpg"
  }
];

const seedProducts = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_products', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Xóa dữ liệu cũ
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Thêm dữ liệu mới
    const createdProducts = await Product.insertMany(products);
    console.log(`Seeded ${createdProducts.length} products successfully`);

    // Hiển thị danh sách sản phẩm đã tạo
    console.log('\nSeeded Products:');
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price} (${product.stock} in stock)`);
    });

  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Chạy seed script
if (require.main === module) {
  seedProducts();
}

module.exports = seedProducts;
