import React, { useState, useEffect } from 'react';

// --- Header ---
export const SimpleHeader = ({ goToHome, isDashboard, goToLogin, goToContact }) => (
    <header className="simple-header">
        <div className="container header-container">
            <div className="logo" onClick={goToHome}>
                <i className="fas fa-landmark fa-2x"></i>
                <h1>Monterion Union</h1>
            </div>
            <nav className="main-nav">
                <a href="#" onClick={(e) => { e.preventDefault(); if(goToLogin) goToLogin(); }}>Zaumwini</a>
                <a href="#" onClick={(e) => { e.preventDefault(); if(goToLogin) goToLogin(); }}>Zamalonda</a>
                <a href="#" onClick={(e) => { e.preventDefault(); if(goToLogin) goToLogin(); }}>Ndalama Zosungitsa</a>
                <a href="#" onClick={(e) => { e.preventDefault(); if(goToContact) goToContact(); }}>Lumikizanani Nafe</a>
            </nav>
            {!isDashboard && goToLogin && (
                <button onClick={goToLogin} className="btn-login-nav">
                    <i className="fas fa-arrow-right-to-bracket"></i> Lowani
                </button>
            )}
        </div>
    </header>
);

// --- Footer ---
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
                    <div>
                        <h4>Zokhudza Ife</h4>
                        <a href="#" onClick={handleComingSoon}>Cholinga ndi Masomphenya</a>
                        <a href="#" onClick={handleComingSoon}>Nkhani</a>
                    </div>
                    <div>
                        <h4>Ntchito Zathu</h4>
                        <a href="#" onClick={handleComingSoon}>Malipiro a pa intaneti</a>
                        <a href="#" onClick={handleComingSoon}>Mitengo ya chiwongoladzanja</a>
                    </div>
                    <div>
                        <h4>Thandizo ndi Zovomerezeka</h4>
                        <a href="#" onClick={(e) => { e.preventDefault(); setShowFaq(true); }}>Mafunso Ofunsidwa Kawirikawiri</a>
                        <a href="#" onClick={handleComingSoon}>Ndondomeko ya Zinsinsi</a>
                    </div>
                    <div>
                        <h4>Thandizo</h4>
                        <p><i className="fas fa-phone-alt"></i> +265 1 234 567</p>
                        <p><i className="fas fa-map-marker-alt"></i> Lilongwe, Malawi</p>
                    </div>
                </div>
                <div className="footer-bottom">&copy; 2026 Monterion Union. Chitetezo Cha Digito Pantchito Za Banki.</div>
            </footer>

            {/* --- INTERNAL TOAST --- */}
            {toast && (
                <div className="toast-notification info animate-slide-up" style={{bottom: '20px', top: 'auto'}}>
                    <i className="fas fa-info-circle"></i> {toast}
                </div>
            )}

            {/* --- FAQ MODAL --- */}
            {showFaq && (
                <div className="fullscreen-modal animate-slide-up-full" style={{zIndex: 9999}}>
                    <div className="modal-header">
                        <i className="fas fa-times" onClick={() => setShowFaq(false)}></i>
                        <h2>Mafunso Ofunsidwa Kawirikawiri</h2>
                        <div style={{width:'20px'}}></div>
                    </div>
                    <div className="modal-body">
                        <div className="faq-container" style={{maxWidth: '800px', margin: '0 auto'}}>
                            <div className="faq-item">
                                <h3>Kodi ndingapeze bwanji nambala yanga ya akaunti ya Monterion Union?</h3>
                                <p>Nambala yanu ya njira (routing number) ndi <strong>271973128</strong>. Nambala yanu ya akaunti idzakhala mu dashboard yanu mukalowamo.</p>
                            </div>
                            <div className="faq-item">
                                <h3>Bwanji ngati sindingathe kulipira pamwezi basi?</h3>
                                <p>Monterion Union imapereka banki ya pa intaneti yaulere yomwe ingakuthandizeni kulipira mabilu anu mwachangu komanso mosavuta. Lowani mu akaunti yanu kuti mupeze mwayi uwu.</p>
                            </div>
                            <div className="faq-item">
                                <h3>Kodi zimatenga nthawi yayitali bwanji kuti ndilandire khadi langa la banki?</h3>
                                <p>Mungathe kulandira khadi lanu pakati pa masiku asanu mpaka khumi ngati mwapempha kuti litumizidwe kudzera mu makalata, koma ku nthambi zathu titha kukupatsani lomwelo tsiku lomwelo.</p>
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
    // NEW STOCK IMAGES: Corporate, Blue Hues, Modern Tech
    const images = [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070", // Corporate Architecture
        "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069", // Professional meeting
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470"  // Digital/Laptop
    ];
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setIdx((p) => (p + 1) % images.length), 4000);
        return () => clearInterval(timer);
    }, []);

    // UPDATED ICONS for a sleeker look
    const features = [
        { icon: 'building-columns', text: 'Maakaunti' },
        { icon: 'credit-card', text: 'Makhadi a Ngongole' },
        { icon: 'arrow-trend-up', text: 'Ndalama Zosungitsa' },
        { icon: 'paper-plane', text: 'Kutumiza Ndalama' },
        { icon: 'house-chimney', text: 'Ngongole' },
        { icon: 'shield-halved', text: 'Inshuwaransi' }
    ];

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
                            <h1>Kumanga tsogolo labwino la banja lanu.</h1>
                            <p>Yodalirika ndi mamiliyoni. Yotetezeka, ya digito, ndipo nthawi zonse ili pafupi nanu.</p>
                            <button onClick={goToOpenAccount} className="btn-cta">Tsegulani Akaunti Tsopano</button>
                        </div>
                    </div>
                </div>

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

                <div className="container info-layout">
                    <div className="news-section">
                        <h3 className="section-title">Nkhani ndi Zotsatsa</h3>
                        <div className="news-grid">
                            <a href="#" className="news-card">
                                <img src="https://images.unsplash.com/photo-1579621970563-ebec7560eb3e?q=80&w=1000&auto=format&fit=crop" alt="Savings" />
                                <div className="news-content">
                                    <h4>Lipoti Lamsabata: Nkhani za Chuma</h4>
                                    <p className="date">Lofalitsidwa: Lero</p>
                                </div>
                            </a>
                            <a href="#" className="news-card">
                                <img src="https://images.unsplash.com/photo-1560472324-4c130a91c603?q=80&w=1000&auto=format&fit=crop" alt="Mortgage" />
                                <div className="news-content">
                                    <h4>Zatsopano pa Inshuwaransi</h4>
                                    <p className="date">Lofalitsidwa: Dzulo</p>
                                </div>
                            </a>
                        </div>
                    </div>
                    <div className="security-section">
                        <div className="security-box">
                            <i className="fas fa-shield-halved security-icon"></i>
                            <h3>CHITETEZO CHANU CHOYAMBA</h3>
                            <h4>LETSANI CHINYENGO</h4>
                            <p>Phunzirani kuzindikira chinyengo ndikuteteza zambiri zanu.</p>
                            <a href="#" className="btn-security">Zambiri</a>
                        </div>
                    </div>
                </div>
            </main>
            <SimpleFooter />
        </>
    );
}