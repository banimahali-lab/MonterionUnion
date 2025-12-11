import React, { useState, useEffect } from 'react';

// --- Header (Unchanged) ---
export const SimpleHeader = ({ goToHome, isDashboard, goToLogin, goToContact }) => (
    <header className="simple-header">
        <div className="container header-container">
            <div className="logo" onClick={goToHome}>
                <i className="fas fa-mountain fa-2x"></i>
                <h1>Andes Prime Bank</h1>
            </div>
            <nav className="main-nav">
                <a href="#" onClick={(e) => { e.preventDefault(); if(goToLogin) goToLogin(); }}>Personal</a>
                <a href="#" onClick={(e) => { e.preventDefault(); if(goToLogin) goToLogin(); }}>Business</a>
                <a href="#" onClick={(e) => { e.preventDefault(); if(goToLogin) goToLogin(); }}>Investments</a>
                <a href="#" onClick={(e) => { e.preventDefault(); if(goToContact) goToContact(); }}>Contact</a>
            </nav>
            {!isDashboard && goToLogin && (
                <button onClick={goToLogin} className="btn-login-nav">
                    <i className="fas fa-lock"></i> Iniciar Sesión
                </button>
            )}
        </div>
    </header>
);

// --- UPGRADED FOOTER (Handles FAQ, Links & Toasts internally) ---
export const SimpleFooter = () => {
    const [showFaq, setShowFaq] = useState(false);
    const [toast, setToast] = useState('');

    const handleComingSoon = (e) => {
        e.preventDefault();
        setToast('Próximamente...');
        setTimeout(() => setToast(''), 3000);
    };

    return (
        <>
            <footer className="simple-footer">
                <div className="container footer-grid">
                    <div>
                        <h4>Sobre Nosotros</h4>
                        <a href="https://thedocs.worldbank.org/en/doc/088042525556863402-0560011970/original/WorldBankGroupArchivesfolder30307490.pdf" target="_blank" rel="noopener noreferrer">Misión y Visión</a>
                        <a href="#" onClick={handleComingSoon}>Medios de Prensa</a>
                    </div>
                    <div>
                        <h4>Servicios</h4>
                        <a href="#" onClick={handleComingSoon}>Pagos en Línea</a>
                        <a href="#" onClick={handleComingSoon}>Tasas de Interés</a>
                    </div>
                    <div>
                        <h4>Ayuda y Legal</h4>
                        <a href="#" onClick={(e) => { e.preventDefault(); setShowFaq(true); }}>Preguntas Frecuentes</a>
                        <a href="https://perufederal.mymortgage-online.com/PrivacyPolicy.html" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>
                    </div>
                    <div>
                        <h4>Soporte</h4>
                        <p><i className="fas fa-phone-alt" style={{color:'#fca311'}}></i> (511) 613 2000</p>
                        <p><i className="fas fa-map-marker-alt" style={{color:'#fca311'}}></i> Carabayllo, Lima Province</p>
                    </div>
                </div>
                <div className="footer-bottom">&copy; 2025 Andes Prime Bank. Secure Digital Banking in Peru.</div>
            </footer>

            {/* --- INTERNAL TOAST --- */}
            {toast && (
                <div className="toast-notification info animate-slide-up" style={{bottom: '20px', top: 'auto', background: '#333'}}>
                    <i className="fas fa-info-circle"></i> {toast}
                </div>
            )}

            {/* --- FAQ MODAL --- */}
            {showFaq && (
                <div className="fullscreen-modal animate-slide-up-full" style={{zIndex: 9999}}>
                    <div className="modal-header">
                        <i className="fas fa-times" onClick={() => setShowFaq(false)}></i>
                        <h2>Preguntas Frecuentes</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body">
                        <div className="faq-container" style={{maxWidth: '800px', margin: '0 auto'}}>

                            <div className="faq-item">
                                <h3>How can I find my PFSB routing number and account number?</h3>
                                <p>The routing number for Peru Federal Savings Bank is <strong>271973128</strong>. Your account number will be on your check; it is the set of numbers after the routing number.</p>
                            </div>

                            <div className="faq-item">
                                <h3>When will my automatic payments or direct deposits start applying to my account?</h3>
                                <p>It may take 2 to 3 billing cycles for these to switch over. This is why you want to keep some money in your old account to cover any automatic payments. It is also the same for any direct deposits.</p>
                            </div>

                            <div className="faq-item">
                                <h3>What if my requests to change my automatic payments or direct deposits are not accepted?</h3>
                                <p>Companies are instructed to contact you if the request forms are insufficient. We also recommend that you use our Switch Checklist to help keep track of when your transaction have successfully switched to PFSB.</p>
                            </div>

                            <div className="faq-item">
                                <h3>I don’t want to use automatic payments to pay my bills; are there any other payment options?</h3>
                                <p>Yes! Peru Federal Savings Bank offers online banking with bill pay for FREE! Bill pay is a safe & convenient way to pay your bills. Plus, it’s EASY! First sign up for online banking at PeruFederalSavings.com, it will take 24-48 hours for you to be able to access your accounts. Once you have logged in you will be able to view your balances, transfer funds, pay bills, and much more!</p>
                            </div>

                            <div className="faq-item">
                                <h3>How fast can I get new checks for my checking account?</h3>
                                <p>You can order checks through Peru Federal Savings Bank. Checks are usually ready for pickup in 48 hours.</p>
                            </div>

                            <div className="faq-item">
                                <h3>What do I do with my old checks and debit card?</h3>
                                <p>You can bring all of it to one of our locations and we will shred them for you.</p>
                            </div>

                            <div className="faq-item">
                                <h3>How long will it take to receive my debit card?</h3>
                                <p>You may receive your debit card either by mail or via instant issue. Mailed cards take 7 to 10 business days and you will call to activate your card. Instant issue cards are done at the Downtown Office and can be done at account opening. Otherwise, they are ready within 24 hours.</p>
                            </div>

                            <div className="faq-item">
                                <h3>Who do I contact if I have questions?</h3>
                                <p>If you have any questions, you can contact any us at any of our branches. We’d be happy to help!</p>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// --- Homepage ---
export default function App({ goToOpenAccount, goToLogin, goToContact }) {
    const images = [
        "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=2070", // Family
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1932", // Young
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=2070"  // Child+Dog
    ];
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setIdx((p) => (p + 1) % images.length), 4000);
        return () => clearInterval(timer);
    }, []);

    const features = [
        { icon: 'wallet', text: 'Cuentas' },
        { icon: 'credit-card', text: 'Tarjetas de Crédito' },
        { icon: 'chart-line', text: 'Inversiones' },
        { icon: 'exchange-alt', text: 'Transferencias' },
        { icon: 'home', text: 'Préstamos' },
        { icon: 'shield-alt', text: 'Seguros' }
    ];

    return (
        <>
            <SimpleHeader goToHome={goToOpenAccount} goToLogin={goToLogin} goToContact={goToContact} />
            <main>
                {/* Hero Section */}
                <div className="hero-section">
                    {images.map((img, i) => (
                        <div key={i} className={`hero-slide ${i === idx ? 'active' : ''}`} style={{backgroundImage: `url('${img}')`}} />
                    ))}
                    <div className="hero-overlay">
                        <div className="container hero-content">
                            <h1>Building a better future for your family.</h1>
                            <p>Trusted by millions in Peru. Secure, digital, and always by your side.</p>
                            <button onClick={goToOpenAccount} className="btn-cta">Abrir Cuenta Ahora</button>
                        </div>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="container feature-section">
                    <div className="feature-grid-box">
                        {features.map((item, i) => (
                            <div key={i} className="feature-card" onClick={goToLogin}>
                                <div className="icon-wrapper">
                                    <i className={`fas fa-${item.icon}`}></i>
                                </div>
                                <p>{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Section & News */}
                <div className="container info-layout">
                    <div className="news-section">
                        <h3 className="section-title">Novedades y Promociones</h3>
                        <div className="news-grid">

                            {/* News Link 1 */}
                            <a href="https://www.bcrp.gob.pe/eng-docs/Publications/Weekly-Reports/2025/weekly-report-2025-11-27.pdf" target="_blank" rel="noopener noreferrer" className="news-card">
                                <img src="https://images.unsplash.com/photo-1579621970563-ebec7560eb3e?q=80&w=1000&auto=format&fit=crop" alt="Savings" />
                                <div className="news-content">
                                    <h4>Reporte Semanal: Nov 27, 2025</h4>
                                    <p className="date">Publicado: Diciembre 10, 2025</p>
                                </div>
                            </a>

                            {/* News Link 2 */}
                            <a href="https://www.bcrp.gob.pe/eng-docs/Publications/Weekly-Reports/2025/weekly-report-2025-11-20.pdf" target="_blank" rel="noopener noreferrer" className="news-card">
                                <img src="https://images.unsplash.com/photo-1560472324-4c130a91c603?q=80&w=1000&auto=format&fit=crop" alt="Mortgage" />
                                <div className="news-content">
                                    <h4>Reporte Semanal: Nov 20, 2025</h4>
                                    <p className="date">Publicado: Noviembre 25, 2025</p>
                                </div>
                            </a>

                        </div>
                    </div>

                    <div className="security-section">
                        <div className="security-box">
                            <i className="fas fa-shield-alt security-icon"></i>
                            <h3>TU SEGURIDAD ES PRIMERO</h3>
                            <h4>ALTO AL FRAUDE</h4>
                            <p>Aprende a reconocer estafas y protege tu información.</p>
                            <a href="https://www.cgap.org/sites/default/files/CGAP-Financial-Inclusion-and-Consumer-Protection-in-Peru-Feb-2010.pdf" target="_blank" rel="noopener noreferrer" className="btn-security">
                                Más información
                            </a>
                        </div>
                    </div>
                </div>
            </main>
            <SimpleFooter />
        </>
    );
}