import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ProductForm from './components/ProductForm';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import LoginForm from './components/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppContent() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <div className="loading"><h2>Loading...</h2></div>;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="app">
      <nav className="navbar">
        <h1>E-commerce Demo</h1>
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link to="/" className="btn">Products</Link>
          <Link to="/orders" className="btn">Orders</Link>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'white' }}>Welcome, {user.name || user.email}</span>
              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn">Login</Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/:id/edit" element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        } />
        <Route path="/products/new" element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        } />
        <Route path="/order/:productId" element={<OrderForm />} />
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrderList />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
