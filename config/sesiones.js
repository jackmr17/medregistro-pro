// config/sesiones.js
const session = require('express-session');

const sessionMiddleware = session({
  secret: 'supersecreto-medregistropro',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8 // 8 horas
  }
});

module.exports = sessionMiddleware;
