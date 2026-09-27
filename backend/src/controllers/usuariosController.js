const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.crear = async (req, res, next) => {
  try {
    const { nombre, usuario, password, rol } = req.body;
    if (!nombre || !usuario || !password) {
      return res.status(400).json({ error: 'nombre, usuario y password son requeridos' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, usuario, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre, usuario, password_hash, rol || 'vendedor']
    );
    res.status(201).json({ id: result.insertId, nombre, usuario, rol: rol || 'vendedor' });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const { usuario, password } = req.body;
    const [[u]] = await pool.query(
      'SELECT * FROM usuarios WHERE usuario = ? AND activo = TRUE',
      [usuario]
    );
    if (!u) return res.status(401).json({ error: 'Credenciales invalidas' });
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales invalidas' });
    res.json({ id: u.id, nombre: u.nombre, rol: u.rol });
  } catch (e) { next(e); }
};

exports.listar = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre, usuario, rol, activo FROM usuarios');
    res.json(rows);
  } catch (e) { next(e); }
};
