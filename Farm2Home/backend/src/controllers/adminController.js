const User = require('../models/User');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// @desc    Basic admin stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    const [userCount, productCount, salesAgg] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Sale.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalUnits: { $sum: '$quantity' },
            txCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totals = salesAgg[0] || { totalRevenue: 0, totalUnits: 0, txCount: 0 };

    res.json({
      userCount,
      productCount,
      totalRevenue: totals.totalRevenue,
      totalUnitsSold: totals.totalUnits,
      transactions: totals.txCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Sales timeseries (daily)
// @route   GET /api/admin/sales
// @access  Private/Admin
// query: range=7d|30d|90d (default 30d)
exports.getSalesSeries = async (req, res) => {
  try {
    const range = (req.query.range || '30d').toLowerCase();
    const days = parseInt(range, 10) || 30;
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const series = await Sale.aggregate([
      { $match: { soldAt: { $gte: fromDate } } },
      {
        $group: {
          _id: {
            y: { $year: '$soldAt' },
            m: { $month: '$soldAt' },
            d: { $dayOfMonth: '$soldAt' },
          },
          revenue: { $sum: '$total' },
          units: { $sum: '$quantity' },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
    ]);

    const data = series.map((s) => ({
      date: `${s._id.y}-${String(s._id.m).padStart(2, '0')}-${String(s._id.d).padStart(2, '0')}`,
      revenue: s.revenue,
      units: s.units,
    }));

    res.json({ rangeDays: days, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    List users with purchase summaries
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsersDetailed = async (req, res) => {
  try {
    // Fetch base user info (only regular users)
    const users = await User.find({ role: 'user' }, 'fname lname email role createdAt').lean();

    // Aggregate sales by user if Sale has a `user` field (if not, aggregation will yield no per-user results)
    const salesByUser = await Sale.aggregate([
      {
        $group: {
          _id: '$user',
          orders: { $sum: 1 },
          items: { $sum: '$quantity' },
          totalSpent: { $sum: '$total' },
        },
      },
    ]);

    const summaryMap = new Map();
    for (const s of salesByUser) {
      if (!s._id) continue; // skip docs with no user field
      summaryMap.set(String(s._id), {
        orders: s.orders || 0,
        items: s.items || 0,
        totalSpent: s.totalSpent || 0,
      });
    }

    // Optionally fetch recent purchases per user (best-effort; will be empty if no `user` on Sale)
    // Limit to last 5 purchases per user to keep payload small
    const userIds = users.map((u) => u._id);
    const recentSales = await Sale.find({ user: { $in: userIds } })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('product', 'name')
      .lean();

    const recentMap = new Map();
    for (const sale of recentSales) {
      const key = String(sale.user);
      if (!recentMap.has(key)) recentMap.set(key, []);
      const arr = recentMap.get(key);
      if (arr.length < 5) {
        arr.push({
          productName: sale.product?.name || 'Unknown',
          quantity: sale.quantity,
          total: sale.total,
          soldAt: sale.soldAt,
        });
      }
    }

    const result = users.map((u) => {
      const base = {
        _id: u._id,
        name: `${u.fname} ${u.lname}`.trim(),
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      };
      const sum = summaryMap.get(String(u._id)) || { orders: 0, items: 0, totalSpent: 0 };
      const recent = recentMap.get(String(u._id)) || [];
      return { ...base, ...sum, recentPurchases: recent };
    });

    res.json({ users: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
