const router = require('express').Router();
const ctrl = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', ctrl.getActiveCategories);
router.get('/admin/all', authenticate, requireAdmin, ctrl.getAllCategories);
router.post('/admin', authenticate, requireAdmin, ctrl.createCategory);
router.put('/admin/:id', authenticate, requireAdmin, ctrl.updateCategory);
router.put('/admin/:id/activate', authenticate, requireAdmin, ctrl.setActive(true));
router.put('/admin/:id/deactivate', authenticate, requireAdmin, ctrl.setActive(false));
router.delete('/admin/:id', authenticate, requireAdmin, ctrl.deleteCategory);

module.exports = router;
