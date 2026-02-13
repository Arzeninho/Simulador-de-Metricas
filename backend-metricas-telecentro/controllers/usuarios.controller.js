import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

// GET /usuarios - Listar todos los usuarios (only supervisors)
export const obtenerUsuarios = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre, email, rol, created_at, updated_at 
       FROM usuarios 
       ORDER BY rol, nombre`
    );

    res.json({
      usuarios: result.rows,
      cantidad: result.rows.length
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      error: 'Error al obtener los usuarios' 
    });
  }
};

// GET /usuarios/agentes - Listar solo agentes con sus métricas (accessible for all authenticated users)
export const obtenerAgentes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        u.id, 
        u.nombre, 
        u.email, 
        u.rol, 
        u.created_at,
        COALESCE(m.tmo, 0) as tmo,
        COALESCE(m.trans_comercial, 0) as trans_comercial,
        COALESCE(m.trans_retencion, 0) as trans_retencion,
        COALESCE(m.isn, 0) as isn,
        COALESCE(m.epa_satisfaccion, 0) as epa_satisfaccion,
        COALESCE(m.epa_resolucion, 0) as epa_resolucion,
        COALESCE(m.epa_trato, 0) as epa_trato,
        COALESCE(m.visitas_tecnicas, 0) as visitas_tecnicas
       FROM usuarios u
       LEFT JOIN LATERAL (
         SELECT * FROM metricas 
         WHERE agente_id = u.id 
         ORDER BY created_at DESC 
         LIMIT 1
       ) m ON true
       WHERE u.rol = 'agente'
       ORDER BY u.nombre`
    );

    res.json({
      agentes: result.rows,
      cantidad: result.rows.length
    });

  } catch (error) {
    console.error('Error al obtener agentes:', error);
    res.status(500).json({ 
      error: 'Error al obtener los agentes' 
    });
  }
};

// GET /usuarios/:id - Obtener un usuario específico (accessible for all authenticated users)
export const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, nombre, email, rol, created_at, updated_at 
       FROM usuarios 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    res.json({
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ 
      error: 'Error al obtener el usuario' 
    });
  }
};

