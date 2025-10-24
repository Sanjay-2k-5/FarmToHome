const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public (adjust as needed)
exports.getProducts = async (req, res) => {
  try {
    const { category, availability, sort } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (availability === 'active') filter.isActive = true;
    if (availability === 'inactive') filter.isActive = false;
    let sortOpt = { createdAt: -1 };
    // If availability filter is applied, sort by stock desc primarily
    if (availability === 'active' || availability === 'inactive') {
      sortOpt = { stock: -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOpt = { createdAt: 1 };
    }
    const products = await Product.find(filter).sort(sortOpt);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, category, isActive } = req.body;
    if (!name || price == null) return res.status(400).json({ message: 'Name and price are required' });
    const product = await Product.create({ name, description, price, stock, imageUrl, category, isActive });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const updates = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
