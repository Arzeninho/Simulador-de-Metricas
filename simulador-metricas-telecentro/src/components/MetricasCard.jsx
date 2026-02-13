import React from 'react';

const MetricasCard = ({ titulo, valor, unidad, icono, tendencia, color }) => {
  return (
    <div className={`metrica-card ${color}`}>
      <div className="metrica-header">
        <span className="metrica-icono">{icono}</span>
        <h3>{titulo}</h3>
      </div>
      <div className="metrica-valor">
        <span className="valor">{valor}</span>
        <span className="unidad">{unidad}</span>
      </div>
      {tendencia && (
        <div className={`metrica-tendencia ${tendencia > 0 ? 'positiva' : 'negativa'}`}>
          <span>{tendencia > 0 ? '↑' : '↓'} {Math.abs(tendencia)}%</span>
          <span className="tendencia-texto">vs. período anterior</span>
        </div>
      )}
    </div>
  );
};

export default MetricasCard;
