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
        sessionStorage.setItem('andes_session_active', 'true');
        try {
            const cred = await signInWithEmailAndPassword(auth, email, pass);
            onLogin(cred.user);
        } catch (e) {
            sessionStorage.removeItem('andes_session_active');
            setErr("Zolembazo ndi zolakwika kapena wosuta sanapezeke."); // Invalid credentials
        }
    };

    return (
        <>
            <SimpleHeader goToHome={goToHome} goToContact={goToContact} />
            <main className="auth-container">
                <div className="auth-box">
                    <div style={{textAlign: 'center', marginBottom: '20px', color: 'var(--deep-blue)'}}>
                        <i className="fas fa-user-lock fa-3x" style={{marginBottom: '15px'}}></i>
                        <h2>Kulowa mu Banki</h2>
                    </div>

                    <form onSubmit={handleLogin}>
                        <label>Imelo yanu (Email)</label>
                        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="name@example.com" />

                        <label>Mawu achinsinsi (Password)</label>
                        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required placeholder="••••••••" />

                        {err && <div className="error-msg">{err}</div>}

                        <button type="submit" className="btn-cta full-width" style={{marginTop: '10px'}}>Lowani</button>
                    </form>

                    <div className="auth-links" style={{marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)'}}>
                        <a href="#" onClick={(e) => {e.preventDefault(); goToContact();}} style={{color: 'var(--deep-blue)', fontWeight: '600'}}>Lumikizanani Nafe</a> |
                        <span style={{marginLeft: '10px'}}><i className="fas fa-phone-alt"></i> +265 1 234 567</span>
                    </div>
                </div>
            </main>
            <SimpleFooter />
        </>
    );
}