// src/app/api/notification.js
import axios from 'axios';

const API_BASE = 'https://code360.pro';

export const notificationApi = {
  // Fetch history (No token needed)
  getNotifications: async (email) => {
    const response = await axios.get(`${API_BASE}/notifications/${email}`);
    return response.data;
  },

  // Mark one as read
  markAsRead: async (notificationId) => {
    const response = await axios.patch(`${API_BASE}/notifications/mark-read`, { 
      notificationId 
    });
    return response.data;
  },

  // Mark all as read
  markAllRead: async (email) => {
    const response = await axios.patch(`${API_BASE}/notifications/mark-all-read`, { 
      email 
    });
    return response.data;
  }
};