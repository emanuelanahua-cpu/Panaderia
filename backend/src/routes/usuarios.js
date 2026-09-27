const router = require('express').Router();
const ctrl = require('../controllers/usuariosController');

router.post('/', ctrl.crear);
router.post('/login', ctrl.login);
router.get('/', ctrl.listar);

module.exports = router;
