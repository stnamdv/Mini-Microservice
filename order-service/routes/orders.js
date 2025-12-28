const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const { sendOrderCreatedEvent } = require('../config/kafka');

const router = express.Router();

// Middleware để xử lý validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// POST /api/orders - Đặt hàng
router.post('/', [
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required for each item'),
  body('items.*.productName').notEmpty().withMessage('Product name is required for each item'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress').optional().isObject().withMessage('Shipping address must be an object'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { customerId, items, shippingAddress, notes } = req.body;

    // Tạo đơn hàng mới với trạng thái PENDING
    const order = new Order({
      customerId,
      items,
      shippingAddress,
      notes,
      status: 'PENDING'
    });

    // Lưu đơn hàng (middleware sẽ tự động tính totalAmount)
    const savedOrder = await order.save();

    // Gửi sự kiện OrderCreated vào Kafka (không chờ phản hồi)
    try {
      await sendOrderCreatedEvent(savedOrder);
    } catch (kafkaError) {
      console.error('Failed to send OrderCreated event:', kafkaError);
      // Không làm gián đoạn flow, service vẫn trả về success
    }

    // Trả về thông báo thành công ngay lập tức
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderId: savedOrder._id,
        orderNumber: savedOrder.orderNumber,
        totalAmount: savedOrder.totalAmount,
        status: savedOrder.status,
        createdAt: savedOrder.createdAt,
        estimatedProcessingTime: 'Processing will begin shortly'
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/orders - Lấy danh sách đơn hàng của customer
router.get('/', async (req, res) => {
  try {
    const { customerId, page = 1, limit = 10, status } = req.query;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }

    // Build query
    let query = { customerId };

    if (status) {
      query.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const orders = await Order.find(query)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .sort(options.sort);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(total / options.limit),
        totalOrders: total,
        hasNext: options.page * options.limit < total,
        hasPrev: options.page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/orders/:id - Lấy chi tiết đơn hàng
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid order ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng (cho admin/internal use)
router.put('/:id/status', [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status').isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).withMessage('Invalid status'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/orders/:id - Hủy đơn hàng (chỉ cho đơn PENDING)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid order ID'),
  handleValidationErrors
], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Chỉ cho phép hủy đơn hàng ở trạng thái PENDING
    if (order.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order that is not in PENDING status'
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
