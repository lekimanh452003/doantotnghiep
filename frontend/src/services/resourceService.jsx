import api from './api';
import notificationService from './notificationService';
import { getUserId } from '../utils/auth';

const resourceService = {
  getAll: async () => {
    const response = await api.get('/resource');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/resource/${id}`);
    return response.data;
  },

  getClassResources: async (classId) => {
    const response = await api.get(`/resource/class/${classId}`);
    return response.data;
  },

  create: async (classId, data) => {
    const response = await api.post(`/Resource/class/${classId}`, data);
    
    // Tạo thông báo cho học sinh
    const notificationData = {
      title: 'Tài liệu mới',
      content: `Giáo viên đã tải lên tài liệu mới: ${data.title}`,
      type: 'Resource',
      targetId: response.data.id,
      targetType: 'Resource',
      classId: data.classId,
      userId: getUserId()
    };
    await notificationService.create(notificationData);
    
    return response.data;
  },

  update: async (id, resourceData) => {
    const response = await api.put(`/resource/${id}`, resourceData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/resource/${id}`);
    return response.data;
  },

  download: async (id) => {
    const response = await api.get(`/resources/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default resourceService; 