import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({ nombre: '', precio: '', stock: '' });
  const [error, setError] = useState('');

  const cargar = async () => setProductos(await api.get('/productos'));

  useEffect(() => { cargar(); }, []);

  const crear = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/productos', {
        nombre: form.nombre,
        precio: Number(form.precio),
        stock: Number(form.stock || 0),
      });
      setForm({ nombre: '', precio: '', stock: '' });
      cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section>
      <h2>Productos</h2>
      <form onSubmit={crear}>
        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          placeholder="Precio"
          type="number"
          step="0.01"
          value={form.precio}
          onChange={(e) => setForm({ ...form, precio: e.target.value })}
          required
        />
        <input
          placeholder="Stock"
          type="number"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />
        <button type="submit">Agregar</button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {productos.map((p) => (
          <li key={p.id}>{p.nombre} – S/ {Number(p.precio).toFixed(2)} (stock: {p.stock})</li>
        ))}
      </ul>
    </section>
  );
}
