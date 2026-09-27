const pool = require('../config/db');

// Resumen del dia: total vendido, total cobrado y cuanto falta cobrar.
// Esto reemplaza el "tachar en el cuaderno" al cuadrar caja.
exports.resumenDia = async (req, res, next) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().slice(0, 10);

    const [[totales]] = await pool.query(
      `SELECT
        IFNULL(SUM(p.total), 0) AS total_vendido,
        IFNULL((SELECT SUM(pg.monto) FROM pagos pg
                WHERE DATE(pg.fecha_pago) = ?), 0) AS total_cobrado
       FROM pedidos p WHERE DATE(p.fecha_pedido) = ?`,
      [fecha, fecha]
    );

    const total_vendido = Number(totales.total_vendido);
    const total_cobrado = Number(totales.total_cobrado);

    const [pendientes] = await pool.query(
      `SELECT v.* FROM vista_estado_pedidos v
       JOIN pedidos p ON p.id = v.pedido_id
       WHERE DATE(p.fecha_pedido) = ? AND v.estado_pago != 'pagado_completo'`,
      [fecha]
    );

    res.json({
      fecha,
      total_vendido,
      total_cobrado,
      total_pendiente: total_vendido - total_cobrado,
      pedidos_pendientes: pendientes
    });
  } catch (e) { next(e); }
};

// Guarda el cierre de caja del dia (queda registrado, ya no depende del cuaderno)
exports.cerrarDia = async (req, res, next) => {
  try {
    const { fecha, usuario_id, total_vendido, total_cobrado, total_pendiente } = req.body;
    if (!fecha || !usuario_id) {
      return res.status(400).json({ error: 'fecha y usuario_id son requeridos' });
    }
    await pool.query(
      `INSERT INTO cierre_caja (fecha, total_vendido, total_cobrado, total_pendiente, usuario_id)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE total_vendido = VALUES(total_vendido),
         total_cobrado = VALUES(total_cobrado), total_pendiente = VALUES(total_pendiente)`,
      [fecha, total_vendido || 0, total_cobrado || 0, total_pendiente || 0, usuario_id]
    );
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
};
