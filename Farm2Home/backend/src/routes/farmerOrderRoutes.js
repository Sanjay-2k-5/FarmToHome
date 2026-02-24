const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getFarmerOrders, updateOrderStatus } = require('../controllers/orderController');

// All routes are protected and require authentication
router.use(protect);

// Only farmers can access these routes
router.use(authorize('farmer', 'admin'));

// Get all pending orders for farmers
router.get('/orders', getFarmerOrders);

// Update order status (accept/reject/ship/deliver)
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
