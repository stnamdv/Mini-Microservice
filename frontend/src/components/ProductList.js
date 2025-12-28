import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll();
      console.log('API Response:', response.data); // Debug log
      const productsData = response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error fetching products:', err);
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading products...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn" onClick={fetchProducts}>Try Again</button>
      </div>
    );
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsApi.delete(productId);
        // Refresh the product list
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Products</h1>
        <Link to="/products/new" className="btn">Add New Product</Link>
      </div>

      {!Array.isArray(products) || products.length === 0 ? (
        <div className="card">
          <p>No products available.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <div key={product._id || product.id} className="product-card">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="product-price">${product.price}</div>
              <div className="product-stock">Stock: {product.stock}</div>
              <div className="product-category">Category: {product.category}</div>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link to={`/products/${product._id || product.id}`} className="btn">
                  View Details
                </Link>
                <Link to={`/order/${product._id || product.id}`} className="btn">
                  Order Now
                </Link>
                <Link to={`/products/${product._id || product.id}/edit`} className="btn btn-secondary">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product._id || product.id)}
                  className="btn"
                  style={{ backgroundColor: '#e74c3c' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
