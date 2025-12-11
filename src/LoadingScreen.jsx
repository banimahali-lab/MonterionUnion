import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
    return (
        <div className="loading-container">
      <span className="loading-text">
        LOADING<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
      </span>
        </div>
    );
};

export default LoadingScreen;