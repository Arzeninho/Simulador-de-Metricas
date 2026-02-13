import React, { useState } from 'react';

const MetricaEditable = ({ titulo, valor, unidad, icono, color, onUpdate, tipo = 'number' }) => {
  const [editando, setEditando] = useState(false);
  const [valorTemp, setValorTemp] = useState(valor);

  const handleGuardar = () => {
    onUpdate(valorTemp);
    setEditando(false);
  };

  const handleCancelar = () => {
    setValorTemp(valor);
    setEditando(false);
  };

  return (
    <div className={`metrica-card ${color}`}>
      <div className="metrica-header">
        <span className="metrica-icono">{icono}</span>
        <h3>{titulo}</h3>
        <button 
          className="btn-editar"
          onClick={() => setEditando(!editando)}
          title="Editar métrica"
        >
          ✏️
        </button>
      </div>
      
      {editando ? (
        <div className="metrica-edicion">
          <input
            type={tipo}
            value={valorTemp}
            onChange={(e) => setValorTemp(e.target.value)}
            className="input-metrica"
            step={tipo === 'number' ? '0.01' : undefined}
          />
          <span className="unidad-edicion">{unidad}</span>
          <div className="botones-edicion">
            <button className="btn-guardar" onClick={handleGuardar}>✓</button>
            <button className="btn-cancelar" onClick={handleCancelar}>✗</button>
          </div>
        </div>
      ) : (
        <div className="metrica-valor">
          <span className="valor">{valor}</span>
          <span className="unidad">{unidad}</span>
        </div>
      )}
    </div>
  );
};

export default MetricaEditable;
