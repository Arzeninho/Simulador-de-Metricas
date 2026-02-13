import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import MetricasGlobales from './MetricasGlobales';
import TablaAgentes from './TablaAgentes';

const Dashboard = ({ usuario }) => {
  const isSupervisor = usuario?.rol === 'supervisor';
  
  // Valores por defecto
  const valoresDefecto = {
    metricas: {
      tmo: 330,
      transferenciasComercial: 12.5,
      transferenciasRetencion: 8.3,
      encuestaISN: 85.5,
      visitasTecnicas: 23.5,
      epaSatisfaccion: 87.5,
      epaResolucion: 82.3,
      epaTrato: 91.2,
      fcr: 75.5
    },
    agentes: [
      { id: 'AG001', nombre: 'Juan Pérez', tmo: 320, transComercial: 10.5, transRetencion: 7.2, isn: 88.5, epaSatisfaccion: 89.2, epaResolucion: 84.5, epaTrato: 92.1, visitasTecnicas: 22.3, fcr: 78.5 },
      { id: 'AG002', nombre: 'María González', tmo: 295, transComercial: 11.8, transRetencion: 8.5, isn: 91.2, epaSatisfaccion: 90.5, epaResolucion: 86.3, epaTrato: 93.8, visitasTecnicas: 24.1, fcr: 82.3 },
      { id: 'AG003', nombre: 'Carlos Rodríguez', tmo: 370, transComercial: 13.2, transRetencion: 9.1, isn: 82.3, epaSatisfaccion: 85.7, epaResolucion: 80.2, epaTrato: 88.9, visitasTecnicas: 25.8, fcr: 71.2 },
      { id: 'AG004', nombre: 'Ana Martínez', tmo: 345, transComercial: 12.0, transRetencion: 7.8, isn: 89.7, epaSatisfaccion: 88.4, epaResolucion: 83.9, epaTrato: 91.5, visitasTecnicas: 21.7, fcr: 76.8 },
      { id: 'AG005', nombre: 'Luis Fernández', tmo: 315, transComercial: 11.5, transRetencion: 8.0, isn: 84.6, epaSatisfaccion: 86.8, epaResolucion: 81.7, epaTrato: 89.3, visitasTecnicas: 23.9, fcr: 74.5 },
      { id: 'AG006', nombre: 'Laura Sánchez', tmo: 330, transComercial: 12.8, transRetencion: 8.7, isn: 90.1, epaSatisfaccion: 89.9, epaResolucion: 85.6, epaTrato: 92.7, visitasTecnicas: 22.5, fcr: 79.1 },
      { id: 'AG007', nombre: 'Diego López', tmo: 350, transComercial: 13.5, transRetencion: 9.3, isn: 86.4, epaSatisfaccion: 87.2, epaResolucion: 82.8, epaTrato: 90.1, visitasTecnicas: 24.6, fcr: 72.4 },
      { id: 'AG008', nombre: 'Sofía Torres', tmo: 305, transComercial: 10.8, transRetencion: 7.5, isn: 92.3, epaSatisfaccion: 91.1, epaResolucion: 87.4, epaTrato: 94.2, visitasTecnicas: 20.8, fcr: 85.7 },
      { id: 'AG009', nombre: 'Martín Silva', tmo: 360, transComercial: 14.0, transRetencion: 9.5, isn: 83.8, epaSatisfaccion: 85.3, epaResolucion: 79.8, epaTrato: 88.5, visitasTecnicas: 26.2, fcr: 68.9 },
      { id: 'AG010', nombre: 'Valentina Ruiz', tmo: 325, transComercial: 11.2, transRetencion: 8.2, isn: 88.9, epaSatisfaccion: 88.7, epaResolucion: 84.1, epaTrato: 91.8, visitasTecnicas: 23.1, fcr: 77.3 }
    ]
  };

  const [metricas, setMetricas] = useState(null);
  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos desde LocalStorage
  useEffect(() => {
    const cargarDatos = () => {
      const datosGuardados = localStorage.getItem('telecentroMetricas');
      if (datosGuardados) {
        try {
          const datos = JSON.parse(datosGuardados);
          setMetricas(datos.metricas);
          setAgentes(datos.agentes);
        } catch (error) {
          console.error('Error al cargar datos:', error);
          setMetricas(valoresDefecto.metricas);
          setAgentes(valoresDefecto.agentes);
        }
      } else {
        setMetricas(valoresDefecto.metricas);
        setAgentes(valoresDefecto.agentes);
      }
      setLoading(false);
    };
    cargarDatos();
  }, []);

  // Guardar en LocalStorage cada vez que cambien los datos
  useEffect(() => {
    if (metricas && agentes.length > 0) {
      const datos = { metricas, agentes };
      localStorage.setItem('telecentroMetricas', JSON.stringify(datos));
    }
  }, [metricas, agentes]);

  // Función para actualizar métricas
  const actualizarMetrica = (campo, valor) => {
    setMetricas({
      ...metricas,
      [campo]: valor
    });
  };

  // Función para actualizar agente
  const actualizarAgente = (id, campo, valor) => {
    const nuevosAgentes = agentes.map(agente => 
      agente.id === id ? { ...agente, [campo]: valor } : agente
    );
    setAgentes(nuevosAgentes);
  };

  // Función para importar desde Excel/CSV
  const importarDesdeExcel = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Leer primera hoja
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          
          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            alert('El archivo está vacío o no tiene suficientes datos');
            return;
          }
          
          // La primera fila es el encabezado
          const headers = jsonData[0].map(h => h ? h.toString().trim().toLowerCase() : '');
          
          // Buscar índices de las columnas
          const idxId = headers.findIndex(h => h.includes('id') || h.includes('codigo'));
          const idxNombre = headers.findIndex(h => h.includes('nombre') || h.includes('asesor') || h.includes('agente'));
          const idxTmo = headers.findIndex(h => h.includes('tmo'));
          const idxTransCom = headers.findIndex(h => h.includes('comercial') || h.includes('trans'));
          const idxTransRet = headers.findIndex(h => h.includes('retencion') || h.includes('ret'));
          const idxIsn = headers.findIndex(h => h.includes('isn'));
          const idxEpaSat = headers.findIndex(h => h.includes('satisfaccion') || h.includes('epa s'));
          const idxEpaRes = headers.findIndex(h => h.includes('resolucion') || h.includes('epa r'));
          const idxEpaTra = headers.findIndex(h => h.includes('trato') || h.includes('epa t'));
          const idxVisitas = headers.findIndex(h => h.includes('visita'));
          const idxFcr = headers.findIndex(h => h.includes('fcr') || h.includes('first'));
          
          // Parsear los datos de agentes
          const nuevosAgentes = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;
            
            const agente = {
              id: idxId >= 0 && row[idxId] ? `AG${String(row[idxId]).padStart(3, '0')}` : `AG${String(nuevosAgentes.length + 1).padStart(3, '0')}`,
              nombre: idxNombre >= 0 && row[idxNombre] ? row[idxNombre].toString() : `Asesor ${nuevosAgentes.length + 1}`,
              tmo: idxTmo >= 0 && row[idxTmo] ? parseFloat(row[idxTmo]) || 0 : 0,
              transComercial: idxTransCom >= 0 && row[idxTransCom] ? parseFloat(row[idxTransCom]) || 0 : 0,
              transRetencion: idxTransRet >= 0 && row[idxTransRet] ? parseFloat(row[idxTransRet]) || 0 : 0,
              isn: idxIsn >= 0 && row[idxIsn] ? parseFloat(row[idxIsn]) || 0 : 0,
              epaSatisfaccion: idxEpaSat >= 0 && row[idxEpaSat] ? parseFloat(row[idxEpaSat]) || 0 : 0,
              epaResolucion: idxEpaRes >= 0 && row[idxEpaRes] ? parseFloat(row[idxEpaRes]) || 0 : 0,
              epaTrato: idxEpaTra >= 0 && row[idxEpaTra] ? parseFloat(row[idxEpaTra]) || 0 : 0,
              visitasTecnicas: idxVisitas >= 0 && row[idxVisitas] ? parseFloat(row[idxVisitas]) || 0 : 0,
              fcr: idxFcr >= 0 && row[idxFcr] ? parseFloat(row[idxFcr]) || 0 : 0
            };
            nuevosAgentes.push(agente);
          }
          
          if (nuevosAgentes.length > 0) {
            setAgentes(nuevosAgentes);
            
            // Calcular métricas globales (promedios)
            const tmoProm = nuevosAgentes.reduce((sum, a) => sum + a.tmo, 0) / nuevosAgentes.length;
            const transComProm = nuevosAgentes.reduce((sum, a) => sum + a.transComercial, 0) / nuevosAgentes.length;
            const transRetProm = nuevosAgentes.reduce((sum, a) => sum + a.transRetencion, 0) / nuevosAgentes.length;
            const isnProm = nuevosAgentes.reduce((sum, a) => sum + a.isn, 0) / nuevosAgentes.length;
            const epaSatProm = nuevosAgentes.reduce((sum, a) => sum + a.epaSatisfaccion, 0) / nuevosAgentes.length;
            const epaResProm = nuevosAgentes.reduce((sum, a) => sum + a.epaResolucion, 0) / nuevosAgentes.length;
            const epaTraProm = nuevosAgentes.reduce((sum, a) => sum + a.epaTrato, 0) / nuevosAgentes.length;
            const visitasProm = nuevosAgentes.reduce((sum, a) => sum + a.visitasTecnicas, 0) / nuevosAgentes.length;
            const fcrProm = nuevosAgentes.reduce((sum, a) => sum + (a.fcr || 0), 0) / nuevosAgentes.length;
            
            setMetricas({
              tmo: Math.round(tmoProm),
              transferenciasComercial: Math.round(transComProm * 10) / 10,
              transferenciasRetencion: Math.round(transRetProm * 10) / 10,
              encuestaISN: Math.round(isnProm * 10) / 10,
              visitasTecnicas: Math.round(visitasProm * 10) / 10,
              epaSatisfaccion: Math.round(epaSatProm * 10) / 10,
              epaResolucion: Math.round(epaResProm * 10) / 10,
              epaTrato: Math.round(epaTraProm * 10) / 10,
              fcr: Math.round(fcrProm * 10) / 10
            });
            
            alert(`✅ Se importaron ${nuevosAgentes.length} asesores con sus métricas`);
          } else {
            alert('No se pudieron parsear los datos del archivo');
          }
          
        } catch (error) {
          alert('Error al leer el archivo: ' + error.message);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Función para exportar datos a JSON
  const exportarDatos = () => {
    const datos = { metricas, agentes };
    const dataStr = JSON.stringify(datos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `telecentro-metricas-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Función para importar datos desde JSON
  const importarDatos = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const datos = JSON.parse(e.target.result);
          if (datos.metricas && datos.agentes) {
            setMetricas(datos.metricas);
            setAgentes(datos.agentes);
            alert('Datos importados correctamente');
          } else {
            alert('Formato de archivo inválido');
          }
        } catch (error) {
          alert('Error al leer el archivo: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  // Función para resetear datos
  const resetearDatos = () => {
    if (confirm('¿Estás seguro de que quieres resetear todos los datos a los valores por defecto?')) {
      setMetricas(valoresDefecto.metricas);
      setAgentes(valoresDefecto.agentes);
      alert('Datos reseteados correctamente');
    }
  };

  if (loading) {
    return (
      <div className="dashboard" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Cargando datos...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Barra de herramientas */}
      <div className="toolbar">
        <button className="btn-toolbar" onClick={exportarDatos} title="Exportar datos a JSON">
          📥 Exportar Datos
        </button>
        
        {isSupervisor && (
          <>
            <label className="btn-toolbar" title="Importar datos desde JSON">
              📤 Importar JSON
              <input
                type="file"
                accept=".json"
                onChange={importarDatos}
                style={{ display: 'none' }}
              />
            </label>
            
            <label className="btn-toolbar btn-excel" title="Importar datos desde Excel">
              📊 Importar Excel
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={importarDesdeExcel}
                style={{ display: 'none' }}
              />
            </label>
            
            <button className="btn-toolbar btn-reset" onClick={resetearDatos} title="Resetear a valores por defecto">
              🔄 Resetear Datos
            </button>
          </>
        )}
      </div>

      {/* Métricas Globales del Equipo */}
      <MetricasGlobales 
        metricas={metricas}
        onUpdate={actualizarMetrica}
        puedeEditar={isSupervisor}
      />

      {/* Tabla de Agentes */}
      <TablaAgentes 
        agentes={agentes} 
        puedeEditar={isSupervisor}
        onUpdate={actualizarAgente}
      />
    </div>
  );
};

export default Dashboard;
