import React, { useState } from 'react';
import { SimpleHeader, SimpleFooter } from './App';

export default function ContactUs({ goToHome, goToLogin }) {
    const [toast, setToast] = useState(false);

    const send = (e) => {
        e.preventDefault();
        setToast(true);
        setTimeout(() => { setToast(false); goToHome(); }, 3000);
    };

    return (
        <>
            <SimpleHeader goToHome={goToHome} goToLogin={goToLogin} />
            <main className="container contact-page">
                <h2>Contact Form</h2>
                <form onSubmit={send}>
                    <input placeholder="Name" required className="input-field" />
                    <input placeholder="Email" required className="input-field" />
                    <textarea placeholder="Message" required className="input-field" rows="5"></textarea>
                    <button className="btn-cta">Send Email</button>
                </form>
                {toast && <div className="toast">Message Sent! Redirecting...</div>}
            </main>
            <SimpleFooter />
        </>
    );
}