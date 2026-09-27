import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');

  const cargar = async () => setClientes(await api.get('/clientes'));

  useEffect(() => { cargar(); }, []);

  const crear = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/clientes', { nombre, telefono });
      setNombre('');
      setTelefono('');
      cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section>
      <h2>Clientes</h2>
      <form onSubmit={crear}>
        <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <input placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        <button type="submit">Agregar</button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {clientes.map((c) => <li key={c.id}>{c.nombre}{c.telefono ? ` – ${c.telefono}` : ''}</li>)}
      </ul>
    </section>
  );
}
