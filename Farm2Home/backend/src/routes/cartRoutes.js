const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMyCart, addOrIncrement, updateQty, removeItem, clearCart } = require('../controllers/cartController');

router.use(protect);

router.get('/', getMyCart);
router.post('/', addOrIncrement);
// Use ':id' for the PUT route so controller can read req.params.id
router.put('/:id', updateQty);
router.delete('/:id', removeItem);
router.delete('/', clearCart);

module.exports = router;
