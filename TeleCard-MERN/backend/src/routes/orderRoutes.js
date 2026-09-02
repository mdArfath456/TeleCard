const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.post('/', ctrl.createOrder);
router.get('/my', ctrl.getMyOrders);
router.get('/my/:orderId', ctrl.getMyOrder);
router.get('/admin/all', requireAdmin, ctrl.getAllOrders);
router.get('/admin/:orderId', requireAdmin, ctrl.getOrderById);
router.put('/admin/:orderId/status', requireAdmin, ctrl.updateStatus);
router.post('/admin/:orderId/fulfill', requireAdmin, ctrl.fulfillOrder);

module.exports = router;
