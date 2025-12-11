import React, { useState, useEffect } from 'react';

// --- Header (Logo Above Name) ---
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

// --- Footer (Unchanged) ---
export const SimpleFooter = () => (
    <footer className="simple-footer">
        <div className="container footer-grid">
            <div><h4>Sobre Nosotros</h4><a href="#">Misión y Visión</a><a href="#">Medios de Prensa</a></div>
            <div><h4>Servicios</h4><a href="#">Pagos en Línea</a><a href="#">Tasas de Interés</a></div>
            <div><h4>Ayuda y Legal</h4><a href="#">Preguntas Frecuentes</a><a href="#">Política de Privacidad</a></div>
            <div>
                <h4>Soporte</h4>
                <p><i className="fas fa-phone-alt" style={{color:'#fca311'}}></i> (511) 613 2000</p>
                <p><i className="fas fa-map-marker-alt" style={{color:'#fca311'}}></i> Carabayllo, Lima Province</p>
            </div>
        </div>
        <div className="footer-bottom">&copy; 2025 Andes Prime Bank. Secure Digital Banking in Peru.</div>
    </footer>
);

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

                {/* New Feature Grid with Boxes */}
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

                {/* Redesigned Info Section & Security Box */}
                <div className="container info-layout">
                    <div className="news-section">
                        <h3 className="section-title">Novedades y Promociones</h3>
                        <div className="news-grid">
                            <div className="news-card">
                                <img src="https://images.unsplash.com/photo-1579621970563-ebec7560eb3e?q=80&w=1000&auto=format&fit=crop" alt="Savings" />
                                <div className="news-content">
                                    <h4>Nueva Tasa Preferencial de Ahorro</h4>
                                    <p className="date">Publicado: Diciembre 10, 2025</p>
                                </div>
                            </div>
                            <div className="news-card">
                                <img src="https://images.unsplash.com/photo-1560472324-4c130a91c603?q=80&w=1000&auto=format&fit=crop" alt="Mortgage" />
                                <div className="news-content">
                                    <h4>Campaña de Crédito Hipotecario 2026</h4>
                                    <p className="date">Publicado: Noviembre 25, 2025</p>
                                </div>
                            </div>
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