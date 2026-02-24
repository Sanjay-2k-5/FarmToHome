const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { 
  getFarmerOrders, 
  updateOrderStatus 
} = require('../controllers/farmerController');
const { 
  getFarmerProducts,
  createProduct,
  deleteProduct 
} = require('../controllers/farmerProductController');

// All routes are protected and require farmer role
router.use(protect);
router.use(authorize('farmer', 'admin'));

// Order management - Farmer specific routes
router.get('/my-orders', getFarmerOrders);
router.put('/update-order-status/:id', updateOrderStatus);

// Product management - Farmer specific routes
router.route('/products')
  .get(getFarmerProducts)
  .post(upload.single('image'), createProduct);

router.delete('/products/:id', deleteProduct);

module.exports = router;
