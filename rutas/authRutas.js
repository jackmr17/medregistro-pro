// rutas/authRutas.js
const express = require('express');
const router = express.Router();
const { registro, login, logout } = require('../controladores/authControlador');

// Usamos rutas completas para no cambiar el frontend
router.post('/api/auth/registro', registro);
router.post('/api/auth/login', login);
router.post('/api/auth/logout', logout);

module.exports = router;
