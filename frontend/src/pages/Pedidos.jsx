import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Pedidos() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [items, setItems] = useState([{ producto_id: '', cantidad: 1 }]);
  const [error, setError] = useState('');

  const cargarTodo = async () => {
    const [c, p, ped] = await Promise.all([
      api.get('/clientes'),
      api.get('/productos'),
      api.get('/pedidos'),
    ]);
    setClientes(c);
    setProductos(p);
    setPedidos(ped);
  };

  useEffect(() => { cargarTodo(); }, []);

  const actualizarItem = (idx, campo, valor) => {
    const copia = [...items];
    copia[idx][campo] = valor;
    setItems(copia);
  };

  const agregarLinea = () => setItems([...items, { producto_id: '', cantidad: 1 }]);

  const crearPedido = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/pedidos', {
        cliente_id: Number(clienteId),
        usuario_id: 1,
        items: items
          .filter((i) => i.producto_id)
          .map((i) => ({ producto_id: Number(i.producto_id), cantidad: Number(i.cantidad) })),
      });
      setClienteId('');
      setItems([{ producto_id: '', cantidad: 1 }]);
      cargarTodo();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section>
      <h2>Nuevo pedido</h2>
      <form onSubmit={crearPedido}>
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
          <option value="">-- Cliente --</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        {items.map((item, idx) => (
          <div key={idx} className="linea-item">
            <select
              value={item.producto_id}
              onChange={(e) => actualizarItem(idx, 'producto_id', e.target.value)}
              required
            >
              <option value="">-- Producto --</option>
              {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <input
              type="number"
              min="1"
              value={item.cantidad}
              onChange={(e) => actualizarItem(idx, 'cantidad', e.target.value)}
            />
          </div>
        ))}
        <button type="button" onClick={agregarLinea}>+ agregar producto</button>
        <button type="submit">Crear pedido</button>
      </form>
      {error && <p className="error">{error}</p>}

      <h2>Pedidos</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Cliente</th><th>Total</th><th>Pagado</th><th>Saldo</th><th>Estado pago</th></tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.pedido_id}>
              <td>{p.pedido_id}</td>
              <td>{p.cliente}</td>
              <td>S/ {Number(p.total).toFixed(2)}</td>
              <td>S/ {Number(p.total_pagado).toFixed(2)}</td>
              <td>S/ {Number(p.saldo).toFixed(2)}</td>
              <td><span className={`badge ${p.estado_pago}`}>{p.estado_pago}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
