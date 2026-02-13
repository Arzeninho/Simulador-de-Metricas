import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'telecentro_metricas',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de conexión
pool.on('connect', () => {
  console.log('✅ Conectado a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error en la conexión a la base de datos:', err.message);
  process.exit(-1);
});

// Función para inicializar las tablas
export const inicializarBaseDeDatos = async () => {
  const client = await pool.connect();
  try {
    // Crear tabla de usuarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(20) NOT NULL CHECK (rol IN ('supervisor', 'agente')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla usuarios creada/verificada');

    // Crear tabla de métricas
    await client.query(`
      CREATE TABLE IF NOT EXISTS metricas (
        id SERIAL PRIMARY KEY,
        agente_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        tmo INTEGER DEFAULT 0,
        trans_comercial DECIMAL(5,2) DEFAULT 0,
        trans_retencion DECIMAL(5,2) DEFAULT 0,
        isn DECIMAL(5,2) DEFAULT 0,
        epa_satisfaccion DECIMAL(5,2) DEFAULT 0,
        epa_resolucion DECIMAL(5,2) DEFAULT 0,
        epa_trato DECIMAL(5,2) DEFAULT 0,
        visitas_tecnicas DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla métricas creada/verificada');

    // Verificar si existe un supervisor por defecto
    const supervisorExistente = await client.query(
      'SELECT id FROM usuarios WHERE rol = $1 LIMIT 1',
      ['supervisor']
    );

    if (supervisorExistente.rows.length === 0) {
      // Crear supervisor por defecto (password: Superv1s0r2024!)
      const bcrypt = await import('bcryptjs');
      const passwordHasheado = await bcrypt.default.hash('Superv1s0r2024!', 10);
      
      await client.query(
        `INSERT INTO usuarios (nombre, email, password, rol) 
         VALUES ($1, $2, $3, $4)`,
        ['Supervisor Principal', 'supervisor@telecentro.com', passwordHasheado, 'supervisor']
      );
      console.log('✅ Supervisor por defecto creado');
      console.log('   Email: supervisor@telecentro.com');
      console.log('   Password: Superv1s0r2024!');
    }

  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
  } finally {
    client.release();
  }
};

export default pool;
