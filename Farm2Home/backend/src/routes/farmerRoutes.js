const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getFarmerOrders, 
  updateOrderStatus,
  predictCropPrice
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

// AI/ML Price Prediction
router.post('/predict-price', authorize('farmer', 'admin'), predictCropPrice);

// Product management - Farmer specific routes
router.route('/products')
  .get(getFarmerProducts)
  .post(createProduct);

router.delete('/products/:id', deleteProduct);

module.exports = router;
