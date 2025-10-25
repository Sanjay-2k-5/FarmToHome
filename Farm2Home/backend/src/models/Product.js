const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    imageUrl: { type: String, default: '' },
    // Reference to the User model for the farmer who added the product
    farmer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    // Allowed categories; include 'general' for backward compatibility
    category: { 
      type: String, 
      enum: ['fruit', 'vegetable', 'other', 'general'], 
      default: 'other' 
    },
    // Product approval status
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    // Reason for rejection (if any)
    rejectionReason: { type: String },
    // Product visibility based on admin approval
    isActive: { type: Boolean, default: false }, // Default to false until approved
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
