import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import '../styles/FacultySelection.css';
import logoSrc from '/rcnnct.png';

const FacultySelection = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppContext();

  useEffect(() => {
    const fetchFaculty = async () => {
      const token = localStorage.getItem('reconnect_access_token');
      if (!token) {
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getAllFaculty();
        console.log('Faculty response:', response); // Debug log
        setFaculty(response);
      } catch (error) {
        console.error('Error fetching faculty:', error);
        setError('Failed to load faculty members. Please try again.');
        // Don't redirect on error, just show error message
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, [navigate, location.pathname]);

  const handleFacultySelect = (facultyId) => {
    sessionStorage.setItem('selected_faculty_id', facultyId);
    const token = localStorage.getItem('reconnect_access_token');
    
    if (!token || !user) {
      navigate('/login', { state: { from: '/home' } });
    } else {
      navigate('/home');
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
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
          <h2>Select a Faculty Member</h2>
          {error ? (
            <div className="error-container">
              <p>{error}</p>
              <Button onClick={handleRetry}>Try Again</Button>
            </div>
          ) : (
            <div className="faculty-grid">
              {faculty.map((member) => (
                <div key={member.user_id || member.id} className="faculty-item">
                  <button
                    onClick={() => handleFacultySelect(member.user_id)}
                    className="faculty-button"
                  >
                    <div className="faculty-name">
                      {member.last_name}, {member.first_name}
                    </div>
                    <div className="faculty-details">
                      Faculty Member
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultySelection;