const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const pool = require('../db');

// Tablas y columnas según la base de datos
const TABLA_PRODUCTO = 'producto';

// Mapeo de los nombres que llegan del front-end a los nombres reales de columnas
function mapearAColumnasBD(body) {
  return {
    titulo: body.titulo,
    id_categoria: body.categoria_id,
    descripcion: body.descripcion,
    precio: body.precio,
    contacto: body.info_contacto,
    id_usuario: body.usuario_id,
    disponibilidad: body.disponibilidad,
    imageUrl: body.imageUrl
  };
}

// Convierte un registro de BD a la forma esperada por el front-end
function mapearAFrontEnd(reg, req = null) {
  let imageUrl = reg.imageUrl;
  
  // Si la URL de imagen es relativa y tenemos acceso al request, convertirla a absoluta
  if (imageUrl && imageUrl.startsWith('/uploads/') && req) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    imageUrl = `${baseUrl}${imageUrl}`;
  }
  
  return {
    id: reg.id_producto,
    categoria_id: reg.id_categoria,
    titulo: reg.titulo,
    descripcion: reg.descripcion,
    precio: reg.precio,
    info_contacto: reg.contacto,
    usuario_id: reg.id_usuario,
    disponibilidad: reg.disponibilidad,
    fecha_creacion: reg.fecha_creacion,
    fecha_modificacion: reg.fecha_modificacion,
    imageUrl: imageUrl
  };
}

// Configuración de almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
});

// Crear publicación    
router.post('/', upload.array('imagenes', 5), (req, res) => {
  const { titulo, categoria_id, descripcion, precio, info_contacto, usuario_id } = req.body;

  if (!titulo || !categoria_id || !descripcion || !precio || !info_contacto || !usuario_id) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }

  // Procesar imágenes
  const archivos = req.files || [];
  console.log('Archivos recibidos:', archivos.length);
  console.log('Archivos:', archivos.map(f => f.filename));
  
  let imageUrl = null;
  if (archivos.length > 0) {
    // Tomar la primera imagen como imagen principal
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    imageUrl = `${baseUrl}/uploads/${archivos[0].filename}`;
    console.log('URL de imagen principal:', imageUrl);
  }

  const producto = {
    ...mapearAColumnasBD({ titulo, categoria_id, descripcion, precio, info_contacto, usuario_id }),
    disponibilidad: 1,
    imageUrl: imageUrl
  };

  pool.query(`INSERT INTO \`${TABLA_PRODUCTO}\` SET ?`, producto, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al crear producto' });
    }

    console.log('Producto creado con imagen:', imageUrl);
    res.status(201).json({ mensaje: 'Producto creado', id: result.insertId });
  });
});

// Obtener publicaciones de un usuario
router.get('/usuario/:usuarioId', (req, res) => {
  const { usuarioId } = req.params;
  pool.query(`SELECT * FROM \`${TABLA_PRODUCTO}\` WHERE id_usuario = ?`, [usuarioId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al obtener publicaciones' });
    }
    
    const productos = results.map(reg => mapearAFrontEnd(reg, req));
    res.json(productos);
  });
});

// Obtener un producto por id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  pool.query(`SELECT * FROM \`${TABLA_PRODUCTO}\` WHERE id_producto = ?`, [id], (err, productos) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al obtener producto' });
    }
    if (!productos.length) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    const producto = mapearAFrontEnd(productos[0], req);
    res.json(producto);
  });
});

// Actualizar producto
router.put('/:id', upload.array('imagenes', 5), (req, res) => {
  const { id } = req.params;
  const { titulo, categoria_id, descripcion, precio, info_contacto, disponibilidad } = req.body;

  let data = mapearAColumnasBD({ titulo, categoria_id, descripcion, precio, info_contacto, disponibilidad });
  // Quitar propiedades undefined para no sobreescribir con NULL/undefined
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

  // Procesar nuevas imágenes si las hay
  const archivos = req.files || [];
  if (archivos.length > 0) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    data.imageUrl = `${baseUrl}/uploads/${archivos[0].filename}`;
  }

  pool.query(`UPDATE \`${TABLA_PRODUCTO}\` SET ? WHERE id_producto = ?`, [data, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al actualizar producto' });
    }

    res.json({ mensaje: 'Producto actualizado' });
  });
});

