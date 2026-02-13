import React from 'react';

const Header = ({ usuario, onLogout, onOpenGestionUsuarios }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <h1>📊 Simulador de Métricas</h1>
          <p className="subtitle">Apex America - Soporte Técnico</p>
        </div>
        <div className="header-info">
          <div className="user-info">
            <span className="user-name">👤 {usuario?.nombre}</span>
            <span className="user-role">({usuario?.rol === 'supervisor' ? '👔 Supervisor' : '🎧 Agente'})</span>
          </div>
          <div className="header-buttons">
            {usuario?.rol === 'supervisor' && (
              <button 
                className="btn-gestion-usuarios" 
                onClick={onOpenGestionUsuarios}
                title="Gestionar Usuarios"
              >
                👥 Usuarios
              </button>
            )}
            <button className="btn-logout" onClick={onLogout}>
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
