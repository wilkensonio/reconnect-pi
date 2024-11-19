import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import '../styles/FacultySelection.css';
import logoSrc from '/rcnnct.png';
import LogoutButton from './LogoutButton';

const FacultySelection = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppContext();


  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('reconnect_access_token');
        
        if (!token) {
          setError('Please log in to view faculty members.');
          navigate('/login', { state: { from: location.pathname } });
          return;
        }

        const facultyMembers = await apiService.getAllFaculty();
        
        if (!facultyMembers || facultyMembers.length === 0) {
          setError('No faculty members found.');
          return;
        }
        
        setFaculty(facultyMembers);
      } catch (error) {
        console.error('Error fetching faculty:', error);
        
        if (error.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          navigate('/login', { state: { from: location.pathname } });
        } else {
          setError('Failed to load faculty members. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, [location.state, navigate, location.pathname]);

  const handleFacultySelect = (facultyId) => {
    if (!facultyId) return;
    
    sessionStorage.setItem('selected_faculty_id', facultyId);
    
    if (!localStorage.getItem('reconnect_access_token') || !user) {
      navigate('/login');
    } else {
      navigate('/home');
    }
  };

  if (loading) {
    return (
      <div className="faculty-selection">
        <BackgroundLogos logoSrc={logoSrc} />
        <div className="faculty-selection-container">
          <div className="faculty-card">
            <div className="loading-container">
              <div className="loading-spinner" />
              <p>Loading faculty members...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-selection">
      <BackgroundLogos logoSrc={logoSrc} />
      <div className="faculty-selection-container">
        <div className="faculty-card">
          <div className="logout-button-container">
            <LogoutButton />
          </div>
          <h2>Select a Faculty Member</h2>
          {faculty.length > 0 ? (
            <div className="faculty-grid">
              {faculty.map((member) => (
                <div key={member.user_id} className="faculty-item">
                  <button
                    onClick={() => handleFacultySelect(member.user_id)}
                    className="faculty-button"
                  >
                    <div className="faculty-name">
                      {member.last_name}, {member.first_name}
                    </div>
                    <div className="faculty-details">
                      {member.title || 'Faculty Member'}
                    </div>
                    {member.department && (
                      <div className="faculty-department">
                        {member.department}
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="error-container">
              <p className="error-message">{error || 'No faculty members available.'}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultySelection;