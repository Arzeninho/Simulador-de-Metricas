import pool from '../config/database.js';

// GET /metricas/global - Obtener métricas globales del equipo (accessible for all authenticated users)
export const obtenerMetricasGlobales = async (req, res) => {
  try {
    // Calcular el promedio de todas las métricas de los agentes
    const result = await pool.query(`
      SELECT 
        AVG(tmo) as tmo,
        AVG(trans_comercial) as transferencias_comercial,
        AVG(trans_retencion) as transferencias_retencion,
        AVG(isn) as isn,
        AVG(epa_satisfaccion) as epa_satisfaccion,
        AVG(epa_resolucion) as epa_resolucion,
        AVG(epa_trato) as epa_trato,
        AVG(visitas_tecnicas) as visitas_tecnicas
      FROM metricas
    `);

    res.json({
      metricas: result.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener métricas globales:', error);
    res.status(500).json({ 
      error: 'Error al obtener las métricas globales' 
    });
  }
};

// POST /metricas/global - Crear o actualizar métricas globales (only supervisors)
export const guardarMetricasGlobales = async (req, res) => {
  try {
    const { tmo, trans_comercial, trans_retencion, isn, epa_satisfaccion, epa_resolucion, epa_trato, visitas_tecnicas } = req.body;

    // Obtener todos los agentes
    const agentes = await pool.query('SELECT id FROM usuarios WHERE rol = $1', ['agente']);

    if (agentes.rows.length === 0) {
      return res.status(404).json({ 
        error: 'No hay agentes registrados' 
      });
    }

    // Crear métricas para cada agente con los valores globales
    const metricasCreadas = [];
    for (const agente of agentes.rows) {
      const result = await pool.query(
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
      metricasCreadas.push(result.rows[0]);
    }

    res.status(201).json({
      mensaje: 'Métricas globales creadas exitosamente',
      metricas: metricasCreadas
    });

  } catch (error) {
    console.error('Error al guardar métricas globales:', error);
    res.status(500).json({ 
      error: 'Error al guardar las métricas globales' 
    });
  }
};

// GET /metricas - Obtener todas las métricas (accessible for all authenticated users)
export const obtenerMetricas = async (req, res) => {
  try {
    // Si el usuario es supervisor, obtiene todas las métricas
    // Si es agente, obtiene solo sus métricas
    let query;
    let params;

    if (req.usuario.rol === 'supervisor') {
      query = `
        SELECT m.*, u.nombre as nombre_agente, u.email as email_agente
        FROM metricas m
        JOIN usuarios u ON m.agente_id = u.id
        ORDER BY m.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT m.*, u.nombre as nombre_agente, u.email as email_agente
        FROM metricas m
        JOIN usuarios u ON m.agente_id = u.id
        WHERE m.agente_id = $1
        ORDER BY m.created_at DESC
      `;
      params = [req.usuario.id];
    }

    const result = await pool.query(query, params);

    res.json({
      metricas: result.rows,
      cantidad: result.rows.length
    });

  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ 
      error: 'Error al obtener las métricas' 
    });
  }
};

// POST /metricas - Crear nuevas métricas (only supervisors)
export const crearMetricas = async (req, res) => {
  try {
    const { agente_id, tmo, trans_comercial, trans_retencion, isn, epa_satisfaccion, epa_resolucion, epa_trato, visitas_tecnicas } = req.body;

    // Validar que se proporcione el ID del agente
    if (!agente_id) {
      return res.status(400).json({ 
        error: 'El ID del agente es requerido' 
      });
    }

    // Verificar que el agente exista
    const agenteExistente = await pool.query(
      'SELECT id, nombre FROM usuarios WHERE id = $1 AND rol = $2',
      [agente_id, 'agente']
    );

    if (agenteExistente.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Agente no encontrado' 
      });
    }

    // Insertar las métricas
    const result = await pool.query(
      `INSERT INTO metricas 
       (agente_id, tmo, trans_comercial, trans_retencion, isn, epa_satisfaccion, epa_resolucion, epa_trato, visitas_tecnicas) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        agente_id, 
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
      mensaje: 'Métricas creadas exitosamente',
      metricas: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear métricas:', error);
    res.status(500).json({ 
      error: 'Error al crear las métricas' 
    });
  }
};

// PUT /metricas/:id - Actualizar métricas (only supervisors)
export const actualizarMetricas = async (req, res) => {
  try {
    const { id } = req.params;
    const { tmo, trans_comercial, trans_retencion, isn, epa_satisfaccion, epa_resolucion, epa_trato, visitas_tecnicas } = req.body;

    // Verificar que la métrica exista
    const metricaExistente = await pool.query(
      'SELECT * FROM metricas WHERE id = $1',
      [id]
    );

    if (metricaExistente.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Métrica no encontrada' 
      });
    }

    // Actualizar la métrica
    const result = await pool.query(
      `UPDATE metricas 
       SET tmo = COALESCE($1, tmo),
           trans_comercial = COALESCE($2, trans_comercial),
           trans_retencion = COALESCE($3, trans_retencion),
           isn = COALESCE($4, isn),
           epa_satisfaccion = COALESCE($5, epa_satisfaccion),
           epa_resolucion = COALESCE($6, epa_resolucion),
           epa_trato = COALESCE($7, epa_trato),
           visitas_tecnicas = COALESCE($8, visitas_tecnicas),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [tmo, trans_comercial, trans_retencion, isn, epa_satisfaccion, epa_resolucion, epa_trato, visitas_tecnicas, id]
    );

    res.json({
      mensaje: 'Métricas actualizadas exitosamente',
      metricas: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar métricas:', error);
    res.status(500).json({ 
      error: 'Error al actualizar las métricas' 
    });
  }
};

// DELETE /metricas/:id - Eliminar métricas (only supervisors)
export const eliminarMetricas = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la métrica exista
    const metricaExistente = await pool.query(
      'SELECT * FROM metricas WHERE id = $1',
      [id]
    );

    if (metricaExistente.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Métrica no encontrada' 
      });
    }

    // Eliminar la métrica
    await pool.query(
      'DELETE FROM metricas WHERE id = $1',
      [id]
    );

    res.json({
      mensaje: 'Métricas eliminadas exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar métricas:', error);
    res.status(500).json({ 
      error: 'Error al eliminar las métricas' 
    });
  }
};

export default { obtenerMetricas, crearMetricas, actualizarMetricas, eliminarMetricas };
