const router = require('express').Router();
const ctrl = require('../controllers/productosController');

router.get('/', ctrl.listar);
router.post('/', ctrl.crear);
router.put('/:id', ctrl.actualizar);

module.exports = router;
