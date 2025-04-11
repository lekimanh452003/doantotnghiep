import api from './api.jsx';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const authService = {
  // Core authentication methods
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async updateProfile(updateData) {
    try {
      const token = this.getToken();
      const response = await api.put('/auth/update', updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Nếu backend trả về token mới thì cập nhật lại
      if (response.data.token) {
        this.setToken(response.data.token);
      }
  
      this.setUser(response.data.user); 
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  logout() {
    this.clearToken();
    this.clearUser();
  },

  // Local storage management
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.clearUser();
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  clearUser() {
    localStorage.removeItem(USER_KEY);
  },

  // Authentication state
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  },

  getCurrentUser() {
    return this.getUser();
  }
};

export default authService; 