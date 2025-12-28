import React, { useState, useEffect } from 'react';
import { ordersApi } from '../services/api';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getAll();
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

      {orders.length === 0 ? (
        <div className="card">
          <p>No orders found.</p>
        </div>
      ) : (
        <div>
          {orders.map(order => (
            <div key={order.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Order #{order.id}</h3>
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
                <p><strong>Email:</strong> {order.customerEmail}</p>
                <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <h4>Items:</h4>
                {order.items && order.items.map((item, index) => (
                  <div key={index} style={{ marginLeft: '20px', marginBottom: '5px' }}>
                    <p>Product ID: {item.productId} | Quantity: {item.quantity}</p>
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

      <div style={{ marginTop: '20px' }}>
        <button className="btn" onClick={fetchOrders}>Refresh Orders</button>
      </div>
    </div>
  );
};

export default OrderList;
