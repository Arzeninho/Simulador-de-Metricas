import express from 'express';
import { obtenerUsuarios, obtenerAgentes, obtenerUsuario, crearUsuario, actualizarUsuario, eliminarUsuario, guardarAgenteMetricas } from '../controllers/usuarios.controller.js';
import verificarToken from '../middleware/auth.js';
import verificarRol from '../middleware/verificarRol.js';

const router = express.Router();

// GET /api/usuarios - Listar todos los usuarios (solo supervisores)
router.get('/', verificarToken, verificarRol('supervisor'), obtenerUsuarios);

// GET /api/usuarios/agentes - Listar solo agentes (todos los usuarios autenticados)
router.get('/agentes', verificarToken, obtenerAgentes);

// POST /api/usuarios/agentes - Crear o actualizar agente con métricas (solo supervisores)
router.post('/agentes', verificarToken, verificarRol('supervisor'), guardarAgenteMetricas);

// GET /api/usuarios/:id - Obtener un usuario específico (todos los usuarios autenticados)
router.get('/:id', verificarToken, obtenerUsuario);

// POST /api/usuarios - Crear un nuevo usuario (solo supervisores)
router.post('/', verificarToken, verificarRol('supervisor'), crearUsuario);

// PUT /api/usuarios/:id - Actualizar un usuario (solo supervisores)
router.put('/:id', verificarToken, verificarRol('supervisor'), actualizarUsuario);

// DELETE /api/usuarios/:id - Eliminar un usuario (solo supervisores)
router.delete('/:id', verificarToken, verificarRol('supervisor'), eliminarUsuario);

export default router;
