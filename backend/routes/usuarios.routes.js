const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Registro de usuario
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }
  try {
    const [usuarios] = await pool.promise().query('SELECT * FROM usuario WHERE email = ?', [email]);
    if (usuarios.length > 0) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }
    const hash = await bcrypt.hash(password, 10);
    // Asignar rol 'usuario' por defecto (no admin)
    await pool.promise().query('INSERT INTO usuario (nombre, email, password, rol) VALUES (?, ?, ?, ?)', [nombre, email, hash, 'usuario']);
    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error en el registro' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ mensaje: 'Email y contraseña requeridos' });
  }
  try {
    const [usuarios] = await pool.promise().query('SELECT * FROM usuario WHERE email = ?', [email]);
    if (usuarios.length === 0) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }
    const usuario = usuarios[0];
    const match = await bcrypt.compare(password, usuario.password);
    if (!match) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ id: usuario.id_usuario, rol: usuario.rol, nombre: usuario.nombre, email: usuario.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, usuario: { id: usuario.id_usuario, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error en el login' });
  }
});

// Middleware de autenticación
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ mensaje: 'Token requerido' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ mensaje: 'Token inválido' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
}

// Ruta protegida para obtener perfil
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [usuarios] = await pool.promise().query('SELECT id_usuario, nombre, email, rol FROM usuario WHERE id_usuario = ?', [req.user.id]);
    if (usuarios.length === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuarios[0]);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener perfil' });
  }
});

// Obtener todos los usuarios (solo admin)
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.rol !== 'admin') return res.status(403).json({ mensaje: 'Solo admin puede ver usuarios' });
  try {
    const [usuarios] = await pool.promise().query('SELECT id_usuario, nombre, email, rol FROM usuario');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
});

// Obtener usuario por ID (público para obtener nombres)
router.get('/:id', async (req, res) => {
  try {
    const [usuarios] = await pool.promise().query('SELECT id_usuario, nombre, email FROM usuario WHERE id_usuario = ?', [req.params.id]);
    if (usuarios.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json(usuarios[0]);
  } catch (err) {
    console.error('Error obteniendo usuario:', err);
    res.status(500).json({ mensaje: 'Error al obtener usuario' });
  }
});

// Eliminar usuario (solo admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.rol !== 'admin') return res.status(403).json({ mensaje: 'Solo admin puede eliminar usuarios' });
  
  try {
    // Verificar si es el último admin
    const [admins] = await pool.promise().query('SELECT COUNT(*) as count FROM usuario WHERE rol = ?', ['admin']);
    const [usuarioAEliminar] = await pool.promise().query('SELECT rol FROM usuario WHERE id_usuario = ?', [req.params.id]);
    
    if (admins[0].count === 1 && usuarioAEliminar[0]?.rol === 'admin') {
      return res.status(400).json({ mensaje: 'No se puede eliminar el último administrador del sistema' });
    }
    
    await pool.promise().query('DELETE FROM usuario WHERE id_usuario = ?', [req.params.id]);
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario' });
  }
});

// Cambiar rol de usuario (solo admin)
router.put('/:id/rol', authMiddleware, async (req, res) => {
  if (req.user.rol !== 'admin') return res.status(403).json({ mensaje: 'Solo admin puede cambiar roles' });
  const { rol } = req.body;
  if (!rol) return res.status(400).json({ mensaje: 'Rol requerido' });
  
  try {
    // Verificar si está intentando quitar admin al último administrador
    if (rol === 'usuario') {
      const [admins] = await pool.promise().query('SELECT COUNT(*) as count FROM usuario WHERE rol = ?', ['admin']);
      const [usuarioACambiar] = await pool.promise().query('SELECT rol FROM usuario WHERE id_usuario = ?', [req.params.id]);
      
      if (admins[0].count === 1 && usuarioACambiar[0]?.rol === 'admin') {
        return res.status(400).json({ mensaje: 'No se puede quitar los privilegios al último administrador del sistema' });
      }
    }
    
    await pool.promise().query('UPDATE usuario SET rol = ? WHERE id_usuario = ?', [rol, req.params.id]);
    res.json({ mensaje: 'Rol actualizado' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar rol' });
  }
});

module.exports = router; 