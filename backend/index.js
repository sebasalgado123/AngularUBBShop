const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const productosRoutes = require('./routes/productos.routes');
const categoriasRoutes = require('./routes/categorias.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const mensajesRoutes = require('./routes/mensajes.routes');
const notificacionesRoutes = require('./routes/notificaciones.routes');
const pagosRoutes = require('./routes/pagos.routes');
const finanzasRoutes = require('./routes/finanzas.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Carpeta para servir imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoint de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected'
  });
});

// Rutas API
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/mensajes', mensajesRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/finanzas', finanzasRoutes);

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
}); 