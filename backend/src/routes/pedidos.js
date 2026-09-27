const router = require('express').Router();
const ctrl = require('../controllers/pedidosController');

router.post('/', ctrl.crear);
router.get('/', ctrl.listar);
router.get('/:id/estado', ctrl.estado);
router.patch('/:id/estado', ctrl.cambiarEstado);

module.exports = router;
