import React from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import { useAppContext } from '../context/AppContext';
import '../styles/Home.css';
import logoSrc from '/rcnnct.png';

/**
 * Home component displaying the main menu
 */
const Home = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();

  /**
   * Handle navigation to different pages
   * @param {string} path - The path to navigate to
   */
  const handleNavigation = (path) => {
    if (user) {
      navigate(path);
    } else {
      navigate('/login', { state: { from: path } });
    }
    console.log(`Navigating to: ${path}`);
  };

  return (
    <div className="home">
      <BackgroundLogos logoSrc={logoSrc} />
      <div className="card">
        <h1>Message from Faculty</h1>
        <div className="button-container">
          <Button onClick={() => handleNavigation('/schedule')}>
            Schedule Meeting
          </Button>
          <Button onClick={() => handleNavigation('/view')}>
            View Meeting
          </Button>
          <Button onClick={() => handleNavigation('/view')}>
            Cancel Meeting
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;