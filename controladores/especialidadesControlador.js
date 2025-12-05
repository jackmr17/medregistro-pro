// controladores/especialidadesControlador.js
const { query } = require('../config/bd');

// GET /api/especialidades?clinica_id=
async function listarEspecialidadesPorClinica(req, res) {
  try {
    const { clinica_id } = req.query;
    if (!clinica_id) {
      return res.status(400).json([]);
    }

    const rows = await query(
      `SELECT DISTINCT e.id, e.nombre
       FROM especialidades e
       JOIN doctores d ON d.especialidad_id = e.id
       WHERE d.clinica_id = ? AND d.activo = 1
       ORDER BY e.nombre`,
      [clinica_id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error en listarEspecialidadesPorClinica:', err);
    res.status(500).json([]);
  }
}

// GET /api/admin/especialidades
async function listarEspecialidadesAdmin(req, res) {
  try {
    const rows = await query(
      'SELECT id, nombre FROM especialidades ORDER BY nombre'
    );
    res.json({ ok: true, especialidades: rows });
  } catch (err) {
    console.error('Error en listarEspecialidadesAdmin:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener especialidades.' });
  }
}

// POST /api/admin/especialidades
async function crearEspecialidad(req, res) {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ ok: false, mensaje: 'El nombre es obligatorio.' });
    }

    const result = await query(
      'INSERT INTO especialidades (nombre) VALUES (?)',
      [nombre]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error('Error en crearEspecialidad:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al crear especialidad.' });
  }
}

// PUT /api/admin/especialidades/:id
async function actualizarEspecialidad(req, res) {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ ok: false, mensaje: 'El nombre es obligatorio.' });
    }

    await query(
      'UPDATE especialidades SET nombre = ? WHERE id = ?',
      [nombre, id]
    );

    res.json({ ok: true, mensaje: 'Especialidad actualizada.' });
  } catch (err) {
    console.error('Error en actualizarEspecialidad:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar especialidad.' });
  }
}

// DELETE /api/admin/especialidades/:id
async function eliminarEspecialidad(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM especialidades WHERE id = ?', [id]);
    res.json({ ok: true, mensaje: 'Especialidad eliminada.' });
  } catch (err) {
    console.error('Error en eliminarEspecialidad:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar especialidad.' });
  }
}

module.exports = {
  listarEspecialidadesPorClinica,
  listarEspecialidadesAdmin,
  crearEspecialidad,
  actualizarEspecialidad,
  eliminarEspecialidad
};
