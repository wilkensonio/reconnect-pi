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
      try {
        setLoading(true);
        setError(null);

        // Check if we have a token
        const token = localStorage.getItem('reconnect_access_token');
        
        if (!token) {
          // If coming from login page, show error
          if (location.state?.from === '/login') {
            setError('Authentication required to view faculty members.');
          } else {
            // First time visitors or expired token - use sample data temporarily
            setFaculty([{
              id: "70578617",
              user_id: "70578617",
              first_name: "J",
              last_name: "Escobar",
              title: "Professor",
              department: "Computer Science"
            }]);
          }
        } else {
          // We have a token, try to fetch faculty
          const facultyMembers = await apiService.getAllFaculty();
          setFaculty(facultyMembers);
        }
      } catch (error) {
        console.error('Error fetching faculty:', error);
        // If unauthorized, use sample data
        if (error.response?.status === 401) {
          setFaculty([{
            id: "70578617",
            user_id: "70578617",
            first_name: "J",
            last_name: "Escobar",
            title: "Professor",
            department: "Computer Science"
          }]);
        } else {
          setError('Failed to load faculty members. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, [location.state]);

  const handleFacultySelect = (facultyId) => {
    sessionStorage.setItem('selected_faculty_id', facultyId);
    
    // If no token or user, go to login
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
          <h2>Select a Faculty Member</h2>
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
          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultySelection;