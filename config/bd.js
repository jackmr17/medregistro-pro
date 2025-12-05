// config/bd.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'medregistropro',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  port: 3307
});

async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = { pool, query };