// Eliminar producto
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  pool.query(`DELETE FROM \`${TABLA_PRODUCTO}\` WHERE id_producto = ?`, [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al eliminar producto' });
    }
    res.json({ mensaje: 'Producto eliminado' });
  });
});

// Obtener todas las publicaciones (público)
router.get('/', (req, res) => {
  pool.query(`SELECT * FROM \`${TABLA_PRODUCTO}\` WHERE disponibilidad = 1 ORDER BY fecha_creacion DESC`, (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener productos' });
    res.json(results.map(reg => mapearAFrontEnd(reg, req)));
  });
});

// Obtener todas las publicaciones (solo admin)
router.get('/admin/all', requireAdmin, (req, res) => {
  pool.query(`SELECT * FROM \`${TABLA_PRODUCTO}\``, (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener productos' });
    res.json(results.map(reg => mapearAFrontEnd(reg, req)));
  });
});

// Eliminar publicación (solo admin)
router.delete('/admin/:id', requireAdmin, (req, res) => {
  pool.query(`DELETE FROM \`${TABLA_PRODUCTO}\` WHERE id_producto = ?`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ mensaje: 'Error al eliminar producto' });
    res.json({ mensaje: 'Producto eliminado' });
  });
});

// Reportar publicación (cualquier usuario)
router.post('/:id/report', (req, res) => {
  const { motivo } = req.body;
  const id_producto = req.params.id;
  if (!motivo) return res.status(400).json({ mensaje: 'Motivo requerido' });
  pool.query('INSERT INTO reporte (id_producto, motivo) VALUES (?, ?)', [id_producto, motivo], async (err) => {
    if (err) return res.status(500).json({ mensaje: 'Error al reportar publicación' });
    
    try {
      // Obtener información del producto y usuario que lo reportó
      const [producto] = await pool.promise().query('SELECT titulo, id_usuario FROM producto WHERE id_producto = ?', [id_producto]);
      const [reportador] = await pool.promise().query('SELECT nombre FROM usuario WHERE id_usuario = ?', [req.body.reportador_id || 1]);
      
      if (producto.length > 0) {
        const tituloProducto = producto[0].titulo;
        const nombreReportador = reportador[0]?.nombre || 'Usuario';
        
        // Notificar al admin
        await pool.promise().query('INSERT INTO notificacion (usuario_id, mensaje) VALUES (?, ?)', [1, `Nueva publicación reportada: "${tituloProducto}" por ${nombreReportador}`]);
        
        // Notificar al dueño de la publicación
        await pool.promise().query('INSERT INTO notificacion (usuario_id, mensaje) VALUES (?, ?)', [producto[0].id_usuario, `Tu publicación "${tituloProducto}" ha sido reportada`]);
      }
      
      res.json({ mensaje: 'Reporte enviado' });
    } catch (notifErr) {
      console.error('Error al crear notificaciones:', notifErr);
      res.json({ mensaje: 'Reporte enviado' });
    }
  });
});

// Listar reportes (solo admin)
router.get('/admin/reportes', requireAdmin, (req, res) => {
  pool.query('SELECT r.id_reporte, r.motivo, r.id_producto, p.titulo FROM reporte r JOIN producto p ON r.id_producto = p.id_producto', (err, results) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener reportes' });
    res.json(results);
  });
});

// Middleware para admin
function requireAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ mensaje: 'Token requerido' });
  const token = authHeader.split(' ')[1];
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.rol !== 'admin') return res.status(403).json({ mensaje: 'Solo admin' });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
}

module.exports = router; 