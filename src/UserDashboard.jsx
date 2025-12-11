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

    if(!data) return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando sus productos...</p>
        </div>
    );

    const firstName = data.name.split(' ')[0];

    return (
        <div className="dashboard-layout">
            {/* Dashboard Navigation */}
            <nav className="dash-sidebar">
                <div className="dash-logo" onClick={goToHome}>
                    <i className="fas fa-mountain fa-2x"></i>
                    <span>Andes Prime</span>
                </div>

                <div className="user-profile-snippet">
                    <div className="avatar-circle">{firstName[0]}</div>
                    <div className="user-info">
                        <strong>{firstName}</strong>
                        <span>Cliente Verificado</span>
                    </div>
                </div>

                <ul className="dash-menu">
                    <li className="active"><i className="fas fa-th-large"></i> Resumen</li>
                    <li><i className="fas fa-wallet"></i> Mis Cuentas</li>
                    <li onClick={applyCC}><i className="fas fa-credit-card"></i> Tarjetas</li>
                    <li><i className="fas fa-exchange-alt"></i> Transferencias</li>
                    <li><i className="fas fa-file-invoice-dollar"></i> Pagos de Servicios</li>
                    <li><i className="fas fa-user-cog"></i> Configuración</li>
                </ul>

                <button onClick={onLogout} className="btn-logout">
                    <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                </button>
            </nav>

            {/* Main Content Area */}
            <main className="dash-content">
                <header className="dash-header">
                    <h2>Resumen de Productos</h2>
                    <div className="date-badge">
                        <i className="far fa-calendar-alt"></i> {new Date().toLocaleDateString()}
                    </div>
                </header>

                {/* Account Cards Section */}
                <div className="account-cards-grid">
                    {/* Primary Savings Account */}
                    <div className="bank-card gold-card">
                        <div className="card-top">
                            <span>Cuenta de Ahorros</span>
                            <i className="fas fa-wifi"></i>
                        </div>
                        <div className="card-balance">
                            <small>Saldo Disponible</small>
                            <h3>S/ {data.bankBalance.toFixed(2)}</h3>
                        </div>
                        <div className="card-bottom">
                            <span>**** **** **** {data.accountNumber.slice(-4)}</span>
                            <span>{data.name.toUpperCase()}</span>
                        </div>
                    </div>

                    {/* Debit Card Visual */}
                    <div className="bank-card blue-card">
                        <div className="card-top">
                            <span>Visa Débito</span>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" style={{height:'20px', background:'white', borderRadius:'4px', padding:'2px'}}/>
                        </div>
                        <div className="card-number">
                            **** **** **** {Math.floor(1000 + Math.random() * 9000)}
                        </div>
                        <div className="card-bottom">
                            <span>Vence: 12/28</span>
                            <span>CVV: ***</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h3>Acciones Rápidas</h3>
                    <div className="action-buttons">
                        <button className="action-btn"><div className="icon-box"><i className="fas fa-paper-plane"></i></div><span>Transferir</span></button>
                        <button className="action-btn"><div className="icon-box"><i className="fas fa-mobile-alt"></i></div><span>Recargar</span></button>
                        <button className="action-btn"><div className="icon-box"><i className="fas fa-lightbulb"></i></div><span>Servicios</span></button>
                        <button className="action-btn" onClick={applyCC}><div className="icon-box"><i className="fas fa-plus"></i></div><span>Solicitar</span></button>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="transactions-section">
                    <div className="section-header">
                        <h3>Movimientos Recientes</h3>
                        <a href="#">Ver todos</a>
                    </div>
                    <div className="table-responsive">
                        <table className="tx-table">
                            <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                                <th>Monto</th>
                            </tr>
                            </thead>
                            <tbody>
                            {data.transactionHistory?.map((t, i) => (
                                <tr key={i}>
                                    <td>{t.date}</td>
                                    <td>
                                        <div className="tx-desc">
                                            <div className={`tx-icon ${t.amount < 0 ? 'out' : 'in'}`}>
                                                <i className={`fas fa-${t.amount < 0 ? 'shopping-bag' : 'arrow-down'}`}></i>
                                            </div>
                                            {t.description}
                                        </div>
                                    </td>
                                    <td><span className="badge success">Procesado</span></td>
                                    <td className={t.amount < 0 ? 'amount-neg' : 'amount-pos'}>
                                        {t.amount < 0 ? '-' : '+'} S/ {Math.abs(t.amount).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}