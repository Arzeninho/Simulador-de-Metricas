import React, { useState } from 'react';

const MetricasGlobales = ({ metricas, onUpdate, puedeEditar = true }) => {
  const [editando, setEditando] = useState(null);
  const [valoresTemp, setValoresTemp] = useState(metricas);

  const handleChange = (campo, valor) => {
    setValoresTemp({
      ...valoresTemp,
      [campo]: valor
    });
  };

  const handleGuardar = (campo) => {
    onUpdate(campo, valoresTemp[campo]);
    setEditando(null);
  };

  const handleCancelar = (campo) => {
    setValoresTemp({
      ...valoresTemp,
      [campo]: metricas[campo]
    });
    setEditando(null);
  };

  const metricasConfig = [
    { campo: 'tmo', titulo: 'TMO Global', icono: '⏱️', unidad: 'seg', tipo: 'number' },
    { campo: 'transferenciasComercial', titulo: 'Trans. Comercial', icono: '📞', unidad: '%', tipo: 'number' },
    { campo: 'transferenciasRetencion', titulo: 'Trans. Retención', icono: '🔄', unidad: '%', tipo: 'number' },
    { campo: 'encuestaISN', titulo: 'ISN Global', icono: '⭐', unidad: '%', tipo: 'number' },
    { campo: 'visitasTecnicas', titulo: 'Visitas Técnicas', icono: '🔧', unidad: '%', tipo: 'number' },
    { campo: 'epaSatisfaccion', titulo: 'EPA Satisfacción', icono: '😊', unidad: '%', tipo: 'number' },
    { campo: 'epaResolucion', titulo: 'EPA Resolución', icono: '✅', unidad: '%', tipo: 'number' },
    { campo: 'epaTrato', titulo: 'EPA Trato', icono: '🤝', unidad: '%', tipo: 'number' }
  ];

  return (
    <div className="metricas-globales-container">
      <div className="metricas-globales-header">
        <h2>📊 Métricas Globales del Equipo</h2>
      </div>
      <div className="metricas-globales-grid">
        {metricasConfig.map((config) => (
          <div key={config.campo} className="metrica-global-item">
            <div className="metrica-global-header">
              <span className="metrica-global-icono">{config.icono}</span>
              <h3>{config.titulo}</h3>
              {puedeEditar && (
                <button 
                  className="btn-editar-global"
                  onClick={() => setEditando(config.campo)}
                  title="Editar métrica"
                >
                  ✏️
                </button>
              )}
            </div>
            
            {editando === config.campo ? (
              <div className="metrica-global-edicion">
                <input
                  type={config.tipo}
                  value={valoresTemp[config.campo]}
                  onChange={(e) => handleChange(config.campo, e.target.value)}
                  className="input-metrica-global"
                  step={config.tipo === 'number' ? '0.1' : undefined}
                />
                <span className="unidad-global">{config.unidad}</span>
                <div className="botones-edicion-global">
                  <button className="btn-guardar-global" onClick={() => handleGuardar(config.campo)}>✓</button>
                  <button className="btn-cancelar-global" onClick={() => handleCancelar(config.campo)}>✗</button>
                </div>
              </div>
            ) : (
              <div className="metrica-global-valor">
                <span className="valor-global">{metricas[config.campo]}</span>
                <span className="unidad-global">{config.unidad}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricasGlobales;
