const router = require('express').Router();
const ctrl = require('../controllers/paymentController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/config', ctrl.getGatewayConfig);

router.use(authenticate);
router.post('/order/:orderId', ctrl.createPayment);
router.post('/order/:orderId/razorpay/create', ctrl.createRazorpayOrder);
router.post('/order/:orderId/razorpay/verify', ctrl.verifyRazorpayPayment);
router.post('/order/:orderId/submit', upload.single('screenshot'), upload.finalizeUpload, ctrl.submitPayment);
router.get('/order/:orderId', ctrl.getMyPayment);
router.get('/admin/all', requireAdmin, ctrl.getAllPayments);
router.get('/admin/submitted', requireAdmin, ctrl.getSubmittedPayments);
router.get('/admin/:paymentId', requireAdmin, ctrl.getPaymentById);
router.post('/admin/:paymentId/verify', requireAdmin, ctrl.verifyPayment);

module.exports = router;
