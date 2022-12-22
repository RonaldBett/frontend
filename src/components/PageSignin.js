import React, { Component } from 'react'
import '../css/Login.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import axios from 'axios'

import Cookies from 'universal-cookie'

const urlUsuarios = "http://129.146.172.44:9000/api/usuarios"


const cookies = new Cookies();


class PageLogin extends Component {
  state = {
    form: {
      usu_nombres: '',
      usu_apellidos: '',
      usu_email: '',
      usu_clave: '',
      reClave: ''
    }

  }

  handleChange = async e => {
    await this.setState({
      form: {
        ...this.state.form,
        [e.target.name]: e.target.value
      }
    })
    console.log(this.state.form)
  }

  registrarUsuario = async () => {
    let usu_email = this.state.form.usu_email
    let pwd = this.state.form.usu_clave
    let repwd = this.state.form.reClave
    let name = this.state.form.usu_nombres
    let lastname = this.state.form.usu_apellidos
    if (name.length <= 0 || pwd.length <= 0 || usu_email.length <= 0 || lastname.length <= 0) {
      alert('Se requieren todos los datos')
      return "Datos Vacios"
    }

    if (pwd != repwd) {
      alert('Las contraseñas no coinciden')
      return "Contraseñas no coinciden"
    }

    axios.get(urlUsuarios + "/" + usu_email + "/" + pwd).then(response => {
      if (response.data.length > 0) {
        alert('El usuario ya existe')
        return "El usuario ya existe"
      }

      delete this.state.form.reClave
      alert('Gracias por registrarse')
      this.peticionPost();
    }).catch(error => {
      console.log(error)
    })

  }

  peticionPost = () => {
    axios.post(urlUsuarios, this.state.form).then(response => {
      //console.log(response.data)
      this.iniciarSesion()
    }).catch(error => {
      console.log(error)
    })
    this.iniciarSesion()
  }

  iniciarSesion = () => {
    axios.get(urlUsuarios + "/" + this.state.form.usu_email + "/" + this.state.form.usu_clave).then(response => {
      cookies.set("usu_id", response.data.usu_id, { path: "/" })
      cookies.set("usu_email", response.data.usu_email, { path: "/" })
      cookies.set("usu_nombres", response.data.usu_nombres, { path: "/" })
      cookies.set("usu_apellidos", response.data.usu_apellidos, { path: "/" })
      window.location.href = './'
    }).catch(error => {
      console.log(error)
    })
  }

  render() {
    return (
      <div className="container-signin-login">
        <div className="containerPrincipal">
          <div className="containerSecundario">
            <div className="form-group">

              <label>Nombre: </label>
              <br />
              <input
                type="text"
                className="form-control"
                name="usu_nombres"
                onChange={this.handleChange}
              />
              <br />

              <label>Apellido: </label>
              <br />
              <input
                type="text"
                className="form-control"
                name="usu_apellidos"
                onChange={this.handleChange}
              />
              <br />

              <label>Usuario: </label>
              <br />
              <input
                type="text"
                className="form-control"
                name="usu_email"
                onChange={this.handleChange}
              />
              <br />

              <label>Contraseña: </label>
              <br />
              <input
                type="password"
                className="form-control"
                name="usu_clave"
                onChange={this.handleChange}
              />
              <br />

              <label>Repetir Contraseña: </label>
              <br />
              <input
                type="password"
                className="form-control"
                name="reClave"
                onChange={this.handleChange}
              />
              <br />

              <button className="btn btn-success" onClick={() => this.registrarUsuario()}>Registrarse</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default PageLogin