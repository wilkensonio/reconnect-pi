import axios from 'axios';
import qs from 'qs';

const API_URL = import.meta.env.VITE_API_URL || 'http://ec2-3-82-206-23.compute-1.amazonaws.com:8000/api/v1';
const apiKey = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'R-API-KEY': apiKey,
  },
});

api.interceptors.request.use(request => {
  const token = localStorage.getItem('reconnect_access_token');
  if (token) {
    request.headers['Authorization'] = `Bearer ${token}`;
  }
  return request;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('reconnect_access_token');
      sessionStorage.removeItem('selected_faculty_id');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  async kioskLogin(userId) {
    try {
      const response = await api.post('/kiosk-signin/', { user_id: userId });
      const { access_token } = response.data;
      localStorage.setItem('reconnect_access_token', access_token);
      return response.data;
    } catch (error) {
      console.error('Kiosk login error:', error);
      throw error;
    }
  },

  async getAllFaculty() {
    try {
      // For development, return sample data
      return [{
        id: "70578617",
        first_name: "J",
        last_name: "Escobar",
        title: "Professor",
        department: "Computer Science"
      }];
      // Uncomment when API endpoint is ready:
      // const response = await api.get('/users/faculty/');
      // return response.data;
    } catch (error) {
      console.error('Error fetching faculty members:', error);
      throw error;
    }
  },

  async getAvailabilitiesByUser(facultyId) {
    try {
      const response = await api.get(`/availability/get-by-user/${facultyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching faculty availabilities:', error);
      throw error;
    }
  },

  async getStudentAppointments(studentId) {
    try {
      const response = await api.get(`/appointments/?student_id=${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student appointments:', error);
      throw error;
    }
  },

  // ... rest of your existing methods ...

  async createAppointment(appointmentData) {
    try {
      const response = await api.post('/appointment/create/', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      if (error.response && error.response.data) {
        throw new Error(error.response.data.detail || 'Failed to create appointment');
      }
      throw error;
    }
  },

  async getFacultyInfo(facultyId) {
    try {
      const response = await api.get(`/user/id/${facultyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching faculty info:', error);
      throw error;
    }
  },

  async logout() {
    try {
      localStorage.removeItem('reconnect_access_token');
      sessionStorage.removeItem('selected_faculty_id');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  stringifyQuery(obj) {
    return qs.stringify(obj);
  }
};

export default apiService;