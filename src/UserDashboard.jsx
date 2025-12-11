import React, { useState, useEffect } from 'react';
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
            <div className="spinner"><i className="fas fa-circle-notch fa-spin"></i></div>
        </div>
    );

    const firstName = data.name.split(' ')[0];

    return (
        <div className="dashboard-layout">
            {/* Desktop Sidebar (Hidden on Mobile) */}
            <nav className="dash-sidebar desktop-only">
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
                </ul>
                <button onClick={onLogout} className="btn-logout">
                    <i className="fas fa-sign-out-alt"></i> Salir
                </button>
            </nav>

            {/* Mobile Header (Visible on Mobile) */}
            <header className="mobile-header mobile-only">
                <div className="mobile-user">
                    <div className="avatar-circle small">{firstName[0]}</div>
                    <span>Hola, {firstName}</span>
                </div>
                <i className="fas fa-sign-out-alt logout-icon" onClick={onLogout}></i>
            </header>

            {/* Main Content */}
            <main className="dash-content">
                <div className="welcome-banner mobile-only">
                    <h2>Balance Total</h2>
                    <h1>S/ {data.bankBalance.toFixed(2)}</h1>
                </div>

                <div className="desktop-only dash-header">
                    <h2>Resumen de Productos</h2>
                </div>

                {/* Account Cards */}
                <div className="account-cards-grid">
                    <div className="bank-card gold-card animate-slide-up">
                        <div className="card-top">
                            <span>Ahorros</span> <i className="fas fa-wifi"></i>
                        </div>
                        <div className="card-balance">
                            <small className="desktop-only">Saldo Disponible</small>
                            <h3>S/ {data.bankBalance.toFixed(2)}</h3>
                        </div>
                        <div className="card-bottom">
                            <span>**** {data.accountNumber.slice(-4)}</span>
                            <span>{data.name.toUpperCase()}</span>
                        </div>
                    </div>

                    <div className="bank-card blue-card animate-slide-up delay-1">
                        <div className="card-top">
                            <span>Visa Débito</span> <i className="fab fa-cc-visa fa-lg"></i>
                        </div>
                        <div className="card-number">**** **** **** 4242</div>
                        <div className="card-bottom">
                            <span>12/28</span> <span>CVV ***</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions (Round Buttons) */}
                <div className="quick-actions animate-slide-up delay-2">
                    <h3 className="section-title-sm">Operaciones</h3>
                    <div className="action-buttons">
                        <button className="action-btn"><div className="icon-box"><i className="fas fa-paper-plane"></i></div><span>Enviar</span></button>
                        <button className="action-btn"><div className="icon-box"><i className="fas fa-qrcode"></i></div><span>Yape/Plin</span></button>
                        <button className="action-btn"><div className="icon-box"><i className="fas fa-lightbulb"></i></div><span>Pagar</span></button>
                        <button className="action-btn" onClick={applyCC}><div className="icon-box"><i className="fas fa-plus"></i></div><span>Tarjeta</span></button>
                    </div>
                </div>

                {/* Transactions */}
                <div className="transactions-section animate-slide-up delay-3">
                    <h3>Últimos Movimientos</h3>
                    <div className="tx-list">
                        {data.transactionHistory?.map((t, i) => (
                            <div key={i} className="tx-item">
                                <div className={`tx-icon-circle ${t.amount < 0 ? 'out' : 'in'}`}>
                                    <i className={`fas fa-${t.amount < 0 ? 'shopping-bag' : 'arrow-down'}`}></i>
                                </div>
                                <div className="tx-details">
                                    <strong>{t.description}</strong>
                                    <small>{t.date}</small>
                                </div>
                                <span className={t.amount < 0 ? 'amount-neg' : 'amount-pos'}>
                                    {t.amount < 0 ? '-' : '+'} S/ {Math.abs(t.amount).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="mobile-bottom-nav mobile-only">
                <div className="nav-item active"><i className="fas fa-home"></i><span>Inicio</span></div>
                <div className="nav-item"><i className="fas fa-wallet"></i><span>Cuentas</span></div>
                <div className="nav-item center-fab" onClick={applyCC}><i className="fas fa-plus"></i></div>
                <div className="nav-item"><i className="fas fa-exchange-alt"></i><span>Transf.</span></div>
                <div className="nav-item"><i className="fas fa-bars"></i><span>Menú</span></div>
            </nav>
        </div>
    );
}