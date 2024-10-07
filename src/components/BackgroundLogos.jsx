import React from 'react';
import PropTypes from 'prop-types';
import useBackgroundLogos from '../hooks/useBackgroundLogos';
import '../styles/BackgroundLogos.css';

/**
 * BackgroundLogos component for displaying animated background logos
 * @param {Object} props - The component props
 * @param {string} props.logoSrc - The source URL for the logo image
 */
const BackgroundLogos = ({ logoSrc }) => {
  const logos = useBackgroundLogos();

  return (
    <div className="background-logos">
      {logos.map((logoItem, index) => (
        <img
          key={index}
          src={logoSrc}
          alt="background-logo"
          className="background-logo animate-logo"
          style={{
            width: `${logoItem.size}px`,
            top: `${logoItem.top}%`,
            left: `${logoItem.left}%`,
            opacity: logoItem.opacity,
            transform: `translate(-50%, -50%) rotate(${logoItem.rotation}deg)`,
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

BackgroundLogos.propTypes = {
  logoSrc: PropTypes.string.isRequired,
};

export default BackgroundLogos;