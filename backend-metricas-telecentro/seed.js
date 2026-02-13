import bcrypt from 'bcryptjs';
import pool from './config/database.js';

const crearUsuariosPorDefecto = async () => {
  try {
    console.log('Creando usuarios por defecto...');
    
    // Hash de contraseñas
    const passwordSupervisor = await bcrypt.hash('Superv1s0r2024!', 10);
    const passwordAgente = await bcrypt.hash('Ag3nt32024!', 10);
    
    // Crear supervisor
    await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING`,
      ['Supervisor Principal', 'supervisor@telecentro.com', passwordSupervisor, 'supervisor']
    );
    console.log('✓ Supervisor creado: supervisor@telecentro.com');
    
    // Crear agente
    await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING`,
      ['Agente de Soporte', 'agente@telecentro.com', passwordAgente, 'agente']
    );
    console.log('✓ Agente creado: agente@telecentro.com');
    
    console.log('\n🎉 Usuarios creados exitosamente!');
    console.log('\nCredenciales de acceso:');
    console.log('  Supervisor: supervisor@telecentro.com / Superv1s0r2024!');
    console.log('  Agente: agente@telecentro.com / Ag3nt32024!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error al crear usuarios:', error);
    process.exit(1);
  }
};

crearUsuariosPorDefecto();
