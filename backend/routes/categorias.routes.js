const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todas las categorías
router.get('/', (req, res) => {
  console.log('Intentando obtener categorías...');
  
  // Verifica la conexión
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error al conectar con la base de datos:', err);
      return res.status(500).json({ mensaje: 'Error de conexión a la base de datos' });
    }

    // Si la conexión es exitosa, intentamos la consulta
    connection.query('SHOW TABLES', (err, tables) => {
      if (err) {
        console.error('Error al listar tablas:', err);
        connection.release();
        return res.status(500).json({ mensaje: 'Error al listar tablas' });
      }

      console.log('Tablas disponibles:', tables);

      // Obtener las categorías
      connection.query('SELECT id_categorias AS id, nombre FROM categorias', (err, results) => {
        connection.release(); 

        if (err) {
          console.error('Error al obtener categorías:', err);
          return res.status(500).json({ mensaje: 'Error al obtener categorías', error: err.message });
        }

        console.log('Categorías obtenidas:', results);
        res.json(results);
      });
    });
  });
});

module.exports = router; 