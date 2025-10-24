const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMyCart, addOrIncrement, updateQty, removeItem, clearCart } = require('../controllers/cartController');

router.use(protect);

router.get('/', getMyCart);
router.post('/', addOrIncrement);
router.put('/:productId', updateQty);
router.delete('/:productId', removeItem);
router.delete('/', clearCart);

module.exports = router;
