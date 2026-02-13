function Tarea({ tarea, onToggle }) {
  return (
    <li
      onClick={onToggle}
      style={{
        cursor: 'pointer',
        textDecoration: tarea.completada ? 'line-through' : 'none'
      }}
    >
      {tarea.texto}
    </li>
  )
}

export default Tarea