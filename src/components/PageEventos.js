import React, { Component } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const url = 'http://129.146.172.44:9000/api/marcadores'
const urlEquipos = 'http://129.146.172.44:9000/api/equipos' /////////
const urlDeportes = 'http://129.146.172.44:9000/api/deportes' ////////
const field_id = '/mar_id/'

class PageEventos extends Component {

  state = {
    data: [],
    modalInsertar: false,
    modalEliminar: false,
    tipoModal: '',
    form: {
      mar_id: '',
      mar_fechaevento: '',
      mar_horaevento: '',
      mar_fecharegistro: '',
      mar_horaregistro: '',
      equi_id1: '',
      equi_id2: '',
      mar_marcadorequi1: '',
      mar_marcadorequi2: '',
      dep_id: '',
      usu_id: ''
    },
    dataEquipos: [],
    dataDeportes: []
  }

  peticionGet = () => {
    axios.get(url).then(response => {
      //console.log(response.data);

      // Si el usuario es admin entonces se muestran los marcadores de todos los usuarios
      // si no es admin solo se muestran sus marcadores
      if (cookies.get('usu_nombres')=='admin') {
        this.setState({ data: response.data })
      }else{
        const usuId = cookies.get('usu_id')
        const marcadoresById = response.data.filter(marcador => marcador.usu_id == usuId)
        console.log(usuId)
        console.log(marcadoresById)
        this.setState({ data: marcadoresById })
      }

    }).catch(error => {
      console.log(error.message);
    })
  }

// Peticion para traer los equipos disponibles en la db
  peticionGetEquipos = () => {
    axios.get(urlEquipos).then(response => {
      console.log(this.state.form);
      this.setState({ dataEquipos: response.data })
    }).catch(error => {
      console.log(error.message);
    })
  }

  // Peticion para traer los deportes disponibles en la db
  peticionGetDeportes = () => {
    axios.get(urlDeportes).then(response => {
      //console.log(response.data);
      this.setState({ dataDeportes: response.data })
    }).catch(error => {
      console.log(error.message);
    })
  }

  peticionPost = async () => {
    delete this.state.form.mar_id //esto borra el campo usu_id
    await axios.post(url, this.state.form).then(response => {
      this.modalInsertar()
      this.peticionGet()
    }).catch(error => {
      console.log(error.message);
    })
  }

  peticionPut = () => {
    axios.put(url + field_id + this.state.form.mar_id, this.state.form).then(response => {
      this.modalInsertar()
      this.peticionGet()
    }).catch(error => {
      console.log(error.message);
    })
  }

  peticionDelete = () => {
    axios.delete(url + field_id + this.state.form.mar_id).then(response => {
      this.modalEliminar()
      this.peticionGet()
    }).catch(error => {
      console.log(error.message);
    })
  }


