// rutas/reservasRutas.js
const express = require('express');
const router = express.Router();
const { requireLogin, requireAdmin } = require('../middlewares/authMiddleware');
const MailtrapAdapter = require('../servicios/correo/MailtrapAdapter');

const correoAdapter = new MailtrapAdapter();

const {
  horasDisponibles,
  crearReservaControlador,
  misReservas,
  obtenerReserva,
  cancelarReserva,
  eliminarReservaAdmin,
  comprobantePdf,
  pagarReserva,
  reservasAdmin,
  usuariosAdmin
} = require('../controladores/reservasControlador');

// Horas disponibles
router.get('/api/reservas/horas-disponibles', horasDisponibles);

// Reservas usuario
router.post('/api/reservas', requireLogin, (req, res) =>
  crearReservaControlador(req, res, correoAdapter)
);
router.get('/api/reservas/mias', requireLogin, misReservas);
router.get('/api/reservas/:id', requireLogin, obtenerReserva);
router.post('/api/reservas/:id/cancelar', requireLogin, cancelarReserva);
router.delete('/api/reservas/:id', requireAdmin, eliminarReservaAdmin);

// Comprobante PDF
router.get('/api/reservas/:id/comprobante', requireLogin, comprobantePdf);

// Pagos simulados
router.post('/api/pagos/:reserva_id', requireLogin, pagarReserva);

// Admin reservas y usuarios
router.get('/api/admin/reservas', requireAdmin, reservasAdmin);
router.get('/api/admin/usuarios', requireAdmin, usuariosAdmin);

module.exports = router;
