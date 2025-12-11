import React from 'react';
import { SimpleHeader, SimpleFooter } from './App';

export default function CreditCardRejection({ goToHome }) {
    return (
        <>
            <SimpleHeader goToHome={goToHome} />
            <main className="container rejection-page">
                <i className="fas fa-exclamation-circle icon-red"></i>
                <h2>Solicitud No Aprobada</h2>
                <p>No podemos aprobar su solicitud debido a políticas de riesgo.</p>
                <button onClick={goToHome} className="btn-cta">Volver al Inicio</button>
            </main>
            <SimpleFooter />
        </>
    );
}