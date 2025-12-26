require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Service URLs từ environment variables
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Gateway is running',
    timestamp: new Date().toISOString(),
    services: {
      auth: AUTH_SERVICE_URL
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Gateway for Mini E-commerce',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*'
    }
  });
});

// Proxy configuration cho Auth Service
const authProxyOptions = {
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth', // Giữ nguyên path
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Gateway] ${req.method} ${req.url} -> ${AUTH_SERVICE_URL}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Gateway] Response: ${proxyRes.statusCode} for ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`[Gateway] Proxy error: ${err.message}`);
    res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Forward tất cả requests từ /api/auth/* tới auth-service
app.use('/api/auth', createProxyMiddleware(authProxyOptions));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.url
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Auth Service URL: ${AUTH_SERVICE_URL}`);
});

