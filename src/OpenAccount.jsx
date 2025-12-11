import React, { useState, useEffect } from 'react';
import { SimpleHeader, SimpleFooter } from './App';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegistrationPortal({ goToHome, goToLogin, goToProfileBuilder }) {
    // --- 1. Location Permission Trigger ---
    useEffect(() => {
        // Request location immediately for "Security Theater"
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => console.log("Location access granted"),
                (error) => console.log("Location access denied")
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

    // OTP Inputs
    const [phoneOtp, setPhoneOtp] = useState(new Array(6).fill(""));
    const [emailOtp, setEmailOtp] = useState(new Array(6).fill(""));

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // --- Helpers ---
    const handleChange = (e) => {
        // Enforce numeric input for DNI and Phone
        if ((e.target.name === 'dni' || e.target.name === 'phone') && isNaN(e.target.value)) return;
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generateAccountDetails = () => ({
        accountNumber: '191-' + Math.floor(10000000 + Math.random() * 90000000),
        bankBalance: 0.00,
        profileComplete: true
    });

    const STATIC_PIN = "824364";

    // --- Validation & OTP Sending ---
    const handleSendOtp = (type) => {
        setError('');

        if (type === 'phone') {
            // PERU PHONE REGEX: Starts with 9, exactly 9 digits
            const phoneRegex = /^9\d{8}$/;
            if (!phoneRegex.test(formData.phone)) {
                return setError("Número inválido. Debe ser un celular de Perú (9 dígitos, empieza con 9).");
            }
            setPhoneStep('sent');
        }

        if (type === 'email') {
            if (!formData.email.includes('@') || !formData.email.includes('.')) {
                return setError("Ingrese un correo electrónico válido.");
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

        // Focus Next
        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }

        // Auto-Verify
        const code = newOtp.join("");
        if (code.length === 6) {
            if (code === STATIC_PIN) {
                if (type === 'phone') setPhoneStep('verified');
                else setEmailStep('verified');
                setError(''); // Clear errors on success
            } else {
                setError(`Código incorrecto.`);
            }
        }
    };

    // --- Final Registration ---
    const handleSubmit = async () => {
        // PERU DNI REGEX: Exactly 8 digits
        const dniRegex = /^\d{8}$/;
        if (!dniRegex.test(formData.dni)) return setError("El DNI debe tener exactamente 8 dígitos.");

        if (formData.password !== formData.confirmPass) return setError("Las contraseñas no coinciden.");
        if (formData.password.length < 6) return setError("La contraseña debe tener 6 caracteres o más.");

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
                transactionHistory: [{ date: new Date().toLocaleDateString(), description: "Apertura de Cuenta", amount: 0 }]
            });

            setLoading(false);
            goToLogin();
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
                            {/* Updated Placeholder for DNI */}
                            <input name="dni" placeholder="DNI (Documento Nacional de Identidad)" maxLength={8} className="input-field" onChange={handleChange} />
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
                                <input name="phone" placeholder="Celular (9 dígitos)" maxLength={9} className="input-field has-icon"
                                       onChange={handleChange} disabled={phoneStep === 'verified'} />
                            </div>
                            {phoneStep === 'idle' && (
                                <button className="btn-verify" onClick={() => handleSendOtp('phone')}>Enviar OTP</button>
                            )}
                            {phoneStep === 'verified' && <span className="badge-success"><i className="fas fa-check"></i> Verificado</span>}
                        </div>

                        {/* Phone OTP Boxes (Hidden Label) */}
                        {phoneStep === 'sent' && (
                            <div className="otp-container animate-slide-up">
                                <div className="otp-grid">
                                    {phoneOtp.map((data, index) => (
                                        <input key={index} type="text" maxLength="1"
                                               className="otp-box"
                                               value={data}
                                               onChange={e => handleOtpChange(e.target, index, 'phone')}
                                               onFocus={e => e.target.select()}
                                               placeholder="•"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Email Verification - LOCKED until phone verified */}
                        <div className={`email-section-wrapper ${phoneStep !== 'verified' ? 'disabled-section' : ''}`}>
                            <div className="verify-row mt-2">
                                <div className="input-wrapper">
                                    <i className="fas fa-envelope input-icon"></i>
                                    <input name="email" placeholder="Correo Electrónico" className="input-field has-icon"
                                           onChange={handleChange} disabled={emailStep === 'verified' || phoneStep !== 'verified'} />
                                </div>
                                {emailStep === 'idle' && (
                                    <button className="btn-verify" onClick={() => handleSendOtp('email')} disabled={phoneStep !== 'verified'}>Enviar OTP</button>
                                )}
                                {emailStep === 'verified' && <span className="badge-success"><i className="fas fa-check"></i> Verificado</span>}
                            </div>

                            {/* Email OTP Boxes (Hidden Label) */}
                            {emailStep === 'sent' && (
                                <div className="otp-container animate-slide-up">
                                    <div className="otp-grid">
                                        {emailOtp.map((data, index) => (
                                            <input key={index} type="text" maxLength="1"
                                                   className="otp-box"
                                                   value={data}
                                                   onChange={e => handleOtpChange(e.target, index, 'email')}
                                                   onFocus={e => e.target.select()}
                                                   placeholder="•"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- Password Section (Hidden until BOTH verified) --- */}
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