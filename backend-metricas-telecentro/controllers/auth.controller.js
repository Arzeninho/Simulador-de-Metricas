import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que se proporcionen email y password
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y password son requeridos' 
      });
    }

    // Buscar el usuario en la base de datos
    const result = await pool.query(
      'SELECT id, nombre, email, password, rol FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    const usuario = result.rows[0];

    // Verificar la contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValido) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Generar el token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        nombre: usuario.nombre, 
        email: usuario.email, 
        rol: usuario.rol 
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    // Responder con el token y la información del usuario
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión' 
    });
  }
};

export const registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }

    // Validar que el nombre no esté vacío
    if (nombre.trim().length < 2) {
      return res.status(400).json({ 
        error: 'El nombre debe tener al menos 2 caracteres' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'El formato del email es inválido' 
      });
    }

    // Validar que el email sea de Telecentro
    if (!email.toLowerCase().endsWith('@telecentro.com.ar') && !email.toLowerCase().endsWith('@telecentro.com')) {
      return res.status(400).json({ 
        error: 'El email debe ser de Telecentro (@telecentro.com.ar o @telecentro.com)' 
      });
    }

    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Si se proporciona un rol, debe ser válido (solo supervisores pueden crear otros supervisores)
    if (rol && !['supervisor', 'agente'].includes(rol)) {
      return res.status(400).json({ 
        error: 'Rol inválido' 
      });
    }

    // Verificar si el email ya existe
    const emailExistente = await pool.query(
      'SELECT id FROM usuarios WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (emailExistente.rows.length > 0) {
      return res.status(400).json({ 
        error: 'El email ya está registrado en el sistema' 
      });
    }

    // Verificar si el nombre ya existe
    const nombreExistente = await pool.query(
      'SELECT id FROM usuarios WHERE LOWER(nombre) = LOWER($1)',
      [nombre]
    );

    if (nombreExistente.rows.length > 0) {
      return res.status(400).json({ 
        error: 'El nombre de usuario ya está registrado' 
      });
    }

    // Encriptar la contraseña
    const passwordHasheado = await bcrypt.hash(password, 10);

    // Usar el rol proporcionado o 'agente' por defecto
    const rolUsuario = rol || 'agente';

    // Insertar el nuevo usuario
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, nombre, email, rol`,
      [nombre, email, passwordHasheado, rolUsuario]
    );

    // Si se crea un agente, también crear sus métricas vacías
    if (rolUsuario === 'agente') {
      await pool.query(
        `INSERT INTO metricas (agente_id, tmo, trans_comercial, trans_retencion, isn, epa_satisfaccion, epa_resolucion, epa_trato, visitas_tecnicas) 
         VALUES ($1, 0, 0, 0, 0, 0, 0, 0, 0)`,
        [result.rows[0].id]
      );
    }

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error('Error al registrar:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario' 
    });
  }
};

export default { login, registrar };
