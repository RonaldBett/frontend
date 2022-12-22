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
    dataEquipos: [], //Almacena los equipos de la db
    dataDeportes: [], //Almacena los deportes de la db
    filtros:{         //Para guardar el nombre del equipo o deporte que se quiera filtrar
      filtrar_equipo:'',
      filtrar_deporte:''
    }
  }

  peticionGet = () => {
    axios.get(url).then(response => {
      //console.log(response.data);

      // Si el usuario es admin entonces se muestran los marcadores de todos los usuarios
      // si no es admin solo se muestran sus marcadores
      if (cookies.get('usu_nombres') == 'admin') {
        this.setState({ data: response.data })
      } else {
        const usuId = cookies.get('usu_id')
        const marcadoresById = response.data.filter(marcador => marcador.usu_id == usuId)
        // console.log(usuId)
        // console.log(marcadoresById)
        this.setState({ data: marcadoresById })
      }

    }).catch(error => {
      console.log(error.message);
    })
  }

  // Peticion para traer los equipos disponibles en la db
  peticionGetEquipos = () => {
    axios.get(urlEquipos).then(response => {
      //console.log(this.state.form);
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
    var datosEnviar = Object.assign({}, this.state.form);
    //Si no estan completos los datos no los envia a la db
    if (!this.formCompleto(datosEnviar)) {
      window.alert('Debe ingresar todos los campos')
      return
    }
    //Si el equipo no existe no envia los datos a la db
    if (!this.getEquiIdByName(datosEnviar.equi_id1.trim())) {
      window.alert('El equipo Local no existe')
      return
    }

    if (!this.getEquiIdByName(datosEnviar.equi_id2.trim())) {
      window.alert('El equipo Visitante no existe')
      return
    }
    //Reemplaza el nombre del equipo por su id correspondiente
    datosEnviar.equi_id1 = this.getEquiIdByName(datosEnviar.equi_id1.trim())
    datosEnviar.equi_id2 = this.getEquiIdByName(datosEnviar.equi_id2.trim())

    delete datosEnviar.mar_id //esto borra el campo usu_id
    await axios.post(url, datosEnviar).then(response => {
      this.modalInsertar()
      this.peticionGet()
    }).catch(error => {
      console.log(error.message);
    })
  }

  peticionPut = () => {
    var datosEnviar = Object.assign({}, this.state.form);
    if (!this.formCompleto(datosEnviar)) {
      return
    }

    if (!this.getEquiIdByName(datosEnviar.equi_id1.trim())) {
      window.alert('El equipo Local no existe')
      return
    }

    if (!this.getEquiIdByName(datosEnviar.equi_id2.trim())) {
      window.alert('El equipo Visitante no existe')
      return
    }

    datosEnviar.equi_id1 = this.getEquiIdByName(datosEnviar.equi_id1.trim())
    datosEnviar.equi_id2 = this.getEquiIdByName(datosEnviar.equi_id2.trim())

    axios.put(url + field_id + datosEnviar.mar_id, datosEnviar).then(response => {
      //console.log(response)
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
        mar_fechaevento: marcador.mar_fechaevento.slice(0, 10),
        mar_horaevento: marcador.mar_horaevento,
        mar_fecharegistro: marcador.mar_fecharegistro.slice(0, 10),
        mar_horaregistro: marcador.mar_horaregistro,
        equi_id1: marcador.equi_id1.equi_nombre,
        equi_id2: marcador.equi_id2.equi_nombre,
        mar_marcadorequi1: marcador.mar_marcadorequi1,
        mar_marcadorequi2: marcador.mar_marcadorequi2,
        dep_id: marcador.dep_id.dep_id,
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
    this.peticionGet();
    this.peticionGetDeportes();
    this.peticionGetEquipos();
  }

  //para obtener la hora y fecha del momento 
  obtenerFechaHoraActual = () => {
    const date = new Date();
    const year = date.getFullYear();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const time = date.toLocaleTimeString('it-IT');
    const fecha = `${year}-${month}-${day}`
    // console.log(fecha)
    // console.log(time)
    return { fecha: fecha, hora: time }
  }

  // valida que todos los campos del form esten completos antes de hacer peticiones post,put
  formCompleto = (form) => {
    if (form.mar_fechaevento && form.mar_horaevento &&
      form.mar_fecharegistro && form.mar_horaregistro && form.equi_id1 &&
      form.equi_id2 && form.mar_marcadorequi1 && form.mar_marcadorequi2 &&
      form.dep_id && form.usu_id) {
      return true
    }
    return false
  }
  //Retorna el id de un equipo segun su nombre
  getEquiIdByName = (name) => {
    let equipo = this.state.dataEquipos.filter(equipo => equipo.equi_nombre.toUpperCase() == name.toUpperCase())[0]

    if (equipo) {
      return equipo.equi_id
    }

    return false
  }

  //Filtra los datos renderizados segun el nombre del deporte
  filtrarPorDeporte = (deporteNombre) => {
    let eventos = this.state.data.filter(evento => evento.dep_id.dep_nombre == deporteNombre)
    this.setState({ data: eventos })
  }

  //Filtra los datos renderizados segun el nombre del equipo
  filtrarPorEquipo = (equipoNombre) => {
    if (!equipoNombre || !equipoNombre.trim()) {return}
    equipoNombre= equipoNombre.trim().toUpperCase()
    let eventos = this.state.data.filter(evento => evento.equi_id1.equi_nombre.toUpperCase() == equipoNombre || evento.equi_id2.equi_nombre.toUpperCase() == equipoNombre)
    if (!eventos.length > 0) {window.alert('Sin resultados'); return}
    
    this.setState({ data: eventos })
  }

  //Manej el onChange() de el input de filtrado
  handleChangeOnFilter = async e => {  /// función para capturar los datos del usuario. Es en 2do plano debe ser asincrona
    e.persist();           /// y por eso debemos especificar persistencia
    await this.setState({   /// await regresa la ejecución de la función asincrona despues de terminar
      filtros: {
        ...this.state.filtros, /// esta linea sirve para conservar los datos que ya tenia el arreglo
        [e.target.name]: e.target.value  /// los nombres de los imputs deben ser iguales a los del arreglo
      }
    });
    console.log(this.state.filtros);  /// probar por consola lo que se guarda
  }

  render() {

    const form = this.state.form

    return (
      <div className="App">
        <h1> TABLA MARCADORES</h1>
        <br /><br /><br />

        {/* Input para ingreso de filtros */}
        <input
          className="form"
          name="filtrar_equipo"
          list="datalist_equipos"
          onChange={this.handleChangeOnFilter}>
        </input>
        <button onClick={() => this.filtrarPorEquipo(this.state.filtros.filtrar_equipo)}>filtrar</button>
        <button onClick={() => this.peticionGet()}>limpiar filtros</button>
        <br />
        <br />

        <button
          className="btn btn-success"
          onClick={() => {
            this.modalInsertar();
            this.setState({ tipoModal: 'insertar' });
            // Si usuario == admin entonces el comportamiento es igual al se antes
            // se deja la variable form vacia, excepto for fecha y hora registro
            // Si usuario es diferente de admin entonces se vacia el form pero se conserva el usu_id, hora y fecha registro
            cookies.get('usu_nombres') == 'admin' ?
              this.setState({
                form: {
                  'mar_fecharegistro': this.obtenerFechaHoraActual().fecha,
                  'mar_horaregistro': this.obtenerFechaHoraActual().hora
                }
              })
              :
              this.setState({
                form: {
                  'usu_id': cookies.get('usu_id'),
                  'mar_fecharegistro': this.obtenerFechaHoraActual().fecha,
                  'mar_horaregistro': this.obtenerFechaHoraActual().hora
                }
              })

          }}
        >
          Agregar Marcador
        </button>
        <br /><br />
        <table className="table ">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha/Hora Evento</th>
              <th>Fecha/Hora Registro</th>
              <th>Local</th>
              <th>Marcadores</th>
              <th>Visitante</th>
              <th>Deporte</th>
              <th hidden={cookies.get('usu_nombres') != 'admin'}>ID Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {this.state.data.map(marcador => {
              return (
                <tr>
                  <td>{marcador.mar_id}</td>
                  <td>{marcador.mar_fechaevento.slice(0, 10) + '/' + marcador.mar_horaevento}</td>
                  <td>{marcador.mar_fecharegistro.slice(0, 10) + '/' + marcador.mar_horaregistro}</td>
                  <td>{marcador.equi_id1.equi_nombre}</td>
                  <td>{marcador.mar_marcadorequi1 + ':' + marcador.mar_marcadorequi2}</td>
                  <td>{marcador.equi_id2.equi_nombre}</td>
                  <td>{marcador.dep_id.dep_nombre}</td>
                  <td hidden={cookies.get('usu_nombres') != 'admin'}>{marcador.usu_id}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => { this.seleccionarDeporte(marcador); this.modalInsertar() }}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>{" "}
                    <button
                      className="btn btn-danger"
                      onClick={() => { this.seleccionarDeporte(marcador); this.modalEliminar() }}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
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

              {/* El hidden es para mostrar este input solo en la ventana modal ingresar */}
              <label hidden={!form.mar_id} htmlFor="mar_id">ID</label>
              <input
                hidden={!form.mar_id}
                className="form-control"
                type="number"
                name="mar_id"
                id="mar_id"
                readOnly
                onChange={this.handleChange}
                value={form ? form.mar_id : this.state.data.length + 1}>
              </input>
              <br hidden={!form.mar_id} />

              <label htmlFor="mar_fechaevento">Fecha Evento</label>
              <input
                className="form-control"
                type="date"
                name="mar_fechaevento"
                id="mar_fechaevento"
                onChange={this.handleChange}
                value={form ? form.mar_fechaevento ? form.mar_fechaevento.slice(0, 10) : '' : ''}
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

              <label hidden={!form.mar_id} htmlFor="mar_fecharegistro">Fecha Registro</label>
              <input
                hidden={!form.mar_id}
                className="form-control"
                type="date"
                name="mar_fecharegistro"
                id="mar_fecharegistro"
                onChange={this.handleChange}
                value={form ? form.mar_fecharegistro ? form.mar_fecharegistro.slice(0, 10) : '' : ''}>
              </input>
              <br hidden={!form.mar_id} />

              <label hidden={!form.mar_id} htmlFor="mar_horaregistro">Hora Registro</label>
              <input
                hidden={!form.mar_id}
                className="form-control"
                type="time"
                name="mar_horaregistro"
                id="mar_horaregistro"
                onChange={this.handleChange}
                value={form ? form.mar_horaregistro : ''}>
              </input>
              <br hidden={!form.mar_id} />


              {/* Input con autocompletar */}
              <label htmlFor="equi_id1">Equipo Local</label>
              <input
                className="form-control"
                name="equi_id1"
                list="datalist_equipos"
                onChange={this.handleChange}
                defaultValue={form ? form.equi_id1 : ''}>
              </input>

              <br />
              {/* Input con autocompletar */}
              <label htmlFor="equi_id2">Equipo Visitante</label>
              <input
                className="form-control"
                name="equi_id2"
                list="datalist_equipos"
                onChange={this.handleChange}
                defaultValue={form ? form.equi_id2 : ''}>
              </input>

              <br />

              {/* datos para el autocompletar */}
              <datalist
                name="equi_id2"
                id="datalist_equipos"
              >
                {
                  //Crea una lista de los equipos que servira como buscador en el input
                  this.state.dataEquipos.map(equipo => {
                    return (
                      <option>{equipo.equi_nombre}</option>
                    )

                  })
                }
              </datalist>

              <label htmlFor="mar_marcadorequi1">Marcador Local</label>
              <input
                className="form-control"
                type="number"
                name="mar_marcadorequi1"
                id="mar_marcadorequi1"
                onChange={this.handleChange}
                value={form ? form.mar_marcadorequi1 : ''}>
              </input>
              <br />

              <label htmlFor="mar_marcadorequi2">Marcador Visitante</label>
              <input
                className="form-control"
                type="number"
                name="mar_marcadorequi2"
                id="mar_marcadorequi2"
                onChange={this.handleChange}
                value={form ? form.mar_marcadorequi2 : ''}>
              </input>
              <br />

                {/* Input select/option de deportes */}
              <label htmlFor="dep_id">Deporte</label>
              <select
                className="form-control"
                type="select"
                name="dep_id"
                id="dep_id"
                onChange={this.handleChange}
                defaultValue={form ? form.dep_id : 'default'}
              >
                <option value="default" disabled selected >Seleccionar Deporte</option>
                {
                  //Crea un menu desplegable con los deportes disponibles en la db
                  this.state.dataDeportes.map(deporte => {
                    return (
                      <option value={deporte.dep_id}>{deporte.dep_nombre}</option>
                    )

                  })
                }
              </select>
              <br />

              {/* El hidden es para mostrar este input solo al admin */}
              <label htmlFor="usu_id" hidden={cookies.get('usu_nombres') != 'admin'}>ID Usuario</label>
              <input
                hidden={cookies.get('usu_nombres') != 'admin'}
                className="form-control"
                type="number"
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