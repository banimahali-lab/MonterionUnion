import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebaseConfig';
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function UserDashboard({ user, goToHome, onLogout, onCreditCardReject }) {
    const [data, setData] = useState(null);

    // Modals
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showBillsModal, setShowBillsModal] = useState(false);
    const [showDateSelect, setShowDateSelect] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

    // --- NEW: Debit Card Management Modals ---
    const [showCardModal, setShowCardModal] = useState(false);
    const [isCardFlipped, setIsCardFlipped] = useState(false);

    // --- NEW: Chatbot States ---
    const [showChat, setShowChat] = useState(false);
    const [chatStep, setChatStep] = useState('init'); // init, call_support, list_tx, tx_options, form, final
    const [selectedTx, setSelectedTx] = useState(null);
    const chatEndRef = useRef(null);

    // Transfer Logic
    const [transferTab, setTransferTab] = useState('andes');
    const [toast, setToast] = useState('');

    useEffect(() => {
        if(user) getDoc(doc(db, "users", user.uid)).then(s => setData(s.data()));
    }, [user]);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatStep, showChat]);

    const applyCC = async () => {
        sessionStorage.removeItem('andes_session_active');
        await signOut(auth);
        onCreditCardReject();
    };

    const handleStatementClick = () => {
        setShowDateSelect(true);
    };

    const onDateSelected = () => {
        setShowDateSelect(false);
        setToast("Tu cuenta es muy reciente. Espera unos días para usar este servicio.");
        setTimeout(() => setToast(''), 4000);
    };

    const handleTransferSubmit = () => {
        setToast("Saldo insuficiente para realizar esta operación.");
        setTimeout(() => setToast(''), 4000);
    };

    // --- CHATBOT LOGIC ---
    const resetChat = () => {
        setChatStep('init');
        setSelectedTx(null);
    };

    const renderChatContent = () => {
        switch (chatStep) {
            case 'init':
                return (
                    <div className="chat-options">
                        <p className="bot-msg">¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?</p>
                        <button onClick={() => setChatStep('call_support')}>Problemas de Cuenta</button>
                        <button onClick={() => setChatStep('list_tx')}>Problemas con Transacción</button>
                        <button onClick={() => setChatStep('call_support')}>Número de Atención</button>
                        <button onClick={() => setChatStep('call_support')}>Otro no listado</button>
                    </div>
                );
            case 'call_support':
                return (
                    <div className="chat-msg-box">
                        <p className="bot-msg">Para este tipo de consultas, por favor contacta a nuestro equipo humano.</p>
                        <div className="contact-card-chat">
                            <i className="fas fa-headset"></i>
                            <strong>(511) 613 2000</strong>
                        </div>
                        <button className="chat-back-btn" onClick={resetChat}>Volver al Inicio</button>
                    </div>
                );
            case 'list_tx':
                return (
                    <div className="chat-options">
                        <p className="bot-msg">Selecciona la transacción con la que tienes problemas:</p>
                        {data.transactionHistory?.slice(0, 4).map((t, i) => (
                            <button key={i} className="tx-chat-btn" onClick={() => { setSelectedTx(t); setChatStep('tx_options'); }}>
                                <span>{t.description}</span>
                                <strong>S/ {Math.abs(t.amount)}</strong>
                            </button>
                        ))}
                        <button className="chat-back-btn" onClick={resetChat}>Cancelar</button>
                    </div>
                );
            case 'tx_options':
                return (
                    <div className="chat-options">
                        <p className="bot-msg">Has seleccionado: <strong>{selectedTx.description}</strong>. ¿Cuál es el problema?</p>
                        <button onClick={() => setChatStep('form')}>Solicitar Reembolso</button>
                        <button onClick={() => setChatStep('not_received')}>No recibí el producto</button>
                        <button onClick={() => setChatStep('form')}>Reportar Fraude</button>
                    </div>
                );
            case 'not_received':
                return (
                    <div className="chat-msg-box">
                        <p className="bot-msg">Por favor, contacta primero al comercio con este ID de transacción:</p>
                        <div className="static-id-box">TXN-{Math.floor(100000 + Math.random() * 900000)}</div>
                        <p className="bot-msg">Si no responden en 48 horas, contáctanos nuevamente.</p>
                        <button className="chat-back-btn" onClick={resetChat}>Entendido</button>
                    </div>
                );
            case 'form':
                return (
                    <div className="chat-form">
                        <p className="bot-msg">Entendido. Por favor describe brevemente la situación:</p>
                        <textarea placeholder="Escribe aquí..." rows="3"></textarea>
                        <button onClick={() => setChatStep('final')}>Enviar Reporte</button>
                    </div>
                );
            case 'final':
                return (
                    <div className="chat-msg-box">
                        <i className="fas fa-check-circle success-icon-chat"></i>
                        <p className="bot-msg">Hemos recibido tu reporte. Nuestro equipo de servicio al cliente revisará el caso y lo resolverá a la brevedad.</p>
                        <button className="chat-back-btn" onClick={() => setShowChat(false)}>Cerrar Chat</button>
                    </div>
                );
            default: return null;
        }
    };

    if(!data) return (
        <div className="loading-state">
            <div className="spinner"><i className="fas fa-circle-notch fa-spin"></i></div>
        </div>
    );

    const firstName = data.name.split(' ')[0];

    return (
        <div className="dashboard-layout">
            {toast && (
                <div className="error-toast animate-slide-up">
                    <i className="fas fa-exclamation-circle"></i> {toast}
                </div>
            )}

            {/* Desktop Sidebar */}
            <nav className="dash-sidebar desktop-only">
                <div className="dash-logo" onClick={goToHome}>
                    <i className="fas fa-mountain fa-2x"></i>
                    <span>Andes Prime Bank</span>
                </div>
                <div className="user-profile-snippet">
                    <div className="avatar-circle">{firstName[0]}</div>
                    <div className="user-info">
                        <strong>{firstName}</strong>
                        {/* REMOVED: "Cliente Verificado" */}
                    </div>
                </div>
                <ul className="dash-menu">
                    <li className="active"><i className="fas fa-th-large"></i> Resumen</li>
                    <li><i className="fas fa-wallet"></i> Mis Cuentas</li>
                    <li onClick={() => setShowCardModal(true)}><i className="fas fa-credit-card"></i> Tarjetas</li> {/* Opens Debit Manager */}
                    <li onClick={() => setShowTransferModal(true)}><i className="fas fa-exchange-alt"></i> Transferencias</li>
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
                            {/* REMOVED: "Ahorros" or "Cuenta de Ahorros" label */}
                            <span></span> <i className="fas fa-wifi"></i>
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

                    {/* Blue Visa Card - Click to Manage */}
                    <div className="bank-card blue-card animate-slide-up delay-1" onClick={() => setShowCardModal(true)} style={{cursor:'pointer'}}>
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
                        <button className="action-btn" onClick={() => setShowTransferModal(true)}>
                            <div className="icon-box"><i className="fas fa-paper-plane"></i></div>
                            <span>Transferir</span>
                        </button>
                        <button className="action-btn" onClick={() => setShowBillsModal(true)}>
                            <div className="icon-box"><i className="fas fa-file-invoice-dollar"></i></div>
                            <span>Pago Serv.</span>
                        </button>
                        <button className="action-btn" onClick={handleStatementClick}>
                            <div className="icon-box"><i className="fas fa-file-alt"></i></div>
                            <span>Est. Cuenta</span>
                        </button>
                        <button className="action-btn" onClick={applyCC}> {/* Still Apply CC */}
                            <div className="icon-box"><i className="fas fa-plus"></i></div>
                            <span>Tarjeta</span>
                        </button>
                    </div>
                </div>

                {/* Transactions Preview */}
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

            {/* --- DEBIT CARD MANAGEMENT MODAL --- */}
            {showCardModal && (
                <div className="fullscreen-modal animate-slide-up-full">
                    <div className="modal-header">
                        <i className="fas fa-arrow-left" onClick={() => {setShowCardModal(false); setShowChat(false);}}></i>
                        <h2>Gestión de Tarjeta</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body card-manage-body">

                        {/* Horizontal Scroll / Carousel */}
                        <div className="cards-carousel">
                            {/* Card 1: The Visa Debit (Flippable) */}
                            <div className={`flip-card-container ${isCardFlipped ? 'flipped' : ''}`} onClick={() => setIsCardFlipped(!isCardFlipped)}>
                                <div className="flip-card-inner">
                                    <div className="flip-card-front blue-card">
                                        <div className="card-top">
                                            <span>Visa Débito</span> <i className="fab fa-cc-visa fa-lg"></i>
                                        </div>
                                        <div className="card-number">**** **** **** 4242</div>
                                        <div className="card-bottom">
                                            <span>12/28</span>
                                            <span>{data.name.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div className="flip-card-back">
                                        <div className="magnetic-strip"></div>
                                        <div className="cvv-strip">
                                            <span>CVV: 453</span>
                                        </div>
                                        <p className="card-help-text">Authorized Signature</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Apply New Debit */}
                            <div className="add-card-placeholder">
                                <div className="add-btn-circle"><i className="fas fa-plus"></i></div>
                                <span>Solicitar Tarjeta Adicional</span>
                            </div>
                        </div>

                        {/* Management Options */}
                        <div className="manage-options-grid">
                            <div className="manage-option-item">
                                <div className="manage-icon"><i className="fas fa-sliders-h"></i></div>
                                <span>Límites</span>
                            </div>
                            <div className="manage-option-item">
                                <div className="manage-icon"><i className="fas fa-lock"></i></div>
                                <span>Bloquear</span>
                            </div>
                            <div className="manage-option-item" onClick={() => setShowHistoryModal(true)}>
                                <div className="manage-icon"><i className="fas fa-bars"></i></div>
                                <span>Transacciones</span>
                            </div>
                            <div className="manage-option-item" onClick={() => {setShowChat(true); resetChat();}}>
                                <div className="manage-icon" style={{background:'var(--gold)', color:'var(--blue)'}}><i className="fas fa-headset"></i></div>
                                <span>Ayuda</span>
                            </div>
                        </div>

                        {/* Chatbot Overlay (Inside Modal) */}
                        {showChat && (
                            <div className="chat-overlay animate-slide-up">
                                <div className="chat-header">
                                    <div className="bot-profile">
                                        <div className="bot-avatar"><i className="fas fa-robot"></i></div>
                                        <span>Asistente Andes</span>
                                    </div>
                                    <i className="fas fa-times" onClick={() => setShowChat(false)}></i>
                                </div>
                                <div className="chat-body">
                                    {renderChatContent()}
                                    <div ref={chatEndRef} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Other Modals (Transfer, History, Bills, Date) remain exactly the same as previous code... */}
            {/* ... (Hidden for brevity, but assume existing modal code is here) ... */}

            {/* --- RE-INSERTING PREVIOUS MODALS FOR COMPLETENESS --- */}
            {showTransferModal && (
                <div className="fullscreen-modal animate-slide-up-full">
                    <div className="modal-header">
                        <i className="fas fa-times" onClick={() => setShowTransferModal(false)}></i>
                        <h2>Transferencias</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body">
                        <div className="transfer-tabs">
                            <button className={`tab-btn ${transferTab === 'andes' ? 'active' : ''}`} onClick={()=>setTransferTab('andes')}>A Andes Prime</button>
                            <button className={`tab-btn ${transferTab === 'other' ? 'active' : ''}`} onClick={()=>setTransferTab('other')}>A Otros Bancos</button>
                        </div>
                        <div className="transfer-form">
                            {transferTab === 'other' && (
                                <div className="input-group">
                                    <label>Banco de Destino</label>
                                    <select className="dash-input"><option>BCP</option><option>BBVA</option><option>Interbank</option></select>
                                </div>
                            )}
                            <div className="input-group"><label>Número de Cuenta</label><input type="number" className="dash-input" /></div>
                            <div className="input-group"><label>Monto</label><input type="number" className="dash-input" /></div>
                            <button className="btn-cta full-width" style={{marginTop:'20px'}} onClick={handleTransferSubmit}>Enviar Dinero</button>
                        </div>
                    </div>
                </div>
            )}

            {showHistoryModal && (
                <div className="fullscreen-modal animate-slide-up-full">
                    <div className="modal-header">
                        <i className="fas fa-arrow-left" onClick={() => setShowHistoryModal(false)}></i>
                        <h2>Historial</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body">
                        <div className="tx-list full-list">
                            {data.transactionHistory?.map((t, i) => (
                                <div key={i} className="tx-item">
                                    <div className={`tx-icon-circle ${t.amount < 0 ? 'out' : 'in'}`}><i className={`fas fa-${t.amount < 0 ? 'shopping-bag' : 'arrow-down'}`}></i></div>
                                    <div className="tx-details"><strong>{t.description}</strong><small>{t.date}</small></div>
                                    <span className={t.amount < 0 ? 'amount-neg' : 'amount-pos'}>{t.amount < 0 ? '-' : '+'} S/ {Math.abs(t.amount).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {showBillsModal && (
                <div className="fullscreen-modal animate-slide-up-full">
                    <div className="modal-header">
                        <i className="fas fa-times" onClick={() => setShowBillsModal(false)}></i>
                        <h2>Pago de Servicios</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body">
                        <div className="bills-grid">
                            <div className="bill-item"><div className="bill-icon"><i className="fas fa-mobile-alt"></i></div><span>Recargas</span></div>
                            <div className="bill-item"><div className="bill-icon"><i className="fas fa-lightbulb"></i></div><span>Luz</span></div>
                        </div>
                    </div>
                </div>
            )}
            {showDateSelect && (
                <div className="modal-overlay" onClick={() => setShowDateSelect(false)}>
                    <div className="date-picker-box" onClick={e => e.stopPropagation()}>
                        <h3>Seleccionar Periodo</h3>
                        <input type="date" className="date-input" onChange={onDateSelected} />
                        <button className="btn-close-text" onClick={() => setShowDateSelect(false)}>Cancelar</button>
                    </div>
                </div>
            )}

            <nav className="mobile-bottom-nav mobile-only">
                <div className="nav-item" onClick={goToHome}><i className="fas fa-home"></i><span>Inicio</span></div>
                <div className="nav-item active"><i className="fas fa-wallet"></i><span>Cuentas</span></div>
                <div className="nav-item" onClick={() => setShowCardModal(true)}><i className="fas fa-credit-card"></i><span>Tarjetas</span></div> {/* Opens Manage Debit */}
                <div className="nav-item" onClick={() => setShowTransferModal(true)}><i className="fas fa-exchange-alt"></i><span>Transf.</span></div>
            </nav>
        </div>
    );
}
