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
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error fetching products:', err);
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

  return (
    <div>
      <h1 className="page-title">Products</h1>

      {products.length === 0 ? (
        <div className="card">
          <p>No products available.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="product-price">${product.price}</div>
              <div className="product-stock">Stock: {product.stock}</div>
              <div className="product-category">Category: {product.category}</div>
              <div style={{ marginTop: '15px' }}>
                <Link to={`/products/${product.id}`} className="btn">
                  View Details
                </Link>
                <Link to={`/order/${product.id}`} className="btn">
                  Order Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
