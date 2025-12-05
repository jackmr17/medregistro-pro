// controladores/doctoresControlador.js
const { query } = require('../config/bd');

// GET /api/doctores?clinica_id=&especialidad_id=
async function listarDoctoresPublic(req, res) {
  try {
    const { clinica_id, especialidad_id } = req.query;
    if (!clinica_id || !especialidad_id) {
      return res.status(400).json([]);
    }

    const rows = await query(
      `SELECT id, nombre, monto
       FROM doctores
       WHERE clinica_id = ? AND especialidad_id = ? AND activo = 1
       ORDER BY nombre`,
      [clinica_id, especialidad_id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error en listarDoctoresPublic:', err);
    res.status(500).json([]);
  }
}

// GET /api/admin/doctores
async function listarDoctoresAdmin(req, res) {
  try {
    const rows = await query(
      `SELECT d.id, d.nombre, d.monto, d.activo,
              c.id AS clinica_id, c.nombre AS clinica,
              e.id AS especialidad_id, e.nombre AS especialidad
       FROM doctores d
       JOIN clinicas c ON d.clinica_id = c.id
       JOIN especialidades e ON d.especialidad_id = e.id
       ORDER BY c.nombre, e.nombre, d.nombre`
    );
    res.json({ ok: true, doctores: rows });
  } catch (err) {
    console.error('Error en listarDoctoresAdmin:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener doctores.' });
  }
}

// POST /api/admin/doctores
async function crearDoctor(req, res) {
  try {
    const { nombre, clinica_id, especialidad_id, monto } = req.body;

    if (!nombre || !clinica_id || !especialidad_id || !monto) {
      return res.status(400).json({ ok: false, mensaje: 'Faltan datos del doctor.' });
    }

    const result = await query(
      `INSERT INTO doctores (nombre, clinica_id, especialidad_id, monto, activo)
       VALUES (?, ?, ?, ?, 1)`,
      [nombre, clinica_id, especialidad_id, monto]
    );

    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error('Error en crearDoctor:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al crear doctor.' });
  }
}

// PUT /api/admin/doctores/:id
async function actualizarDoctor(req, res) {
  try {
    const { id } = req.params;
    const { nombre, clinica_id, especialidad_id, monto, activo } = req.body;

    await query(
      `UPDATE doctores
       SET nombre = ?, clinica_id = ?, especialidad_id = ?, monto = ?, activo = ?
       WHERE id = ?`,
      [nombre, clinica_id, especialidad_id, monto, activo ? 1 : 0, id]
    );

    res.json({ ok: true, mensaje: 'Doctor actualizado correctamente.' });
  } catch (err) {
    console.error('Error en actualizarDoctor:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar doctor.' });
  }
}

// DELETE /api/admin/doctores/:id
async function eliminarDoctor(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM doctores WHERE id = ?', [id]);
    res.json({ ok: true, mensaje: 'Doctor eliminado correctamente.' });
  } catch (err) {
    console.error('Error en eliminarDoctor:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar doctor.' });
  }
}

module.exports = {
  listarDoctoresPublic,
  listarDoctoresAdmin,
  crearDoctor,
  actualizarDoctor,
  eliminarDoctor
};
