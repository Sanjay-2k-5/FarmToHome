const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getFarmerOrders, 
  updateOrderStatus 
} = require('../controllers/farmerController');

// All routes are protected and require farmer role
router.use(protect);
router.use(authorize('farmer', 'admin'));

// Order management - Farmer specific routes
router.get('/my-orders', getFarmerOrders);
router.put('/update-order-status/:id', updateOrderStatus);

module.exports = router;
