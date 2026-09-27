import { useEffect, useState } from 'react';
import { api } from '../api.js';

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

export default function Caja() {
  const [fecha, setFecha] = useState(hoy());
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');

  const cargar = async () => {
    setError('');
    try {
      setResumen(await api.get(`/caja/resumen?fecha=${fecha}`));
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { cargar(); }, [fecha]);

  const cerrarCaja = async () => {
    if (!resumen) return;
    try {
      await api.post('/caja/cerrar', {
        fecha,
        usuario_id: 1,
        total_vendido: resumen.total_vendido,
        total_cobrado: resumen.total_cobrado,
        total_pendiente: resumen.total_pendiente,
      });
      alert('Cierre de caja guardado');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section>
      <h2>Cuadre del día</h2>
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      {error && <p className="error">{error}</p>}
      {resumen && (
        <>
          <div className="cards">
            <div className="card"><span>Vendido</span><strong>S/ {resumen.total_vendido.toFixed(2)}</strong></div>
            <div className="card"><span>Cobrado</span><strong>S/ {resumen.total_cobrado.toFixed(2)}</strong></div>
            <div className="card"><span>Pendiente</span><strong>S/ {resumen.total_pendiente.toFixed(2)}</strong></div>
          </div>
          <h3>Pedidos aún no pagados por completo</h3>
          <table>
            <thead>
              <tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Pagado</th><th>Saldo</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {resumen.pedidos_pendientes.map((p) => (
                <tr key={p.pedido_id}>
                  <td>{p.pedido_id}</td>
                  <td>{p.cliente}</td>
                  <td>S/ {Number(p.total).toFixed(2)}</td>
                  <td>S/ {Number(p.total_pagado).toFixed(2)}</td>
                  <td>S/ {Number(p.saldo).toFixed(2)}</td>
                  <td><span className={`badge ${p.estado_pago}`}>{p.estado_pago}</span></td>
                </tr>
              ))}
              {!resumen.pedidos_pendientes.length && (
                <tr><td colSpan="6">Todo cobrado.</td></tr>
              )}
            </tbody>
          </table>
          <button type="button" onClick={cerrarCaja}>Cerrar caja del día</button>
        </>
      )}
    </section>
  );
}
