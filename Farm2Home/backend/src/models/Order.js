const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  imageUrl: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  qty: {
    type: Number,
    required: true,
    min: 1
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    required: true,
    default: 29,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online'],
    default: 'cod'
  },
  paymentId: String,
  paymentReceipt: String,
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled'],
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Add indexes for better query performance
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  // Calculate item totals
  this.items.forEach(item => {
    item.total = item.price * item.qty;
  });
  
  // Calculate order totals if not set
  if (this.isNew) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    this.total = this.subtotal + (this.deliveryFee || 0);
  }
  
  next();
});

// Create a text index for search
orderSchema.index({
  'items.name': 'text',
  'shippingAddress': 'text',
  'paymentId': 'text'
}, {
  weights: {
    'items.name': 3,
    'shippingAddress': 2,
    'paymentId': 1
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
