const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Get total revenue from delivered orders
// @route   GET /api/orders/revenue
// @access  Private/Admin
exports.getDeliveredOrdersRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $match: { status: 'delivered' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    const stats = result[0] || { totalRevenue: 0, orderCount: 0 };
    
    res.status(200).json({
      success: true,
      totalRevenue: stats.totalRevenue,
      orderCount: stats.orderCount
    });
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue statistics',
      error: error.message
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { shippingAddress, paymentMethod = 'cod', paymentId } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!shippingAddress) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Get user with cart
    const user = await User.findById(userId).session(session);
    if (!user || !user.cart || user.cart.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'No items in cart'
      });
    }

    // Prepare order items and validate stock
    const orderItems = [];
    const productUpdates = [];
    let subtotal = 0;
    const DELIVERY_FEE = 29;

    // Process each item in cart
    for (const cartItem of user.cart) {
      const product = await Product.findById(cartItem.product).session(session);
      
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: `Product ${cartItem.name} not found`
        });
      }

      // Check stock
      if (product.stock < cartItem.qty) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available`
        });
      }

      // Add to order items
      const itemTotal = cartItem.price * cartItem.qty;
      orderItems.push({
        product: product._id,
        name: product.name,
        imageUrl: product.imageUrl || product.img || '',
        price: cartItem.price,
        qty: cartItem.qty,
        total: itemTotal
      });

      subtotal += itemTotal;

      // Prepare product stock update
      productUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $inc: { stock: -cartItem.qty } }
        }
      });
    }

    // Calculate totals
    const total = subtotal + DELIVERY_FEE;

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      total,
      shippingAddress,
      paymentMethod,
      paymentId: paymentMethod === 'online' ? paymentId : undefined,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      status: 'pending' // New orders start as pending
    });

    await order.save({ session });

    // Update product stocks
    if (productUpdates.length > 0) {
      await Product.bulkWrite(productUpdates, { session });
    }

    // Clear user's cart
    user.cart = [];
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get farmer's pending orders
// @route   GET /api/orders/farmer/orders
// @access  Private/Farmer
exports.getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'pending' })
      .populate('user', 'fname lname email')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
};

// @desc    Update order status (accept/reject)
// @route   PUT /api/orders/:id/status
// @access  Private/Farmer
exports.updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status } = req.body;
    const { id } = req.params;
    
    if (!['accepted', 'rejected', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(id).session(session);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update order status
    order.status = status;
    order.updatedAt = new Date();
    
    // If order is rejected, return stock to inventory
    if (status === 'rejected') {
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.qty } },
          { session }
        );
      }
    }

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    // In a real app, you would send a notification to the user here
    // and/or emit a WebSocket event for real-time updates

    res.json({ success: true, order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Error updating order status' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if the order belongs to the user or if user is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
