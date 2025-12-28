import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi } from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getById(id);
      setProduct(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load product details. Please try again.');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading product details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/" className="btn">Back to Products</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error">
        <h2>Product not found</h2>
        <Link to="/" className="btn">Back to Products</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Product Details</h1>

      <div className="card">
        <h2>{product.name}</h2>
        <p><strong>Description:</strong> {product.description}</p>
        <p><strong>Price:</strong> ${product.price}</p>
        <p><strong>Stock:</strong> {product.stock}</p>
        <p><strong>Category:</strong> {product.category}</p>
        <p><strong>Created:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>

        <div style={{ marginTop: '20px' }}>
          <Link to="/" className="btn">Back to Products</Link>
          <Link to={`/order/${product._id || product.id}`} className="btn">Order This Product</Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
