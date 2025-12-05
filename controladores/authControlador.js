// controladores/authControlador.js
const bcrypt = require('bcrypt');
const { query } = require('../config/bd');

async function registro(req, res) {
  try {
    const {
      nombres,
      apellidos,
      rut,
      fecha_nacimiento,
      correo,
      telefono,
      clave
    } = req.body;

    if (!nombres || !apellidos || !rut || !fecha_nacimiento || !correo || !clave) {
      return res.status(400).json({ ok: false, mensaje: 'Faltan datos obligatorios.' });
    }

    const existe = await query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (existe.length) {
      return res.status(400).json({ ok: false, mensaje: 'Ese correo ya está registrado.' });
    }

    const hash = await bcrypt.hash(clave, 10);

    const result = await query(
      `INSERT INTO usuarios 
       (nombres, apellidos, rut, fecha_nacimiento, correo, telefono, clave_hash, rol)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'user')`,
      [nombres, apellidos, rut, fecha_nacimiento, correo, telefono || null, hash]
    );

    const usuario = {
      id: result.insertId,
      nombres,
      apellidos,
      rut,
      fecha_nacimiento,
      correo,
      telefono,
      rol: 'user'
    };

    req.session.userId = usuario.id;

    res.json({ ok: true, usuario });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ ok: false, mensaje: 'Error interno al registrar.' });
  }
}

async function login(req, res) {
  try {
    const { correo, clave } = req.body;

    if (!correo || !clave) {
      return res.status(400).json({ ok: false, mensaje: 'Correo y contraseña son obligatorios.' });
    }

    const rows = await query(
      'SELECT id, nombres, apellidos, rut, fecha_nacimiento, correo, telefono, rol, clave_hash FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (!rows.length) {
      return res.status(400).json({ ok: false, mensaje: 'Credenciales inválidas.' });
    }

    const user = rows[0];
    const okPass = await bcrypt.compare(clave, user.clave_hash);
    if (!okPass) {
      return res.status(400).json({ ok: false, mensaje: 'Credenciales inválidas.' });
    }

    req.session.userId = user.id;

    const usuario = {
      id: user.id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      rut: user.rut,
      fecha_nacimiento: user.fecha_nacimiento,
      correo: user.correo,
      telefono: user.telefono,
      rol: user.rol
    };

    res.json({ ok: true, usuario });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ ok: false, mensaje: 'Error interno al iniciar sesión.' });
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
}

module.exports = { registro, login, logout };
