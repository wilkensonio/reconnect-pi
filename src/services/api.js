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

  async getStudentAppointments(studentId) {
    try {
      const response = await api.get(`/appointments/?student_id=${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student appointments:', error);
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

  async getAppointmentById(appointmentId) {
    try {
      const response = await api.get(`/appointment/get-by-id/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  },

  async updateAppointment(appointmentId, appointmentData) {
    try {
      const response = await api.put(`/appointment/update/${appointmentId}`, appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
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

  async getAvailabilities() {
    try {
      const response = await api.get('/availabilities/');
      return response.data;
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      throw error;
    }
  },

  async logout() {
    try {
      // If you have a backend logout endpoint, you can call it here
      // await api.post('/logout');
      localStorage.removeItem('reconnect_access_token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  stringifyQuery(obj) {
    return qs.stringify(obj);
  }
};

export default apiService;