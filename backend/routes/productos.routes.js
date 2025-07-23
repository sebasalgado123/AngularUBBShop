const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const pool = require('../db');

// Tablas y columnas según la base de datos
const TABLA_PRODUCTO = 'producto';
const TABLA_IMAGEN_PRODUCTO = 'imagen_producto';

// Mapeo de los nombres que llegan del front-end a los nombres reales de columnas
function mapearAColumnasBD(body) {
  return {
    titulo: body.titulo,
    id_categorias: body.categoria_id,
    descripcion: body.descripcion,
    precio: body.precio,
    contacto: body.info_contacto,
    id_usuario: body.usuario_id,
    disponibilidad: body.disponibilidad
  };
}

// Convierte un registro de BD a la forma esperada por el front-end
function mapearAFrontEnd(reg) {
  return {
    id: reg.id_producto,
    categoria_id: reg.id_categorias,
    titulo: reg.titulo,
    descripcion: reg.descripcion,
    precio: reg.precio,
    info_contacto: reg.contacto,
    usuario_id: reg.id_usuario,
    disponibilidad: reg.disponibilidad,
    fecha_creacion: reg.fecha_creacion,
    fecha_modificacion: reg.fecha_modificacion
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

  const producto = {
    ...mapearAColumnasBD({ titulo, categoria_id, descripcion, precio, info_contacto, usuario_id }),
    disponibilidad: 1
  };

  pool.query(`INSERT INTO \`${TABLA_PRODUCTO}\` SET ?`, producto, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al crear producto' });
    }

    const productoId = result.insertId;

    // Insertar imágenes
    const archivos = req.files || [];
    if (archivos.length) {
      const registrosImagenes = archivos.map((file) => [productoId, `/uploads/${file.filename}`]);
      pool.query(`INSERT INTO \`${TABLA_IMAGEN_PRODUCTO}\` (id_producto, imagen_url) VALUES ?`, [registrosImagenes], (err2) => {
        if (err2) {
          console.error(err2);
        }
      });
    }

    res.status(201).json({ mensaje: 'Producto creado', id: productoId });
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
    const respuesta = results.map(mapearAFrontEnd);
    res.json(respuesta);
  });
});

// Obtener un producto por id (con imágenes)
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
    const producto = mapearAFrontEnd(productos[0]);
    pool.query(`SELECT imagen_url FROM \`${TABLA_IMAGEN_PRODUCTO}\` WHERE id_producto = ?`, [id], (err2, imagenes) => {
      if (err2) {
        console.error(err2);
      }
      producto.imagenes = imagenes.map((i) => i.imagen_url);
      res.json(producto);
    });
  });
});

// Actualizar producto
router.put('/:id', upload.array('imagenes', 5), (req, res) => {
  const { id } = req.params;
  const { titulo, categoria_id, descripcion, precio, info_contacto, disponibilidad } = req.body;

  let data = mapearAColumnasBD({ titulo, categoria_id, descripcion, precio, info_contacto, disponibilidad });
  // Quitar propiedades undefined para no sobreescribir con NULL/undefined
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

  pool.query(`UPDATE \`${TABLA_PRODUCTO}\` SET ? WHERE id_producto = ?`, [data, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al actualizar producto' });
    }

    // Si hay nuevas imágenes, insertarlas
    const archivos = req.files || [];
    if (archivos.length) {
      const registrosImagenes = archivos.map((file) => [id, `/uploads/${file.filename}`]);
      pool.query(`INSERT INTO \`${TABLA_IMAGEN_PRODUCTO}\` (id_producto, imagen_url) VALUES ?`, [registrosImagenes], (err2) => {
        if (err2) {
          console.error(err2);
        }
      });
    }

    res.json({ mensaje: 'Producto actualizado' });
  });
});

// Eliminar producto (y sus imágenes)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  pool.query(`DELETE FROM \`${TABLA_IMAGEN_PRODUCTO}\` WHERE id_producto = ?`, [id], (err) => {
    if (err) console.error(err);
    pool.query(`DELETE FROM \`${TABLA_PRODUCTO}\` WHERE id_producto = ?`, [id], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ mensaje: 'Error al eliminar producto' });
      }
      res.json({ mensaje: 'Producto eliminado' });
    });
  });
});

module.exports = router; 