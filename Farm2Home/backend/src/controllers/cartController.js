const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to shape item
const shapeItem = (prod, qty) => ({
  _id: String(prod._id),
  name: prod.name,
  price: prod.price,
  stock: prod.stock,
  imageUrl: prod.imageUrl || '',
  qty,
});

// Get or create cart for user
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

exports.getMyCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    // Populate products
    const productIds = cart.items.map((i) => i.product);
    const prods = await Product.find({ _id: { $in: productIds } });
    const map = new Map(prods.map((p) => [String(p._id), p]));
    const items = cart.items
      .map((i) => {
        const p = map.get(String(i.product));
        if (!p) return null;
        // Clamp qty to current stock
        const qty = Math.min(i.qty, p.stock || 0);
        return shapeItem(p, qty);
      })
      .filter(Boolean);
    res.json({ items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addOrIncrement = async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId required' });
    const prod = await Product.findById(productId);
    if (!prod) return res.status(404).json({ message: 'Product not found' });
    const cart = await getOrCreateCart(req.user._id);
    const idx = cart.items.findIndex((i) => String(i.product) === String(productId));
    const nextQty = Math.max(1, Math.min((idx >= 0 ? cart.items[idx].qty : 0) + Number(qty), prod.stock || 0));
    if (idx >= 0) cart.items[idx].qty = nextQty; else cart.items.push({ product: productId, qty: nextQty });
    await cart.save();
    return exports.getMyCart(req, res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateQty = async (req, res) => {
  try {
    const { productId } = req.params;
    let { qty } = req.body;
    qty = Number(qty);
    if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ message: 'Invalid qty' });
    const prod = await Product.findById(productId);
    if (!prod) return res.status(404).json({ message: 'Product not found' });
    const cart = await getOrCreateCart(req.user._id);
    const idx = cart.items.findIndex((i) => String(i.product) === String(productId));
    if (idx < 0) return res.status(404).json({ message: 'Item not in cart' });
    cart.items[idx].qty = Math.min(qty, prod.stock || 0);
    await cart.save();
    return exports.getMyCart(req, res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((i) => String(i.product) !== String(productId));
    await cart.save();
    return exports.getMyCart(req, res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    return exports.getMyCart(req, res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
