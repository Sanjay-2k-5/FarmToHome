<<<<<<< HEAD
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
=======
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Helper to shape cart item for response
const shapeCartItem = (item) => ({
  _id: item.product,
  name: item.name,
  price: item.price,
  stock: item.stock,
  imageUrl: item.imageUrl || '',
  qty: item.qty,
  description: item.description
});

// Helper to get user with cart populated
const getUserWithCart = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }
  
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))
};

exports.getMyCart = async (req, res) => {
  try {
<<<<<<< HEAD
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
=======
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    console.log('getMyCart called with user:', req.user._id);
    
    // Get user with cart
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If cart doesn't exist, initialize it as an empty array
    if (!user.cart) {
      user.cart = [];
      await user.save();
    }
    
    // Get product details for cart items
    const cartItems = [];
    for (const item of user.cart) {
      try {
        const product = await Product.findById(item.product);
        if (product) {
          // Update item with current product details
          cartItems.push({
            _id: product._id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            imageUrl: product.imageUrl || product.img || '',
            description: product.description,
            qty: item.qty
          });
        }
      } catch (error) {
        console.error(`Error processing cart item ${item.product}:`, error);
      }
    }
    
    res.json({ items: cartItems });
  } catch (error) {
    console.error('Error in getMyCart:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))
  }
};

exports.addOrIncrement = async (req, res) => {
  try {
<<<<<<< HEAD
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
=======
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { productId, qty = 1 } = req.body;
    
    // Validate input
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Valid productId is required' });
    }
    
    const parsedQty = Math.max(1, Math.min(Number(qty) || 1, 100)); // Limit max qty to 100
    
    console.log(`Adding/updating product ${productId} for user ${req.user._id}, qty: ${parsedQty}`);
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get user with cart
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize cart if it doesn't exist
    if (!user.cart) {
      user.cart = [];
    }
    
    // Check if item already exists in cart
    const existingItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      const newQty = Math.min(
        user.cart[existingItemIndex].qty + parsedQty,
        product.stock
      );
      
      if (newQty <= 0) {
        // Remove item if quantity is zero or negative
        user.cart.splice(existingItemIndex, 1);
      } else {
        // Update quantity
        user.cart[existingItemIndex].qty = newQty;
        user.cart[existingItemIndex].price = product.price;
        user.cart[existingItemIndex].name = product.name;
        user.cart[existingItemIndex].imageUrl = product.imageUrl || product.img || '';
        user.cart[existingItemIndex].description = product.description || '';
      }
    } else if (parsedQty > 0) {
      // Add new item
      user.cart.push({
        product: product._id,
        qty: Math.min(parsedQty, product.stock),
        price: product.price,
        name: product.name,
        imageUrl: product.imageUrl || product.img || '',
        description: product.description || '',
        stock: product.stock
      });
    }
    
    // Save the updated user with cart
    await user.save();
    
    // Format the response
    const responseItems = user.cart.map(item => ({
      _id: item.product,
      name: item.name,
      price: item.price,
      stock: item.stock,
      imageUrl: item.imageUrl,
      description: item.description,
      qty: item.qty
    }));
    
    res.json({ 
      message: 'Cart updated successfully',
      items: responseItems
    });
  } catch (error) {
    console.error('Error in addOrIncrement:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))
  }
};

exports.removeItem = async (req, res) => {
  try {
<<<<<<< HEAD
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((i) => String(i.product) !== String(productId));
    await cart.save();
    return exports.getMyCart(req, res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
=======
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Valid product ID is required' });
    }
    
    // Get user with cart
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize cart if it doesn't exist
    if (!user.cart) {
      user.cart = [];
    }
    
    // Find and remove the item
    const initialLength = user.cart.length;
    user.cart = user.cart.filter(
      item => item.product.toString() !== id
    );
    
    if (user.cart.length === initialLength) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Save the updated user with cart
    await user.save();
    
    // Format the response
    const responseItems = user.cart.map(item => ({
      _id: item.product,
      name: item.name,
      price: item.price,
      stock: item.stock,
      imageUrl: item.imageUrl,
      description: item.description,
      qty: item.qty
    }));
    
    res.json({ 
      message: 'Item removed from cart',
      items: responseItems
    });
    
  } catch (error) {
    console.error('Error in removeItem:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateQty = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { qty } = req.body;
    const { id } = req.params;
    
    // Validate input
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Valid product ID is required' });
    }
    
    const parsedQty = Math.max(0, Math.min(Number(qty) || 1, 100));
    
    // Find the product to get stock
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get user with cart
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize cart if it doesn't exist
    if (!user.cart) {
      user.cart = [];
    }
    
    // Find the item in cart
    const itemIndex = user.cart.findIndex(
      item => item.product.toString() === id
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    if (parsedQty <= 0) {
      // Remove item if quantity is zero or negative
      user.cart.splice(itemIndex, 1);
    } else {
      // Update quantity and ensure it doesn't exceed stock
      user.cart[itemIndex].qty = Math.min(parsedQty, product.stock);
      // Update other product details in case they've changed
      user.cart[itemIndex].price = product.price;
      user.cart[itemIndex].name = product.name;
      user.cart[itemIndex].imageUrl = product.imageUrl || product.img || '';
      user.cart[itemIndex].description = product.description || '';
      user.cart[itemIndex].stock = product.stock;
    }
    
    // Save the updated user with cart
    await user.save();
    
    // Format the response
    const responseItems = user.cart.map(item => ({
      _id: item.product,
      name: item.name,
      price: item.price,
      stock: item.stock,
      imageUrl: item.imageUrl,
      description: item.description,
      qty: item.qty
    }));
    
    res.json({ 
      message: 'Cart updated successfully',
      items: responseItems
    });
    
  } catch (error) {
    console.error('Error in updateQty:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))
  }
};

exports.clearCart = async (req, res) => {
  try {
<<<<<<< HEAD
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    return exports.getMyCart(req, res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
=======
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get user and clear the cart
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Clear the cart
    user.cart = [];
    await user.save();
    
    res.json({ 
      message: 'Cart cleared successfully',
      items: []
    });
    
  } catch (error) {
    console.error('Error in clearCart:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))
  }
};
