import { useState, useEffect } from 'react';

/**
 * Custom hook to generate and manage background logos
 * @param {number} mobileCount - Number of logos for mobile screens
 * @param {number} desktopCount - Number of logos for desktop screens
 * @returns {Array} Array of logo objects
 */
const useBackgroundLogos = (mobileCount = 100, desktopCount = 200) => {
  const [logos, setLogos] = useState([]);

  useEffect(() => {
    const generateLogos = () => {
      const isMobile = window.innerWidth < 768;
      const logoCount = isMobile ? mobileCount : desktopCount;
      const newLogos = [];

      for (let i = 0; i < logoCount; i++) {
        newLogos.push({
          size: Math.random() * 150 + 100,
          top: Math.random() * 100,
          left: Math.random() * 100,
          opacity: Math.random() * 0.3 + 0.2,
          rotation: Math.random() * 360,
        });
      }

      setLogos(newLogos);
      console.log(`Generated ${newLogos.length} background logos`);
    };

    generateLogos();

    window.addEventListener("resize", generateLogos);
    return () => window.removeEventListener("resize", generateLogos);
  }, [mobileCount, desktopCount]);

  return logos;
};

export default useBackgroundLogos;