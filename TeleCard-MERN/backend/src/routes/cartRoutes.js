const router = require('express').Router();
const ctrl = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getCart);
router.post('/add', ctrl.addToCart);
router.put('/item/:itemId', ctrl.updateQuantity);
router.put('/item/:itemId/increase', ctrl.increaseQuantity);
router.put('/item/:itemId/decrease', ctrl.decreaseQuantity);
router.delete('/item/:itemId', ctrl.removeItem);
router.delete('/clear', ctrl.clearCart);

module.exports = router;
