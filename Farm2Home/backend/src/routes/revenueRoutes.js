const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getRevenueStats, processRevenue } = require('../controllers/revenueController');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Revenue management routes
router.get('/', getRevenueStats);
router.put('/:id/process', processRevenue);

module.exports = router;
