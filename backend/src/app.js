require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const clientesRoutes = require('./routes/clientes');
const productosRoutes = require('./routes/productos');
const usuariosRoutes = require('./routes/usuarios');
const metodosPagoRoutes = require('./routes/metodosPago');
const pedidosRoutes = require('./routes/pedidos');
const pagosRoutes = require('./routes/pagos');
const cajaRoutes = require('./routes/caja');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/clientes', clientesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/metodos-pago', metodosPagoRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/caja', cajaRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta de API no encontrada' });
});

// Frontend de React ya compilado (npm run build en /frontend genera /frontend/dist)
const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
