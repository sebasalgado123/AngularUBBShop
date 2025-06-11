const mysql = require('mysql');

// Configuración de conexión - ajusta según tu entorno
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'ubbshop',
  port: process.env.DB_PORT || 3306,
  timezone: 'Z'
});

module.exports = pool; 