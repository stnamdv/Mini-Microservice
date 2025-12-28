import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsApi = {
  getAll: () => api.get('/api/products'),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (product) => api.post('/api/products', product),
  update: (id, product) => api.put(`/api/products/${id}`, product),
  delete: (id) => api.delete(`/api/products/${id}`),
};

// Orders API
export const ordersApi = {
  getAll: () => api.get('/api/orders'),
  getById: (id) => api.get(`/api/orders/${id}`),
  create: (order) => api.post('/api/orders', order),
  updateStatus: (id, status) => api.put(`/api/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/api/orders/${id}`),
};

export default api;