  seleccionarDeporte = (marcador) => {
    this.setState({
      tipoModal: 'actualizar',
      form: {
        mar_id: marcador.mar_id,
        mar_fechaevento: marcador.mar_fechaevento,
        mar_horaevento: marcador.mar_horaevento,
        mar_fecharegistro: marcador.mar_fecharegistro,
        mar_horaregistro: marcador.mar_horaregistro,
        equi_id1: marcador.equi_id1,
        equi_id2: marcador.equi_id2,
        mar_marcadorequi1: marcador.mar_marcadorequi1,
        mar_marcadorequi2: marcador.mar_marcadorequi2,
        dep_id: marcador.dep_id,
        usu_id: marcador.usu_id
      }
    })
  }

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar })
  }

  modalEliminar = () => {
    this.setState({ modalEliminar: !this.state.modalEliminar })
  }

  handleChange = async e => {  /// función para capturar los datos del usuario. Es en 2do plano debe ser asincrona
    e.persist();           /// y por eso debemos especificar persistencia
    await this.setState({   /// await regresa la ejecución de la función asincrona despues de terminar
      form: {
        ...this.state.form, /// esta linea sirve para conservar los datos que ya tenia el arreglo
        [e.target.name]: e.target.value  /// los nombres de los imputs deben ser iguales a los del arreglo
      }
    });
    console.log(this.state.form);  /// probar por consola lo que se guarda
  }

  //se ejecuta cuando lo realiza
  componentDidMount() {
    //Guarda el id del usuario logeado en la variable de estado form (a menos que el usuario sea admin)
    if(cookies.get('usu_nombres') !='admin'){
      this.setState({ form: {
        ...this.state.form,
        ['usu_id']: cookies.get('usu_id')
      }} );
    } 
    this.peticionGet();
    this.peticionGetDeportes();
    this.peticionGetEquipos();
    this.obtenerFechaHoraActual()
  }

  //para obtener la hora y fecha del momento 
  obtenerFechaHoraActual = () => {
    const date = new Date();
    const year = date.getFullYear();
    const day = date.getDate();
    const month = date.getMonth() + 1; 
    const time = date.toLocaleTimeString('it-IT');
    console.log(`${year}-${month}-${day}`)
    console.log(time)
  }

  render() {

    const form = this.state.form

    return (
      <div className="App">
        <h1> TABLA MARCADORES</h1>
        <br /><br /><br />
        <button 
          className="btn btn-success" 
          onClick={() => {
            this.modalInsertar();
            this.setState({tipoModal: 'insertar'});  
            // Si usuario == admin entonces el comportamiento es igual al se antes
            // se deja la variable form vacia
            // Si usuario es diferente de admin entonces se vacia el form pero se conserva el usu_id
            cookies.get('usu_nombres')=='admin'?
              this.setState({form: null})
            :
              this.setState({form: {'usu_id': cookies.get('usu_id')}})
              
          }} 
        >
          Agregar Marcador
        </button>
        <br /><br />
        <table className="table ">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha Evento</th>
              <th>Hora Evento</th>
              <th>Fecha Registro</th>
              <th>Hora de registro</th>
              <th>ID Equipo 1</th>
              <th>ID Equipo 2</th>
              <th>Mar Equipo 1</th>
              <th>Mar Equipo 2</th>
              <th>ID Deporte</th>
              <th>ID Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {this.state.data.map(marcador => {
              return (
                <tr>
                  <td>{marcador.mar_id}</td>
                  <td>{marcador.mar_fechaevento.slice(0,10)}</td>
                  <td>{marcador.mar_horaevento}</td>
                  <td>{marcador.mar_fecharegistro.slice(0,10)}</td>
                  <td>{marcador.mar_horaregistro}</td>
                  <td>{marcador.equi_id1}</td>
                  <td>{marcador.equi_id2}</td>
                  <td>{marcador.mar_marcadorequi1}</td>
                  <td>{marcador.mar_marcadorequi2}</td>
                  <td>{marcador.dep_id}</td>
                  <td>{marcador.usu_id}</td>
                  <td><button className="btn btn-primary"><FontAwesomeIcon icon={faEdit} onClick={() => { this.seleccionarDeporte(marcador); this.modalInsertar() }} /></button>
                    {" "}
                    <button className="btn btn-danger"><FontAwesomeIcon icon={faTrashAlt} onClick={() => { this.seleccionarDeporte(marcador); this.modalEliminar() }} /></button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <Modal isOpen={this.state.modalInsertar}>
          <ModalHeader style={{ display: 'block' }}>
          </ModalHeader>
          <ModalBody>
            <div>
              <label htmlFor="mar_id">ID</label>
              <input 
                className="form-control" 
                type="text" 
                name="mar_id" 
                id="mar_id" 
                readOnly 
                onChange={this.handleChange} 
                value={form ? form.mar_id : this.state.data.length + 1}>  
              </input>
              <br />

              <label htmlFor="mar_fechaevento">Fecha Evento</label>
              <input 
                className="form-control" 
                type="date" 
                name="mar_fechaevento" 
                id="mar_fechaevento" 
                onChange={this.handleChange} 
                value={form? form.mar_fechaevento? form.mar_fechaevento.slice(0, 10) : '' : ''}
                >                
              </input>
              <br />

              <label htmlFor="mar_horaevento">Hora Evento</label>
              <input 
                className="form-control" 
                type="time" 
                name="mar_horaevento" 
                id="mar_horaevento" 
                onChange={this.handleChange} 
                value={form ? form.mar_horaevento : ''}>
              </input>
              <br />

              <label htmlFor="mar_fecharegistro">Fecha Registro</label>
              <input 
                className="form-control" 
                type="date" 
                name="mar_fecharegistro" 
                id="mar_fecharegistro" 
                onChange={this.handleChange} 
                value={form? form.mar_fecharegistro? form.mar_fecharegistro.slice(0, 10) : '' : ''}>
              </input>
              <br />

              <label htmlFor="mar_horaregistro">Hora Registro</label>
              <input 
                className="form-control" 
                type="time" 
                name="mar_horaregistro" 
                id="mar_horaregistro" 
                onChange={this.handleChange} 
                value={form ? form.mar_horaregistro : ''}>
              </input>
              <br />

              <label htmlFor="equi_id1">ID equipo 1</label>
              <select 
                className="form-control" 
                type="select" 
                name="equi_id1" 
                id="equi_id1" 
                onChange={this.handleChange}
                defaultValue={form? form.equi_id1:'default'} 
              >
                <option value="default" disabled selected >Seleccionar Equipo</option>
                {
                  //Crea un menu desplegable con los equipos disponibles en la db
                  this.state.dataEquipos.map(equipo => {
                    return(
                      <option value={equipo.equi_id}>{equipo.equi_nombre}</option>
                    )
                    
                  })
                }
               
              
              </select>
              <br />

              <label htmlFor="equi_id2">ID equipo 2</label>
              <select 
                className="form-control" 
                type="select" 
                name="equi_id2" 
                id="equi_id2" 
                onChange={this.handleChange}
                defaultValue={form? form.equi_id2:'default'} 
              >
                <option value="default" disabled selected >Seleccionar Equipo</option>
                {
                  //Crea un menu desplegable con los equipos disponibles en la db
                  this.state.dataEquipos.map(equipo => {
                    return(
                      <option value={equipo.equi_id}>{equipo.equi_nombre}</option>
                    )
                    
                  })
                }            
              </select>
              <br />

              <label htmlFor="mar_marcadorequi1">Mar Equipo 1</label>
              <input 
                className="form-control" 
                type="text" 
                name="mar_marcadorequi1" 
                id="mar_marcadorequi1" 
                onChange={this.handleChange} 
                value={form ? form.mar_marcadorequi1 : ''}>
              </input>
              <br />

              <label htmlFor="mar_marcadorequi2">Mar Equipo 2</label>
              <input 
                className="form-control" 
                type="text" 
                name="mar_marcadorequi2" 
                id="mar_marcadorequi2" 
                onChange={this.handleChange} 
                value={form ? form.mar_marcadorequi2 : ''}>
               </input>
              <br />

              <label htmlFor="dep_id">ID Deporte</label>
              <select 
                className="form-control" 
                type="select" 
                name="dep_id" 
                id="dep_id" 
                onChange={this.handleChange}
                defaultValue={form? form.dep_id:'default'} 
              >
                <option value="default" disabled selected >Seleccionar Deporte</option>
                {
                  //Crea un menu desplegable con los deportes disponibles en la db
                  this.state.dataDeportes.map(deporte => {
                    return(
                      <option value={deporte.dep_id}>{deporte.dep_nombre}</option>
                    )
                    
                  })
                }
              </select>
              <br />

              {/* El hidden es para mostrar este input solo al admin */}
              <label htmlFor="usu_id" hidden={cookies.get('usu_nombres')!='admin'}>ID Usuario</label>
              <input 
                hidden={cookies.get('usu_nombres')!='admin'}
                className="form-control" 
                type="text" 
                name="usu_id" 
                id="usu_id" 
                onChange={this.handleChange} 
                value={form ? form.usu_id : ''}>
              </input>
              <br />

            </div>
          </ModalBody>
          <ModalFooter>
            {
              this.state.tipoModal === 'insertar' ?
                <button className="btn btn-success" onClick={() => this.peticionPost()}>Insertar</button>
                :
                <button className="btn btn-success" onClick={() => this.peticionPut()}>Modificar</button>
            }
            <button className="btn btn-danger" onClick={() => this.modalInsertar()} >Cancelar</button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={this.state.modalEliminar}>
          <ModalBody>
            ¿Estas seguro que deseas eliminar?
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-danger" onClick={() => this.peticionDelete()} >Si</button>
            <button className="btn btn-success" onClick={() => this.modalEliminar()} >No</button>
          </ModalFooter>
        </Modal>

      </div>
    )
  }
}

export default PageEventos;