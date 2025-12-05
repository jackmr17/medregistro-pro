// server.js - MedRegistro Pro (versión MVC + Adapter)
const express = require('express');
const path = require('path');

const sessionMiddleware = require('./config/sesiones');

// Rutas
const authRutas = require('./rutas/authRutas');
const clinicasRutas = require('./rutas/clinicasRutas');
const doctoresRutas = require('./rutas/doctoresRutas');
const especialidadesRutas = require('./rutas/especialidadesRutas');
const reservasRutas = require('./rutas/reservasRutas');

const app = express();
const PORT = 3000;
port : 3307

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// Archivos estáticos
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.use('/imagenes', express.static(path.join(publicPath, 'imagenes')));

// Rutas de páginas
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'PaginaPrincipal.html'));
});

app.get('/PaginaPrincipal', (req, res) => {
  res.sendFile(path.join(publicPath, 'PaginaPrincipal.html'));
});

app.get('/Clinicas', (req, res) => {
  res.sendFile(path.join(publicPath, 'Clinicas.html'));
});

// (El resto de páginas HTML las sirves igual si quieres rutas “bonitas”)
// Ejemplos:
// app.get('/IniciarSesion', (req,res)=>res.sendFile(path.join(publicPath,'IniciarSesion.html')));
// app.get('/PanelUsuario', (req,res)=>res.sendFile(path.join(publicPath,'PanelUsuario.html')));
// app.get('/PanelAdmin', (req,res)=>res.sendFile(path.join(publicPath,'PanelAdmin.html')));

// Rutas API (todas empiezan con /api/..., pero las definimos en los archivos de rutas)
app.use(authRutas);
app.use(clinicasRutas);
app.use(doctoresRutas);
app.use(especialidadesRutas);
app.use(reservasRutas);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
