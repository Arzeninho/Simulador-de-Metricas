function InputTarea({tarea, setTarea, agregarTarea}) {
    return (
        <div>
            <input
                type="text"
                placeholder='Escribi una tarea'
                value={tarea}
                onChange={(e) => setTarea(e.target.value)}

            />
            <button onClick={agregarTarea}>Agregar</button>
        </div>
    )
}



export default InputTarea