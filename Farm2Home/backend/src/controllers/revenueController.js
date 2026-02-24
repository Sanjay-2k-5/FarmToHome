const Revenue = require('../models/Revenue');
const Order = require('../models/Order');

// @desc    Get revenue statistics
// @route   GET /api/admin/revenue
// @access  Private/Admin
exports.getRevenueStats = async (req, res) => {
  try {
    // Calculate total revenue (sum of all processed revenues)
    const totalRevenue = await Revenue.aggregate([
      { $match: { status: 'processed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Calculate monthly revenue
    const monthlyRevenue = await Revenue.aggregate([
      { $match: { status: 'processed' } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 } // Last 6 months
    ]);

    // Get pending revenue (not yet processed)
    const pendingRevenue = await Revenue.find({ status: 'pending' })
      .populate('order', 'orderNumber total')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        total: totalRevenue[0]?.total || 0,
        monthly: monthlyRevenue,
        pending: pendingRevenue
      }
    });
  } catch (error) {
    console.error('Error getting revenue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting revenue statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update revenue status (mark as processed)
// @route   PUT /api/admin/revenue/:id/process
// @access  Private/Admin
exports.processRevenue = async (req, res) => {
  try {
    const revenue = await Revenue.findById(req.params.id);
    
    if (!revenue) {
      return res.status(404).json({
        success: false,
        message: 'Revenue record not found'
      });
    }

    revenue.status = 'processed';
    revenue.processedAt = new Date();
    await revenue.save();

    res.json({
      success: true,
      message: 'Revenue marked as processed',
      data: revenue
    });
  } catch (error) {
    console.error('Error processing revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing revenue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
