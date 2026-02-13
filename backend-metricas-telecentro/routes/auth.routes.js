import express from 'express';
import { login, registrar } from '../controllers/auth.controller.js';

const router = express.Router();

// POST /api/auth/login - Iniciar sesión
router.post('/login', login);

// POST /api/auth/registrar - Registrar nuevo usuario (solo supervisors)
router.post('/registrar', registrar);

export default router;
