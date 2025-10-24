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
};

exports.getMyCart = async (req, res) => {
  try {
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
  }
};

exports.addOrIncrement = async (req, res) => {
  try {
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
  }
};

exports.removeItem = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { id: productId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
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
      await user.save();
      return res.json({ items: [] });
    }
    
    // Find the index of the item to remove
    const itemIndex = user.cart.findIndex(
      item => item.product && item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Remove the item from the cart
    user.cart.splice(itemIndex, 1);
    
    // Save the updated user with cart
    await user.save();
    
    // If cart is empty after removal, return empty array
    if (user.cart.length === 0) {
      return res.json({ items: [], message: 'Item removed from cart' });
    }
    
    // Get updated cart with product details
    const updatedCart = [];
    for (const item of user.cart) {
      try {
        const product = await Product.findById(item.product);
        if (product) {
          updatedCart.push({
            _id: product._id,
            name: item.name || product.name,
            price: item.price || product.price,
            stock: product.stock,
            imageUrl: item.imageUrl || product.imageUrl || '',
            description: product.description || '',
            qty: item.qty || 1
          });
        }
      } catch (error) {
        console.error(`Error processing product ${item.product}:`, error);
      }
    }
    
    res.json({ 
      success: true,
      message: 'Item removed from cart',
      items: updatedCart
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
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated' 
      });
    }
    
    // Get quantity from query parameters instead of request body
    const qty = req.query.qty || req.body.qty;
    const { id } = req.params;
    
    // Validate input
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid product ID is required' 
      });
    }
    
    const parsedQty = Math.max(0, Math.min(parseInt(qty, 10) || 1, 100));
    
    // Find the product to get stock
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    // Get user with cart
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Initialize cart if it doesn't exist
    if (!user.cart) {
      user.cart = [];
    }
    
    // Find the item in cart
    const itemIndex = user.cart.findIndex(
      item => item.product && item.product.toString() === id
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found in cart',
        items: user.cart.map(item => ({
          _id: item.product,
          name: item.name,
          price: item.price,
          stock: item.stock,
          imageUrl: item.imageUrl,
          description: item.description,
          qty: item.qty
        }))
      });
    }
    
    if (parsedQty <= 0) {
      // Remove item if quantity is zero or negative
      user.cart.splice(itemIndex, 1);
    } else {
      // Update quantity and ensure it doesn't exceed stock
      const newQty = Math.min(parsedQty, product.stock);
      if (newQty < 1) {
        // If the calculated quantity is less than 1, remove the item
        user.cart.splice(itemIndex, 1);
      } else {
        // Otherwise, update the item
        user.cart[itemIndex].qty = newQty;
        // Update other product details in case they've changed
        user.cart[itemIndex].price = product.price;
        user.cart[itemIndex].name = product.name;
        user.cart[itemIndex].imageUrl = product.imageUrl || product.img || '';
        user.cart[itemIndex].description = product.description || '';
        user.cart[itemIndex].stock = product.stock;
      }
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
      success: true,
      message: 'Cart updated successfully',
      items: responseItems
    });
    
  } catch (error) {
    console.error('Error in updateQty:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.clearCart = async (req, res) => {
  try {
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
  }
};