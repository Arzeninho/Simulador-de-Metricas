import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Registro from './components/Registro';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import GestionUsuarios from './components/GestionUsuarios';
import { isAuthenticated, getUsuarioActual, logout } from './services/api';
import './App.css';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarGestionUsuarios, setMostrarGestionUsuarios] = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  useEffect(() => {
    // Verificar si hay sesión activa
    if (isAuthenticated()) {
      const usuarioActual = getUsuarioActual();
      if (usuarioActual) {
        setUsuario(usuarioActual);
      }
    }
    setCargando(false);
  }, []);

  const handleLogin = (usuarioData) => {
    setUsuario(usuarioData);
  };

  const handleLogout = () => {
    logout();
    setUsuario(null);
  };

  const handleOpenGestionUsuarios = () => {
    setMostrarGestionUsuarios(true);
  };

  const handleCloseGestionUsuarios = () => {
    setMostrarGestionUsuarios(false);
  };

  const handleSwitchToRegistro = () => {
    setMostrarRegistro(true);
  };

  const handleSwitchToLogin = () => {
    setMostrarRegistro(false);
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {usuario ? (
        <>
          <Header 
            usuario={usuario} 
            onLogout={handleLogout}
            onOpenGestionUsuarios={handleOpenGestionUsuarios}
          />
          <Dashboard usuario={usuario} />
          {mostrarGestionUsuarios && (
            <GestionUsuarios onClose={handleCloseGestionUsuarios} />
          )}
        </>
      ) : (
        mostrarRegistro ? (
          <Registro 
            onSwitchToLogin={handleSwitchToLogin}
          />
        ) : (
          <Login 
            onLogin={handleLogin} 
            onSwitchToRegistro={handleSwitchToRegistro}
          />
        )
      )}
    </div>
  );
}

export default App;
