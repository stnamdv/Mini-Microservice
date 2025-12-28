import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsApi, ordersApi } from '../services/api';

const OrderForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    customerId: '',
    quantity: 1,
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getById(productId);
      setProduct(response.data);
    } catch (err) {
      setError('Failed to load product. Please try again.');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested shipping address fields
    if (name.startsWith('shippingAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product) {
      setError('Product not found.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const orderData = {
        customerId: formData.customerId,
        items: [
          {
            productId: product._id || product.id,
            productName: product.name,
            price: product.price,
            quantity: parseInt(formData.quantity)
          }
        ],
        shippingAddress: formData.shippingAddress
      };

      await ordersApi.create(orderData);
      setSuccess('Order placed successfully!');

      // Reset form
      setFormData({
        customerId: '',
        quantity: 1,
        shippingAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });

      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 2000);

    } catch (err) {
      setError('Failed to place order. Please try again.');
      console.error('Error placing order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading product...</h2>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/" className="btn">Back to Products</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Place Order</h1>

      {product && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Product: {product.name}</h3>
          <p>Price: ${product.price}</p>
          <p>Available Stock: {product.stock}</p>
        </div>
      )}

      {success && (
        <div className="success">
          <h3>{success}</h3>
          <p>Redirecting to orders page...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customerId">Customer ID:</label>
            <input
              type="text"
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleInputChange}
              required
              placeholder="Enter your customer ID"
            />
          </div>

          <div className="form-group">
            <label htmlFor="street">Street Address:</label>
            <input
              type="text"
              id="street"
              name="shippingAddress.street"
              value={formData.shippingAddress.street}
              onChange={handleInputChange}
              required
              placeholder="Enter your street address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">City:</label>
            <input
              type="text"
              id="city"
              name="shippingAddress.city"
              value={formData.shippingAddress.city}
              onChange={handleInputChange}
              required
              placeholder="Enter your city"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="state">State:</label>
              <input
                type="text"
                id="state"
                name="shippingAddress.state"
                value={formData.shippingAddress.state}
                onChange={handleInputChange}
                required
                placeholder="State"
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="zipCode">ZIP Code:</label>
              <input
                type="text"
                id="zipCode"
                name="shippingAddress.zipCode"
                value={formData.shippingAddress.zipCode}
                onChange={handleInputChange}
                required
                placeholder="ZIP Code"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="country">Country:</label>
            <input
              type="text"
              id="country"
              name="shippingAddress.country"
              value={formData.shippingAddress.country}
              onChange={handleInputChange}
              required
              placeholder="Enter your country"
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              max={product ? product.stock : 1}
              required
            />
          </div>


          <div style={{ marginTop: '20px' }}>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
            <Link to="/" className="btn btn-danger">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
