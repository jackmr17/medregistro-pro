// rutas/doctoresRutas.js
const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middlewares/authMiddleware');
const {
  listarDoctoresPublic,
  listarDoctoresAdmin,
  crearDoctor,
  actualizarDoctor,
  eliminarDoctor
} = require('../controladores/doctoresControlador');

// Público
router.get('/api/doctores', listarDoctoresPublic);

// Admin (mantiene /api/admin/doctores)
router.get('/api/admin/doctores', requireAdmin, listarDoctoresAdmin);
router.post('/api/admin/doctores', requireAdmin, crearDoctor);
router.put('/api/admin/doctores/:id', requireAdmin, actualizarDoctor);
router.delete('/api/admin/doctores/:id', requireAdmin, eliminarDoctor);

module.exports = router;
