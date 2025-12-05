// controladores/reservasControlador.js
const { query } = require('../config/bd');
const { getUserFromSession } = require('../middlewares/authMiddleware');
const {
  obtenerHorasDisponibles,
  crearReserva,
  obtenerReservasDeUsuario,
  obtenerReservaDetalleCompleto,
  obtenerReservaSimple,
  listarReservasAdmin
} = require('../modelos/ReservaModelo');
const { generarComprobantePDF } = require('../servicios/pdf/ComprobantePDF');

// GET /api/reservas/horas-disponibles
async function horasDisponibles(req, res) {
  try {
    const { doctor_id, fecha } = req.query;
    if (!doctor_id || !fecha) {
      return res.status(400).json([]);
    }
    const horas = await obtenerHorasDisponibles(doctor_id, fecha);
    res.json(horas);
  } catch (err) {
    console.error('Error en horasDisponibles:', err);
    res.status(500).json([]);
  }
}

// POST /api/reservas  (usa adapter para correo)
async function crearReservaControlador(req, res, correoAdapter) {
  try {
    const userId = req.session.userId;
    const {
      clinica_id,
      especialidad_id,
      doctor_id,
      fecha,
      hora,
      monto,
      metodo_pago
    } = req.body;

    if (!clinica_id || !especialidad_id || !doctor_id || !fecha || !hora || !metodo_pago) {
      return res.status(400).json({ ok: false, mensaje: 'Faltan datos de la reserva.' });
    }

    const horasDisp = await query(
      `SELECT hora FROM reservas
       WHERE doctor_id = ? AND fecha = ? AND hora = ? AND estado IN ('pendiente','pagada')`,
      [doctor_id, fecha, hora + ':00']
    );
    if (horasDisp.length) {
      return res.status(400).json({ ok: false, mensaje: 'La hora ya no está disponible.' });
    }

    const estadoInicial = 'pendiente';
    const idReserva = await crearReserva({
      usuario_id: userId,
      clinica_id,
      especialidad_id,
      doctor_id,
      fecha,
      hora,
      monto: monto || 25000,
      metodo_pago,
      estado: estadoInicial
    });

    const reserva = {
      id: idReserva,
      clinica_id,
      especialidad_id,
      doctor_id,
      fecha,
      hora,
      monto,
      metodo_pago,
      estado: estadoInicial
    };

    // Enviar correo (no rompe si falla)
    try {
      const det = await obtenerReservaDetalleCompleto(idReserva);
      if (det && det.correo) {
        await correoAdapter.enviarConfirmacionReserva({
          correoPaciente: det.correo,
          nombrePaciente: `${det.nombres} ${det.apellidos}`,
          rut: det.rut,
          fecha: det.fecha_atencion,
          hora: det.hora_atencion,
          clinica: det.clinica,
          especialidad: det.especialidad,
          doctor: det.doctor,
          monto: det.monto,
          metodo_pago: det.metodo_pago,
          estado: det.estado
        });
      }
    } catch (errCorreo) {
      console.error('Error enviando correo de reserva:', errCorreo);
    }

    res.json({ ok: true, reserva });
  } catch (err) {
    console.error('Error en crearReservaControlador:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al crear la reserva.' });
  }
}

// GET /api/reservas/mias
async function misReservas(req, res) {
  try {
    const userId = req.session.userId;
    const rows = await obtenerReservasDeUsuario(userId);
    res.json({ ok: true, reservas: rows });
  } catch (err) {
    console.error('Error en misReservas:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener reservas.' });
  }
}

// GET /api/reservas/:id
async function obtenerReserva(req, res) {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const r = await obtenerReservaSimple(id);
    if (!r) {
      return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada.' });
    }

    const user = await getUserFromSession(req);
    if (r.usuario_id !== userId && (!user || user.rol !== 'admin')) {
      return res.status(403).json({ ok: false, mensaje: 'No autorizado.' });
    }

    res.json({ ok: true, reserva: r });
  } catch (err) {
    console.error('Error en obtenerReserva:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener reserva.' });
  }
}

// POST /api/reservas/:id/cancelar
async function cancelarReserva(req, res) {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const rows = await query(
      `SELECT id,
              usuario_id,
              estado,
              TIMESTAMPDIFF(HOUR, NOW(), CONCAT(fecha, ' ', hora)) AS horas_restantes
       FROM reservas
       WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada.' });
    }

    const r = rows[0];
    if (r.usuario_id !== userId) {
      return res.status(403).json({ ok: false, mensaje: 'No autorizado.' });
    }

    if (r.estado === 'cancelada') {
      return res.status(400).json({ ok: false, mensaje: 'La reserva ya está cancelada.' });
    }

    if (r.horas_restantes < 24) {
      return res.status(400).json({ ok: false, mensaje: 'Solo puedes cancelar con al menos 24 horas de anticipación.' });
    }

    await query(
      `UPDATE reservas
       SET estado = 'cancelada', cancelada_at = NOW()
       WHERE id = ?`,
      [id]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('Error en cancelarReserva:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al cancelar reserva.' });
  }
}

// DELETE /api/reservas/:id  (admin)
async function eliminarReservaAdmin(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM reservas WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error en eliminarReservaAdmin:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar reserva.' });
  }
}

// GET /api/reservas/:id/comprobante
async function comprobantePdf(req, res) {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const reserva = await obtenerReservaDetalleCompleto(id);
    if (!reserva) {
      return res.status(404).send('Reserva no encontrada.');
    }

    const user = await getUserFromSession(req);
    if (!user || (user.id !== reserva.usuario_id && user.rol !== 'admin')) {
      return res.status(403).send('No autorizado.');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="comprobante_reserva_${id}.pdf"`
    );

    generarComprobantePDF(reserva, res);
  } catch (err) {
    console.error('Error en comprobantePdf:', err);
    res.status(500).send('Error al generar comprobante.');
  }
}

// POST /api/pagos/:reserva_id
async function pagarReserva(req, res) {
  try {
    const { reserva_id } = req.params;
    const userId = req.session.userId;

    const r = await obtenerReservaSimple(reserva_id);
    if (!r) {
      return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada.' });
    }

    if (r.usuario_id !== userId) {
      return res.status(403).json({ ok: false, mensaje: 'No autorizado.' });
    }

    if (r.metodo_pago === 'clinica') {
      return res.status(400).json({ ok: false, mensaje: 'Esta reserva es de pago en clínica.' });
    }

    if (r.estado === 'pagada') {
      return res.status(400).json({ ok: false, mensaje: 'La reserva ya está pagada.' });
    }

    await query(
      `UPDATE reservas
       SET estado = 'pagada', pagada_at = NOW()
       WHERE id = ?`,
      [reserva_id]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('Error en pagarReserva:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al procesar pago.' });
  }
}

// GET /api/admin/reservas
async function reservasAdmin(req, res) {
  try {
    const { reservas, hoy } = await listarReservasAdmin();
    res.json({ ok: true, reservas, hoy });
  } catch (err) {
    console.error('Error en reservasAdmin:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener reservas.' });
  }
}

// GET /api/admin/usuarios
async function usuariosAdmin(req, res) {
  try {
    const rows = await query(
      `SELECT id, nombres, apellidos, rut, correo, rol
       FROM usuarios
       ORDER BY created_at DESC`
    );
    res.json({ ok: true, usuarios: rows });
  } catch (err) {
    console.error('Error en usuariosAdmin:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener usuarios.' });
  }
}

module.exports = {
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
};
