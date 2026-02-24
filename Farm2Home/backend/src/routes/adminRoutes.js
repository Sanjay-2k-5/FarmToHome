const express = require('express');
const router = express.Router();
const { 
  getStats, 
  getSalesSeries, 
  getUsersDetailed,
  getProductStats,
  getUserStats,
  getRevenueStats,
  getOrderStats,
  getRoles
} = require('../controllers/adminController');
const { getPendingProducts, updateProductStatus } = require('../controllers/adminProductController');
const { protect, authorize } = require('../middleware/auth');

// Protect all admin routes
router.use(protect, authorize('admin'));

// Dashboard routes
router.get('/stats', getStats);
router.get('/sales', getSalesSeries);
router.get('/users', getUsersDetailed);
router.get('/roles', getRoles);

// Statistics routes
router.get('/stats/products', getProductStats);
router.get('/stats/users', getUserStats);
router.get('/stats/revenue', getRevenueStats);
router.get('/stats/orders', getOrderStats);

// Product management routes
router.get('/products/pending', getPendingProducts);
router.put('/products/:id/status', updateProductStatus);

module.exports = router;
