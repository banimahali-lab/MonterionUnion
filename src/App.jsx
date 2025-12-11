import React, { useState, useEffect } from 'react';

// --- Header ---
export const SimpleHeader = ({ goToHome, isDashboard, goToLogin, goToContact }) => (
    <header className="simple-header">
        <div className="container header-container">
            <div className="logo" onClick={goToHome}>
                <i className="fas fa-mountain"></i> <h1>Andes Prime Bank</h1>
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

// --- Footer ---
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

    return (
        <>
            <SimpleHeader goToHome={goToOpenAccount} goToLogin={goToLogin} goToContact={goToContact} />
            <main>
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

                <div className="container feature-grid">
                    {['Accounts','Credit Cards','Investments','Transfers','Loans','Insurance'].map((item, i) => (
                        <div key={i} className="feature-item" onClick={goToLogin}>
                            <i className={`fas fa-${['wallet','credit-card','chart-line','exchange-alt','home','shield-alt'][i]}`}></i>
                            <p>{item}</p>
                        </div>
                    ))}
                </div>

                <div className="container info-section">
                    <div className="info-box">
                        <h3>Novedades y Promociones</h3>
                        <h4>Nueva Tasa Preferencial</h4>
                        <p>Publicado: Diciembre 10, 2025</p>
                    </div>
                    <div className="info-box security">
                        <h3><i className="fas fa-shield-alt"></i> ALTO AL FRAUDE</h3>
                        <p>Protege tu información.</p>
                        <a href="https://www.cgap.org/sites/default/files/CGAP-Financial-Inclusion-and-Consumer-Protection-in-Peru-Feb-2010.pdf" target="_blank" className="btn-link">Más información</a>
                    </div>
                </div>
            </main>
            <SimpleFooter />
        </>
    );
}