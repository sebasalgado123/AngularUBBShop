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

// Crear un nuevo pago
router.post('/', authMiddleware, async (req, res) => {
  const { producto_id, monto, metodo_pago } = req.body;
  const comprador_id = req.user.id;
  
  if (!producto_id || !monto || !metodo_pago) {
    return res.status(400).json({ mensaje: 'Faltan datos del pago' });
  }

  try {
    // Verificar que el producto existe y está disponible
    const [productos] = await pool.promise().query('SELECT * FROM producto WHERE id_producto = ? AND disponibilidad = 1', [producto_id]);
    if (productos.length === 0) {
      return res.status(400).json({ mensaje: 'Producto no disponible' });
    }

    // Crear el pago
    const [result] = await pool.promise().query(
      'INSERT INTO pago (id_usuario, id_producto, monto, metodo_pago, estado) VALUES (?, ?, ?, ?, ?)',
      [comprador_id, producto_id, monto, metodo_pago, 'pendiente']
    );

    const pago_id = result.insertId;
    
    // Simular procesamiento de pago (en producción usarías un proveedor real)
    setTimeout(async () => {
      try {
        await pool.promise().query('UPDATE pago SET estado = ? WHERE id_pago = ?', ['completado', pago_id]);
        // Marcar producto como vendido
        await pool.promise().query('UPDATE producto SET disponibilidad = 0 WHERE id_producto = ?', [producto_id]);
        
        // Obtener información para notificaciones
        const [producto] = await pool.promise().query('SELECT titulo, id_usuario FROM producto WHERE id_producto = ?', [producto_id]);
        const [comprador] = await pool.promise().query('SELECT nombre FROM usuario WHERE id_usuario = ?', [comprador_id]);
        const [vendedor] = await pool.promise().query('SELECT nombre FROM usuario WHERE id_usuario = ?', [producto[0].id_usuario]);
        
        if (producto.length > 0) {
          const tituloProducto = producto[0].titulo;
          const nombreComprador = comprador[0]?.nombre || 'Usuario';
          const nombreVendedor = vendedor[0]?.nombre || 'Usuario';
          
          // Notificar al comprador
          await pool.promise().query('INSERT INTO notificacion (id_usuario, mensaje) VALUES (?, ?)', 
            [comprador_id, `¡Tu pago por "${tituloProducto}" ha sido confirmado!`]);
          
          // Notificar al vendedor
          await pool.promise().query('INSERT INTO notificacion (id_usuario, mensaje) VALUES (?, ?)', 
            [producto[0].id_usuario, `¡Has vendido "${tituloProducto}" a ${nombreComprador}!`]);
        }
      } catch (err) {
        console.error('Error al procesar pago:', err);
      }
    }, 2000);

    res.json({ 
      mensaje: 'Pago iniciado', 
      pago_id: pago_id,
      estado: 'pendiente'
    });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear pago' });
  }
});

// Obtener estado del pago
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [pagos] = await pool.promise().query(
      'SELECT * FROM pago WHERE id_pago = ? AND id_usuario = ?',
      [req.params.id, req.user.id]
    );
    
    if (pagos.length === 0) {
      return res.status(404).json({ mensaje: 'Pago no encontrado' });
    }
    
    res.json(pagos[0]);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener pago' });
  }
});

// Listar pagos del usuario
router.get('/usuario/mis-pagos', authMiddleware, async (req, res) => {
  try {
    const [pagos] = await pool.promise().query(
      `SELECT p.*, pr.titulo as producto_titulo 
       FROM pago p 
       JOIN producto pr ON p.id_producto = pr.id_producto 
       WHERE p.id_usuario = ? 
       ORDER BY p.fecha_pago DESC`,
      [req.user.id]
    );
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener pagos' });
  }
});

// Cancelar pago (solo si está pendiente)
router.put('/:id/cancelar', authMiddleware, async (req, res) => {
  try {
    const [pagos] = await pool.promise().query(
      'SELECT * FROM pago WHERE id_pago = ? AND id_usuario = ? AND estado = ?',
      [req.params.id, req.user.id, 'pendiente']
    );
    
    if (pagos.length === 0) {
      return res.status(400).json({ mensaje: 'Pago no puede ser cancelado' });
    }
    
    await pool.promise().query('UPDATE pago SET estado = ? WHERE id_pago = ?', ['cancelado', req.params.id]);
    res.json({ mensaje: 'Pago cancelado' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al cancelar pago' });
  }
});

module.exports = router; 