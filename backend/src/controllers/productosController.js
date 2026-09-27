const pool = require('../config/db');

exports.listar = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE activo = TRUE ORDER BY nombre');
    res.json(rows);
  } catch (e) { next(e); }
};

exports.crear = async (req, res, next) => {
  try {
    const { nombre, descripcion, precio, stock } = req.body;
    if (!nombre || precio == null) {
      return res.status(400).json({ error: 'nombre y precio son requeridos' });
    }
    const [result] = await pool.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)',
      [nombre, descripcion || null, precio, stock || 0]
    );
    res.status(201).json({ id: result.insertId, nombre, precio });
  } catch (e) { next(e); }
};

exports.actualizar = async (req, res, next) => {
  try {
    const { nombre, descripcion, precio, stock, activo } = req.body;
    await pool.query(
      'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, activo = ? WHERE id = ?',
      [nombre, descripcion, precio, stock, activo, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) { next(e); }
};
