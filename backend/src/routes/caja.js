const router = require('express').Router();
const ctrl = require('../controllers/cajaController');

router.get('/resumen', ctrl.resumenDia);
router.post('/cerrar', ctrl.cerrarDia);

module.exports = router;
