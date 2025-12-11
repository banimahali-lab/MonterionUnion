import React from 'react';
export default function LoadingScreen() {
    return (
        <div className="loading-overlay">
            <div className="spinner"><i className="fas fa-mountain"></i></div>
            <h2>ANDES PRIME BANK</h2>
            <div className="progress-bar"><div className="fill"></div></div>
        </div>
    );
}