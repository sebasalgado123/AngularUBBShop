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

// Calcular comisiones (5% para la plataforma)
function calcularComision(monto) {
  return monto * 0.05;
}

// Obtener reporte de ventas del vendedor
router.get('/ventas', authMiddleware, async (req, res) => {
  try {
    const [ventas] = await pool.promise().query(
      `SELECT p.*, pr.titulo, pr.precio, 
              (pr.precio * 0.95) as ganancia_vendedor,
              (pr.precio * 0.05) as comision_plataforma,
              p.fecha_pago
       FROM pago p 
       JOIN producto pr ON p.id_producto = pr.id_producto 
       WHERE pr.id_usuario = ? AND p.estado = 'completado'
       ORDER BY p.fecha_pago DESC`,
      [req.user.id]
    );
    res.json(ventas);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener ventas' });
  }
});

// Obtener balance del vendedor
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const [resultado] = await pool.promise().query(
      `SELECT 
        SUM(pr.precio * 0.95) as total_ganancias,
        COUNT(*) as total_ventas
       FROM pago p 
       JOIN producto pr ON p.id_producto = pr.id_producto 
       WHERE pr.id_usuario = ? AND p.estado = 'completado'`,
      [req.user.id]
    );
    
    const balance = resultado[0] || { total_ganancias: 0, total_ventas: 0 };
    res.json(balance);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener balance' });
  }
});

// Solicitar retiro de dinero
router.post('/retiro', authMiddleware, async (req, res) => {
  const { monto, cuenta_bancaria } = req.body;
  
  if (!monto || !cuenta_bancaria) {
    return res.status(400).json({ mensaje: 'Faltan datos del retiro' });
  }

  try {
    // Verificar que tiene fondos suficientes
    const [balance] = await pool.promise().query(
      `SELECT SUM(pr.precio * 0.95) as total_disponible
       FROM pago p 
       JOIN producto pr ON p.id_producto = pr.id_producto 
       WHERE pr.id_usuario = ? AND p.estado = 'completado'`,
      [req.user.id]
    );
    
    const disponible = balance[0]?.total_disponible || 0;
    if (monto > disponible) {
      return res.status(400).json({ mensaje: 'Fondos insuficientes' });
    }

    // Crear solicitud de retiro
    await pool.promise().query(
      'INSERT INTO retiro (usuario_id, monto, cuenta_bancaria, estado) VALUES (?, ?, ?, ?)',
      [req.user.id, monto, cuenta_bancaria, 'pendiente']
    );

    res.json({ mensaje: 'Solicitud de retiro creada' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al solicitar retiro' });
  }
});

// Obtener historial de retiros
router.get('/retiros', authMiddleware, async (req, res) => {
  try {
    const [retiros] = await pool.promise().query(
      'SELECT * FROM retiro WHERE usuario_id = ? ORDER BY fecha_solicitud DESC',
      [req.user.id]
    );
    res.json(retiros);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener retiros' });
  }
});

// Dashboard financiero para admin
router.get('/admin/dashboard', authMiddleware, async (req, res) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Solo admin puede ver dashboard' });
  }

  try {
    const [stats] = await pool.promise().query(
      `SELECT 
        COUNT(*) as total_ventas,
        SUM(pr.precio) as volumen_total,
        SUM(pr.precio * 0.05) as comisiones_totales,
        COUNT(DISTINCT pr.id_usuario) as vendedores_activos
       FROM pago p 
       JOIN producto pr ON p.id_producto = pr.id_producto 
       WHERE p.estado = 'completado'`
    );

    const [ventasRecientes] = await pool.promise().query(
      `SELECT p.*, pr.titulo, u.nombre as vendedor
       FROM pago p 
       JOIN producto pr ON p.id_producto = pr.id_producto 
       JOIN usuario u ON pr.id_usuario = u.id_usuario
       WHERE p.estado = 'completado'
       ORDER BY p.fecha_pago DESC
       LIMIT 10`
    );

    res.json({
      estadisticas: stats[0] || {},
      ventas_recientes: ventasRecientes
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener dashboard' });
  }
});

module.exports = router; 