const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todas las categorías
router.get('/', (req, res) => {
  pool.query('SELECT id, nombre FROM categorias', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al obtener categorías' });
    }
    res.json(results);
  });
});

module.exports = router; 