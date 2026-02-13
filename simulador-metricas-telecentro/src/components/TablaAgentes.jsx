import React from 'react';

const TablaAgentes = ({ agentes, puedeEditar = false, onUpdate = null }) => {
  return (
    <div className="tabla-agentes-container">
      <h2>👥 Métricas por Agente de Soporte Técnico</h2>
      <div className="tabla-wrapper">
        <table className="tabla-agentes">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>TMO (seg)</th>
              <th>EPA Satisfacción</th>
              <th>EPA Resolución</th>
              <th>EPA Trato</th>
              <th>FCR</th>
              <th>Trans. Comercial</th>
              <th>Trans. Retención</th>
              <th>ISN</th>
              <th>Visitas Técnicas</th>
            </tr>
          </thead>
          <tbody>
            {agentes.map((agente) => (
              <tr key={agente.id}>
                <td className="id-cell">{agente.id}</td>
                <td className="nombre-agente">{agente.nombre}</td>
                <td className="tmo-valor">{agente.tmo}</td>
                <td>
                  <span className="porcentaje-badge epa-satisfaccion">{agente.epaSatisfaccion}%</span>
                </td>
                <td>
                  <span className="porcentaje-badge epa-resolucion">{agente.epaResolucion}%</span>
                </td>
                <td>
                  <span className="porcentaje-badge epa-trato">{agente.epaTrato}%</span>
                </td>
                <td>
                  <span className="porcentaje-badge fcr">{agente.fcr}%</span>
                </td>
                <td>
                  <span className="porcentaje-badge comercial">{agente.transComercial}%</span>
                </td>
                <td>
                  <span className="porcentaje-badge retencion">{agente.transRetencion}%</span>
                </td>
                <td>
                  <span className="porcentaje-badge isn">{agente.isn}%</span>
                </td>
                <td>
                  <span className="porcentaje-badge visitas">{agente.visitasTecnicas}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaAgentes;
