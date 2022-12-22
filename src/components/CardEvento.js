import React from 'react';
import '../css/CardEvento.css';

function CardEvento({id, deporte, eLocal, eVisitante, mLocal, mVisitante, FechaR, FechaE, btnEditar, btnEliminar, funcionEdi, funcionEli}) {
  return (
    <div id='card-m-2' className="tarjeta">
      <div id='div_card_body' className='card-body'>
        <h6 id='card_id' className="tarjeta-subtitle">{id}{FechaR}</h6>
        <h5 id='card_title' className="tarjeta-title">{deporte}</h5>
        <h6 id='card_subtitle' className="tarjeta-subtitle">{eLocal} {mLocal} : {mVisitante} {eVisitante}</h6>
        <h6 id='card_subtitle_2' className="tarjeta-subtitle">{FechaE}</h6>
        <div className='contenedor-botones-card'>
          <button 
            className='btn btn-' 
            onClick={funcionEdi}>
              {btnEditar}
          </button>
          <button 
            className='btn btn-' 
            onClick={funcionEli}>
              {btnEliminar}
          </button>
        </div>
      </div>
    </div>

  );
}

export default CardEvento;