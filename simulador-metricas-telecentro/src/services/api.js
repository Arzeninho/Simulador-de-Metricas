import axios from 'axios';

// URL base del backend - usa variable de entorno para producción
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token JWT a cada请求
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Función para iniciar sesión
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al iniciar sesión';
  }
};

// Función para registro de asesores (auto-registro)
export const registro = async (datos) => {
  try {
    const response = await api.post('/auth/registrar', datos);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al registrar usuario';
  }
};

// Función para cerrar sesión
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

// Función para obtener el usuario actual
export const getUsuarioActual = () => {
  const usuario = localStorage.getItem('usuario');
  return usuario ? JSON.parse(usuario) : null;
};

// Función para verificar si está autenticado
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Obtener todas las métricas
export const obtenerMetricas = async () => {
  try {
    const response = await api.get('/metricas/global');
    return response.data.metricas ? [response.data.metricas] : [];
  } catch (error) {
    throw error.response?.data?.error || 'Error al obtener métricas';
  }
};

// Obtener agentes
export const obtenerAgentes = async () => {
  try {
    const response = await api.get('/usuarios/agentes');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al obtener agentes';
  }
};

// Obtener usuarios (solo supervisores)
export const obtenerUsuarios = async () => {
  try {
    const response = await api.get('/usuarios');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al obtener usuarios';
  }
};

// Crear métricas (solo supervisores)
export const crearMetricas = async (datos) => {
  try {
    const response = await api.post('/metricas', datos);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al crear métricas';
  }
};

// Actualizar métricas (solo supervisores)
export const actualizarMetricas = async (id, datos) => {
  try {
    const response = await api.put(`/metricas/${id}`, datos);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al actualizar métricas';
  }
};

// Crear usuario (solo supervisores)
export const crearUsuario = async (datos) => {
  try {
    const response = await api.post('/usuarios', datos);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al crear usuario';
  }
};

// Eliminar usuario (solo supervisores)
export const eliminarUsuario = async (id) => {
  try {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al eliminar usuario';
  }
};

// Guardar métricas (crear o actualizar)
export const guardarMetricas = async (datos) => {
  try {
    // Convertir formato del frontend al formato del backend
    const datosBackend = {
      tmo: parseFloat(datos.tmo) || 0,
      trans_comercial: parseFloat(datos.transferenciasComercial) || 0,
      trans_retencion: parseFloat(datos.transferenciasRetencion) || 0,
      isn: parseFloat(datos.encuestaISN) || 0,
      epa_satisfaccion: parseFloat(datos.epaSatisfaccion) || 0,
      epa_resolucion: parseFloat(datos.epaResolucion) || 0,
      epa_trato: parseFloat(datos.epaTrato) || 0,
      visitas_tecnicas: parseFloat(datos.visitasTecnicas) || 0,
      fcr: parseFloat(datos.fcr) || 0
    };
    
    const response = await api.post('/metricas/global', datosBackend);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al guardar métricas';
  }
};

// Guardar agente (crear o actualizar)
export const guardarAgentes = async (datos) => {
  try {
    // Convertir formato del frontend al formato del backend
    const datosBackend = {
      id: datos.id,
      nombre: datos.nombre,
      tmo: parseFloat(datos.tmo) || 0,
      trans_comercial: parseFloat(datos.transComercial) || 0,
      trans_retencion: parseFloat(datos.transRetencion) || 0,
      isn: parseFloat(datos.isn) || 0,
      epa_satisfaccion: parseFloat(datos.epaSatisfaccion) || 0,
      epa_resolucion: parseFloat(datos.epaResolucion) || 0,
      epa_trato: parseFloat(datos.epaTrato) || 0,
      visitas_tecnicas: parseFloat(datos.visitasTecnicas) || 0,
      fcr: parseFloat(datos.fcr) || 0
    };
    
    const response = await api.post('/usuarios/agentes', datosBackend);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al guardar agente';
  }
};

export default api;
