import api from './api';

const notificationService = {
  getAll: async () => {
    const response = await api.get('/notification');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/notification/${id}`);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notification/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notification/read-all');
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notification/${id}`);
    return response.data;
  },

  deleteAll: async () => {
    const response = await api.delete('/notification');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/notification', data);
    return response.data;
  }
};

export default notificationService; 