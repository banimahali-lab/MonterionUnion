import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import App from './App';
import LoginPortal from './LoginPortal';
import UserDashboard from './UserDashboard';
import RegistrationPortal from './OpenAccount';
import ProfileBuilder from './ProfileBuilder';
import ContactUs from './ContactUs';
import CreditCardRejection from './CreditCardRejection';
import LoadingScreen from './LoadingScreen';
import './index.css';

const checkProfileStatus = async (user) => {
    if (!user) return false;
    try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        return docSnap.exists() && !!docSnap.data().profileComplete;
    } catch (e) { return false; }
};

function MainRouter() {
    const [view, setView] = useState('home');
    const [currentUser, setCurrentUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const minLoadTime = new Promise(resolve => setTimeout(resolve, 1500));

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            await minLoadTime;

            // --- SECURITY: LOGOUT ON REFRESH ---
            const isSessionActive = sessionStorage.getItem('andes_session_active');

            if (user) {
                if (!isSessionActive) {
                    await signOut(auth);
                    setCurrentUser(null);
                    setView('home');
                } else {
                    const isComplete = await checkProfileStatus(user);
                    setCurrentUser(user);
                    setView(isComplete ? 'dashboard' : 'profileBuilder');
                }
            } else {
                setCurrentUser(null);
                if (view !== 'rejection' && view !== 'contact' && view !== 'openAccount') {
                    setView('home');
                }
            }
            setAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    const nav = (v) => { setView(v); window.scrollTo(0,0); };
    const handleLogout = async () => {
        sessionStorage.removeItem('andes_session_active');
        await signOut(auth);
        nav('home');
    };

    if (!authReady) return <LoadingScreen />;

    if (view === 'rejection') return <CreditCardRejection goToHome={() => nav('home')} />;
    if (view === 'contact') return <ContactUs goToHome={() => nav('home')} goToLogin={() => nav('login')} />;
    if (view === 'openAccount') return <RegistrationPortal goToHome={() => nav('home')} goToLogin={() => nav('login')} goToProfileBuilder={() => nav('profileBuilder')} />;
    if (view === 'login') return <LoginPortal goToHome={() => nav('home')} onLogin={() => nav('dashboard')} goToContact={() => nav('contact')} />;

    if (currentUser) {
        return view === 'profileBuilder'
            ? <ProfileBuilder user={currentUser} goToDashboard={() => nav('dashboard')} />
            : <UserDashboard user={currentUser} goToHome={() => nav('home')} onLogout={handleLogout} onCreditCardReject={() => nav('rejection')} />;
    }

    return <App goToOpenAccount={() => nav('openAccount')} goToLogin={() => nav('login')} goToContact={() => nav('contact')} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<MainRouter />);