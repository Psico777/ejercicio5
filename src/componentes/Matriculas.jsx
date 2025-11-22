import React, { useState, useEffect } from 'react';
import { createAlova } from 'alova';
import fetchAdapter from 'alova/fetch';
import reactHook from 'alova/react';

const alovaInstance = createAlova({
  baseURL: 'http://localhost:3001',
  statesHook: reactHook,
  requestAdapter: fetchAdapter(),
  responded: response => response.json()
});

const Matriculas = () => {
  const [matriculas, setMatriculas] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [alumnoId, setAlumnoId] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [matData, alumData, curData] = await Promise.all([
      alovaInstance.Get('/matriculas'),
      alovaInstance.Get('/alumnos'),
      alovaInstance.Get('/cursos')
    ]);
    setMatriculas(matData);
    setAlumnos(alumData);
    setCursos(curData);
  };

  const registrarMatricula = async (e) => {
    e.preventDefault();
    const alumno = alumnos.find(a => a.id === parseInt(alumnoId));
    const curso = cursos.find(c => c.id === parseInt(cursoId));
    
    const nuevaMatricula = {
      alumnoId: parseInt(alumnoId),
      cursoId: parseInt(cursoId),
      alumnoNombre: alumno.nombre,
      cursoNombre: curso.nombre,
      fecha: new Date().toISOString().split('T')[0]
    };

    if (editandoId) {
      await alovaInstance.Put(`/matriculas/${editandoId}`, nuevaMatricula);
      setEditandoId(null);
    } else {
      await alovaInstance.Post('/matriculas', nuevaMatricula);
    }
    
    setAlumnoId('');
    setCursoId('');
    cargarDatos();
  };

  const editarMatricula = (matricula) => {
    setAlumnoId(matricula.alumnoId);
    setCursoId(matricula.cursoId);
    setEditandoId(matricula.id);
  };

  const eliminarMatricula = async (id) => {
    await alovaInstance.Delete(`/matriculas/${id}`);
    cargarDatos();
  };

  return (
    <div className="container mt-4">
      <h2>Sistema de Matriculas</h2>
      
      <form onSubmit={registrarMatricula} className="mb-4">
        <div className="row g-2">
          <div className="col-md-4">
            <select 
              className="form-select" 
              value={alumnoId}
              onChange={(e) => setAlumnoId(e.target.value)}
              required
            >
              <option value="">Seleccionar Alumno</option>
              {alumnos.map(alumno => (
                <option key={alumno.id} value={alumno.id}>{alumno.nombre}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <select 
              className="form-select" 
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
              required
            >
              <option value="">Seleccionar Curso</option>
              {cursos.map(curso => (
                <option key={curso.id} value={curso.id}>{curso.nombre}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <button type="submit" className="btn btn-primary w-100">
              {editandoId ? 'Actualizar' : 'Matricular'}
            </button>
          </div>
        </div>
      </form>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Alumno</th>
            <th>Curso</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {matriculas.map(matricula => (
            <tr key={matricula.id}>
              <td>{matricula.id}</td>
              <td>{matricula.alumnoNombre}</td>
              <td>{matricula.cursoNombre}</td>
              <td>{matricula.fecha}</td>
              <td>
                <button 
                  className="btn btn-sm btn-warning me-2" 
                  onClick={() => editarMatricula(matricula)}
                >
                  Editar
                </button>
                <button 
                  className="btn btn-sm btn-danger" 
                  onClick={() => eliminarMatricula(matricula.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Matriculas;
