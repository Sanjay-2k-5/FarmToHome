const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Get orders for farmer's products
// @route   GET /api/orders/farmer
// @access  Private/Farmer
exports.getFarmerOrders = async (req, res) => {
  try {
    // In a real app, you would filter orders to only include products from this farmer
    // For now, we'll return all orders
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'fname lname email');

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update order status
// @route   PUT /api/farmer/update-order-status/:id
// @access  Private/Farmer
exports.updateOrderStatus = async (req, res) => {
  let session;
  
  try {
    const { status, reason } = req.body;
    const { id } = req.params;
    
    console.log('Updating order status:', { id, status, reason });
    
    const validStatuses = ['pending', 'accepted', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      console.error('Invalid status:', status);
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Start session and transaction
    session = await mongoose.startSession();
    await session.startTransaction();

    const order = await Order.findById(id).session(session);
    if (!order) {
      console.error('Order not found:', id);
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('Found order:', order._id, 'Current status:', order.status);

    // Add to status history
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      reason: (status === 'rejected' || status === 'cancelled') ? (reason || 'No reason provided') : undefined,
      changedBy: req.user._id
    });
    
    // Update order status
    order.status = status;
    order.updatedAt = new Date();
    
    // If order is cancelled, return stock to inventory
    if (status === 'cancelled' || status === 'rejected') {
      console.log('Returning stock to inventory for order:', order._id);
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
    
    console.log('Order status updated successfully:', order._id, 'New status:', status);

    res.json({
      success: true,
      message: 'Order status updated',
      order: {
        _id: order._id,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });

  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Error aborting transaction:', abortError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (session) {
      try {
        await session.endSession();
      } catch (endSessionError) {
        console.error('Error ending session:', endSessionError);
      }
    }
  }
};
