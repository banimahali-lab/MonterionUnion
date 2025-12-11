// andes/frontend/src/ProfileBuilder.jsx

import React, { useState, useEffect } from 'react';
import { SimpleHeader, SimpleFooter } from './App';
import './OpenAccount.css';
import { db } from './firebaseConfig';
import { doc, updateDoc, getDoc } from "firebase/firestore";

// --- Helper Functions and Components (ProgressBar) ---
const generateAccountNumber = () => 'AP' + Math.floor(Math.random() * 900000 + 100000);

const ProgressBar = ({ currentStep }) => {
    const totalSteps = 4;
    const stepLabels = ["Reg.", "Contacto/Fin.", "Cuenta", "Finalizar"];

    return (
        <div className="progress-bar-container">
            {stepLabels.map((label, index) => {
                const step = index + 1;
                if (step < 2) return null;

                return (
                    <div key={step} className={`step-bubble ${step <= currentStep ? 'active' : ''}`}>
                        {step}
                        <div className="step-label">{label}</div>
                    </div>
                );
            })}
        </div>
    );
};


// --- Step 2: Contact and Financial Details (Mobile Ready) ---
function Step2({ formData, handleChange, handleNext, handlePrev }) {

    const requiredFields = ['phone', 'nationalId', 'dateOfBirth', 'occupation', 'monthlyIncome'];
    const isStepComplete = requiredFields.every(field => field in formData && formData[field]);
    const isFinancialDataValid = formData.monthlyIncome && Number(formData.monthlyIncome) > 0;

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (isStepComplete && isFinancialDataValid) {
            handleNext();
        } else if (!isFinancialDataValid) {
            alert("Por favor, ingrese un monto de ingreso mensual válido.");
        }
    };

    return (
        <div className="step-form-content">
            <h2>Paso 2: Contacto y Información Financiera</h2>
            <form onSubmit={handleFormSubmit}>

                <div className="form-group-grid"> {/* This will stack on mobile via CSS */}
                    <div className="form-group"><label htmlFor="phone">Número de Teléfono</label><input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required pattern="[0-9]{9}" maxLength="9" placeholder="987654321" /></div>
                    <div className="form-group"><label htmlFor="nationalId">Número de DNI/CE</label><input type="text" id="nationalId" name="nationalId" value={formData.nationalId} onChange={handleChange} required placeholder="12345678" /></div>
                </div>

                <div className="form-group"><label htmlFor="dateOfBirth">Fecha de Nacimiento</label><input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required /></div>

                <h3>Detalles Financieros</h3>
                <div className="form-group-grid">
                    <div className="form-group"><label htmlFor="occupation">Ocupación</label><select id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} required><option value="">Seleccione...</option><option value="privado">Empleado Privado</option></select></div>
                    <div className="form-group"><label htmlFor="monthlyIncome">Ingreso Mensual Neto (S/)</label><input type="number" id="monthlyIncome" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} required min="0" placeholder="Monto en Soles" /></div>
                </div>

                <div className="navigation-buttons">
                    <button type="button" className="btn btn-secondary" onClick={handlePrev}>&larr; Anterior</button>
                    <button type="submit" className="btn btn-cta" disabled={!isStepComplete || !isFinancialDataValid}>Continuar al Paso 3</button>
                </div>
            </form>
        </div>
    );
}


// --- Step 3: Account Selection and Features ---
function Step3({ formData, handleChange, handleNext, handlePrev }) {
    const isStepComplete = formData.accountType;
    return (
        <div className="step-form-content">
            <h2>Paso 3: Elija su Cuenta</h2>
            <form onSubmit={(e) => { e.preventDefault(); if (isStepComplete) handleNext(); }}>
                <div className="account-selection-grid">
                    <label className={`account-card ${formData.accountType === 'digital' ? 'selected' : ''}`}><input type="radio" name="accountType" value="digital" checked={formData.accountType === 'digital'} onChange={handleChange} style={{ display: 'none' }} /><h3>Cuenta Digital Andes</h3></label>
                    <label className={`account-card ${formData.accountType === 'prime' ? 'selected' : ''}`}><input type="radio" name="accountType" value="prime" checked={formData.accountType === 'prime'} onChange={handleChange} style={{ display: 'none' }} /><h3>Cuenta Prime Más</h3></label>
                </div>
                <div className="form-group checkbox-group" style={{marginTop: '30px'}}><label><input type="checkbox" name="requestCreditCard" checked={formData.requestCreditCard} onChange={handleChange} />Solicitar Tarjeta de Crédito.</label></div>
                <div className="navigation-buttons"><button type="button" className="btn btn-secondary" onClick={handlePrev}>&larr; Anterior</button><button type="submit" className="btn btn-cta" disabled={!isStepComplete}>Continuar al Paso 4</button></div>
            </form>
        </div>
    );
}


// --- Step 4: Final Review and Submission ---
function Step4({ formData, handleSubmit, handlePrev, isSubmitting }) {
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const isStepComplete = acceptedTerms && !isSubmitting;
    const accountName = formData.accountType === 'digital' ? 'Cuenta Digital Andes' : 'Cuenta Prime Más';

    return (
        <div className="step-form-content">
            <h2>Paso 4: Finalizar Solicitud</h2>
            <div className="review-summary"><p><strong>Cuenta Seleccionada:</strong> {accountName}</p><p><strong>DNI/CE:</strong> {formData.nationalId}</p></div>
            <div className="legal-acceptance"><div className="form-group checkbox-group"><label><input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />**Acepto** los <a href="#">Términos y Condiciones</a>.</label></div></div>
            <div className="navigation-buttons"><button type="button" className="btn btn-secondary" onClick={handlePrev} disabled={isSubmitting}>&larr; Anterior</button><button type="button" className="btn btn-cta" onClick={handleSubmit} disabled={!isStepComplete}>{isSubmitting ? 'Finalizando...' : 'Confirmar Solicitud'}</button></div>
        </div>
    );
}


// --- MAIN Profile Builder Component ---
function ProfileBuilder({ user, goToDashboard }) {
    const [currentStep, setCurrentStep] = useState(2);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);
    const [formData, setFormData] = useState({
        phone: '', nationalId: '', dateOfBirth: '', occupation: '', monthlyIncome: 0,
        accountType: 'digital', requestCreditCard: false,
    });

    // Load existing profile data (if any) when the component mounts
    useEffect(() => {
        if (user) {
            const fetchInitialData = async () => {
                const docSnap = await getDoc(doc(db, "users", user.uid));
                if (docSnap.exists()) {
                    // Overwrite default state with any existing data
                    setFormData(prev => ({ ...prev, ...docSnap.data() }));
                }
                setInitialDataLoaded(true);
            };
            fetchInitialData();
        }
    }, [user]);

    const handleChange = (e) => { /* ... (Same logic) ... */ };
    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 2));

    const handleSubmit = async () => { /* ... (Same logic, uses updateDoc) ... */ };

    const renderStep = () => {
        const props = { formData, handleChange, handleNext, handlePrev, handleSubmit, isSubmitting };
        switch (currentStep) {
            case 2: return <Step2 {...props} />;
            case 3: return <Step3 {...props} />;
            case 4: return <Step4 {...props} />;
            default: return <Step2 {...props} />;
        }
    };

    if (!initialDataLoaded) return <div>Cargando perfil...</div>;

    return (
        <>
            <SimpleHeader />
            <main className="open-account-page">
                <div className="container">
                    <ProgressBar currentStep={currentStep} totalSteps={4} />
                    {renderStep()}
                </div>
            </main>
            <SimpleFooter />
        </>
    );
}

export default ProfileBuilder;