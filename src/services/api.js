// src/services/api.js

import axios from 'axios';

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

  async getAllFaculty() {
    try {
      const response = await api.get('/users/');
      console.log('API Response:', response.data); // Debug log
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

  async getAvailabilitiesByUser(userId) {
    try {
      const response = await api.get(`/availability/get-by-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      throw error;
    }
  },

  async getAppointmentsByUser(userId) {
    try {
      const response = await api.get(`/appointments/get-by-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
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
