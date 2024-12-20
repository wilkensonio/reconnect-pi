import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://ec2-3-82-206-23.compute-1.amazonaws.com:8000';
const apiKey = import.meta.env.VITE_API_KEY;

// Single axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'R-API-KEY': apiKey,
  },
  timeout: 5000,
});

// Add auth interceptor
api.interceptors.request.use(request => {
  const token = localStorage.getItem('reconnect_access_token');
  if (token) {
    request.headers['Authorization'] = `Bearer ${token}`;
  }
  return request;
});

// Add response interceptor
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
  // Authentication
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

  // Faculty
  async getAllFaculty() {
    try {
      const response = await api.get('/users/');
      return response.data;
    } catch (error) {
      console.error('Error fetching faculty members:', error);
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

  // Availability
  async getAvailabilitiesByUser(userId) {
    try {
      const response = await api.get(`/availability/get-by-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      throw error;
    }
  },

  // Appointments
  async getAppointmentsByUser(userId) {
    try {
      const response = await api.get(`/appointments/get-by-user/${userId}`);
      console.log('API Response for appointments:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error in getAppointmentsByUser:', error.response || error);
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

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

  async deleteAppointment(appointmentId) {
    try {
      const response = await api.delete(`/appointment/delete/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },

  // Student Check-in
  async studentCheckin(appointmentId) {
    try {
      const response = await api.post(`/student/checkin/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking in:', error);
      if (error.response && error.response.data) {
        throw new Error(error.response.data.detail || 'Failed to check in');
      }
      throw error;
    }
  },

  // PI Messages
  async getAllPiMessages() {
    try {
      const response = await api.get('/pi-message/get-all');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return [];
      }
      console.error('Error fetching PI messages:', error);
      throw error;
    }
  },

  async getPiMessage(userId) {
    try {
      const response = await api.get(`/pi-message/get/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error('Error fetching PI message:', error);
      throw error;
    }
  },

  async deletePiMessage(userId) {
    try {
      const response = await api.delete(`/pi-message/delete/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting PI message:', error);
      throw error;
    }
  },

  // Session Management
  logout() {
    try {
      localStorage.removeItem('reconnect_access_token');
      sessionStorage.removeItem('selected_faculty_id');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
};

export default apiService;