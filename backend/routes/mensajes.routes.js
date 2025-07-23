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

// Enviar mensaje
router.post('/', authMiddleware, async (req, res) => {
  const { destinatario_id, contenido } = req.body;
  const remitente_id = req.user.id;
  
  if (!destinatario_id || !contenido) {
    return res.status(400).json({ mensaje: 'Faltan datos' });
  }
  
  try {
    await pool.promise().query('INSERT INTO mensaje (remitente_id, destinatario_id, contenido) VALUES (?, ?, ?)', [remitente_id, destinatario_id, contenido]);
    
    // Crear notificación automática para el destinatario
    const [remitente] = await pool.promise().query('SELECT nombre FROM usuario WHERE id_usuario = ?', [remitente_id]);
    const nombreRemitente = remitente[0]?.nombre || 'Usuario';
    await pool.promise().query('INSERT INTO notificacion (id_usuario, mensaje) VALUES (?, ?)', [
      destinatario_id, 
      `Tienes un nuevo mensaje de ${nombreRemitente}`
    ]);
    
    res.json({ mensaje: 'Mensaje enviado' });
  } catch (err) {
    console.error('Error al enviar mensaje:', err);
    res.status(500).json({ mensaje: 'Error al enviar mensaje' });
  }
});

// Listar mensajes entre dos usuarios
router.get('/conversacion/:usuarioId', authMiddleware, async (req, res) => {
  const usuario1 = req.user.id;
  const usuario2 = req.params.usuarioId;
  try {
    const [mensajes] = await pool.promise().query(
      'SELECT * FROM mensaje WHERE (remitente_id = ? AND destinatario_id = ?) OR (remitente_id = ? AND destinatario_id = ?) ORDER BY fecha_envio ASC',
      [usuario1, usuario2, usuario2, usuario1]
    );
    res.json(mensajes);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener mensajes' });
  }
});

// Listar conversaciones del usuario autenticado
router.get('/conversaciones', authMiddleware, async (req, res) => {
  const usuarioId = req.user.id;
  try {
    const [convs] = await pool.promise().query(
      `SELECT DISTINCT IF(remitente_id = ?, destinatario_id, remitente_id) AS usuario_conversacion FROM mensaje WHERE remitente_id = ? OR destinatario_id = ?`,
      [usuarioId, usuarioId, usuarioId]
    );
    res.json(convs);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener conversaciones' });
  }
});

module.exports = router; 