const pool = require('../config/db');

exports.listar = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM metodos_pago');
    res.json(rows);
  } catch (e) { next(e); }
};
