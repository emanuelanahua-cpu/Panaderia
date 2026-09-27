const router = require('express').Router();
const ctrl = require('../controllers/pagosController');

router.post('/', ctrl.crear);
router.get('/pedido/:pedidoId', ctrl.porPedido);

module.exports = router;
