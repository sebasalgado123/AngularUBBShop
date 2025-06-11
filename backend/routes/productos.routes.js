const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const pool = require('../db');

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

  const producto = { titulo, categoria_id, descripcion, precio, info_contacto, usuario_id, esta_activo: 1 };

  pool.query('INSERT INTO productos SET ?', producto, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al crear producto' });
    }

    const productoId = result.insertId;

    // Insertar imágenes
    const archivos = req.files || [];
    if (archivos.length) {
      const registrosImagenes = archivos.map((file) => [productoId, `/uploads/${file.filename}`]);
      pool.query('INSERT INTO imagenes_producto (producto_id, url_imagen) VALUES ?', [registrosImagenes], (err2) => {
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
  pool.query('SELECT * FROM productos WHERE usuario_id = ?', [usuarioId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al obtener publicaciones' });
    }
    res.json(results);
  });
});

// Obtener un producto por id (con imágenes)
router.get('/:id', (req, res) => {
  const { id } = req.params;
  pool.query('SELECT * FROM productos WHERE id = ?', [id], (err, productos) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al obtener producto' });
    }
    if (!productos.length) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    const producto = productos[0];
    pool.query('SELECT url_imagen FROM imagenes_producto WHERE producto_id = ?', [id], (err2, imagenes) => {
      if (err2) {
        console.error(err2);
      }
      producto.imagenes = imagenes.map((i) => i.url_imagen);
      res.json(producto);
    });
  });
});

// Actualizar producto
router.put('/:id', upload.array('imagenes', 5), (req, res) => {
  const { id } = req.params;
  const { titulo, categoria_id, descripcion, precio, info_contacto, esta_activo } = req.body;

  const data = { titulo, categoria_id, descripcion, precio, info_contacto, esta_activo };
  pool.query('UPDATE productos SET ? WHERE id = ?', [data, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al actualizar producto' });
    }

    // Si hay nuevas imágenes, insertarlas
    const archivos = req.files || [];
    if (archivos.length) {
      const registrosImagenes = archivos.map((file) => [id, `/uploads/${file.filename}`]);
      pool.query('INSERT INTO imagenes_producto (producto_id, url_imagen) VALUES ?', [registrosImagenes], (err2) => {
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

  pool.query('DELETE FROM imagenes_producto WHERE producto_id = ?', [id], (err) => {
    if (err) console.error(err);
    pool.query('DELETE FROM productos WHERE id = ?', [id], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ mensaje: 'Error al eliminar producto' });
      }
      res.json({ mensaje: 'Producto eliminado' });
    });
  });
});

module.exports = router; 