// middlewares/authMiddleware.js
const { query } = require('../config/bd');

async function getUserFromSession(req) {
  if (!req.session.userId) return null;
  const rows = await query(
    'SELECT id, nombres, apellidos, rut, fecha_nacimiento, correo, telefono, rol FROM usuarios WHERE id = ?',
    [req.session.userId]
  );
  return rows[0] || null;
}

async function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ ok: false, mensaje: 'No has iniciado sesión.' });
  }
  next();
}

async function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ ok: false, mensaje: 'No has iniciado sesión.' });
  }
  const user = await getUserFromSession(req);
  if (!user || user.rol !== 'admin') {
    return res.status(403).json({ ok: false, mensaje: 'Solo administradores.' });
  }
  next();
}

module.exports = { getUserFromSession, requireLogin, requireAdmin };
