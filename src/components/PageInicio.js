import React, { Component } from 'react'
import CardEvento from './CardEvento.js';
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";


const urlEventos = 'http://129.146.172.44:9000/api/marcadores/3'



class PageInicio extends Component {

  state = {
    data: []
  }


  peticionGet = () => {
    axios.get(urlEventos).then(response => {
      //console.log(response.data);
      this.setState({ data: response.data })
    }).catch(error => {
      console.log(error.message);
    })
  }

  componentDidMount() {
    this.peticionGet()
  }


  render() {
    return (

      <div>

        <br /><br /><br />

        <div id="div_items">
          <div className='container'>
            <div id='div_rows_items' className='row'>
              {this.state.data.map(marcador => {
                return (
                  <CardEvento
                    deporte={marcador.deportes}
                    eLocal={marcador.nombre1}
                    eVisitante={marcador.nombre2}
                    mLocal={marcador.marcador1}
                    mVisitante={marcador.marcador2}
                    FechaE={marcador.mar_fechaevento.slice(0, 10) + '/' + marcador.hora}
                  />
                )
              })}
            </div>
          </div>
        </div>

        
      </div>

    )
  }
}

export default PageInicio;