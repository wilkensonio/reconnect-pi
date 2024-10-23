import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import BackgroundLogos from './BackgroundLogos';
import Button from './Button';
import '../styles/FacultySelection.css';
import logoSrc from '/rcnnct.png';

// Sample faculty data while figuring out the API
const SAMPLE_FACULTY = [
  {
    id: "70578617",
    first_name: "J",
    last_name: "Escobar",
    title: "Professor",
    department: "Computer Science"
  }
];

const FacultySelection = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAppContext();

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        // For development, using sample data
        // const response = await apiService.getAllFaculty();
        setFaculty(SAMPLE_FACULTY);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching faculty:', error);
        setError('Failed to load faculty members. Please try again later.');
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  const handleFacultySelect = (facultyId) => {
    sessionStorage.setItem('selected_faculty_id', facultyId);
    // If user is already logged in, go directly to home
    if (user) {
      navigate('/home');
    } else {
      navigate('/login');
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

  if (error) {
    return (
      <div className="faculty-selection">
        <BackgroundLogos logoSrc={logoSrc} />
        <div className="faculty-selection-container">
          <div className="faculty-card">
            <div className="error-container">
              <p>{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
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
              <div key={member.id} className="faculty-item">
                <button
                  onClick={() => handleFacultySelect(member.id)}
                  className="faculty-button"
                >
                  <div className="faculty-name">
                    {member.last_name}, {member.first_name}
                  </div>
                  <div className="faculty-details">
                    {member.title}
                  </div>
                  <div className="faculty-department">
                    {member.department}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultySelection;