import React from 'react';
import BackgroundLogos from './BackgroundLogos';
import '../styles/Loading.css';
import logoSrc from '/rcnnct.png';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-page">
      <BackgroundLogos logoSrc={logoSrc} />
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-message">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;