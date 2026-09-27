const router = require('express').Router();
const ctrl = require('../controllers/clientesController');

router.get('/', ctrl.listar);
router.post('/', ctrl.crear);
router.get('/:id', ctrl.obtener);

module.exports = router;
