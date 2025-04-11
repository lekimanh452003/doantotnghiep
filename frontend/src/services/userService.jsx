import api from './api.jsx';

const userService = {
  // Get all users
  async getAll() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user by ID
  async getById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new user
  async create(userData) {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user
  async update(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete user
  async delete(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
//update profile + pass
  async updateMe(data) {
    try {
      const token = authService.getToken();
      const response = await api.put('/auth/update', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Nếu có token mới, lưu lại
      if (response.data.token) {
        authService.setToken(response.data.token);
      }

      authService.setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getNotificationSettings: async () => {
    const response = await api.get('/users/notification-settings');
    return response.data;
  },

  updateNotificationSettings: async (settings) => {
    const response = await api.put('/users/notification-settings', settings);
    return response.data;
  },

  getAllTeachers: async () => {
    const response = await api.get('/users/teachers');
    return response.data;
  },

  getAllStudents: async () => {
    const response = await api.get('/users/students');
    return response.data;
  },

  deactivateAccount: async () => {
    const response = await api.put('/users/deactivate');
    return response.data;
  },

  reactivateAccount: async () => {
    const response = await api.put('/users/reactivate');
    return response.data;
  }
};

export default userService; 