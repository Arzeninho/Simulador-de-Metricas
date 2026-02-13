function ListaTareas({ tareas, toggleTarea, eliminarTarea }) {
  return (
    <ul>
      {tareas.map((tarea, index) => (
        <li key={index} style={{ cursor: 'pointer' }}>
          <span
            onClick={() => toggleTarea(index)}
            style={{
              textDecoration: tarea.completada ? 'line-through' : 'none'
            }}
          >
            {tarea.texto}
          </span>

          <button onClick={() => eliminarTarea(index)}>❌</button>
        </li>
      ))}
    </ul>
  )
}

export default ListaTareas