import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <h1>E-commerce Demo</h1>
          <div style={{ marginTop: '10px' }}>
            <Link to="/" className="btn">Products</Link>
            <Link to="/orders" className="btn">Orders</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/order/:productId" element={<OrderForm />} />
          <Route path="/orders" element={<OrderList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
