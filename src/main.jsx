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
import LoadingScreen from './LoadingScreen'; // Import the new loader
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

    // Start with loading TRUE so the very first reload shows the screen
    const [isLoading, setIsLoading] = useState(true);

    // --- Navigation Wrapper (Smooth Transition) ---
    // Every time we click a menu item, this runs
    const nav = (newView) => {
        setIsLoading(true); // Show loader
        window.scrollTo(0,0);

        // Wait 1.2 seconds for the animation to play, then switch view
        setTimeout(() => {
            setView(newView);
            setIsLoading(false); // Hide loader
        }, 1200);
    };

    // --- Login Logic (Specific Request) ---
    // Only triggers AFTER Firebase confirms credentials are correct
    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
        setIsLoading(true); // Show loader immediately after login success

        // Longer delay (2s) for Login to make it feel like "processing" data
        setTimeout(async () => {
            const isComplete = await checkProfileStatus(user);
            setView(isComplete ? 'dashboard' : 'profileBuilder');
            setIsLoading(false); // Reveal Dashboard
        }, 2000);
    };

    // --- Initial Load Logic ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            // Keep loader visible while we check session
            setIsLoading(true);

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

            // Turn off loader after initial checks are done
            setTimeout(() => setIsLoading(false), 1500);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        setIsLoading(true); // Show loader during logout
        sessionStorage.removeItem('andes_session_active');
        await signOut(auth);
        setTimeout(() => {
            nav('home'); // nav() will handle the turning off of loading
        }, 1000);
    };

    // --- RENDER ---

    // If loading is true, ONLY show the loading screen (overlays everything)
    if (isLoading) return <LoadingScreen />;

    // View Routing
    if (view === 'rejection') return <CreditCardRejection goToHome={() => nav('home')} />;
    if (view === 'contact') return <ContactUs goToHome={() => nav('home')} goToLogin={() => nav('login')} />;
    if (view === 'openAccount') return <RegistrationPortal goToHome={() => nav('home')} goToLogin={() => nav('login')} goToProfileBuilder={() => nav('profileBuilder')} />;

    // Pass handleLoginSuccess instead of standard nav
    if (view === 'login') return <LoginPortal goToHome={() => nav('home')} onLogin={handleLoginSuccess} goToContact={() => nav('contact')} />;

    if (currentUser) {
        return view === 'profileBuilder'
            ? <ProfileBuilder user={currentUser} goToDashboard={() => nav('dashboard')} />
            : <UserDashboard user={currentUser} goToHome={() => nav('home')} onLogout={handleLogout} onCreditCardReject={() => nav('rejection')} />;
    }

    return <App goToOpenAccount={() => nav('openAccount')} goToLogin={() => nav('login')} goToContact={() => nav('contact')} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<MainRouter />);