import api from './api';

const classService = {
  getAll: async () => {
    const response = await api.get('/class');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/class/${id}`);
    return response.data;
  },

  create: async (classData) => {
    const response = await api.post('/class', classData);
    return response.data;
  },

  update: async (id, classData) => {
    const response = await api.put(`/class/${id}`, classData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/class/${id}`);
    return response.data;
  },

  enrollStudent: async (id, studentId) => {
    const response = await api.post(`/class/${id}/enroll/${studentId}`);
    return response.data;
  },

  removeStudent: async (id, studentId) => {
    const response = await api.delete(`/class/${id}/students/${studentId}`);
    return response.data;
  },

  getStudents: async (id) => {
    const response = await api.get(`/class/${id}/students`);
    return response.data;
  },

  joinClass: async (joinData) => {
    const response = await api.post('/class/join', joinData);
    return response.data;
  }
};

export default classService; 