require('dotenv').config();
const mysql = require('mysql2');

// Configuración de conexión
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  timezone: 'Z',
  ssl: {
    rejectUnauthorized: false 
  }
});

// Probar la conexión
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos establecida correctamente');
  connection.release();
});

module.exports = pool; 