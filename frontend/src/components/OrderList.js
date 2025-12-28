import React, { useState, useEffect } from 'react';
import { ordersApi } from '../services/api';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerId, setCustomerId] = useState('customer_001'); // Default for demo

  useEffect(() => {
    if (customerId) {
      fetchOrders();
    }
  }, [customerId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getAll({ customerId });
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load orders. Please try again.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#f39c12';
      case 'CONFIRMED': return '#27ae60';
      case 'SHIPPED': return '#3498db';
      case 'DELIVERED': return '#2ecc71';
      case 'CANCELLED': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading orders...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn" onClick={fetchOrders}>Try Again</button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Orders</h1>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Filter Orders</h3>
        <div className="form-group">
          <label htmlFor="customerId">Customer ID:</label>
          <input
            type="text"
            id="customerId"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="Enter customer ID (e.g., customer_001)"
          />
        </div>
        <button className="btn" onClick={fetchOrders} disabled={!customerId}>
          Load Orders
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="card">
          <p>No orders found.</p>
        </div>
      ) : (
        <div>
          {orders.map(order => (
            <div key={order._id || order.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Order #{order.orderNumber || order._id}</h3>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: 'white',
                    backgroundColor: getStatusColor(order.status),
                    fontSize: '0.9em'
                  }}
                >
                  {order.status}
                </span>
              </div>

              <div style={{ margin: '10px 0' }}>
                <p><strong>Customer:</strong> {order.customerId}</p>
                <p><strong>Shipping Address:</strong> {
                  typeof order.shippingAddress === 'string'
                    ? order.shippingAddress
                    : `${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.zipCode}, ${order.shippingAddress?.country}`
                }</p>
                <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <h4>Items:</h4>
                {order.items && order.items.map((item, index) => (
                  <div key={index} style={{ marginLeft: '20px', marginBottom: '5px' }}>
                    <p>{item.productName} (ID: {item.productId}) | Quantity: {item.quantity} | Price: ${item.price}</p>
                  </div>
                ))}
              </div>

              {order.totalAmount && (
                <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
                  Total: ${order.totalAmount}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default OrderList;
