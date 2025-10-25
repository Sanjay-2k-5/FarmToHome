const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  createOrder, 
  getMyOrders, 
  getOrderById,
  getDeliveredOrdersRevenue 
} = require('../controllers/orderController');

// Protect all routes
router.use(protect);

// Create a new order
router.post('/', createOrder);

// Get logged in user's orders
router.get('/my-orders', getMyOrders);

// Admin routes - Must come before :id to avoid conflict
router.get('/revenue', authorize('admin'), getDeliveredOrdersRevenue);

// Get order by ID - Must come after all other specific routes
router.get('/:id', getOrderById);

module.exports = router;
