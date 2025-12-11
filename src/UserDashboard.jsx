import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebaseConfig';
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function UserDashboard({ user, goToHome, onLogout, onCreditCardReject }) {
    const [data, setData] = useState(null);

    // --- Modals State ---
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [showLimitsModal, setShowLimitsModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showDateSelect, setShowDateSelect] = useState(false);

    // --- UI Logic States ---
    const [isCardFlipped, setIsCardFlipped] = useState(false);
    const [transferTab, setTransferTab] = useState('andes');

    // --- NEW: Toggle Account Number Visibility ---
    const [showFullAccount, setShowFullAccount] = useState(false);

    // --- Toast State ---
    const [toast, setToast] = useState({ msg: '', type: '' });

    // --- Chatbot States ---
    const [showChat, setShowChat] = useState(false);
    const [chatStep, setChatStep] = useState('init');
    const [selectedTx, setSelectedTx] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if(user) getDoc(doc(db, "users", user.uid)).then(s => setData(s.data()));
    }, [user]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatStep, showChat]);

    // --- HELPERS ---

    // 1. DYNAMIC ACCOUNT NUMBER LOGIC (1100 + Alphabet Index)
    const getCalculatedAccountNumber = () => {
        if (!data || !data.name) return "0000000000";
        // Get first name, lowercase, remove special chars
        const firstName = data.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
        let accNum = "1100";
        for (let i = 0; i < firstName.length; i++) {
            accNum += (firstName.charCodeAt(i) - 96); // a=1, b=2, etc.
        }
        return accNum;
    };

    const calculatedAccNum = getCalculatedAccountNumber();
    // Mask logic: Show only last 4 if locked, else show full
    const displayAccNum = showFullAccount
        ? calculatedAccNum
        : `**** ${calculatedAccNum.slice(-4)}`;


    const showToast = (msg, type = 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: '' }), 4000);
    };

    const handleApplyCard = () => showToast("Saldo insuficiente para solicitar nueva tarjeta.", 'error');
    const handleMaintenance = () => showToast("Sistema en mantenimiento. Intente más tarde.", 'info');
    const handleStatementClick = () => setShowDateSelect(true);
    const onDateSelected = () => {
        setShowDateSelect(false);
        showToast("Tu cuenta es muy reciente. Espera unos días para usar este servicio.", 'error');
    };
    const handleTransferSubmit = () => showToast("Saldo insuficiente para realizar esta operación.", 'error');
    const handleBlockSubmit = () => {
        setShowBlockModal(false);
        showToast("Solicitud procesada. Recibirá una confirmación pronto.", 'info');
    };

    // --- CHATBOT CONTENT ---
    const resetChat = () => { setChatStep('init'); setSelectedTx(null); };
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
                            <i className="fas fa-headset"></i><strong>(511) 613 2000</strong>
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
                                <span>{t.description}</span><strong>S/ {Math.abs(t.amount)}</strong>
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

    if(!data) return <div className="loading-state"><div className="spinner"><i className="fas fa-circle-notch fa-spin"></i></div></div>;

    const firstName = data.name.split(' ')[0];

    return (
        <div className="dashboard-layout">

            {toast.msg && (
                <div className={`toast-notification ${toast.type} animate-slide-up`}>
                    <i className={`fas ${toast.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`}></i>
                    {toast.msg}
                </div>
            )}

            {/* Sidebar */}
            <nav className="dash-sidebar desktop-only">
                <div className="dash-logo" onClick={goToHome}>
                    <i className="fas fa-mountain fa-2x"></i>
                    <span>Andes Prime Bank</span>
                </div>
                <div className="user-profile-snippet">
                    <div className="avatar-circle">{firstName[0]}</div>
                    <div className="user-info"><strong>{firstName}</strong></div>
                </div>
                <ul className="dash-menu">
                    <li className="active"><i className="fas fa-th-large"></i> Resumen</li>
                    <li><i className="fas fa-wallet"></i> Mis Cuentas</li>
                    <li onClick={() => setShowCardModal(true)}><i className="fas fa-credit-card"></i> Tarjetas</li>
                    <li onClick={() => setShowTransferModal(true)}><i className="fas fa-exchange-alt"></i> Transferencias</li>
                </ul>
                <button onClick={onLogout} className="btn-logout"><i className="fas fa-sign-out-alt"></i> Salir</button>
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

                <div className="desktop-only dash-header"><h2>Resumen de Productos</h2></div>

                {/* Account Cards */}
                <div className="account-cards-grid">
                    {/* --- GOLD CARD: SAVINGS (Now Clickable to Toggle Number) --- */}
                    <div className="bank-card gold-card animate-slide-up"
                         onClick={() => setShowFullAccount(!showFullAccount)}
                         style={{cursor: 'pointer'}}>
                        <div className="card-top"><span></span> <i className="fas fa-wifi"></i></div>
                        <div className="card-balance">
                            <small className="desktop-only">Saldo Disponible</small>
                            <h3>S/ {data.bankBalance.toFixed(2)}</h3>
                        </div>
                        <div className="card-bottom">
                            {/* Shows dynamically calculated number */}
                            <span style={{fontFamily: 'monospace', fontSize: '1.1rem'}}>{displayAccNum}</span>
                            <span>{data.name.toUpperCase()}</span>
                        </div>
                    </div>

                    {/* --- BLUE CARD: VISA (Full Number Visible Here) --- */}
                    <div className="bank-card blue-card animate-slide-up delay-1" onClick={() => setShowCardModal(true)} style={{cursor:'pointer'}}>
                        <div className="card-top"><span>Visa Débito</span> <i className="fab fa-cc-visa fa-lg"></i></div>
                        <div className="card-number" style={{letterSpacing: '3px'}}>4832 9320 0052 3027</div>
                        <div className="card-bottom"><span>06/32</span> <span>CVV ***</span></div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions animate-slide-up delay-2">
                    <h3 className="section-title-sm">Operaciones</h3>
                    <div className="action-buttons">
                        <button className="action-btn" onClick={() => setShowTransferModal(true)}>
                            <div className="icon-box"><i className="fas fa-exchange-alt"></i></div>
                            <span>Transferir</span>
                        </button>
                        <button className="action-btn" onClick={handleMaintenance}>
                            <div className="icon-box"><i className="fas fa-file-invoice-dollar"></i></div>
                            <span>Pago Serv.</span>
                        </button>
                        <button className="action-btn" onClick={handleStatementClick}>
                            <div className="icon-box"><i className="fas fa-file-alt"></i></div>
                            <span>Est. Cuenta</span>
                        </button>
                        <button className="action-btn" onClick={handleApplyCard}>
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
                                <div className={`tx-icon-circle ${t.amount < 0 ? 'out' : 'in'}`}><i className={`fas fa-${t.amount < 0 ? 'shopping-bag' : 'arrow-down'}`}></i></div>
                                <div className="tx-details"><strong>{t.description}</strong><small>{t.date}</small></div>
                                <span className={t.amount < 0 ? 'amount-neg' : 'amount-pos'}>{t.amount < 0 ? '-' : '+'} S/ {Math.abs(t.amount).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* --- MODALS --- */}

            {/* 1. MANAGE CARD MODAL */}
            {showCardModal && (
                <div className="fullscreen-modal animate-slide-up-full">
                    <div className="modal-header">
                        <i className="fas fa-arrow-left" onClick={() => {setShowCardModal(false); setShowChat(false);}}></i>
                        <h2>Gestión de Tarjeta</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body card-manage-body">
                        <div className="cards-carousel">
                            <div className={`flip-card-container ${isCardFlipped ? 'flipped' : ''}`} onClick={() => setIsCardFlipped(!isCardFlipped)}>
                                <div className="flip-card-inner">
                                    <div className="flip-card-front blue-card">
                                        <div className="card-top"><span>Visa Débito</span> <i className="fab fa-cc-visa fa-lg"></i></div>
                                        {/* FULL STATIC NUMBER VISIBLE */}
                                        <div className="card-number" style={{letterSpacing: '2px', fontSize: '1.2rem'}}>4832 9320 0052 3027</div>
                                        <div className="card-bottom"><span>06/32</span><span>{data.name.toUpperCase()}</span></div>
                                    </div>
                                    <div className="flip-card-back">
                                        <div className="magnetic-strip"></div>
                                        <div className="cvv-strip"><span>CVV: 956</span></div>
                                        <p className="card-help-text">Authorized Signature</p>
                                    </div>
                                </div>
                            </div>
                            <div className="add-card-placeholder" onClick={handleApplyCard}>
                                <div className="add-btn-circle"><i className="fas fa-plus"></i></div>
                                <span>Solicitar Tarjeta Adicional</span>
                            </div>
                        </div>

                        <div className="manage-options-grid">
                            <div className="manage-option-item" onClick={() => setShowLimitsModal(true)}>
                                <div className="manage-icon"><i className="fas fa-sliders-h"></i></div><span>Límites</span>
                            </div>
                            <div className="manage-option-item" onClick={() => setShowBlockModal(true)}>
                                <div className="manage-icon"><i className="fas fa-lock"></i></div><span>Bloquear</span>
                            </div>
                            <div className="manage-option-item" onClick={() => setShowHistoryModal(true)}>
                                <div className="manage-icon"><i className="fas fa-bars"></i></div><span>Transacciones</span>
                            </div>
                            <div className="manage-option-item" onClick={() => {setShowChat(true); resetChat();}}>
                                <div className="manage-icon" style={{background:'var(--gold)', color:'var(--blue)'}}><i className="fas fa-headset"></i></div><span>Ayuda</span>
                            </div>
                        </div>

                        {showChat && (
                            <div className="chat-overlay animate-slide-up">
                                <div className="chat-header">
                                    <div className="bot-profile"><div className="bot-avatar"><i className="fas fa-robot"></i></div><span>Asistente Andes</span></div>
                                    <i className="fas fa-times" onClick={() => setShowChat(false)}></i>
                                </div>
                                <div className="chat-body">{renderChatContent()}<div ref={chatEndRef} /></div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 2. LIMITS MODAL */}
            {showLimitsModal && (
                <div className="fullscreen-modal animate-slide-up-full">
                    <div className="modal-header">
                        <i className="fas fa-times" onClick={() => setShowLimitsModal(false)}></i>
                        <h2>Configurar Límites</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body">
                        {['Compras Nacionales', 'Compras Internacionales', 'Retiros Cajero (ATM)', 'Compras POS / Web'].map((label, i) => (
                            <div key={i} className="limit-row">
                                <div className="limit-label"><span>{label}</span> <span>S/ 2000</span></div>
                                <input type="range" min="0" max="5000" className="limit-slider" />
                            </div>
                        ))}
                        <button className="btn-cta full-width" onClick={() => {setShowLimitsModal(false); showToast("Límites actualizados correctamente", 'info');}}>Guardar Cambios</button>
                    </div>
                </div>
            )}

            {/* 3. BLOCK CARD MODAL */}
            {showBlockModal && (
                <div className="fullscreen-modal animate-slide-up-full">
                    <div className="modal-header">
                        <i className="fas fa-times" onClick={() => setShowBlockModal(false)}></i>
                        <h2>Bloquear Tarjeta</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body" style={{display:'flex', flexDirection:'column', gap:'15px', justifyContent:'center'}}>
                        <div style={{textAlign:'center', marginBottom:'20px', color:'#666'}}>
                            <i className="fas fa-lock" style={{fontSize:'3rem', color:'var(--blue)', marginBottom:'15px'}}></i>
                            <p>Seleccione el tipo de bloqueo que desea aplicar a su tarjeta terminada en 3027.</p>
                        </div>
                        <button className="btn-cta-outline" onClick={handleBlockSubmit}>Bloqueo Temporal</button>
                        <button className="btn-cta-red" onClick={handleBlockSubmit}>Bloqueo Permanente (Robo/Pérdida)</button>
                    </div>
                </div>
            )}

            {/* 4. TRANSFER MODAL */}
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
                                    <select className="dash-input">
                                        <option>Seleccionar Banco</option><option>BCP</option><option>BBVA</option><option>Interbank</option><option>Scotiabank</option><option>Banco de la Nación</option>
                                    </select>
                                </div>
                            )}
                            <div className="input-group"><label>Número de Cuenta</label><input type="number" className="dash-input" placeholder="0000 0000 0000" /></div>
                            <div className="input-group"><label>Confirmar Cuenta</label><input type="number" className="dash-input" placeholder="Repita el número" /></div>
                            <div className="input-group"><label>Nombre del Beneficiario</label><input type="text" className="dash-input" placeholder="Nombre completo" /></div>
                            <div className="input-group"><label>Monto a Transferir (S/)</label><input type="number" className="dash-input" placeholder="0.00" /></div>
                            <div className="input-group"><label>Motivo</label><input type="text" className="dash-input" placeholder="Ej. Alquiler" /></div>
                            <button className="btn-cta full-width" style={{marginTop:'20px'}} onClick={handleTransferSubmit}>Enviar Dinero</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. HISTORY MODAL */}
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

            {/* 6. DATE PICKER */}
            {showDateSelect && (
                <div className="modal-overlay" onClick={() => setShowDateSelect(false)}>
                    <div className="date-picker-box" onClick={e => e.stopPropagation()}>
                        <h3>Seleccionar Periodo</h3>
                        <input type="date" className="date-input" onChange={onDateSelected} />
                        <button className="btn-close-text" onClick={() => setShowDateSelect(false)}>Cancelar</button>
                    </div>
                </div>
            )}

            {/* Mobile Navigation */}
            <nav className="mobile-bottom-nav mobile-only">
                <div className="nav-item" onClick={goToHome}><i className="fas fa-home"></i><span>Inicio</span></div>
                <div className="nav-item active"><i className="fas fa-wallet"></i><span>Cuentas</span></div>
                <div className="nav-item" onClick={() => setShowCardModal(true)}><i className="fas fa-credit-card"></i><span>Tarjetas</span></div>
                <div className="nav-item" onClick={() => setShowTransferModal(true)}><i className="fas fa-exchange-alt"></i><span>Transf.</span></div>
            </nav>
        </div>
    );
}