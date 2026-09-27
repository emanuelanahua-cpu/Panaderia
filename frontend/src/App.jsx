import { useState } from 'react';
import Caja from './pages/Caja.jsx';
import Pedidos from './pages/Pedidos.jsx';
import Pagos from './pages/Pagos.jsx';
import Clientes from './pages/Clientes.jsx';
import Productos from './pages/Productos.jsx';

const TABS = [
  { id: 'caja', label: 'Caja del día', Component: Caja },
  { id: 'pedidos', label: 'Pedidos', Component: Pedidos },
  { id: 'pagos', label: 'Pagos', Component: Pagos },
  { id: 'clientes', label: 'Clientes', Component: Clientes },
  { id: 'productos', label: 'Productos', Component: Productos },
];

export default function App() {
  const [tab, setTab] = useState('caja');
  const Active = TABS.find((t) => t.id === tab).Component;

  return (
    <div className="app">
      <header>
        <h1>🍞 Panadería Emanuel</h1>
        <nav>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? 'active' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main>
        <Active />
      </main>
    </div>
  );
}
