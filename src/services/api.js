import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
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
    const response = await api.post('/kiosk-signin/', { user_id: userId });
    console.log('Kiosk login response:', response.data);
    return response.data;
  },

  /**
   * Get all meetings
   * @returns {Promise<Array>} Array of meetings
   */
  async getAllMeetings() {
    console.log('Fetching all meetings');
    const response = await api.get('/meetings/');
    console.log('Fetched meetings:', response.data);
    return response.data;
  },

  /**
   * Create a new meeting
   * @param {Object} meetingData - The meeting data
   * @returns {Promise<Object>} The created meeting
   */
  async createMeeting(meetingData) {
    console.log('Creating meeting with data:', meetingData);
    const response = await api.post('/meetings/', meetingData);
    console.log('Created meeting:', response.data);
    return response.data;
  },

  /**
   * Update an existing meeting
   * @param {string} id - The meeting ID
   * @param {Object} meetingData - The updated meeting data
   * @returns {Promise<Object>} The updated meeting
   */
  async updateMeeting(id, meetingData) {
    console.log(`Updating meeting ${id} with data:`, meetingData);
    const response = await api.put(`/meetings/${id}`, meetingData);
    console.log('Updated meeting:', response.data);
    return response.data;
  },

  /**
   * Delete a meeting
   * @param {string} id - The meeting ID
   * @returns {Promise<Object>} The deletion response
   */
  async deleteMeeting(id) {
    console.log(`Deleting meeting ${id}`);
    const response = await api.delete(`/meetings/${id}`);
    console.log('Deletion response:', response.data);
    return response.data;
  },

  /**
   * Get all availabilities
   * @returns {Promise<Array>} Array of availabilities
   */
  async getAvailabilities() {
    console.log('Fetching all availabilities');
    const response = await api.get('/availabilities/');
    console.log('Fetched availabilities:', response.data);
    return response.data;
  },
};

export default apiService;