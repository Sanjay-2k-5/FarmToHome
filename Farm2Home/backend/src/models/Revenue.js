const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'processed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Revenue', revenueSchema);
