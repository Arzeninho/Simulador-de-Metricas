import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import metricasRoutes from './routes/metricas.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';

// Importar configuración de base de datos
import { inicializarBaseDeDatos } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/metricas', metricasRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API de Métricas Telecentro',
    version: '1.0.0',
    estado: 'Funcionando'
  });
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const iniciarServidor = async () => {
  try {
    // Inicializar base de datos (crear tablas y supervisor por defecto)
    await inicializarBaseDeDatos();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 Endpoint de métricas: http://localhost:${PORT}/api/metricas`);
      console.log(`👥 Endpoint de usuarios: http://localhost:${PORT}/api/usuarios`);
      console.log(`🔐 Endpoint de auth: http://localhost:${PORT}/api/auth\n`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();

export default app;
