import React, { useState, useRef, useEffect } from 'react';
import { SimpleHeader, SimpleFooter } from './App';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegistrationPortal({ goToHome, goToLogin, goToProfileBuilder }) {
    // --- Form States ---
    const [formData, setFormData] = useState({
        firstName: '', middleName: '', lastName: '',
        dni: '', dob: '', phone: '', email: '',
        password: '', confirmPass: ''
    });

    // --- OTP Logic States ---
    const [phoneStep, setPhoneStep] = useState('idle'); // idle, sent, verified
    const [emailStep, setEmailStep] = useState('idle'); // idle, sent, verified

    // OTP Inputs (Arrays for 6 boxes)
    const [phoneOtp, setPhoneOtp] = useState(new Array(6).fill(""));
    const [emailOtp, setEmailOtp] = useState(new Array(6).fill(""));

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // --- Helpers ---
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Generate Random Bank Account
    const generateAccountDetails = () => ({
        accountNumber: '191-' + Math.floor(10000000 + Math.random() * 90000000),
        bankBalance: 0.00,
        profileComplete: true // Since we collect all data here, profile is complete
    });

    // --- OTP Handling ---
    const STATIC_PIN = "824364";

    const handleSendOtp = (type) => {
        if (type === 'phone' && !formData.phone) return setError("Ingrese un número de celular.");
        if (type === 'email' && !formData.email) return setError("Ingrese un correo electrónico.");
        setError('');

        if (type === 'phone') setPhoneStep('sent');
        if (type === 'email') setEmailStep('sent');
    };

    const handleOtpChange = (element, index, type) => {
        if (isNaN(element.value)) return;

        const newOtp = type === 'phone' ? [...phoneOtp] : [...emailOtp];
        newOtp[index] = element.value;

        if (type === 'phone') setPhoneOtp(newOtp);
        else setEmailOtp(newOtp);

        // Auto-focus next box
        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }

        // Auto-Verify Check
        const code = newOtp.join("");
        if (code.length === 6) {
            if (code === STATIC_PIN) {
                if (type === 'phone') setPhoneStep('verified');
                else setEmailStep('verified');
            } else {
                setError(`Código ${type === 'phone' ? 'SMS' : 'Email'} incorrecto.`);
            }
        }
    };

    // --- Final Registration ---
    const handleSubmit = async () => {
        if (formData.password !== formData.confirmPass) return setError("Las contraseñas no coinciden.");
        if (formData.password.length < 6) return setError("La contraseña debe tener 6 caracteres o más.");

        setLoading(true);
        try {
            const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

            // Save extended data to Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim(),
                email: formData.email,
                phone: formData.phone,
                dni: formData.dni,
                dob: formData.dob,
                ...generateAccountDetails(),
                transactionHistory: [{ date: new Date().toLocaleDateString(), description: "Apertura de Cuenta", amount: 0 }]
            });

            setLoading(false);
            // If main.jsx logic checks 'profileComplete', this user will go straight to dashboard
            goToLogin(); // Redirect to login to force a fresh session start
        } catch (err) {
            setLoading(false);
            if(err.code === 'auth/email-already-in-use') setError("Este correo ya está registrado.");
            else setError("Error al crear cuenta. Intente nuevamente.");
        }
    };

    return (
        <>
            <SimpleHeader goToHome={goToHome} goToLogin={goToLogin} />
            <main className="auth-container">
                <div className="auth-box wide-box">
                    <h2 className="form-title"><i className="fas fa-user-plus"></i> Abrir Cuenta Digital</h2>
                    <p className="form-subtitle">Complete sus datos para unirse a Andes Prime</p>

                    {/* --- Personal Info Section --- */}
                    <div className="form-section">
                        <h3>1. Datos Personales</h3>
                        <div className="input-group-row">
                            <input name="firstName" placeholder="Primer Nombre" className="input-field" onChange={handleChange} />
                            <input name="middleName" placeholder="Segundo Nombre" className="input-field" onChange={handleChange} />
                        </div>
                        <input name="lastName" placeholder="Apellidos" className="input-field" onChange={handleChange} />

                        <div className="input-group-row">
                            <input name="dni" placeholder="Número de DNI" maxLength={8} className="input-field" onChange={handleChange} />
                            <input name="dob" type="date" className="input-field" onChange={handleChange} title="Fecha de Nacimiento" />
                        </div>
                    </div>

                    {/* --- Contact & Verification Section --- */}
                    <div className="form-section">
                        <h3>2. Verificación de Contacto</h3>

                        {/* Phone Verification */}
                        <div className="verify-row">
                            <div className="input-wrapper">
                                <i className="fas fa-mobile-alt input-icon"></i>
                                <input name="phone" placeholder="Celular" className="input-field has-icon"
                                       onChange={handleChange} disabled={phoneStep === 'verified'} />
                            </div>
                            {phoneStep === 'idle' && (
                                <button className="btn-verify" onClick={() => handleSendOtp('phone')}>Enviar OTP</button>
                            )}
                            {phoneStep === 'verified' && <span className="badge-success"><i className="fas fa-check"></i> Verificado</span>}
                        </div>

                        {/* Phone OTP Boxes */}
                        {phoneStep === 'sent' && (
                            <div className="otp-container animate-slide-up">
                                <p>Ingrese código SMS (824364):</p>
                                <div className="otp-grid">
                                    {phoneOtp.map((data, index) => (
                                        <input key={index} type="text" maxLength="1"
                                               className="otp-box"
                                               value={data}
                                               onChange={e => handleOtpChange(e.target, index, 'phone')}
                                               onFocus={e => e.target.select()}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Email Verification */}
                        <div className="verify-row mt-2">
                            <div className="input-wrapper">
                                <i className="fas fa-envelope input-icon"></i>
                                <input name="email" placeholder="Correo Electrónico" className="input-field has-icon"
                                       onChange={handleChange} disabled={emailStep === 'verified'} />
                            </div>
                            {emailStep === 'idle' && (
                                <button className="btn-verify" onClick={() => handleSendOtp('email')}>Enviar OTP</button>
                            )}
                            {emailStep === 'verified' && <span className="badge-success"><i className="fas fa-check"></i> Verificado</span>}
                        </div>

                        {/* Email OTP Boxes */}
                        {emailStep === 'sent' && (
                            <div className="otp-container animate-slide-up">
                                <p>Ingrese código Email (824364):</p>
                                <div className="otp-grid">
                                    {emailOtp.map((data, index) => (
                                        <input key={index} type="text" maxLength="1"
                                               className="otp-box"
                                               value={data}
                                               onChange={e => handleOtpChange(e.target, index, 'email')}
                                               onFocus={e => e.target.select()}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- Password Section (Hidden until verified) --- */}
                    {phoneStep === 'verified' && emailStep === 'verified' && (
                        <div className="form-section animate-slide-up">
                            <h3>3. Seguridad</h3>
                            <label>Cree su contraseña de internet</label>
                            <input type="password" name="password" placeholder="Nueva Contraseña" className="input-field" onChange={handleChange} />
                            <input type="password" name="confirmPass" placeholder="Confirmar Contraseña" className="input-field" onChange={handleChange} />

                            <button className="btn-cta full-width mt-3" onClick={handleSubmit} disabled={loading}>
                                {loading ? "Creando..." : "CREAR CUENTA AHORA"}
                            </button>
                        </div>
                    )}

                    {error && <div className="error-msg">{error}</div>}

                    <div className="auth-links">
                        <p>¿Ya tienes cuenta? <a href="#" onClick={goToLogin}>Inicia Sesión aquí</a></p>
                    </div>
                </div>
            </main>
            <SimpleFooter />
        </>
    );
}