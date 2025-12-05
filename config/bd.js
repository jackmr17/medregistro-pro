// config/bd.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',          // o 'localhost'
  user: 'medreg_user',        // usuario que creaste en MySQL del servidor
  password: 'TuClaveFuerte123!', // clave que definiste
  database: 'medregistropro', // misma BD de tu script
  port: 3306,                 // puerto por defecto en Linux (no 3307)
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true
});

async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = { pool, query };