// Función para validar formato de email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// POST /usuarios - Crear un nuevo usuario (only supervisors)
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password || !rol) {
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
    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        error: 'El formato del email es inválido' 
      });
    }

    // Validar que el email sea de Apex America (opcional, según requerimiento)
    if (!email.toLowerCase().endsWith('@apexamerica.com.ar') && !email.toLowerCase().endsWith('@apexamerica.com')) {
      return res.status(400).json({ 
        error: 'El email debe ser de Apex America (@apexamerica.com.ar o @apexamerica.com)' 
      });
    }

    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Validar que el rol sea válido
    if (!['supervisor', 'agente'].includes(rol)) {
      return res.status(400).json({ 
        error: 'Rol inválido. Debe ser supervisor o agente' 
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

    // Insertar el nuevo usuario
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, nombre, email, rol, created_at`,
      [nombre, email, passwordHasheado, rol]
    );

    // Si se crea un agente, también crear sus métricas vacías
    if (rol === 'agente') {
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
    console.error('Error al crear usuario:', error);
    res.status(500).json({ 
      error: 'Error al crear el usuario' 
    });
  }
};

// PUT /usuarios/:id - Actualizar un usuario (only supervisors)
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol } = req.body;

    // Verificar que el usuario exista
    const usuarioExistente = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    );

    if (usuarioExistente.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    // Si se cambia el email, verificar que no exista
    if (email && email !== usuarioExistente.rows[0].email) {
      const emailExistente = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email]
      );

      if (emailExistente.rows.length > 0) {
        return res.status(400).json({ 
          error: 'El nuevo email ya está registrado' 
        });
      }
    }

    // Construir la consulta dinámicamente
    let query = 'UPDATE usuarios SET ';
    const params = [];
    let paramIndex = 1;

    if (nombre) {
      query += `nombre = $${paramIndex++}, `;
      params.push(nombre);
    }
    if (email) {
      query += `email = $${paramIndex++}, `;
      params.push(email);
    }
    if (password) {
      const passwordHasheado = await bcrypt.hash(password, 10);
      query += `password = $${paramIndex++}, `;
      params.push(passwordHasheado);
    }
    if (rol) {
      if (!['supervisor', 'agente'].includes(rol)) {
        return res.status(400).json({ 
          error: 'Rol inválido' 
        });
      }
      query += `rol = $${paramIndex++}, `;
      params.push(rol);
    }

    query += `updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING id, nombre, email, rol, updated_at`;
    params.push(id);

    const result = await pool.query(query, params);

    res.json({
      mensaje: 'Usuario actualizado exitosamente',
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ 
      error: 'Error al actualizar el usuario' 
    });
  }
};

// DELETE /usuarios/:id - Eliminar un usuario (only supervisors)
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario exista
    const usuarioExistente = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    );

    if (usuarioExistente.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    // Verificar que no se elimine a sí mismo
    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({ 
        error: 'No puedes eliminar tu propio usuario' 
      });
    }

    // Eliminar el usuario (las métricas se eliminan en cascada)
    await pool.query(
      'DELETE FROM usuarios WHERE id = $1',
      [id]
    );

    res.json({
      mensaje: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ 
      error: 'Error al eliminar el usuario' 
    });
  }
};

// POST /usuarios/agentes - Crear o actualizar agente con métricas (solo supervisores)
export const guardarAgenteMetricas = async (req, res) => {
  try {
    const { id, nombre, tmo, trans_comercial, trans_retencion, isn, epa_satisfaccion, epa_resolucion, epa_trato, visitas_tecnicas } = req.body;

    // Buscar el agente por nombre o crear uno nuevo
    let agente;
    if (id) {
      // Si tiene ID, buscarlo
      const agenteExistente = await pool.query(
        'SELECT * FROM usuarios WHERE id = $1 AND rol = $2',
        [id, 'agente']
      );
      
      if (agenteExistente.rows.length > 0) {
        // Actualizar el agente
        agente = agenteExistente.rows[0];
        await pool.query(
          'UPDATE usuarios SET nombre = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [nombre || agente.nombre, id]
        );
      } else {
        return res.status(404).json({ error: 'Agente no encontrado' });
      }
    } else {
      // Crear nuevo agente con nombre
      const nombreAgente = nombre || `Agente_${Date.now()}`;
      const result = await pool.query(
        `INSERT INTO usuarios (nombre, email, password, rol) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [nombreAgente, `${nombreAgente.toLowerCase().replace(/\s/g, '.')}@apexamerica.com`, 'agente123', 'agente']
      );
      agente = result.rows[0];
    }

    // Crear métricas para el agente
    const metricasResult = await pool.query(
      `INSERT INTO metricas 
       (agente_id, tmo, trans_comercial, trans_retencion, isn, epa_satisfaccion, epa_resolucion, epa_trato, visitas_tecnicas) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        agente.id,
        tmo || 0,
        trans_comercial || 0,
        trans_retencion || 0,
        isn || 0,
        epa_satisfaccion || 0,
        epa_resolucion || 0,
        epa_trato || 0,
        visitas_tecnicas || 0
      ]
    );

    res.status(201).json({
      mensaje: 'Agente y métricas guardados exitosamente',
      agente: agente,
      metricas: metricasResult.rows[0]
    });

  } catch (error) {
    console.error('Error al guardar agente y métricas:', error);
    res.status(500).json({ 
      error: 'Error al guardar el agente y métricas' 
    });
  }
};

export default { obtenerUsuarios, obtenerAgentes, obtenerUsuario, crearUsuario, actualizarUsuario, eliminarUsuario, guardarAgenteMetricas };
