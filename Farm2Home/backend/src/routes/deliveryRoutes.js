const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getDeliveryOrders, 
  updateDeliveryStatus 
} = require('../controllers/deliveryController');

// All routes are protected and require delivery role
router.use(protect);
router.use(authorize('delivery', 'admin'));

// Delivery order management
router.get('/orders', getDeliveryOrders);
router.put('/orders/:id/status', updateDeliveryStatus);

module.exports = router;
