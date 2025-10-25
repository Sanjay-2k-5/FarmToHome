const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Get all pending products for admin review
// @route   GET /api/admin/products/pending
// @access  Private/Admin
exports.getPendingProducts = asyncHandler(async (req, res) => {
  try {
    console.log('Fetching pending products...');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count of pending products
    const total = await Product.countDocuments({ status: 'pending' });
    
    const products = await Product.find({ status: 'pending' })
      .populate('farmer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`Found ${products.length} pending products`);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products
    });
  } catch (error) {
    console.error('Error in getPendingProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending products',
      error: error.message
    });
  }
});

// @desc    Update product status (approve/reject)
// @route   PUT /api/admin/products/:id/status
// @access  Private/Admin
exports.updateProductStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  
  if (!['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status. Must be either "approved" or "rejected"');
  }

  const updateFields = { 
    status,
    isActive: status === 'approved',
    ...(status === 'rejected' && { rejectionReason })
  };

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    updateFields,
    { new: true, runValidators: true }
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({
    success: true,
    product
  });
});
