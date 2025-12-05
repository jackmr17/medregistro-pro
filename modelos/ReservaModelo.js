// modelos/ReservaModelo.js
const { query } = require('../config/bd');

async function obtenerHorasDisponibles(doctor_id, fecha) {
  const horasBase = [];
  for (let h = 9; h < 19; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      horasBase.push(`${hh}:${mm}:00`);
    }
  }

  const ocupadasRows = await query(
    `SELECT hora FROM reservas
     WHERE doctor_id = ? AND fecha = ? AND estado IN ('pendiente','pagada')`,
    [doctor_id, fecha]
  );

  const ocupadasSet = new Set(ocupadasRows.map(r => r.hora));

  return horasBase
    .filter(h => !ocupadasSet.has(h))
    .map(h => h.slice(0, 5)); // HH:MM
}

async function crearReserva(datos) {
  const {
    usuario_id,
    clinica_id,
    especialidad_id,
    doctor_id,
    fecha,
    hora,
    monto,
    metodo_pago,
    estado
  } = datos;

  const result = await query(
    `INSERT INTO reservas
     (usuario_id, clinica_id, doctor_id, especialidad_id, fecha, hora, monto, metodo_pago, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [usuario_id, clinica_id, doctor_id, especialidad_id, fecha, hora + ':00', monto, metodo_pago, estado]
  );

  return result.insertId;
}

async function obtenerReservasDeUsuario(usuario_id) {
  return await query(
    `SELECT r.id,
            DATE_FORMAT(r.fecha, '%Y-%m-%d') AS fecha,
            DATE_FORMAT(r.hora, '%H:%i') AS hora,
            r.estado,
            r.monto,
            c.nombre AS clinica,
            e.nombre AS especialidad,
            d.nombre AS doctor
     FROM reservas r
     JOIN clinicas c       ON r.clinica_id      = c.id
     JOIN especialidades e ON r.especialidad_id = e.id
     JOIN doctores d       ON r.doctor_id       = d.id
     WHERE r.usuario_id = ?
     ORDER BY r.fecha DESC, r.hora DESC`,
    [usuario_id]
  );
}

async function obtenerReservaDetalleCompleto(id) {
  const rows = await query(
    `SELECT 
        r.id,
        r.usuario_id,
        DATE_FORMAT(r.fecha, '%d-%m-%Y') AS fecha_atencion,
        DATE_FORMAT(r.hora, '%H:%i')     AS hora_atencion,
        r.estado,
        r.monto,
        r.metodo_pago,
        u.nombres,
        u.apellidos,
        u.rut,
        u.correo,
        u.telefono,
        c.nombre    AS clinica,
        c.direccion AS clinica_direccion,
        c.telefono  AS clinica_telefono,
        e.nombre    AS especialidad,
        d.nombre    AS doctor
     FROM reservas r
     JOIN usuarios       u ON r.usuario_id       = u.id
     JOIN clinicas       c ON r.clinica_id      = c.id
     JOIN especialidades e ON r.especialidad_id = e.id
     JOIN doctores       d ON r.doctor_id       = d.id
     WHERE r.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function obtenerReservaSimple(id) {
  const rows = await query(
    `SELECT id, usuario_id, monto, estado, metodo_pago
     FROM reservas
     WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function listarReservasAdmin() {
  const filas = await query(
    `SELECT r.id,
            DATE_FORMAT(r.fecha, '%Y-%m-%d') AS fecha,
            DATE_FORMAT(r.hora, '%H:%i')     AS hora,
            r.estado,
            r.monto,
            r.metodo_pago,
            u.nombres,
            u.apellidos,
            c.nombre AS clinica,
            e.nombre AS especialidad,
            d.nombre AS doctor
     FROM reservas r
     JOIN usuarios u       ON r.usuario_id       = u.id
     JOIN clinicas c       ON r.clinica_id      = c.id
     JOIN especialidades e ON r.especialidad_id = e.id
     JOIN doctores d       ON r.doctor_id       = d.id
     ORDER BY r.fecha DESC, r.hora DESC`
  );

  const reservas = filas.map(r => ({
    id: r.id,
    fecha: r.fecha,
    hora: r.hora,
    paciente: `${r.nombres} ${r.apellidos}`,
    clinica: r.clinica,
    especialidad: r.especialidad,
    doctor: r.doctor,
    metodo_pago: r.metodo_pago,
    estado: r.estado,
    monto: r.monto
  }));

  const hoyRow = await query(
    `SELECT COUNT(*) AS total
     FROM reservas
     WHERE fecha = CURDATE()`
  );
  const hoy = hoyRow[0]?.total || 0;

  return { reservas, hoy };
}

module.exports = {
  obtenerHorasDisponibles,
  crearReserva,
  obtenerReservasDeUsuario,
  obtenerReservaDetalleCompleto,
  obtenerReservaSimple,
  listarReservasAdmin
};
