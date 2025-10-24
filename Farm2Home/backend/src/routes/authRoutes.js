const express = require('express');
const router = express.Router();
const { register, login, getMe, requestPasswordReset, resetPassword, sendVerification, verifyEmail, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerRules, loginRules, forgotPasswordRules, resetPasswordRules, updateProfileRules, validate } = require('../middleware/validators/authValidator');

// Apply rate limiting to auth routes
router.use(authLimiter);

// Public routes
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/forgot-password', forgotPasswordRules, validate, requestPasswordReset);
router.post('/reset-password', resetPasswordRules, validate, resetPassword);
router.get('/verify-email', verifyEmail);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.post('/send-verification', sendVerification);
router.put('/profile', updateProfileRules, validate, updateProfile);

// Example admin-only route (uncomment to use)
// router.get('/admin-only', protect, authorize('admin'), (req, res) => {
//   res.json({ message: 'Welcome admin' });
// });

module.exports = router;
