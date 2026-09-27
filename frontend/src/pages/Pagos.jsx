import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Pagos() {
  const [pedidos, setPedidos] = useState([]);
  const [metodos, setMetodos] = useState([]);
  const [pedidoId, setPedidoId] = useState('');
  const [metodoId, setMetodoId] = useState('');
  const [monto, setMonto] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  const cargar = async () => {
    const [ped, met] = await Promise.all([api.get('/pedidos'), api.get('/metodos-pago')]);
    setPedidos(ped.filter((p) => p.estado_pago !== 'pagado_completo'));
    setMetodos(met);
  };

  useEffect(() => { cargar(); }, []);

  const registrarPago = async (e) => {
    e.preventDefault();
    setError('');
    setResultado(null);
    try {
      const data = await api.post('/pagos', {
        pedido_id: Number(pedidoId),
        metodo_pago_id: Number(metodoId),
        usuario_id: 1,
        monto: Number(monto),
      });
      setResultado(data);
      setMonto('');
      cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section>
      <h2>Registrar pago / adelanto</h2>
      <form onSubmit={registrarPago}>
        <select value={pedidoId} onChange={(e) => setPedidoId(e.target.value)} required>
          <option value="">-- Pedido pendiente --</option>
          {pedidos.map((p) => (
            <option key={p.pedido_id} value={p.pedido_id}>
              #{p.pedido_id} – {p.cliente} (saldo S/ {Number(p.saldo).toFixed(2)})
            </option>
          ))}
        </select>
        <select value={metodoId} onChange={(e) => setMetodoId(e.target.value)} required>
          <option value="">-- Método de pago --</option>
          {metodos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
        <input
          type="number"
          step="0.01"
          placeholder="Monto"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
        />
        <button type="submit">Registrar</button>
      </form>
      {error && <p className="error">{error}</p>}
      {resultado && (
        <p>
          Pedido #{resultado.pedido_id}: pagado S/ {Number(resultado.total_pagado).toFixed(2)} de
          S/ {Number(resultado.total).toFixed(2)} → <strong>{resultado.estado_pago}</strong>
        </p>
      )}
    </section>
  );
}
