import React, { useState } from 'react';
import { registro } from '../services/api';

const Registro = ({ onRegistroExitoso, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: ''
  });
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Validaciones en tiempo real
  const validarCampo = (campo, valor) => {
    const nuevosErrores = { ...errores };
    
    switch (campo) {
      case 'nombre':
        if (!valor || valor.trim().length < 2) {
          nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
        } else {
          delete nuevosErrores.nombre;
        }
        break;
      case 'email':
        if (!valor) {
          nuevosErrores.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
          nuevosErrores.email = 'Formato de email inválido';
        } else if (!valor.toLowerCase().endsWith('@telecentro.com.ar') && !valor.toLowerCase().endsWith('@telecentro.com')) {
          nuevosErrores.email = 'Debe ser un email de Telecentro (@telecentro.com.ar)';
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
      case 'confirmarPassword':
        if (valor !== formData.password) {
          nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
        } else {
          delete nuevosErrores.confirmarPassword;
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
    if (formData.password !== formData.confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
    }
    
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    try {
      setCargando(true);
      setMensaje('');
      
      await registro({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password
      });
      
      setMensaje('✅ ¡Registro exitoso! Ahora puedes iniciar sesión.');
      setFormData({ nombre: '', email: '', password: '', confirmarPassword: '' });
      
      // Redireccionar al login después de 2 segundos
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
      
    } catch (err) {
      setErrores({ general: err });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>📊 Registro de Asesor</h1>
          <p>Crea tu usuario para acceder al sistema</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {errores.general && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {errores.general}
            </div>
          )}

          {mensaje && (
            <div className="success-message" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(74, 222, 128, 0.2)', border: '1px solid #4ade80', borderRadius: '0.5rem', color: '#4ade80' }}>
              {mensaje}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              className={errores.nombre ? 'input-error' : ''}
              required
            />
            {errores.nombre && <span className="error-text">{errores.nombre}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Corporativo</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu.email@telecentro.com.ar"
              className={errores.email ? 'input-error' : ''}
              required
            />
            {errores.email && <span className="error-text">{errores.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              className={errores.password ? 'input-error' : ''}
              required
            />
            {errores.password && <span className="error-text">{errores.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmarPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmarPassword"
              name="confirmarPassword"
              value={formData.confirmarPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              className={errores.confirmarPassword ? 'input-error' : ''}
              required
            />
            {errores.confirmarPassword && <span className="error-text">{errores.confirmarPassword}</span>}
          </div>

          <button type="submit" className="btn-login" disabled={cargando}>
            {cargando ? 'Registrando...' : 'Crear Mi Usuario'}
          </button>
        </form>

        <div className="login-footer">
          <button 
            type="button" 
            onClick={onSwitchToLogin}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#4a90d9', 
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.9rem'
            }}
          >
            ← ¿Ya tienes usuario? Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registro;
