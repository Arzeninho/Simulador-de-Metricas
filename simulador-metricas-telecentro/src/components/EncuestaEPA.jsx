import React, { useState } from 'react';

const EncuestaEPA = ({ datos, onUpdate }) => {
  const [editando, setEditando] = useState(false);
  const [valoresTemp, setValoresTemp] = useState(datos);

  const handleChange = (campo, valor) => {
    setValoresTemp({
      ...valoresTemp,
      [campo]: valor
    });
  };

  const handleGuardar = () => {
    onUpdate(valoresTemp);
    setEditando(false);
  };

  const handleCancelar = () => {
    setValoresTemp(datos);
    setEditando(false);
  };

  return (
    <div className="encuesta-epa-card">
      <div className="epa-header">
        <div className="epa-titulo">
          <span className="epa-icono">📋</span>
          <h2>Encuesta EPA</h2>
        </div>
        <button 
          className="btn-editar"
          onClick={() => setEditando(!editando)}
          title="Editar encuesta EPA"
        >
          ✏️
        </button>
      </div>

      <div className="epa-indices">
        <div className="epa-indice satisfaccion">
          <h3>Índice de Satisfacción</h3>
          {editando ? (
            <div className="input-group">
              <input
                type="number"
                value={valoresTemp.satisfaccion}
                onChange={(e) => handleChange('satisfaccion', e.target.value)}
                className="input-epa"
                step="0.1"
                min="0"
                max="100"
              />
              <span className="unidad">%</span>
            </div>
          ) : (
            <div className="valor-epa">
              <span className="numero">{datos.satisfaccion}</span>
              <span className="unidad">%</span>
            </div>
          )}
        </div>

        <div className="epa-indice resolucion">
          <h3>Índice de Resolución</h3>
          {editando ? (
            <div className="input-group">
              <input
                type="number"
                value={valoresTemp.resolucion}
                onChange={(e) => handleChange('resolucion', e.target.value)}
                className="input-epa"
                step="0.1"
                min="0"
                max="100"
              />
              <span className="unidad">%</span>
            </div>
          ) : (
            <div className="valor-epa">
              <span className="numero">{datos.resolucion}</span>
              <span className="unidad">%</span>
            </div>
          )}
        </div>

        <div className="epa-indice trato">
          <h3>Índice de Trato</h3>
          {editando ? (
            <div className="input-group">
              <input
                type="number"
                value={valoresTemp.trato}
                onChange={(e) => handleChange('trato', e.target.value)}
                className="input-epa"
                step="0.1"
                min="0"
                max="100"
              />
              <span className="unidad">%</span>
            </div>
          ) : (
            <div className="valor-epa">
              <span className="numero">{datos.trato}</span>
              <span className="unidad">%</span>
            </div>
          )}
        </div>
      </div>

      {editando && (
        <div className="botones-epa">
          <button className="btn-guardar-epa" onClick={handleGuardar}>
            ✓ Guardar Cambios
          </button>
          <button className="btn-cancelar-epa" onClick={handleCancelar}>
            ✗ Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default EncuestaEPA;
