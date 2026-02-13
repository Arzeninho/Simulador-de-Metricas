import React, { useState, useEffect } from 'react';
import { obtenerUsuarios, crearUsuario, eliminarUsuario } from '../services/api';

const GestionUsuarios = ({ onClose }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'agente'
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Validaciones en tiempo real
  const validarCampo = (campo, valor) => {
    const nuevosErrores = { ...errores };
    
    switch (campo) {
      case 'nombre':
        if (!valor || valor.trim().length < 2) {
          nuevosErrores.nombre = 'El nombre de usuario debe tener al menos 2 caracteres.';
        } else {
          delete nuevosErrores.nombre;
        }
        break;
      case 'email':
        if (!valor) {
          nuevosErrores.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
          nuevosErrores.email = 'Formato de email inválido';
        } else if (!valor.toLowerCase().endsWith('@apexamerica.com.ar') && !valor.toLowerCase().endsWith('@apexamerica.com')) {
          nuevosErrores.email = 'Debe ser un email de Apexamerica (@apexamerica.com.ar)';
        } else {
          delete nuevosErrores.email;
        }
        break;
      case 'password':
        if (!valor || valor.length < 6) {
          nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
        } else {
          delete nuevosErrores.password;
        }
        break;
      default:
        break;
    }
    
    setErrores(nuevosErrores);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validarCampo(name, value);
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await obtenerUsuarios();
      setUsuarios(data.usuarios || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todos los campos antes de enviar
    const nuevosErrores = {};
    if (!formData.nombre || formData.nombre.trim().length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
    }
    if (!formData.email) {
      nuevosErrores.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'Formato de email inválido';
    } else if (!formData.email.toLowerCase().endsWith('@telecentro.com.ar') && !formData.email.toLowerCase().endsWith('@telecentro.com')) {
      nuevosErrores.email = 'Debe ser un email de Telecentro (@telecentro.com.ar)';
    }
    if (!formData.password || formData.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    try {
      setGuardando(true);
      await crearUsuario(formData);
      alert('Usuario creado exitosamente');
      setMostrarFormulario(false);
      setFormData({ nombre: '', email: '', password: '', rol: 'agente' });
      setErrores({});
      cargarUsuarios();
    } catch (err) {
      // Mostrar el error del servidor
      setErrores({ general: err });
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (confirm(`¿Estás seguro de eliminar al usuario "${nombre}"?`)) {
      try {
        await eliminarUsuario(id);
        alert('Usuario eliminado');
        cargarUsuarios();
      } catch (err) {
        alert(err);
      }
    }
  };

  return (
    <div className="gestion-usuarios-overlay">
      <div className="gestion-usuarios-modal">
        <div className="modal-header">
          <h2>👥 Gestión de Usuarios</h2>
          <button className="btn-cerrar" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          {!mostrarFormulario ? (
            <>
              <button 
                className="btn-primary" 
                onClick={() => setMostrarFormulario(true)}
                style={{ marginBottom: '1rem' }}
              >
                ➕ Crear Nuevo Usuario
              </button>

              {loading ? (
                <p>Cargando...</p>
              ) : (
                <table className="tabla-usuarios">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(usuario => (
                      <tr key={usuario.id}>
                        <td>{usuario.nombre}</td>
                        <td>{usuario.email}</td>
                        <td>
                          <span className={`rol-badge ${usuario.rol}`}>
                            {usuario.rol === 'supervisor' ? '👔 Supervisor' : '🎧 Agente'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn-eliminar"
                            onClick={() => handleEliminar(usuario.id, usuario.nombre)}
                          >
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="form-crear-usuario">
              <h3>Crear Nuevo Usuario</h3>
              
              {errores.general && (
                <div className="error-message" style={{ marginBottom: '1rem', padding: '0.75rem' }}>
                  {errores.general}
                </div>
              )}
              
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Nombre completo"
                  className={errores.nombre ? 'input-error' : ''}
                />
                {errores.nombre && <span className="error-text">{errores.nombre}</span>}
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="email@telecentro.com.ar"
                  className={errores.email ? 'input-error' : ''}
                />
                {errores.email && <span className="error-text">{errores.email}</span>}
              </div>

              <div className="form-group">
                <label>Contraseña:</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Mínimo 6 caracteres"
                  className={errores.password ? 'input-error' : ''}
                />
                {errores.password && <span className="error-text">{errores.password}</span>}
              </div>

              <div className="form-group">
                <label>Rol:</label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                >
                  <option value="agente">🎧 Agente</option>
                  <option value="supervisor">👔 Supervisor</option>
                </select>
              </div>

              <div className="botones-formulario">
                <button type="submit" className="btn-primary" disabled={guardando}>
                  {guardando ? 'Creando...' : 'Crear Usuario'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setErrores({});
                    setFormData({ nombre: '', email: '', password: '', rol: 'agente' });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionUsuarios;
