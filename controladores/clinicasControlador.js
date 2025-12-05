// controladores/clinicasControlador.js
const { query } = require('../config/bd');
const path = require('path');
const fs = require('fs');

// Ruta de la carpeta de imágenes (coincide con la que usa clinicasRutas.js)
const imagenesPath = path.join(__dirname, '..', 'public', 'imagenes');

async function listarClinicas(req, res) {
  try {
    const rows = await query(
      `SELECT id, nombre, direccion, telefono, google_maps_url, imagen
       FROM clinicas
       ORDER BY nombre`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error en listarClinicas:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener clínicas.' });
  }
}

async function obtenerClinica(req, res) {
  try {
    const { id } = req.params;
    const rows = await query(
      `SELECT id, nombre, direccion, telefono, google_maps_url, imagen
       FROM clinicas WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, mensaje: 'Clínica no encontrada.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error en obtenerClinica:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener clínica.' });
  }
}

async function crearClinica(req, res) {
  try {
    const { nombre, direccion, telefono, google_maps_url } = req.body;
    const imagen = req.file ? req.file.filename : null;

    if (!nombre) {
      return res.status(400).json({ ok: false, mensaje: 'El nombre de la clínica es obligatorio.' });
    }

    const result = await query(
      `INSERT INTO clinicas (nombre, direccion, telefono, google_maps_url, imagen)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, direccion || null, telefono || null, google_maps_url || null, imagen]
    );

    const clinica = {
      id: result.insertId,
      nombre,
      direccion: direccion || null,
      telefono: telefono || null,
      google_maps_url: google_maps_url || null,
      imagen
    };

    res.json({ ok: true, clinica });
  } catch (err) {
    console.error('Error en crearClinica:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al crear clínica.' });
  }
}

async function actualizarClinica(req, res) {
  try {
    const { id } = req.params;
    const { nombre, direccion, telefono, google_maps_url } = req.body;

    if (!nombre) {
      return res.status(400).json({ ok: false, mensaje: 'El nombre es obligatorio.' });
    }

    const rows = await query(
      `SELECT imagen FROM clinicas WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, mensaje: 'Clínica no encontrada.' });
    }

    let imagenActual = rows[0].imagen;

    if (req.file) {
      const nuevaImagen = req.file.filename;

      if (imagenActual) {
        const oldPath = path.join(imagenesPath, imagenActual);
        fs.unlink(oldPath, err => {
          if (err) console.error('No se pudo eliminar la imagen anterior:', err);
        });
      }

      imagenActual = nuevaImagen;
    }

    await query(
      `UPDATE clinicas
       SET nombre = ?, direccion = ?, telefono = ?, google_maps_url = ?, imagen = ?
       WHERE id = ?`,
      [nombre, direccion || null, telefono || null, google_maps_url || null, imagenActual, id]
    );

    res.json({ ok: true, mensaje: 'Clínica actualizada correctamente.' });
  } catch (err) {
    console.error('Error en actualizarClinica:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar la clínica.' });
  }
}

async function eliminarClinica(req, res) {
  try {
    const { id } = req.params;

    const rows = await query(
      `SELECT imagen FROM clinicas WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, mensaje: 'Clínica no encontrada.' });
    }

    const imagen = rows[0].imagen;

    await query('DELETE FROM clinicas WHERE id = ?', [id]);

    if (imagen) {
      const imgPath = path.join(imagenesPath, imagen);
      fs.unlink(imgPath, err => {
        if (err) console.error('No se pudo eliminar la imagen de la clínica:', err);
      });
    }

    res.json({ ok: true, mensaje: 'Clínica eliminada correctamente.' });
  } catch (err) {
    console.error('Error en eliminarClinica:', err);
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar la clínica.' });
  }
}

module.exports = {
  listarClinicas,
  obtenerClinica,
  crearClinica,
  actualizarClinica,
  eliminarClinica
};
