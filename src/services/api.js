import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://ec2-3-82-206-23.compute-1.amazonaws.com:8000/api/v1';

console.log('Using API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Log all requests
api.interceptors.request.use(request => {
  console.log('Starting Request', JSON.stringify(request, null, 2));
  return request;
});

// Log all responses
api.interceptors.response.use(response => {
  console.log('Response:', JSON.stringify(response, null, 2));
  return response;
}, error => {
  console.log('Error:', error);
  if (error.response) {
    console.log('Error Data:', error.response.data);
    console.log('Error Status:', error.response.status);
    console.log('Error Headers:', error.response.headers);
  }
  if (error.message === 'Network Error') {
    console.log('Possible CORS error. Check if the server is configured to allow CORS.');
  }
  return Promise.reject(error);
});

/**
 * Set the authorization token for API requests
 * @param {string} token - The JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const apiService = {
  /**
   * Perform a kiosk login
   * @param {string} userId - The user ID or barcode
   * @returns {Promise<Object>} The login response
   */
  async kioskLogin(userId) {
    console.log('Attempting kiosk login for user:', userId);
    try {
      const response = await api.post('/kiosk-signin/', { user_id: userId });
      console.log('Kiosk login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Kiosk login error:', error);
      throw error;
    }
  },

  /**
   * Get all meetings
   * @returns {Promise<Array>} Array of meetings
   */
  async getAllMeetings() {
    console.log('Fetching all meetings');
    try {
      const response = await api.get('/meetings/');
      console.log('Fetched meetings:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching meetings:', error);
      if (error.message === 'Network Error') {
        throw new Error('CORS error: The server is not configured to allow requests from this origin.');
      }
      throw error;
    }
  },

  /**
   * Create a new meeting
   * @param {Object} meetingData - The meeting data
   * @returns {Promise<Object>} The created meeting
   */
  async createMeeting(meetingData) {
    console.log('Creating meeting with data:', meetingData);
    try {
      const response = await api.post('/meetings/', meetingData);
      console.log('Created meeting:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating meeting:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  /**
   * Update an existing meeting
   * @param {string} id - The meeting ID
   * @param {Object} meetingData - The updated meeting data
   * @returns {Promise<Object>} The updated meeting
   */
  async updateMeeting(id, meetingData) {
    console.log(`Updating meeting ${id} with data:`, meetingData);
    try {
      const response = await api.put(`/meetings/${id}`, meetingData);
      console.log('Updated meeting:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating meeting:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  /**
   * Delete a meeting
   * @param {string} id - The meeting ID
   * @returns {Promise<Object>} The deletion response
   */
  async deleteMeeting(id) {
    console.log(`Deleting meeting ${id}`);
    try {
      const response = await api.delete(`/meetings/${id}`);
      console.log('Deletion response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting meeting:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  /**
   * Get all availabilities
   * @returns {Promise<Array>} Array of availabilities
   */
  async getAvailabilities() {
    console.log('Fetching all availabilities');
    try {
      const response = await api.get('/availabilities/');
      console.log('Fetched availabilities:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching availabilities:', error.response ? error.response.data : error.message);
      throw error;
    }
  },
};

export default apiService;