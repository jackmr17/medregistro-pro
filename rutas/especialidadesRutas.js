// rutas/especialidadesRutas.js
const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middlewares/authMiddleware');
const {
  listarEspecialidadesPorClinica,
  listarEspecialidadesAdmin,
  crearEspecialidad,
  actualizarEspecialidad,
  eliminarEspecialidad
} = require('../controladores/especialidadesControlador');

// Público
router.get('/api/especialidades', listarEspecialidadesPorClinica);

// Admin
router.get('/api/admin/especialidades', requireAdmin, listarEspecialidadesAdmin);
router.post('/api/admin/especialidades', requireAdmin, crearEspecialidad);
router.put('/api/admin/especialidades/:id', requireAdmin, actualizarEspecialidad);
router.delete('/api/admin/especialidades/:id', requireAdmin, eliminarEspecialidad);

module.exports = router;
