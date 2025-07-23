require('dotenv').config();
const mysql = require('mysql2');

// Configuración de Railway (Prioridad)
const railwayConfig = {
  connectionLimit: 10,
  host: process.env.DB_HOST || 'containers-us-west-207.railway.app',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'tu_password_de_railway',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 7890,
  timezone: 'Z',
  ssl: {
    rejectUnauthorized: false 
  }
};

// Configuración Local (Fallback)
const localConfig = {
  connectionLimit: 10,
  host: process.env.LOCAL_DB_HOST || 'localhost',
  user: process.env.LOCAL_DB_USER || 'root',
  password: process.env.LOCAL_DB_PASS || '',
  database: process.env.LOCAL_DB_NAME || 'proyectoangular',
  port: process.env.LOCAL_DB_PORT || 3306,
  timezone: 'Z'
};

// Función para crear pool de conexión con fallback
function createConnectionPool() {
  // Intentar conectar a Railway primero
  const railwayPool = mysql.createPool(railwayConfig);
  
  railwayPool.getConnection((err, connection) => {
    if (err) {
      console.log('No se pudo conectar a Railway, intentando con local...');
      console.error('Error Railway:', err.message);
      
      // Si falla Railway, usar configuración local
      const localPool = mysql.createPool(localConfig);
      
      localPool.getConnection((localErr, localConnection) => {
        if (localErr) {
          console.error('Error al conectar con la base de datos local:', localErr);
          console.error('No se pudo conectar a ninguna base de datos');
          return;
        }
        console.log('Conexión a la base de datos LOCAL establecida correctamente');
        localConnection.release();
        module.exports = localPool;
      });
    } else {
      console.log('Conexión a la base de datos RAILWAY establecida correctamente');
      connection.release();
      module.exports = railwayPool;
    }
  });
}

// Inicializar la conexión
createConnectionPool(); 