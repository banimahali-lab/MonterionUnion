import React, { useState, useEffect } from 'react';
import { db, auth } from './firebaseConfig';
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function UserDashboard({ user, goToHome, onLogout, onCreditCardReject }) {
    const [data, setData] = useState(null);

    // Modals
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showBillsModal, setShowBillsModal] = useState(false);
    const [showDateSelect, setShowDateSelect] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false); // New Modal State

    // Transfer Logic
    const [transferTab, setTransferTab] = useState('andes'); // 'andes' or 'other'

    const [toast, setToast] = useState('');

    useEffect(() => {
        if(user) getDoc(doc(db, "users", user.uid)).then(s => setData(s.data()));
    }, [user]);

    const applyCC = async () => {
        sessionStorage.removeItem('andes_session_active');
        await signOut(auth);
        onCreditCardReject();
    };

    // Bank Statement Click
    const handleStatementClick = () => {
        setShowDateSelect(true);
    };

    const onDateSelected = () => {
        setShowDateSelect(false);
        setToast("Tu cuenta es muy reciente. Espera unos días para usar este servicio.");
        setTimeout(() => setToast(''), 4000);
    };

    // Transfer Submit Logic
    const handleTransferSubmit = () => {
        setToast("Saldo insuficiente para realizar esta operación.");
        setTimeout(() => setToast(''), 4000);
    };

    if(!data) return (
        <div className="loading-state">
            <div className="spinner"><i className="fas fa-circle-notch fa-spin"></i></div>
        </div>
    );

    const firstName = data.name.split(' ')[0];

    return (
        <div className="dashboard-layout">

            {/* --- RED TOAST NOTIFICATION --- */}
            {toast && (
                <div className="error-toast animate-slide-up">
                    <i className="fas fa-exclamation-circle"></i> {toast}
                </div>
            )}

            {/* Desktop Sidebar */}
            <nav className="dash-sidebar desktop-only">
                <div className="dash-logo" onClick={goToHome}>
                    <i className="fas fa-mountain fa-2x"></i>
                    <span>Andes Prime Bank</span> {/* FIX: Added "Bank" */}
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
                    <li onClick={() => setShowTransferModal(true)}><i className="fas fa-exchange-alt"></i> Transferencias</li> {/* FIX: Opens Transfer Modal */}
                </ul>
                <button onClick={onLogout} className="btn-logout">
                    <i className="fas fa-sign-out-alt"></i> Salir
                </button>
            </nav>

            {/* Mobile Header */}
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

                {/* Quick Actions */}
                <div className="quick-actions animate-slide-up delay-2">
                    <h3 className="section-title-sm">Operaciones</h3>
                    <div className="action-buttons">

                        {/* 1. Transfer (Now opens Transfer Modal) */}
                        <button className="action-btn" onClick={() => setShowTransferModal(true)}>
                            <div className="icon-box"><i className="fas fa-paper-plane"></i></div> {/* Changed Icon to Plane for Send */}
                            <span>Transferir</span>
                        </button>

                        {/* 2. Bills Payment */}
                        <button className="action-btn" onClick={() => setShowBillsModal(true)}>
                            <div className="icon-box"><i className="fas fa-file-invoice-dollar"></i></div>
                            <span>Pago Serv.</span>
                        </button>

                        {/* 3. Bank Statement */}
                        <button className="action-btn" onClick={handleStatementClick}>
                            <div className="icon-box"><i className="fas fa-file-alt"></i></div>
                            <span>Est. Cuenta</span>
                        </button>

                        {/* 4. Apply CC */}
                        <button className="action-btn" onClick={applyCC}>
                            <div className="icon-box"><i className="fas fa-plus"></i></div>
                            <span>Tarjeta</span>
                        </button>
                    </div>
                </div>

                {/* Date Picker Overlay */}
                {showDateSelect && (
                    <div className="modal-overlay" onClick={() => setShowDateSelect(false)}>
                        <div className="date-picker-box" onClick={e => e.stopPropagation()}>
                            <h3>Seleccionar Periodo</h3>
                            <p>Elija la fecha de su estado de cuenta:</p>
                            <input type="date" className="date-input" onChange={onDateSelected} />
                            <button className="btn-close-text" onClick={() => setShowDateSelect(false)}>Cancelar</button>
                        </div>
                    </div>
                )}

                {/* Transactions Preview (Opens History) */}
                <div className="transactions-section animate-slide-up delay-3">
                    <div className="section-header" onClick={() => setShowHistoryModal(true)}>
                        <h3>Transacciones</h3>
                        <span style={{color:'var(--blue)', fontSize:'0.8rem'}}>Ver Todo <i className="fas fa-chevron-right"></i></span>
                    </div>
                    <div className="tx-list">
                        {data.transactionHistory?.slice(0, 3).map((t, i) => (
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

            {/* --- TRANSFER MODAL (New) --- */}
            {showTransferModal && (
                <div className="fullscreen-modal animate-slide-up-full">
                    <div className="modal-header">
                        <i className="fas fa-times" onClick={() => setShowTransferModal(false)}></i>
                        <h2>Transferencias</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body">
                        {/* Tabs */}
                        <div className="transfer-tabs">
                            <button className={`tab-btn ${transferTab === 'andes' ? 'active' : ''}`} onClick={()=>setTransferTab('andes')}>A Andes Prime</button>
                            <button className={`tab-btn ${transferTab === 'other' ? 'active' : ''}`} onClick={()=>setTransferTab('other')}>A Otros Bancos</button>
                        </div>

                        {/* Form */}
                        <div className="transfer-form">
                            {transferTab === 'other' && (
                                <div className="input-group">
                                    <label>Banco de Destino</label>
                                    <select className="dash-input">
                                        <option>Seleccionar Banco</option>
                                        <option>BCP</option>
                                        <option>BBVA</option>
                                        <option>Interbank</option>
                                        <option>Scotiabank</option>
                                        <option>Banco de la Nación</option>
                                    </select>
                                </div>
                            )}

                            <div className="input-group">
                                <label>Número de Cuenta</label>
                                <input type="number" className="dash-input" placeholder="Ingrese número de cuenta" />
                            </div>

                            <div className="input-group">
                                <label>Confirmar Cuenta</label>
                                <input type="number" className="dash-input" placeholder="Repita el número" />
                            </div>

                            <div className="input-group">
                                <label>Nombre del Beneficiario</label>
                                <input type="text" className="dash-input" placeholder="Nombre completo" />
                            </div>

                            <div className="input-group">
                                <label>Monto a Transferir (S/)</label>
                                <input type="number" className="dash-input" placeholder="0.00" />
                            </div>

                            <div className="input-group">
                                <label>Motivo</label>
                                <input type="text" className="dash-input" placeholder="Ej. Alquiler, Préstamo, Varios" />
                            </div>

                            <button className="btn-cta full-width" style={{marginTop:'20px'}} onClick={handleTransferSubmit}>
                                Enviar Dinero
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FULL SCREEN HISTORY MODAL --- */}
            {showHistoryModal && (
                <div className="fullscreen-modal animate-slide-up-full">
                    <div className="modal-header">
                        <i className="fas fa-arrow-left" onClick={() => setShowHistoryModal(false)}></i>
                        <h2>Historial de Transacciones</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body">
                        <div className="tx-list full-list">
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
                </div>
            )}

            {/* --- BILLS PAYMENT MODAL --- */}
            {showBillsModal && (
                <div className="fullscreen-modal animate-slide-up-full">
                    <div className="modal-header">
                        <i className="fas fa-times" onClick={() => setShowBillsModal(false)}></i>
                        <h2>Pago de Servicios</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body">
                        <p style={{textAlign:'center', color:'#666', marginBottom:'30px'}}>Seleccione el servicio a pagar:</p>
                        <div className="bills-grid">
                            <div className="bill-item"><div className="bill-icon"><i className="fas fa-mobile-alt"></i></div><span>Recargas</span></div>
                            <div className="bill-item"><div className="bill-icon"><i className="fas fa-wifi"></i></div><span>Internet/Wifi</span></div>
                            <div className="bill-item"><div className="bill-icon"><i className="fas fa-lightbulb"></i></div><span>Luz</span></div>
                            <div className="bill-item"><div className="bill-icon"><i className="fas fa-water"></i></div><span>Agua</span></div>
                            <div className="bill-item"><div className="bill-icon"><i className="fas fa-fire"></i></div><span>Gas</span></div>
                            <div className="bill-item"><div className="bill-icon"><i className="fas fa-graduation-cap"></i></div><span>Educación</span></div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MOBILE NAVIGATION --- */}
            <nav className="mobile-bottom-nav mobile-only">
                <div className="nav-item" onClick={goToHome}>
                    <i className="fas fa-home"></i><span>Inicio</span>
                </div>
                <div className="nav-item active">
                    <i className="fas fa-wallet"></i><span>Cuentas</span>
                </div>
                <div className="nav-item" onClick={applyCC}>
                    <i className="fas fa-credit-card"></i><span>Tarjetas</span>
                </div>
                <div className="nav-item" onClick={() => setShowTransferModal(true)}> {/* FIX: Opens Transfer */}
                    <i className="fas fa-exchange-alt"></i><span>Transf.</span>
                </div>
            </nav>
        </div>
    );
}