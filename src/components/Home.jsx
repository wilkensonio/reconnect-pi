import React from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import '../styles/Home.css';
import logoSrc from '/rcnnct.png';
import LogoutButton from './LogoutButton';


const Home = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
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
          <LogoutButton/>
        </div>
      </div>
    </div>
  );
};

export default Home;