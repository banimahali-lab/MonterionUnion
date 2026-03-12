import React, { useState, useEffect } from 'react';

// --- Modern Glassmorphism Header ---
export const SimpleHeader = ({ goToHome, isDashboard, goToLogin, goToContact }) => (
    <header className="modern-header">
        <div className="container header-container">
            <div className="logo" onClick={goToHome}>
                <div className="logo-icon"><i className="fas fa-landmark"></i></div>
                <h1>Monterion Union</h1>
            </div>
            <nav className="main-nav">
                <a href="#" onClick={(e) => { e.preventDefault(); if(goToLogin) goToLogin(); }}>Zaumwini</a>
                <a href="#" onClick={(e) => { e.preventDefault(); if(goToLogin) goToLogin(); }}>Zamalonda</a>
                <a href="#" onClick={(e) => { e.preventDefault(); if(goToLogin) goToLogin(); }}>Ndalama</a>
                <a href="#" onClick={(e) => { e.preventDefault(); if(goToContact) goToContact(); }}>Lumikizanani</a>
            </nav>
            {!isDashboard && goToLogin && (
                <div className="header-actions">
                    <button onClick={goToLogin} className="btn-login-outline">Lowani</button>
                    <button onClick={goToHome} className="btn-login-solid desktop-only">Tsegulani Akaunti</button>
                </div>
            )}
        </div>
    </header>
);

// --- Footer (Unchanged structure, refined classes) ---
export const SimpleFooter = () => {
    const [showFaq, setShowFaq] = useState(false);
    const [toast, setToast] = useState('');

    const handleComingSoon = (e) => {
        e.preventDefault();
        setToast('Zikubwera posachedwa...');
        setTimeout(() => setToast(''), 3000);
    };

    return (
        <>
            <footer className="simple-footer">
                <div className="container footer-grid">
                    <div className="footer-brand">
                        <h2><i className="fas fa-landmark"></i> Monterion Union</h2>
                        <p>Banki yanu yodalirika ya digito. Ndalama zanu zili m'manja abwino.</p>
                    </div>
                    <div>
                        <h4>Kampani</h4>
                        <a href="#" onClick={handleComingSoon}>Cholinga Chathu</a>
                        <a href="#" onClick={handleComingSoon}>Nkhani</a>
                    </div>
                    <div>
                        <h4>Zofunika</h4>
                        <a href="#" onClick={(e) => { e.preventDefault(); setShowFaq(true); }}>Mafunso Ofunsidwa</a>
                        <a href="#" onClick={handleComingSoon}>Zinsinsi Zathu</a>
                    </div>
                    <div>
                        <h4>Lumikizanani</h4>
                        <p><i className="fas fa-phone-alt"></i> +265 1 897 457</p>
                        <p><i className="fas fa-map-marker-alt"></i> Lilongwe, Malawi</p>
                    </div>
                </div>
                <div className="footer-bottom">&copy; 2026 Monterion Union. Ufulu wonse ndi wotetezedwa.</div>
            </footer>

            {/* Toast & FAQ Modals remain the same... */}
            {toast && (
                <div className="toast-notification info animate-slide-up" style={{bottom: '20px', top: 'auto', zIndex: 9999}}>
                    <i className="fas fa-info-circle"></i> {toast}
                </div>
            )}
        </>
    );
};

