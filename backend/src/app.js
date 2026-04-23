require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes      = require('./modules/auth/auth.routes');
const usuariosRoutes  = require('./modules/usuarios/usuarios.routes');
const clientesRoutes  = require('./modules/clientes/clientes.routes');
const causasRoutes    = require('./modules/causas/causas.routes');
const acuerdosRoutes  = require('./modules/acuerdos/acuerdos.routes');
const cuotasRoutes    = require('./modules/cuotas/cuotas.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Rutas
app.use('/api/auth',      authRoutes);
app.use('/api/usuarios',  usuariosRoutes);
app.use('/api/clientes',  clientesRoutes);
app.use('/api/causas',    causasRoutes);
app.use('/api/acuerdos',  acuerdosRoutes);
app.use('/api/cuotas',    cuotasRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (_, res) => res.json({ estado: 'OK' }));

// 404
app.use((_, res) => res.status(404).json({ mensaje: 'Ruta no encontrada' }));

// Error handler global
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Legal Check API corriendo en http://localhost:${PORT}`);
});
