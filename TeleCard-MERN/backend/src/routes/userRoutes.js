const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.put('/change-password', ctrl.changePassword);
router.delete('/account', ctrl.deactivateAccount);

module.exports = router;
