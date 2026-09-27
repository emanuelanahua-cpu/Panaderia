const pool = require('../config/db');

// Registra un abono (parcial o que completa el pago) para un pedido.
// body: { pedido_id, metodo_pago_id, usuario_id, monto }
exports.crear = async (req, res, next) => {
  try {
    const { pedido_id, metodo_pago_id, usuario_id, monto } = req.body;
    if (!pedido_id || !metodo_pago_id || !usuario_id || !monto) {
      return res.status(400).json({ error: 'pedido_id, metodo_pago_id, usuario_id y monto son requeridos' });
    }

    const [[pedido]] = await pool.query('SELECT total FROM pedidos WHERE id = ?', [pedido_id]);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    await pool.query(
      'INSERT INTO pagos (pedido_id, metodo_pago_id, usuario_id, monto) VALUES (?, ?, ?, ?)',
      [pedido_id, metodo_pago_id, usuario_id, monto]
    );

    // Devuelve el estado actualizado (reservado / adelanto_parcial / pagado_completo)
    const [[estado]] = await pool.query('SELECT * FROM vista_estado_pedidos WHERE pedido_id = ?', [pedido_id]);
    res.status(201).json(estado);
  } catch (e) { next(e); }
};

exports.porPedido = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT pg.*, mp.nombre AS metodo_pago FROM pagos pg
       JOIN metodos_pago mp ON mp.id = pg.metodo_pago_id
       WHERE pg.pedido_id = ? ORDER BY pg.fecha_pago`,
      [req.params.pedidoId]
    );
    res.json(rows);
  } catch (e) { next(e); }
};
