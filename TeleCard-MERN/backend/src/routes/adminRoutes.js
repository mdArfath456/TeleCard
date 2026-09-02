const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);
router.get('/users', ctrl.getAllUsers);
router.get('/users/customers', ctrl.getCustomers);
router.get('/users/:id', ctrl.getUser);
router.put('/users/:id/block', ctrl.blockUser);
router.put('/users/:id/activate', ctrl.activateUser);
router.delete('/users/:id', ctrl.deleteUser);
router.put('/users/:id/role', ctrl.changeRole);

module.exports = router;
