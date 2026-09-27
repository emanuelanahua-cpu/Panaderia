const pool = require('../config/db');

exports.listar = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(rows);
  } catch (e) { next(e); }
};

exports.crear = async (req, res, next) => {
  try {
    const { nombre, telefono } = req.body;
    if (!nombre) return res.status(400).json({ error: 'nombre es requerido' });
    const [result] = await pool.query(
      'INSERT INTO clientes (nombre, telefono) VALUES (?, ?)',
      [nombre, telefono || null]
    );
    res.status(201).json({ id: result.insertId, nombre, telefono });
  } catch (e) { next(e); }
};

exports.obtener = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (e) { next(e); }
};
