const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { fname, lname, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Ensure the role is one of the allowed values
    const allowedRoles = ['user', 'admin', 'farmer'];
    const userRole = allowedRoles.includes(role) ? role : 'user';
    
    user = await User.create({ 
      fname, 
      lname, 
      email, 
      password, 
      role: userRole 
    });

    res.status(201).json({
      _id: user._id,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      _id: user._id,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset link has been sent' });

    const token = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    // In production: send email with reset link containing raw token
    // For development: return the token so you can test
    return res.json({ message: 'Password reset requested', resetToken: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send email verification
// @route   POST /api/auth/send-verification
// @access  Private
exports.sendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.json({ message: 'Email already verified' });

    const token = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });

    // In production: send email with verification link containing raw token
    // For development: return the token so you can test
    res.json({ message: 'Verification email sent', verifyToken: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email?token=...
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    const allowed = ['fname', 'lname', 'password'];
    for (const key of allowed) {
      if (req.body[key]) updates[key] = req.body[key];
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    Object.assign(user, updates);
    await user.save();

    const safe = await User.findById(user._id);
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
