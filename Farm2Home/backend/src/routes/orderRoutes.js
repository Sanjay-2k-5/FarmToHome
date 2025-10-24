const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  createOrder, 
  getMyOrders, 
  getOrderById 
} = require('../controllers/orderController');

// Protect all routes
router.use(protect);

// Create a new order
router.post('/', createOrder);

// Get logged in user's orders
router.get('/my-orders', getMyOrders);

// Get order by ID
router.get('/:id', getOrderById);

module.exports = router;
