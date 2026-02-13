import express from 'express';
import { obtenerMetricas, crearMetricas, actualizarMetricas, eliminarMetricas, obtenerMetricasGlobales, guardarMetricasGlobales } from '../controllers/metricas.controller.js';
import verificarToken from '../middleware/auth.js';
import verificarRol from '../middleware/verificarRol.js';

const router = express.Router();

// GET /api/metricas/global - Obtener métricas globales del equipo (todos los usuarios autenticados)
router.get('/global', verificarToken, obtenerMetricasGlobales);

// POST /api/metricas/global - Crear o actualizar métricas globales (solo supervisores)
router.post('/global', verificarToken, verificarRol('supervisor'), guardarMetricasGlobales);

// GET /api/metricas - Obtener todas las métricas (todos los usuarios autenticados)
router.get('/', verificarToken, obtenerMetricas);

// POST /api/metricas - Crear nuevas métricas (solo supervisores)
router.post('/', verificarToken, verificarRol('supervisor'), crearMetricas);

// PUT /api/metricas/:id - Actualizar métricas (solo supervisores)
router.put('/:id', verificarToken, verificarRol('supervisor'), actualizarMetricas);

// DELETE /api/metricas/:id - Eliminar métricas (solo supervisores)
router.delete('/:id', verificarToken, verificarRol('supervisor'), eliminarMetricas);

export default router;
