const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ mensaje: 'Token requerido' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
}

// Listar notificaciones del usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [notifs] = await pool.promise().query('SELECT * FROM notificacion WHERE id_usuario = ? ORDER BY fecha_creacion DESC', [req.user.id]);
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener notificaciones' });
  }
});

// Marcar notificaciones como leídas
router.put('/leer', authMiddleware, async (req, res) => {
  try {
    await pool.promise().query('UPDATE notificacion SET leida = 1 WHERE id_usuario = ?', [req.user.id]);
    res.json({ mensaje: 'Notificaciones marcadas como leídas' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al marcar notificaciones' });
  }
});

// Crear notificación (puede ser llamada desde otros módulos)
router.post('/crear', async (req, res) => {
  const { id_usuario, mensaje } = req.body;
  if (!id_usuario || !mensaje) return res.status(400).json({ mensaje: 'Faltan datos' });
  try {
    await pool.promise().query('INSERT INTO notificacion (id_usuario, mensaje) VALUES (?, ?)', [id_usuario, mensaje]);
    res.json({ mensaje: 'Notificación creada' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear notificación' });
  }
});

module.exports = router; 