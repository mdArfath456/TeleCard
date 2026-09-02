const router = require('express').Router();
const ctrl = require('../controllers/cardController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', ctrl.getCards);
router.get('/admin/all', authenticate, requireAdmin, ctrl.getAllCards);
router.post('/admin', authenticate, requireAdmin, ctrl.createCard);
router.put('/admin/:id', authenticate, requireAdmin, ctrl.updateCard);
router.put('/admin/:id/status', authenticate, requireAdmin, ctrl.setStatus);
router.delete('/admin/:id', authenticate, requireAdmin, ctrl.deleteCard);
router.get('/:id', ctrl.getCard);

module.exports = router;
