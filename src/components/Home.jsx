import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import { apiService } from '../services/api';
import LogoutButton from './LogoutButton';
import '../styles/Home.css';
import logoSrc from '/rcnnct.png';

const Home = () => {
  const navigate = useNavigate();
  const [facultyInfo, setFacultyInfo] = useState(null);
  const facultyId = sessionStorage.getItem('selected_faculty_id');

  useEffect(() => {
    const fetchFacultyInfo = async () => {
      if (!facultyId) {
        navigate('/', { replace: true });
        return;
      }

      try {
        const info = await apiService.getFacultyInfo(facultyId);
        setFacultyInfo(info);
      } catch (error) {
        console.error('Error fetching faculty info:', error);
      }
    };

    fetchFacultyInfo();
  }, [facultyId, navigate]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleChangeFaculty = () => {
    sessionStorage.removeItem('selected_faculty_id');
    navigate('/', { replace: true });
  };
  

  return (
    <div className="home">
      <BackgroundLogos logoSrc={logoSrc} />
      <div className="home-container">
        <div className="card home-card">
          <div className="faculty-header">
            {facultyInfo && (
              <h2>Prof. {facultyInfo.last_name}'s Office Hours</h2>
            )}
          </div>
          <div className="button-container">
            <Button 
              onClick={() => handleNavigation('/schedule')}
              className="action-button"
            >
              Schedule Meeting
            </Button>
            <Button 
              onClick={() => handleNavigation('/view')}
              className="action-button"
            >
              View Meetings
            </Button>
            <Button 
              onClick={handleChangeFaculty}
              className="change-faculty-button"
            >
              Change Faculty Member
            </Button>
            <LogoutButton className="logout-button" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;