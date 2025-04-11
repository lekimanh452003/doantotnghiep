import api from './api';
import notificationService from './notificationService';
import { getUserId } from '../utils/auth';

const lessonService = {
  getAll: async () => {
    const response = await api.get('/lesson');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/lesson/${id}`);
    return response.data;
  },

  create: async (classId, data) => {
    const response = await api.post(`/Lesson/class/${classId}`, data);
    
    // Tạo thông báo cho học sinh
    const notificationData = {
      title: 'Buổi học mới',
      content: `Giáo viên đã tạo buổi học mới: ${data.title}`,
      type: 'Lesson',
      targetId: response.data.id,
      targetType: 'Lesson',
      classId: data.classId,
      userId: getUserId()
    };
    await notificationService.create(notificationData);
    
    return response.data;
  },

  update: async (id, lessonData) => {
    const response = await api.put(`/lesson/${id}`, lessonData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/lesson/${id}`);
    return response.data;
  },

  getClassLessons: async (classId) => {
    const response = await api.get(`/lesson/class/${classId}`);
    return response.data;
  },

  markAttendance: async (id, attendances) => {
    const response = await api.post(`/lesson/${id}/attendance`, attendances);
    return response.data;
  },

  markComplete: async (id) => {
    const response = await api.post(`/lesson/${id}/complete`);
    return response.data;
  },

  getProgress: async (id) => {
    const response = await api.get(`/lesson/${id}/progress`);
    return response.data;
  }
};

export default lessonService; 