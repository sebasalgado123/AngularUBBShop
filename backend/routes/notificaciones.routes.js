const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader);
  if (!authHeader) {
    console.log('No auth header found');
    return res.status(401).json({ mensaje: 'Token requerido' });
  }
  const token = authHeader.split(' ')[1];
  console.log('Token:', token ? token.substring(0, 20) + '...' : 'null');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decodificado:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Error verificando token:', err);
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
}

// Listar notificaciones del usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('Buscando notificaciones para usuario:', req.user.id);
    const [notifs] = await pool.promise().query('SELECT * FROM notificacion WHERE id_usuario = ? ORDER BY fecha_creacion DESC', [req.user.id]);
    console.log('Notificaciones encontradas:', notifs.length);
    res.json(notifs);
  } catch (err) {
    console.error('Error al obtener notificaciones:', err);
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

// Ruta de prueba para crear notificaciones (solo para desarrollo)
router.post('/test', async (req, res) => {
  const { id_usuario, mensaje } = req.body;
  if (!id_usuario || !mensaje) return res.status(400).json({ mensaje: 'Faltan datos' });
  try {
    const [result] = await pool.promise().query('INSERT INTO notificacion (id_usuario, mensaje) VALUES (?, ?)', [id_usuario, mensaje]);
    console.log('Notificación de prueba creada:', { id_usuario, mensaje, id: result.insertId });
    res.json({ mensaje: 'Notificación de prueba creada', id: result.insertId });
  } catch (err) {
    console.error('Error al crear notificación de prueba:', err);
    res.status(500).json({ mensaje: 'Error al crear notificación de prueba', error: err.message });
  }
});

module.exports = router; 