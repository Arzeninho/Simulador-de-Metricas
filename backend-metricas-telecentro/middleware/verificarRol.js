export const verificarRol = (rolPermitido) => {
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.usuario) {
      return res.status(401).json({ 
        error: 'No autenticado' 
      });
    }

    // Verificar el rol del usuario
    const { rol } = req.usuario;
    
    if (rol !== rolPermitido) {
      return res.status(403).json({ 
        error: `Acceso denegado. Se requiere rol de ${rolPermitido}` 
      });
    }

    next();
  };
};

// Middleware para permitir múltiples roles
export const verificarRoles = (rolesPermitidos) => {
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.usuario) {
      return res.status(401).json({ 
        error: 'No autenticado' 
      });
    }

    // Verificar si el rol del usuario está en la lista de permitidos
    const { rol } = req.usuario;
    
    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({ 
        error: `Acceso denegado. Roles permitidos: ${rolesPermitidos.join(', ')}` 
      });
    }

    next();
  };
};

export default verificarRol;
