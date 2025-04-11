import api from './api';
import notificationService from './notificationService';
import { getUserId } from '../utils/auth';

const discussionService = {
  getAll: async () => {
    const response = await api.get('/discussion');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/discussion/${id}`);
    return response.data;
  },

  getClassDiscussions: async (classId) => {
    const response = await api.get(`/discussion/class/${classId}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/discussion', data);
    
    // Tạo thông báo cho học sinh
    const notificationData = {
      title: 'Thảo luận mới',
      content: `Giáo viên đã tạo chủ đề thảo luận mới: ${data.title}`,
      type: 'Discussion',
      targetId: response.data.id,
      targetType: 'Discussion',
      classId: data.classId,
      userId: getUserId()
    };
    await notificationService.create(notificationData);
    
    return response.data;
  },

  update: async (id, discussionData) => {
    const response = await api.put(`/discussion/${id}`, discussionData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/discussion/${id}`);
    return response.data;
  },

  addComment: async (commentData) => {
    const response = await api.post('/discussion/comment', commentData);
    return response.data;
  },

  updateComment: async (commentId, commentData) => {
    const response = await api.put(`/discussion/comment/${commentId}`, commentData);
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/discussion/comment/${commentId}`);
    return response.data;
  }
};

export default discussionService; 