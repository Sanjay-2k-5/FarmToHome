const Order = require('../models/Order');
const Revenue = require('../models/Revenue');
const mongoose = require('mongoose');

// @desc    Get orders ready for delivery
// @route   GET /api/delivery/orders
// @access  Private/Delivery
exports.getDeliveryOrders = async (req, res) => {
  try {
    // Get orders that are accepted by farmer but not yet delivered
    const orders = await Order.find({
      status: { $in: ['accepted', 'processing', 'shipped'] }
    })
    .sort({ updatedAt: -1 })
    .populate('user', 'fname lname email phone');

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error fetching delivery orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update order delivery status
// @route   PUT /api/delivery/orders/:id/status
// @access  Private/Delivery
exports.updateDeliveryStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    console.log('Updating delivery status:', { id, status });
    
    const validStatuses = ['processing', 'shipped', 'delivered'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Add to status history
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
      note: `Status updated to ${status} by delivery personnel`
    });
    
    // Update order status
    order.status = status;
    order.updatedAt = new Date();
    
    // If order is delivered, update deliveredAt and record revenue
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      
      // Create a revenue record
      const revenue = new Revenue({
        order: order._id,
        amount: order.total,
        status: 'pending' // Will be processed by admin
      });
      
      await revenue.save({ session });
      console.log(`Revenue record created for order ${order._id}: ${order.total}`);
    }

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();
    
    res.json({
      success: true,
      message: 'Delivery status updated',
      order: {
        _id: order._id,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error updating delivery status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating delivery status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
