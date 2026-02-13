import { useState, useEffect } from 'react'
import InputTarea from './componentes/InputTarea.jsx'
import ListaTareas from './componentes/ListaTareas.jsx'
import './App.css'

function App() {
  const [tarea, setTarea] = useState('')
  const [tareas, setTareas] = useState(() => {
    const tareasGuardadas = localStorage.getItem('tareas')
    return tareasGuardadas ? JSON.parse(tareasGuardadas) : []
  })

  const [filtro, setFiltro] = useState('todas')

  useEffect(() => {
    localStorage.setItem('tareas', JSON.stringify(tareas))
  }, [tareas])

  const agregarTarea = () => {
    if (tarea.trim() === '') return

    setTareas([...tareas, { texto: tarea, completada: false }])
    setTarea('')
  }

  const eliminarTarea = (indexAEliminar) => {
    const nuevasTareas = tareas.filter((_, index) => index !== indexAEliminar)
    setTareas(nuevasTareas)
  }

  const toggleTarea = (indexATocar) => {
    const nuevasTareas = tareas.map((t, index) =>
      index === indexATocar
        ? { ...t, completada: !t.completada }
        : t
    )
    setTareas(nuevasTareas)
  }

  const tareasFiltradas = tareas.filter(t => {
    if (filtro === 'pendientes') return !t.completada
    if (filtro === 'completadas') return t.completada
    return true
  })

  const total = tareas.length
  const completadas = tareas.filter(t => t.completada).length

  return (
    <div>
      <h1>Lista de Tareas</h1>

      <p>
        Total: {total} | Completadas: {completadas}
      </p>

      <InputTarea
        tarea={tarea}
        setTarea={setTarea}
        agregarTarea={agregarTarea}
      />

      <div>
        <button onClick={() => setFiltro('todas')}>Todas</button>
        <button onClick={() => setFiltro('pendientes')}>Pendientes</button>
        <button onClick={() => setFiltro('completadas')}>Completadas</button>
      </div>

      <ListaTareas
        tareas={tareasFiltradas}
        toggleTarea={toggleTarea}
        eliminarTarea={eliminarTarea}
      />
    </div>
  )
}

export default App
