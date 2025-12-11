import React, { useState, useEffect } from 'react';
import { SimpleFooter } from './App';
import { db, auth } from './firebaseConfig';
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function UserDashboard({ user, goToHome, onLogout, onCreditCardReject }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        if(user) getDoc(doc(db, "users", user.uid)).then(s => setData(s.data()));
    }, [user]);

    const applyCC = async () => {
        sessionStorage.removeItem('andes_session_active');
        await signOut(auth);
        onCreditCardReject();
    };

    if(!data) return <div className="loading">Cargando...</div>;

    return (
        <>
            <header className="simple-header">
                <div className="container header-container">
                    <div className="logo" onClick={goToHome}><i className="fas fa-mountain"></i> <h1>Andes Prime Bank</h1></div>
                    <button onClick={onLogout} className="btn-login-nav">Salir</button>
                </div>
            </header>
            <main className="container dashboard-grid">
                <aside className="sidebar">
                    <div className="card">
                        <h3>Hola, {data.name.split(' ')[0]}</h3>
                        <p>Cuenta: **{data.accountNumber.slice(-4)}</p>
                        <p>IFSC: <strong>ANDP0001042</strong></p>
                    </div>
                    <div className="card menu">
                        <div onClick={applyCC} className="menu-item"><i className="fas fa-credit-card"></i> Solicitar Tarjeta Crédito</div>
                        <div className="menu-item"><i className="fas fa-exchange-alt"></i> Transferencias</div>
                    </div>
                </aside>
                <section className="content">
                    <div className="balance-box">
                        <h3>Saldo Disponible</h3>
                        <h1>S/ {data.bankBalance.toFixed(2)}</h1>
                    </div>
                    <h3>Historial</h3>
                    <div className="transactions">
                        {data.transactionHistory?.map((t,i) => (
                            <div key={i} className="tx-row">
                                <span>{t.date}</span>
                                <span>{t.description}</span>
                                <span className={t.amount<0?'red':'green'}>S/ {t.amount}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <SimpleFooter />
        </>
    );
}