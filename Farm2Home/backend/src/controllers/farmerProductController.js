const Product = require('../models/Product');

// @desc    Get all products (for farmer's view)
// @route   GET /api/farmer/products
// @access  Private/Farmer
exports.getFarmerProducts = async (req, res) => {
  try {
    console.log('Fetching all products for farmer view');
    
    // Get all products, not filtered by farmer
    const products = await Product.find({})
      .populate('category', 'name')
      .populate('farmer', 'name email') // Include farmer details
      .sort({ createdAt: -1 });

    console.log(`Found ${products.length} products`);

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error in getFarmerProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create a new product
// @route   POST /api/farmer/products
// @access  Private/Farmer
exports.createProduct = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    // Parse form data
    const { name, description, price, stock, category, imageUrl } = req.body;
    
    // Validate required fields
    if (!name || !price || !stock || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, price, stock, and category'
      });
    }

    // Validate price and stock are numbers
    if (isNaN(price) || isNaN(stock)) {
      return res.status(400).json({
        success: false,
        message: 'Price and stock must be valid numbers'
      });
    }

    // Convert to proper types
    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);

    if (priceNum <= 0 || stockNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0 and stock cannot be negative'
      });
    }
    
    // Create product data
    const productData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      price: priceNum,
      stock: stockNum,
      category: category.trim(),
      farmer: req.user._id,
      status: 'pending', // Initial status
      isActive: false,   // Not active until approved
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Handle image URL if provided
    if (imageUrl && imageUrl.trim()) {
      productData.imageUrl = imageUrl.trim();
    }

    console.log('Creating product with data:', productData);
    
    const product = await Product.create(productData);
    
    // Populate farmer details for the response
    await product.populate('farmer', 'name email');

    res.status(201).json({
      success: true,
      message: 'Product submitted for admin approval',
      product: product
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/farmer/products/:id
// @access  Private/Admin,Farmer
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if farmer field exists, if not reject
    if (!product.farmer) {
      return res.status(400).json({
        success: false,
        message: 'Product has no farmer assigned'
      });
    }

    // Only allow deletion if user is admin or the product's owner
    // Use req.user._id (from auth middleware) and convert both to strings for comparison
    const productFarmerId = product.farmer.toString();
    const userId = req.user._id.toString();
    
    if (productFarmerId !== userId && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // Delete the product using findByIdAndDelete instead of deprecated remove()
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
