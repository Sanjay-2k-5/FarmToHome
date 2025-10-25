const User = require('../models/User');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Order = require('../models/Order');

// @desc    Get available user roles
// @route   GET /api/admin/roles
// @access  Private/Admin
exports.getRoles = async (req, res) => {
  try {
    // Get roles from the User model schema
    const roleValues = User.schema.path('role').enumValues;
    
    // Define role labels and colors
    const roleConfig = {
      user: { label: 'User', color: 'secondary' },
      farmer: { label: 'Farmer', color: 'success' },
      vendor: { label: 'Vendor', color: 'primary' },
      delivery: { label: 'Delivery', color: 'info' },
      admin: { label: 'Admin', color: 'danger' }
    };
    
    // Map roles to include additional info
    const roles = roleValues.map(role => ({
      value: role,
      label: roleConfig[role]?.label || role.charAt(0).toUpperCase() + role.slice(1),
      color: roleConfig[role]?.color || 'light'
    }));
    
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Error fetching roles' });
  }
};

// @desc    Basic admin stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    console.log('Fetching admin stats...');
    
    // Get all users count (excluding admins)
    const [userCount, productCount, salesAgg, activeUsers] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }), // Count all non-admin users
      Product.countDocuments({ isActive: true }), // Only count active products
      Order.aggregate([
        { 
          $match: { status: 'delivered' } // Only count delivered orders for revenue
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
            totalItems: { $sum: { $size: '$items' } }
          }
        }
      ]),
      User.countDocuments({ 
        lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Active in last 30 days
        role: { $ne: 'admin' }
      })
    ]);

    console.log('Stats query results:', { userCount, productCount, salesAgg, activeUsers });

    const salesData = salesAgg[0] || { 
      totalRevenue: 0, 
      orderCount: 0, 
      totalItems: 0 
    };

    const stats = {
      userCount,
      activeUsers,
      productCount,
      totalRevenue: salesData.totalRevenue,
      totalOrders: salesData.orderCount,
      totalItemsSold: salesData.totalItems,
      lastUpdated: new Date()
    };

    console.log('Sending stats:', stats);
    res.json(stats);
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

// @desc    Get product statistics
// @route   GET /api/admin/stats/products
// @access  Private/Admin
exports.getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    // Calculate percentage change (example: +5% from last month)
    const lastMonthCount = await Product.countDocuments({
      createdAt: { 
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        $lt: new Date()
      }
    });
    
    const change = lastMonthCount > 0 
      ? `+${Math.round(((totalProducts - lastMonthCount) / lastMonthCount) * 100)}%`
      : '0%';
      
    res.json({ total: totalProducts, change });
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({ error: 'Failed to fetch product statistics' });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/stats/users
// @access  Private/Admin
exports.getUserStats = async (req, res) => {
  try {
    const activeUsers = await User.countDocuments({ isActive: true });
    const lastMonthCount = await User.countDocuments({
      isActive: true,
      lastActive: { 
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        $lt: new Date()
      }
    });
    
    const change = lastMonthCount > 0 
      ? `+${Math.round(((activeUsers - lastMonthCount) / lastMonthCount) * 100)}%`
      : '0%';
      
    res.json({ active: activeUsers, change });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
};

// @desc    Get revenue statistics
// @route   GET /api/admin/stats/revenue
// @access  Private/Admin
exports.getRevenueStats = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1)
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1)
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const currentMonthRevenue = monthlyRevenue[0]?.total || 0;
    const prevMonthRevenue = lastMonthRevenue[0]?.total || 0;
    
    const change = prevMonthRevenue > 0
      ? `${currentMonthRevenue >= prevMonthRevenue ? '+' : ''}${Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)}%`
      : '0%';
    
    res.json({ currentMonth: currentMonthRevenue, change });
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({ error: 'Failed to fetch revenue statistics' });
  }
};

// @desc    Get order statistics
// @route   GET /api/admin/stats/orders
// @access  Private/Admin
exports.getOrderStats = async (req, res) => {
  try {
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const lastMonthPending = await Order.countDocuments({
      status: 'pending',
      createdAt: { 
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        $lt: new Date()
      }
    });
    
    const change = lastMonthPending > 0
      ? `${pendingOrders >= lastMonthPending ? '+' : ''}${Math.round(((pendingOrders - lastMonthPending) / lastMonthPending) * 100)}%`
      : '0%';
    
    res.json({ pending: pendingOrders, change });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ error: 'Failed to fetch order statistics' });
  }
};

// @desc    List users with purchase summaries
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsersDetailed = async (req, res) => {
  try {
    // Fetch base user info (all users)
    const users = await User.find({}, 'fname lname email role createdAt').lean();

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
