const pool = require('../config/db');

// Crea el pedido junto con su detalle (arma el total automaticamente)
// body: { cliente_id, usuario_id, fecha_entrega, observaciones, items: [{producto_id, cantidad}] }
exports.crear = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { cliente_id, usuario_id, fecha_entrega, observaciones, items } = req.body;
    if (!cliente_id || !usuario_id || !Array.isArray(items) || !items.length) {
      conn.release();
      return res.status(400).json({ error: 'cliente_id, usuario_id e items son requeridos' });
    }

    await conn.beginTransaction();

    const [pedidoResult] = await conn.query(
      'INSERT INTO pedidos (cliente_id, usuario_id, fecha_entrega, observaciones, total) VALUES (?, ?, ?, ?, 0)',
      [cliente_id, usuario_id, fecha_entrega || null, observaciones || null]
    );
    const pedidoId = pedidoResult.insertId;

    let total = 0;
    for (const item of items) {
      const [[producto]] = await conn.query('SELECT precio FROM productos WHERE id = ?', [item.producto_id]);
      if (!producto) throw new Error(`Producto ${item.producto_id} no existe`);
      const subtotal = Number(producto.precio) * Number(item.cantidad);
      total += subtotal;
      await conn.query(
        'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
        [pedidoId, item.producto_id, item.cantidad, producto.precio, subtotal]
      );
    }

    await conn.query('UPDATE pedidos SET total = ? WHERE id = ?', [total, pedidoId]);
    await conn.commit();

    res.status(201).json({ pedido_id: pedidoId, total });
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
};

// Lista pedidos con su estado de pago calculado (usa la vista vista_estado_pedidos)
exports.listar = async (req, res, next) => {
  try {
    const { fecha } = req.query;
    let sql = 'SELECT * FROM vista_estado_pedidos ORDER BY pedido_id DESC';
    const params = [];
    if (fecha) {
      sql = `SELECT v.* FROM vista_estado_pedidos v
             JOIN pedidos p ON p.id = v.pedido_id
             WHERE DATE(p.fecha_pedido) = ?
             ORDER BY v.pedido_id DESC`;
      params.push(fecha);
    }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) { next(e); }
};

// Responde directamente la pregunta del cuaderno: reservado / adelanto / pagado
exports.estado = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vista_estado_pedidos WHERE pedido_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(rows[0]);
  } catch (e) { next(e); }
};

exports.cambiarEstado = async (req, res, next) => {
  try {
    const { estado } = req.body;
    const validos = ['reservado', 'en_preparacion', 'entregado', 'cancelado'];
    if (!validos.includes(estado)) return res.status(400).json({ error: 'estado invalido' });
    await pool.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
};
