import React, { useState } from 'react';
import { SimpleHeader, SimpleFooter } from './App';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPortal({ goToHome, onLogin, goToContact }) {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [err, setErr] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setErr('');
        sessionStorage.setItem('andes_session_active', 'true'); // SET FLAG BEFORE AUTH
        try {
            const cred = await signInWithEmailAndPassword(auth, email, pass);
            onLogin(cred.user);
        } catch (e) {
            sessionStorage.removeItem('andes_session_active');
            setErr("Credenciales incorrectas o usuario no encontrado.");
        }
    };

    return (
        <>
            <SimpleHeader goToHome={goToHome} goToContact={goToContact} />
            <main className="auth-container">
                <div className="auth-box">
                    <h2>Acceso Banca por Internet</h2>
                    <form onSubmit={handleLogin}>
                        <label>Correo Electrónico</label>
                        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
                        <label>Contraseña</label>
                        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required />
                        {err && <div className="error-msg">{err}</div>}
                        <button type="submit" className="btn-cta full-width">Iniciar Sesión</button>
                    </form>
                    <div className="auth-links">
                        <a href="#" onClick={(e) => {e.preventDefault(); goToContact();}}>Contáctenos</a> |
                        <span><i className="fas fa-phone-alt"></i> (511) 613 2000</span>
                    </div>
                </div>
            </main>
            <SimpleFooter />
        </>
    );
}