// --- Homepage (COMPLETELY REDESIGNED) ---
export default function App({ goToOpenAccount, goToLogin, goToContact }) {

    return (
        <div className="home-wrapper">
            <SimpleHeader goToHome={goToOpenAccount} goToLogin={goToLogin} goToContact={goToContact} />

            <main>
                {/* 1. MODERN SPLIT HERO SECTION */}
                <section className="hero-modern">
                    <div className="container hero-grid">
                        <div className="hero-text-content animate-slide-up">
                            <div className="badge-pill">Banki Ya Digito #1 ku Malawi</div>
                            <h1 className="hero-title">Lamulirani Tsogolo Lanu la <span className="text-highlight">Zachuma</span></h1>
                            <p className="hero-subtitle">
                                Tsegulani akaunti mu mphindi zochepa. Tumizani ndalama, sungani, ndikugula zinthu pa intaneti mosavuta ndi chitetezo chapamwamba kwambiri.
                            </p>
                            <div className="hero-buttons">
                                <button onClick={goToOpenAccount} className="btn-primary-large">
                                    Yambani Tsopano <i className="fas fa-arrow-right"></i>
                                </button>
                                <button onClick={goToLogin} className="btn-secondary-large">
                                    Lowani mu Akaunti
                                </button>
                            </div>
                            <div className="hero-trust">
                                <div className="avatars">
                                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User" />
                                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="User" />
                                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="User" />
                                </div>
                                <span>Yodalirika ndi ogwiritsa ntchito <strong>2+ Miliyoni</strong></span>
                            </div>
                        </div>

                        <div className="hero-visual-content animate-slide-up delay-2">
                            <div className="visual-composition">
                                <img className="main-img" src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1000&auto=format&fit=crop" alt="Corporate Banking" />
                                <div className="floating-card top-card">
                                    <i className="fas fa-shield-halved text-blue"></i> Chitetezo 100%
                                </div>
                                <div className="floating-card bottom-card">
                                    <div className="chart-bars">
                                        <div className="bar b1"></div><div className="bar b2"></div><div className="bar b3"></div>
                                    </div>
                                    Kukula kwa Chuma
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. STATS STRIP */}
                <section className="stats-strip">
                    <div className="container stats-container">
                        <div className="stat-box"><h2>$5B+</h2><p>Zosungidwa</p></div>
                        <div className="stat-box"><h2>0%</h2><p>Malipiro Obisika</p></div>
                        <div className="stat-box"><h2>24/7</h2><p>Thandizo</p></div>
                        <div className="stat-box"><h2>50+</h2><p>Nthambi</p></div>
                    </div>
                </section>

                {/* 3. BENTO BOX FEATURES GRID */}
                <section className="bento-section">
                    <div className="container">
                        <div className="section-heading center">
                            <h2>Zomwe Timapereka</h2>
                            <p>Mwayi waukulu woyang'anira ndalama zanu pa foni yanu.</p>
                        </div>

                        <div className="bento-grid">
                            <div className="bento-item large-card" onClick={goToLogin}>
                                <div className="bento-icon"><i className="fas fa-paper-plane"></i></div>
                                <h3>Kutumiza Ndalama Mwachangu</h3>
                                <p>Tumizani ndalama kubanki ina iliyonse mdziko muno popanda kuchedwa. Imagwira ntchito nthawi yomweyo.</p>
                                <img src="https://images.unsplash.com/photo-1616077168712-fc6c788db4af?q=80&w=800&auto=format&fit=crop" alt="Transfer" className="bento-img" />
                            </div>

                            <div className="bento-item" onClick={goToLogin}>
                                <div className="bento-icon"><i className="fas fa-credit-card"></i></div>
                                <h3>Makhadi a Ngongole</h3>
                                <p>Pezani makhadi a Visa omwe ali otetezeka komanso olandiridwa kulikonse.</p>
                            </div>

                            <div className="bento-item deep-blue-bg" onClick={goToLogin}>
                                <div className="bento-icon white-icon"><i className="fas fa-chart-line"></i></div>
                                <h3>Ndalama Zosungitsa</h3>
                                <p>Pindulani ndi chiwongoladzanja chapamwamba pa ndalama zanu zosungidwa.</p>
                            </div>

                            <div className="bento-item wide-card" onClick={goToLogin}>
                                <div className="bento-content-row">
                                    <div>
                                        <div className="bento-icon"><i className="fas fa-house-chimney"></i></div>
                                        <h3>Ngongole Zanyumba</h3>
                                        <p>Gulani nyumba yanu yamaloto ndi ngongole zathu zotsika mtengo.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. CALL TO ACTION / APP PROMO */}
                <section className="app-promo-section">
                    <div className="container app-promo-box">
                        <div className="app-promo-text">
                            <h2>Banki yanu pa foni yanu</h2>
                            <p>Koperani pulogalamu yathu lero kuti muzitha kugwiritsa ntchito banki yanu kulikonse komanso nthawi ina iliyonse.</p>
                            <div className="store-buttons">
                                <button className="store-btn"><i className="fab fa-apple"></i> App Store</button>
                                <button className="store-btn"><i className="fab fa-google-play"></i> Google Play</button>
                            </div>
                        </div>
                        <div className="app-promo-image">
                            {/* Abstract Phone Mockup shapes */}
                            <div className="mockup-frame">
                                <div className="mockup-screen">
                                    <div className="mockup-header"></div>
                                    <div className="mockup-card"></div>
                                    <div className="mockup-row"></div>
                                    <div className="mockup-row"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <SimpleFooter />
        </div>
    );
}