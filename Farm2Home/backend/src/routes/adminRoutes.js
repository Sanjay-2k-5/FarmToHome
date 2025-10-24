const express = require('express');
const router = express.Router();
const { getStats, getSalesSeries, getUsersDetailed } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Protect all admin routes
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/sales', getSalesSeries);
router.get('/users', getUsersDetailed);

module.exports = router;
