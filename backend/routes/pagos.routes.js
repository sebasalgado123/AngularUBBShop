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

// Procesar pago con datos completos (nueva ruta)
router.post('/realizar', authMiddleware, async (req, res) => {
  const { producto_id, monto, metodo_pago, comprador_id, vendedor_id, datos_tarjeta } = req.body;
  
  if (!producto_id || !monto || !metodo_pago || !comprador_id || !vendedor_id) {
    return res.status(400).json({ mensaje: 'Faltan datos del pago' });
  }

  try {
    // Verificar que el producto existe y está disponible
    const [productos] = await pool.promise().query('SELECT * FROM producto WHERE id_producto = ? AND disponibilidad = 1', [producto_id]);
    if (productos.length === 0) {
      return res.status(400).json({ mensaje: 'Producto no disponible' });
    }

    // Verificar que el usuario actual es el comprador
    if (req.user.id !== comprador_id) {
      return res.status(403).json({ mensaje: 'No autorizado para realizar este pago' });
    }

    // Calcular comisión (5% del precio del producto)
    const comision = monto * 0.05;
    const montoConComision = monto + comision;
    
    // Crear el pago con el monto que incluye la comisión
    const [result] = await pool.promise().query(
      'INSERT INTO pago (id_usuario, id_producto, monto, metodo_pago, estado) VALUES (?, ?, ?, ?, ?)',
      [comprador_id, producto_id, montoConComision, metodo_pago, 'pendiente']
    );

    const pago_id = result.insertId;
    
    // Simular procesamiento de pago con validación de tarjeta
    setTimeout(async () => {
      try {
        // Simular validación de tarjeta
        if (datos_tarjeta && datos_tarjeta.numero && datos_tarjeta.numero.length >= 4) {
          await pool.promise().query('UPDATE pago SET estado = ? WHERE id_pago = ?', ['completado', pago_id]);
          // Marcar producto como vendido
          await pool.promise().query('UPDATE producto SET disponibilidad = 0 WHERE id_producto = ?', [producto_id]);
          
          // Obtener información para notificaciones
          const [producto] = await pool.promise().query('SELECT titulo, id_usuario FROM producto WHERE id_producto = ?', [producto_id]);
          const [comprador] = await pool.promise().query('SELECT nombre FROM usuario WHERE id_usuario = ?', [comprador_id]);
          const [vendedor] = await pool.promise().query('SELECT nombre FROM usuario WHERE id_usuario = ?', [vendedor_id]);
          
          if (producto.length > 0) {
            const tituloProducto = producto[0].titulo;
            const nombreComprador = comprador[0]?.nombre || 'Usuario';
            const nombreVendedor = vendedor[0]?.nombre || 'Usuario';
            
            // Notificar al comprador
            await pool.promise().query('INSERT INTO notificacion (id_usuario, mensaje) VALUES (?, ?)', 
              [comprador_id, `¡Tu pago por "${tituloProducto}" ha sido confirmado!`]);
            
            // Notificar al vendedor
            await pool.promise().query('INSERT INTO notificacion (id_usuario, mensaje) VALUES (?, ?)', 
              [vendedor_id, `¡Has vendido "${tituloProducto}" a ${nombreComprador}!`]);
          }
        } else {
          await pool.promise().query('UPDATE pago SET estado = ? WHERE id_pago = ?', ['rechazado', pago_id]);
        }
      } catch (err) {
        console.error('Error al procesar pago:', err);
        await pool.promise().query('UPDATE pago SET estado = ? WHERE id_pago = ?', ['error', pago_id]);
      }
    }, 2000);

    res.json({ 
      mensaje: 'Pago procesado exitosamente', 
      pago_id: pago_id,
      estado: 'completado'
    });
  } catch (err) {
    console.error('Error al procesar pago:', err);
    res.status(500).json({ mensaje: 'Error al procesar el pago' });
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
  console.log('Solicitando pagos para usuario:', req.user.id);
  try {
    const [pagos] = await pool.promise().query(
      `SELECT p.*, pr.titulo as producto_titulo, v.nombre as vendedor_nombre
       FROM pago p 
       JOIN producto pr ON p.id_producto = pr.id_producto 
       JOIN usuario v ON pr.id_usuario = v.id_usuario
       WHERE p.id_usuario = ? 
       ORDER BY p.fecha_pago DESC`,
      [req.user.id]
    );
    console.log('Pagos encontrados:', pagos.length);
    res.json(pagos);
  } catch (err) {
    console.error('Error obteniendo pagos:', err);
    res.status(500).json({ mensaje: 'Error al obtener pagos' });
  }
});

// Listar ventas del vendedor (con información de comisiones)
router.get('/usuario/mis-ventas', authMiddleware, async (req, res) => {
  console.log('Solicitando ventas para usuario:', req.user.id);
  try {
    // Primero verificar si el usuario tiene productos
    const [productos] = await pool.promise().query(
      'SELECT id_producto, titulo FROM producto WHERE id_usuario = ?',
      [req.user.id]
    );
    console.log('Productos del usuario:', productos);
    
    if (productos.length === 0) {
      console.log('Usuario no tiene productos, retornando ventas vacías');
      return res.json([]);
    }
    
    const [ventas] = await pool.promise().query(
      `SELECT p.*, pr.titulo as producto_titulo, pr.precio as precio_original,
              u.nombre as comprador_nombre,
              (p.monto - pr.precio) as comision_cobrada
       FROM pago p 
       JOIN producto pr ON p.id_producto = pr.id_producto 
       JOIN usuario u ON p.id_usuario = u.id_usuario
       WHERE pr.id_usuario = ? AND p.estado = 'completado'
       ORDER BY p.fecha_pago DESC`,
      [req.user.id]
    );
    console.log('Ventas encontradas:', ventas.length);
    console.log('Detalle de ventas:', ventas);
    res.json(ventas);
  } catch (err) {
    console.error('Error obteniendo ventas:', err);
    res.status(500).json({ mensaje: 'Error al obtener ventas' });
  }
});

// Verificar si el usuario es vendedor (tiene productos publicados)
router.get('/usuario/es-vendedor', authMiddleware, async (req, res) => {
  console.log('Verificando si usuario es vendedor:', req.user.id);
  try {
    const [productos] = await pool.promise().query(
      'SELECT COUNT(*) as total FROM producto WHERE id_usuario = ?',
      [req.user.id]
    );
    const esVendedor = productos[0].total > 0;
    console.log('Usuario es vendedor:', esVendedor);
    res.json({ esVendedor });
  } catch (err) {
    console.error('Error verificando si es vendedor:', err);
    res.status(500).json({ mensaje: 'Error al verificar si es vendedor' });
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