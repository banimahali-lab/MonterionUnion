import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
    return (
        <div className="loading-container">
            <div className="loading-content">
                {/* Bank Icon Replaced */}
                <i className="fas fa-landmark loading-icon"></i>

                {/* Small Progress Bar */}
                <div className="loading-progress-bar">
                    <div className="loading-progress-fill"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;