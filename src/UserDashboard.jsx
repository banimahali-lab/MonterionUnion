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
    const [transferTab, setTransferTab] = useState('andes'); // Keep var name, change text
    const [showFullAccount, setShowFullAccount] = useState(false);

    // --- Toast State ---
    const [toast, setToast] = useState({ msg: '', type: '' });

    // --- Chatbot States ---
    const [showChat, setShowChat] = useState(false);
    const [chatStep, setChatStep] = useState('init');
    const [selectedTx, setSelectedTx] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (user) {
            getDoc(doc(db, "users", user.uid))
                .then(s => {
                    if (s.exists()) {
                        setData(s.data());
                    } else {
                        console.error("User document not found.");
                        setData({ error: true });
                    }
                })
                .catch(err => {
                    console.error("Error fetching user data:", err);
                    setData({ error: true });
                });
        }
    }, [user]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatStep, showChat]);

    // --- HELPERS ---

    // DYNAMIC ACCOUNT NUMBER LOGIC (7700 + Alphabet Index for Monterion)
    const getCalculatedAccountNumber = () => {
        if (!data || !data.name) return "0000000000";
        const firstName = data.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
        let accNum = "7700";
        for (let i = 0; i < firstName.length; i++) {
            accNum += (firstName.charCodeAt(i) - 96);
        }
        return accNum;
    };

    const calculatedAccNum = getCalculatedAccountNumber();
    const displayAccNum = showFullAccount
        ? calculatedAccNum
        : `**** ${calculatedAccNum.slice(-4)}`;

    const showToast = (msg, type = 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: '' }), 4000);
    };

    // Translated Toast Messages
    const handleApplyCard = () => showToast("Ndalama zosakwanira kupempha khadi latsopano.", 'error');
    const handleMaintenance = () => showToast("Makina akukonzedwa. Yesani nthawi ina.", 'info');
    const handleStatementClick = () => setShowDateSelect(true);
    const onDateSelected = () => {
        setShowDateSelect(false);
        showToast("Akaunti yanu ndi yatsopano kwambiri. Dikirani masiku ochepa.", 'error');
    };
    const handleTransferSubmit = () => showToast("Ndalama zosakwanira kuti mutumize.", 'error');
    const handleBlockSubmit = () => {
        setShowBlockModal(false);
        showToast("Pempho lanu lakonzedwa. Mudzalandira uthenga posachedwa.", 'info');
    };

    // --- CHATBOT CONTENT (Translated to Chichewa) ---
    const resetChat = () => { setChatStep('init'); setSelectedTx(null); };
    const renderChatContent = () => {
        switch (chatStep) {
            case 'init':
                return (
                    <div className="chat-options">
                        <p className="bot-msg">Moni! Ndine wothandizira wanu. Ndingakuthandizeni bwanji lero?</p>
                        <button onClick={() => setChatStep('call_support')}>Zovuta za Akaunti</button>
                        <button onClick={() => setChatStep('list_tx')}>Zovuta pa Zochitika</button>
                        <button onClick={() => setChatStep('call_support')}>Nambala Yothandizira</button>
                        <button onClick={() => setChatStep('call_support')}>Zina</button>
                    </div>
                );
            case 'call_support':
                return (
                    <div className="chat-msg-box">
                        <p className="bot-msg">Pa mafunso amtunduwu, chonde lemberani gulu lathu lothandizira mwachindunji.</p>
                        <div className="contact-card-chat">
                            <i className="fas fa-headset"></i><strong>+265 1 234 567</strong>
                        </div>
                        <button className="chat-back-btn" onClick={resetChat}>Bwererani Koyamba</button>
                    </div>
                );
            case 'list_tx':
                return (
                    <div className="chat-options">
                        <p className="bot-msg">Sankhani zomwe zakuvutani:</p>
                        {data.transactionHistory?.slice(0, 4).map((t, i) => (
                            <button key={i} className="tx-chat-btn" onClick={() => { setSelectedTx(t); setChatStep('tx_options'); }}>
                                <span>{t.description}</span><strong>MWK {Math.abs(t.amount)}</strong>
                            </button>
                        ))}
                        <button className="chat-back-btn" onClick={resetChat}>Letsani</button>
                    </div>
                );
            case 'tx_options':
                return (
                    <div className="chat-options">
                        <p className="bot-msg">Mwasankha: <strong>{selectedTx.description}</strong>. Vuto ndi chiyani?</p>
                        <button onClick={() => setChatStep('form')}>Pemphani Kubwezeredwa Ndalama</button>
                        <button onClick={() => setChatStep('not_received')}>Sindinalandire Katundu</button>
                        <button onClick={() => setChatStep('form')}>Nenani za Chinyengo</button>
                    </div>
                );
            case 'not_received':
                return (
                    <div className="chat-msg-box">
                        <p className="bot-msg">Chonde funsani wogulitsa kaye ndi nambala iyi ya ID:</p>
                        <div className="static-id-box">TXN-{Math.floor(100000 + Math.random() * 900000)}</div>
                        <p className="bot-msg">Ngati sayankha m'maola 48, lumikizanani nafe kachiwiri.</p>
                        <button className="chat-back-btn" onClick={resetChat}>Ndamva</button>
                    </div>
                );
            case 'form':
                return (
                    <div className="chat-form">
                        <p className="bot-msg">Tamva. Chonde fotokozani mwachidule vutolo:</p>
                        <textarea placeholder="Lembani pano..." rows="3"></textarea>
                        <button onClick={() => setChatStep('final')}>Tumizani Lipoti</button>
                    </div>
                );
            case 'final':
                return (
                    <div className="chat-msg-box">
                        <i className="fas fa-check-circle success-icon-chat"></i>
                        <p className="bot-msg">Talandira lipoti lanu. Gulu lathu lidzawunika ndikuthetsa posachedwa.</p>
                        <button className="chat-back-btn" onClick={() => setShowChat(false)}>Tsekani</button>
                    </div>
                );
            default: return null;
        }
    };

    if (!data) return <div className="loading-state"><div className="spinner"><i className="fas fa-circle-notch fa-spin"></i></div></div>;

    if (data.error) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--off-white)', textAlign: 'center', padding: '20px' }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: '#e74c3c', marginBottom: '15px' }}></i>
                <h2 style={{ color: 'var(--deep-blue)', fontFamily: 'Montserrat, sans-serif' }}>Mbiri Sanapezeke</h2>
                <p style={{ color: '#555', maxWidth: '400px', margin: '10px 0 20px 0' }}>Talephera kutsegula akaunti yanu. Mwina inalembetsedwa mosakwanira kapena pali vuto pa intaneti.</p>
                <button onClick={onLogout} style={{ padding: '12px 24px', background: 'var(--deep-blue)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Tulukani</button>
            </div>
        );
    }

    const firstName = data.name ? data.name.split(' ')[0] : 'Wosuta';
    const bankBalance = data.bankBalance || 0;

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
                    <i className="fas fa-landmark fa-2x"></i>
                    <span>Monterion Union</span>
                </div>
                <div className="user-profile-snippet">
                    <div className="avatar-circle">{firstName[0]}</div>
                    <div className="user-info"><strong>{firstName}</strong></div>
                </div>
                <ul className="dash-menu">
                    <li className="active"><i className="fas fa-table-cells-large"></i> Chidule</li>
                    <li><i className="fas fa-building-columns"></i> Maakaunti Anga</li>
                    <li onClick={() => setShowCardModal(true)}><i className="fas fa-credit-card"></i> Makhadi</li>
                    <li onClick={() => setShowTransferModal(true)}><i className="fas fa-paper-plane"></i> Kutumiza</li>
                </ul>
                <button onClick={onLogout} className="btn-logout"><i className="fas fa-arrow-right-from-bracket"></i> Tulukani</button>
            </nav>

            {/* Mobile Header */}
            <header className="mobile-header mobile-only">
                <div className="mobile-user">
                    <div className="avatar-circle small">{firstName[0]}</div>
                    <span>Moni, {firstName}</span>
                </div>
                <i className="fas fa-arrow-right-from-bracket logout-icon" onClick={onLogout}></i>
            </header>

            <main className="dash-content">
                <div className="welcome-banner mobile-only">
                    <h2>Ndalama Zonse</h2>
                    <h1>MWK {bankBalance.toFixed(2)}</h1>
                </div>

                <div className="desktop-only dash-header"><h2>Chidule cha Katundu</h2></div>

                {/* Account Cards */}
                <div className="account-cards-grid">
                    {/* --- PRIMARY CARD (White theme) --- */}
                    <div className="bank-card gold-card animate-slide-up"
                         onClick={() => setShowFullAccount(!showFullAccount)}
                         style={{cursor: 'pointer'}}>
                        <div className="card-top"><span>Savings</span> <i className="fas fa-wifi"></i></div>
                        <div className="card-balance">
                            <small className="desktop-only">Ndalama Zomwe Zilipo</small>
                            <h3>MWK {bankBalance.toFixed(2)}</h3>
                        </div>
                        <div className="card-bottom">
                            <span style={{fontFamily: 'monospace', fontSize: '1.1rem'}}>{displayAccNum}</span>
                            <span>{data.name ? data.name.toUpperCase() : 'WOSUTA'}</span>
                        </div>
                    </div>

                    {/* --- SECONDARY CARD: VISA (Deep Blue theme) --- */}
                    <div className="bank-card blue-card animate-slide-up delay-1" onClick={() => setShowCardModal(true)} style={{cursor:'pointer'}}>
                        <div className="card-top"><span>Visa Debit</span> <i className="fab fa-cc-visa fa-lg"></i></div>
                        <div className="card-number" style={{letterSpacing: '3px'}}>4832 9320 0052 3027</div>
                        <div className="card-bottom"><span>06/32</span> <span>CVV ***</span></div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions animate-slide-up delay-2">
                    <h3 className="section-title-sm">Zochitika Zofunika</h3>
                    <div className="action-buttons">
                        <button className="action-btn" onClick={() => setShowTransferModal(true)}>
                            <div className="icon-box"><i className="fas fa-paper-plane"></i></div>
                            <span>Kutumiza</span>
                        </button>
                        <button className="action-btn" onClick={handleMaintenance}>
                            <div className="icon-box"><i className="fas fa-file-invoice"></i></div>
                            <span>Mabilu</span>
                        </button>
                        <button className="action-btn" onClick={handleStatementClick}>
                            <div className="icon-box"><i className="fas fa-chart-pie"></i></div>
                            <span>Sititimenti</span>
                        </button>
                        <button className="action-btn" onClick={handleApplyCard}>
                            <div className="icon-box"><i className="fas fa-plus-circle"></i></div>
                            <span>Khadi Latsopano</span>
                        </button>
                    </div>
                </div>

                {/* Transactions Preview */}
                <div className="transactions-section animate-slide-up delay-3">
                    <div className="section-header" onClick={() => setShowHistoryModal(true)} style={{display:'flex', justifyContent:'space-between', cursor:'pointer', marginBottom: '20px'}}>
                        <h3 style={{margin:0, color:'var(--deep-blue)'}}>Mbiri Ya Zochitika</h3>
                        <span style={{color:'var(--text-muted)', fontSize:'0.85rem', fontWeight:'500'}}>Onani Zonse <i className="fas fa-chevron-right"></i></span>
                    </div>
                    <div className="tx-list">
                        {data.transactionHistory?.slice(0, 3).map((t, i) => (
                            <div key={i} className="tx-item">
                                <div className={`tx-icon-circle ${t.amount < 0 ? 'out' : 'in'}`}><i className={`fas fa-${t.amount < 0 ? 'bag-shopping' : 'arrow-down'}`}></i></div>
                                <div className="tx-details"><strong>{t.description}</strong><small>{t.date}</small></div>
                                <span className={t.amount < 0 ? 'amount-neg' : 'amount-pos'}>{t.amount < 0 ? '-' : '+'} MWK {Math.abs(t.amount).toFixed(2)}</span>
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
                        <h2>Kuwongolera Khadi</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body card-manage-body">
                        <div className="cards-carousel">
                            <div className={`flip-card-container ${isCardFlipped ? 'flipped' : ''}`} onClick={() => setIsCardFlipped(!isCardFlipped)}>
                                <div className="flip-card-inner">
                                    <div className="flip-card-front blue-card">
                                        <div className="card-top"><span>Visa Debit</span> <i className="fab fa-cc-visa fa-lg"></i></div>
                                        <div className="card-number" style={{letterSpacing: '2px', fontSize: '1.2rem'}}>4832 9320 0052 3027</div>
                                        <div className="card-bottom"><span>06/32</span><span>{data.name ? data.name.toUpperCase() : 'WOSUTA'}</span></div>
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
                                <span>Pemphani Khadi Latsopano</span>
                            </div>
                        </div>

                        <div className="manage-options-grid">
                            <div className="manage-option-item" onClick={() => setShowLimitsModal(true)}>
                                <div className="manage-icon"><i className="fas fa-sliders-h"></i></div><span>Malire</span>
                            </div>
                            <div className="manage-option-item" onClick={() => setShowBlockModal(true)}>
                                <div className="manage-icon"><i className="fas fa-lock"></i></div><span>Tsekani</span>
                            </div>
                            <div className="manage-option-item" onClick={() => setShowHistoryModal(true)}>
                                <div className="manage-icon"><i className="fas fa-list-ul"></i></div><span>Zochitika</span>
                            </div>
                            <div className="manage-option-item" onClick={() => {setShowChat(true); resetChat();}}>
                                <div className="manage-icon" style={{color:'var(--deep-blue)'}}><i className="fas fa-headset"></i></div><span>Thandizo</span>
                            </div>
                        </div>

                        {showChat && (
                            <div className="chat-overlay animate-slide-up">
                                <div className="chat-header">
                                    <div className="bot-profile"><div className="bot-avatar"><i className="fas fa-robot"></i></div><span>Wothandizira wa Monterion</span></div>
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
                        <h2>Kusintha Malire</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body">
                        {['Kugula mdziko muno', 'Kugula kunja', 'Kutenga pa ATM', 'Kugula pa intaneti'].map((label, i) => (
                            <div key={i} className="limit-row">
                                <div className="limit-label"><span>{label}</span> <span>MWK 200,000</span></div>
                                <input type="range" min="0" max="500000" className="limit-slider" />
                            </div>
                        ))}
                        <button className="btn-cta full-width" onClick={() => {setShowLimitsModal(false); showToast("Malire asinthidwa", 'info');}}>Sungani</button>
                    </div>
                </div>
            )}

            {/* 3. BLOCK CARD MODAL */}
            {showBlockModal && (
                <div className="fullscreen-modal animate-slide-up-full">
                    <div className="modal-header">
                        <i className="fas fa-times" onClick={() => setShowBlockModal(false)}></i>
                        <h2>Tsekani Khadi</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body" style={{display:'flex', flexDirection:'column', gap:'15px', justifyContent:'center'}}>
                        <div style={{textAlign:'center', marginBottom:'20px', color:'#666'}}>
                            <i className="fas fa-shield-halved" style={{fontSize:'3rem', color:'var(--deep-blue)', marginBottom:'15px'}}></i>
                            <p>Sankhani mtundu wa kutseka pa khadi lanu lomaliza ndi 3027.</p>
                        </div>
                        <button className="btn-cta-outline" onClick={handleBlockSubmit}>Kutseka Kwakanthawi</button>
                        <button className="btn-cta-red" onClick={handleBlockSubmit}>Kutseka Kwathunthu (Kuba/Kutaya)</button>
                    </div>
                </div>
            )}

            {/* 4. TRANSFER MODAL */}
            {showTransferModal && (
                <div className="fullscreen-modal animate-slide-up-full">
                    <div className="modal-header">
                        <i className="fas fa-times" onClick={() => setShowTransferModal(false)}></i>
                        <h2>Kutumiza Ndalama</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body">
                        <div className="transfer-tabs">
                            <button className={`tab-btn ${transferTab === 'andes' ? 'active' : ''}`} onClick={()=>setTransferTab('andes')}>Ku Monterion</button>
                            <button className={`tab-btn ${transferTab === 'other' ? 'active' : ''}`} onClick={()=>setTransferTab('other')}>Mabanki Ena</button>
                        </div>
                        <div className="transfer-form">
                            {transferTab === 'other' && (
                                <div className="input-group">
                                    <label>Sankhani Banki</label>
                                    <select className="dash-input">
                                        <option>Sankhani</option><option>National Bank</option><option>Standard Bank</option><option>FDH</option>
                                    </select>
                                </div>
                            )}
                            <div className="input-group"><label>Nambala ya Akaunti</label><input type="number" className="dash-input" placeholder="0000 0000 0000" /></div>
                            <div className="input-group"><label>Tsimikizani Akaunti</label><input type="number" className="dash-input" placeholder="Bwerezani nambala" /></div>
                            <div className="input-group"><label>Dzina la Woulandira</label><input type="text" className="dash-input" placeholder="Dzina lonse" /></div>
                            <div className="input-group"><label>Kuchuluka kwa Ndalama (MWK)</label><input type="number" className="dash-input" placeholder="0.00" /></div>
                            <button className="btn-cta full-width" style={{marginTop:'20px'}} onClick={handleTransferSubmit}>Tumizani Ndalama</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. HISTORY MODAL */}
            {showHistoryModal && (
                <div className="fullscreen-modal animate-slide-up-full">
                    <div className="modal-header">
                        <i className="fas fa-arrow-left" onClick={() => setShowHistoryModal(false)}></i>
                        <h2>Mbiri</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body">
                        <div className="tx-list full-list">
                            {data.transactionHistory?.map((t, i) => (
                                <div key={i} className="tx-item">
                                    <div className={`tx-icon-circle ${t.amount < 0 ? 'out' : 'in'}`}><i className={`fas fa-${t.amount < 0 ? 'bag-shopping' : 'arrow-down'}`}></i></div>
                                    <div className="tx-details"><strong>{t.description}</strong><small>{t.date}</small></div>
                                    <span className={t.amount < 0 ? 'amount-neg' : 'amount-pos'}>{t.amount < 0 ? '-' : '+'} MWK {Math.abs(t.amount).toFixed(2)}</span>
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
                        <h3>Sankhani Nthawi</h3>
                        <input type="date" className="date-input" onChange={onDateSelected} />
                        <button className="btn-close-text" onClick={() => setShowDateSelect(false)}>Letsani</button>
                    </div>
                </div>
            )}

            {/* Mobile Navigation */}
            <nav className="mobile-bottom-nav mobile-only">
                <div className="nav-item" onClick={goToHome}><i className="fas fa-house"></i><span>Koyamba</span></div>
                <div className="nav-item active"><i className="fas fa-building-columns"></i><span>Maakaunti</span></div>
                <div className="nav-item" onClick={() => setShowCardModal(true)}><i className="fas fa-credit-card"></i><span>Makhadi</span></div>
                <div className="nav-item" onClick={() => setShowTransferModal(true)}><i className="fas fa-paper-plane"></i><span>Kutumiza</span></div>
            </nav>
        </div>
    );
}