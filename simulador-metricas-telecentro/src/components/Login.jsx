import React, { useState } from 'react';
import { login } from '../services/api';

const Login = ({ onLogin, onSwitchToRegistro }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const datos = await login(email, password);
      onLogin(datos.usuario);
    } catch (err) {
      setError(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>📊 Inicia sesión </h1>
          <p>Sistema de Gestión de Métricas</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.email@apexamerica.com.ar"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-login" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <button 
            type="button" 
            onClick={onSwitchToRegistro}
            className="link-button"
          >
            ¿No tienes usuario? Regístrate aquí
          </button>
          <p>🔐 Sistema de Supervisión - Apex America</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
