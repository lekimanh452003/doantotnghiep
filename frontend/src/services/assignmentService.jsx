import api from './api';
import notificationService from './notificationService';
import { getUserId } from '../utils/auth';

const assignmentService = {
  getAll: async () => {
    const response = await api.get('/assignment');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/assignment/${id}`);
    return response.data;
  },

  create: async (classId, assignmentData) => {
    const createAssignmentDto = {
      title: assignmentData.title,
      description: assignmentData.description,
      dueDate: assignmentData.dueDate,
      type: assignmentData.type === 'MultipleChoice' ? 0 : assignmentData.type === 'Essay' ? 1 : 2,
      content: assignmentData.content,
      attachmentUrl: assignmentData.attachmentUrl
    };
    const response = await api.post(`/assignment/class/${classId}`, createAssignmentDto);
    
    // Tạo thông báo cho học sinh
    const notificationData = {
      title: 'Bài tập mới',
      content: `Giáo viên đã tạo bài tập mới: ${assignmentData.title}`,
      type: 'Assignment',
      targetId: response.data.id,
      targetType: 'Assignment',
      classId: classId,
      userId: getUserId()
    };
    await notificationService.create(notificationData);
    
    return response.data;
  },

  update: async (id, assignmentData) => {
    const updateAssignmentDto = {
      title: assignmentData.title,
      description: assignmentData.description,
      dueDate: assignmentData.dueDate,
      content: assignmentData.content,
      attachmentUrl: assignmentData.attachmentUrl
    };
    const response = await api.put(`/assignment/${id}`, updateAssignmentDto);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/assignment/${id}`);
    return response.data;
  },

  getClassAssignments: async (classId) => {
    const response = await api.get(`/assignment/class/${classId}`);
    return response.data;
  },

  submitAssignment: async (id, submissionData) => {
    const response = await api.post(`/assignment/${id}/submit`, submissionData);
    return response.data;
  },

  gradeSubmission: async (id, submissionId, gradeData) => {
    const response = await api.post(`/assignment/${id}/submissions/${submissionId}/grade`, gradeData);
    return response.data;
  }
};

export default assignmentService; 