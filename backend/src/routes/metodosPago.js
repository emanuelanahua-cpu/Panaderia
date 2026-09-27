const router = require('express').Router();
const ctrl = require('../controllers/metodosPagoController');

router.get('/', ctrl.listar);

module.exports = router;
