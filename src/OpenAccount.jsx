import React, { useState, useEffect } from 'react';
import { SimpleHeader, SimpleFooter } from './App';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegistrationPortal({ goToHome, goToLogin, goToProfileBuilder }) {
    // --- 1. Location Permission Trigger (Security Theater) ---
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => console.log("Malo atsimikiziridwa"),
                (error) => console.log("Malo akanidwa")
            );
        }
    }, []);

    // --- Form States ---
    const [formData, setFormData] = useState({
        firstName: '', middleName: '', lastName: '',
        dni: '', dob: '', phone: '', email: '',
        password: '', confirmPass: ''
    });

    // --- OTP Logic States ---
    const [phoneStep, setPhoneStep] = useState('idle'); // idle, sent, verified
    const [emailStep, setEmailStep] = useState('idle'); // idle, sent, verified

    const [phoneOtp, setPhoneOtp] = useState(new Array(6).fill(""));
    const [emailOtp, setEmailOtp] = useState(new Array(6).fill(""));

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // --- Helpers ---
    const handleChange = (e) => {
        if ((e.target.name === 'dni' || e.target.name === 'phone') && isNaN(e.target.value)) return;
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Monterion Union uses a 7700 routing prefix equivalent
    const generateAccountDetails = () => ({
        accountNumber: '7700-' + Math.floor(10000000 + Math.random() * 90000000),
        bankBalance: 0.00,
        profileComplete: true
    });

    const STATIC_PIN = "824364";

    // --- Validation & OTP Sending ---
    const handleSendOtp = (type) => {
        setError('');

        if (type === 'phone') {
            // Updated for general 9-10 digit numbers
            const phoneRegex = /^\d{9,10}$/;
            if (!phoneRegex.test(formData.phone)) {
                return setError("Nambala yovomerezeka si yolondola. Iyenera kukhala manambala 9 kapena 10.");
            }
            setPhoneStep('sent');
        }

        if (type === 'email') {
            if (!formData.email.includes('@') || !formData.email.includes('.')) {
                return setError("Chonde lembani imelo yolondola.");
            }
            setEmailStep('sent');
        }
    };

    const handleOtpChange = (element, index, type) => {
        if (isNaN(element.value)) return;

        const newOtp = type === 'phone' ? [...phoneOtp] : [...emailOtp];
        newOtp[index] = element.value;

        if (type === 'phone') setPhoneOtp(newOtp);
        else setEmailOtp(newOtp);

        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }

        const code = newOtp.join("");
        if (code.length === 6) {
            if (code === STATIC_PIN) {
                if (type === 'phone') setPhoneStep('verified');
                else setEmailStep('verified');
                setError('');
            } else {
                setError(`Khodi yolakwika. (OTP yolakwika)`);
            }
        }
    };

    // --- Final Registration ---
    const handleSubmit = async () => {
        const dniRegex = /^\d{8}$/; // Assuming 8 digit National ID format
        if (!dniRegex.test(formData.dni)) return setError("National ID iyenera kukhala manambala 8 omwe.");

        if (formData.password !== formData.confirmPass) return setError("Mawu achinsinsi sakufanana.");
        if (formData.password.length < 6) return setError("Mawu achinsinsi ayenera kukhala ndi zilembo 6 kapena kuposerapo.");

        setLoading(true);
        try {
            const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim(),
                email: formData.email,
                phone: formData.phone,
                dni: formData.dni,
                dob: formData.dob,
                ...generateAccountDetails(),
                transactionHistory: [{ date: new Date().toLocaleDateString(), description: "Kutsegula Akaunti", amount: 0 }]
            });

            setLoading(false);
            goToLogin();
        } catch (err) {
            setLoading(false);
            if(err.code === 'auth/email-already-in-use') setError("Imeloyi ikugwiritsidwa ntchito kale.");
            else setError("Pali vuto pakupanga akaunti. Yesani kachiwiri.");
        }
    };

    return (
        <>
            <SimpleHeader goToHome={goToHome} goToLogin={goToLogin} />
            <main className="registration-wrapper">
                <div className="registration-container">

                    {/* LEFT PANEL: Branding (Deep Blue Theme) */}
                    <div className="registration-sidebar desktop-only">
                        <div className="sidebar-content">
                            <i className="fas fa-landmark fa-4x" style={{ color: 'var(--white)', marginBottom: '20px' }}></i>
                            <h2>Takulandirani ku Monterion Union</h2>
                            <p>Sangalalani ndi banki ya digito yotetezeka komanso yodalirika. Tsegulani akaunti yanu lero ndikuwongolera chuma chanu mwanzeru.</p>

                            <ul className="sidebar-features">
                                <li><i className="fas fa-check-circle"></i> Zotetezedwa 100%</li>
                                <li><i className="fas fa-check-circle"></i> Kutumiza ndalama mwachangu</li>
                                <li><i className="fas fa-check-circle"></i> Palibe malipiro obisika</li>
                            </ul>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Form (Clean White Theme) */}
                    <div className="registration-form-area">
                        <h2 className="form-title mobile-only" style={{color: 'var(--deep-blue)'}}>Monterion Union</h2>
                        <h3 className="form-heading">Tsegulani Akaunti Yatsopano</h3>
                        <p className="form-subtitle">Lembani zambiri zanu m'munsiyi.</p>

                        {/* 1. Personal Info */}
                        <div className="form-section">
                            <h4 className="section-step"><span className="step-num">1</span> Zambiri Zanu</h4>
                            <div className="input-group-row">
                                <input name="firstName" placeholder="Dzina Loyamba" className="input-field" onChange={handleChange} />
                                <input name="middleName" placeholder="Dzina Lachiwiri" className="input-field" onChange={handleChange} />
                            </div>
                            <input name="lastName" placeholder="Dzina la Bambo" className="input-field" onChange={handleChange} />

                            <div className="input-group-row">
                                <input name="dni" placeholder="National ID (Manambala 8)" maxLength={8} className="input-field" onChange={handleChange} />
                                <input name="dob" type="date" className="input-field" onChange={handleChange} title="Tsiku Lobadwa" />
                            </div>
                        </div>

                        {/* 2. Verification */}
                        <div className="form-section">
                            <h4 className="section-step"><span className="step-num">2</span> Kutsimikizira</h4>

                            {/* Phone */}
                            <div className="verify-row">
                                <div className="input-wrapper">
                                    <i className="fas fa-mobile-alt input-icon"></i>
                                    <input name="phone" placeholder="Nambala ya Foni" maxLength={10} className="input-field has-icon"
                                           onChange={handleChange} disabled={phoneStep === 'verified'} />
                                </div>
                                {phoneStep === 'idle' && (
                                    <button className="btn-verify" onClick={() => handleSendOtp('phone')}>Tumizani OTP</button>
                                )}
                                {phoneStep === 'verified' && <span className="badge-success"><i className="fas fa-check"></i> Zatsimikiziridwa</span>}
                            </div>

                            {phoneStep === 'sent' && (
                                <div className="otp-container animate-slide-up">
                                    <p style={{marginBottom: '10px', fontSize: '0.85rem'}}>Lowetsani nambala yomwe yatumizidwa pafoni panu:</p>
                                    <div className="otp-grid">
                                        {phoneOtp.map((data, index) => (
                                            <input key={index} type="text" maxLength="1" className="otp-box"
                                                   value={data} onChange={e => handleOtpChange(e.target, index, 'phone')}
                                                   onFocus={e => e.target.select()} placeholder="•" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            <div className={`email-section-wrapper ${phoneStep !== 'verified' ? 'disabled-section' : ''}`} style={{marginTop: '15px'}}>
                                <div className="verify-row">
                                    <div className="input-wrapper">
                                        <i className="fas fa-envelope input-icon"></i>
                                        <input name="email" placeholder="Imelo Yanu" className="input-field has-icon"
                                               onChange={handleChange} disabled={emailStep === 'verified' || phoneStep !== 'verified'} />
                                    </div>
                                    {emailStep === 'idle' && (
                                        <button className="btn-verify" onClick={() => handleSendOtp('email')} disabled={phoneStep !== 'verified'}>Tumizani OTP</button>
                                    )}
                                    {emailStep === 'verified' && <span className="badge-success"><i className="fas fa-check"></i> Zatsimikiziridwa</span>}
                                </div>

                                {emailStep === 'sent' && (
                                    <div className="otp-container animate-slide-up">
                                        <p style={{marginBottom: '10px', fontSize: '0.85rem'}}>Lowetsani nambala yomwe yatumizidwa ku imelo yanu:</p>
                                        <div className="otp-grid">
                                            {emailOtp.map((data, index) => (
                                                <input key={index} type="text" maxLength="1" className="otp-box"
                                                       value={data} onChange={e => handleOtpChange(e.target, index, 'email')}
                                                       onFocus={e => e.target.select()} placeholder="•" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Security */}
                        {phoneStep === 'verified' && emailStep === 'verified' && (
                            <div className="form-section animate-slide-up" style={{borderBottom: 'none'}}>
                                <h4 className="section-step"><span className="step-num">3</span> Chitetezo</h4>
                                <label style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Pangani mawu achinsinsi</label>
                                <input type="password" name="password" placeholder="Mawu Achinsinsi Atsopano" className="input-field" onChange={handleChange} />
                                <input type="password" name="confirmPass" placeholder="Tsimikizani Mawu Achinsinsi" className="input-field" onChange={handleChange} />

                                <button className="btn-cta full-width mt-3" onClick={handleSubmit} disabled={loading}>
                                    {loading ? "Kupanga..." : "TSEGULANI AKAUNTI TSOPANO"}
                                </button>
                            </div>
                        )}

                        {error && <div className="error-msg"><i className="fas fa-exclamation-circle"></i> {error}</div>}

                        <div className="auth-links" style={{marginTop: '25px', textAlign: 'center', borderTop: '1px solid #eaeaea', paddingTop: '15px'}}>
                            <p style={{color: 'var(--text-muted)', fontSize: '0.95rem'}}>
                                Muli ndi akaunti kale? <a href="#" onClick={goToLogin} style={{color: 'var(--deep-blue)', fontWeight: 'bold'}}>Lowani pano</a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <SimpleFooter />
        </>
    );
}