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
    const [isLoading, setIsLoading] = useState(true);

    const nav = (newView) => {
        setIsLoading(true);
        window.scrollTo(0,0);
        setTimeout(() => {
            setView(newView);
            setIsLoading(false);
        }, 1200);
    };

    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
        setIsLoading(true);
        setTimeout(async () => {
            const isComplete = await checkProfileStatus(user);
            setView(isComplete ? 'dashboard' : 'profileBuilder');
            setIsLoading(false);
        }, 2000);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setIsLoading(true);

            // SECURITY: If session storage flag is missing (deleted on tab close), logout.
            const isSessionActive = sessionStorage.getItem('andes_session_active');

            if (user && isSessionActive) {
                const isComplete = await checkProfileStatus(user);
                setCurrentUser(user);
                setView(isComplete ? 'dashboard' : 'profileBuilder');
            } else {
                if (user) await signOut(auth); // Ensure full cleanup
                setCurrentUser(null);
                if (['login', 'dashboard', 'profileBuilder'].includes(view)) {
                    setView('home');
                }
            }
            setTimeout(() => setIsLoading(false), 1500);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        setIsLoading(true);
        sessionStorage.removeItem('andes_session_active');
        await signOut(auth);
        setTimeout(() => nav('home'), 1000);
    };

    if (isLoading) return <LoadingScreen />;

    if (view === 'rejection') return <CreditCardRejection goToHome={() => nav('home')} />;
    if (view === 'contact') return <ContactUs goToHome={() => nav('home')} goToLogin={() => nav('login')} />;
    if (view === 'openAccount') return <RegistrationPortal goToHome={() => nav('home')} goToLogin={() => nav('login')} goToProfileBuilder={() => nav('profileBuilder')} />;
    if (view === 'login') return <LoginPortal goToHome={() => nav('home')} onLogin={handleLoginSuccess} goToContact={() => nav('contact')} />;

    if (currentUser) {
        return view === 'profileBuilder'
            ? <ProfileBuilder user={currentUser} goToDashboard={() => nav('dashboard')} />
            : <UserDashboard user={currentUser} goToHome={() => nav('home')} onLogout={handleLogout} onCreditCardReject={() => nav('rejection')} />;
    }

    return <App goToOpenAccount={() => nav('openAccount')} goToLogin={() => nav('login')} goToContact={() => nav('contact')} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<MainRouter />);