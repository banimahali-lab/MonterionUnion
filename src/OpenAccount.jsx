// andes/frontend/src/OpenAccount.jsx (New Auth-First Registration)

import React, { useState } from 'react';
import './OpenAccount.css';
import { SimpleHeader, SimpleFooter } from './App';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Helper for minimal initial data
const createInitialProfile = (email, name) => ({
    name: name || "Nuevo Usuario",
    email: email,
    profileComplete: false, // <-- FLAG to force redirect after login
    phoneNumber: '', nationalId: '', dateOfBirth: '', occupation: '', monthlyIncome: 0,
    bankBalance: 0.00, accountNumber: '', creditCardStatus: 'None', transactionHistory: [], bankIFSC: 'ANDSPB0001',
});

function RegistrationPortal({ goToHome, goToLogin, goToProfileBuilder }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const fullName = `${firstName} ${lastName}`;
            const initialData = createInitialProfile(email, fullName);
            await setDoc(doc(db, "users", user.uid), initialData);

            alert(`¡Bienvenido, ${firstName}! Registro completado. Proceda a llenar sus datos.`);
            goToProfileBuilder();

        } catch (error) {
            let message = "Error desconocido al registrar.";
            if (error.code === 'auth/email-already-in-use') {
                message = "El correo ya está registrado. Intente iniciar sesión.";
            } else if (error.code === 'auth/weak-password') {
                message = "Contraseña demasiado débil (mín. 6 caracteres).";
            } else {
                message = `Error de Firebase: ${error.message}`;
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="open-account-page">
            <SimpleHeader goToHome={goToHome} />
            <main className="step-form-content" style={{maxWidth: '500px', margin: '50px auto'}}>
                <h2>1. Crear Acceso y Perfil Básico</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label>Nombre(s)</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></div>
                    <div className="form-group"><label>Apellido(s)</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required /></div>
                    <div className="form-group"><label>Correo Electrónico (Su ID de Acceso)</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                    <div className="form-group"><label>Contraseña (Mínimo 6 caracteres)</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" /></div>

                    {error && <div style={{color: 'red', margin: '15px 0'}}>{error}</div>}

                    <button type="submit" className="btn btn-cta" disabled={isLoading}>
                        {isLoading ? 'Creando Acceso...' : 'Crear Acceso y Continuar'}
                    </button>
                    <div style={{textAlign: 'center', marginTop: '15px'}}>
                        ¿Ya tiene una cuenta? <a href="#" onClick={goToLogin}>Iniciar Sesión</a>
                    </div>
                </form>
            </main>
            <SimpleFooter />
        </div>
    );
}

export default RegistrationPortal;