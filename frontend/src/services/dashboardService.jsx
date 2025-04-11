import api from './api';

const dashboardService = {
  getStudentDashboard: async () => {
    const response = await api.get('/dashboard/student');
    return response.data;
  },

  getTeacherDashboard: async () => {
    const response = await api.get('/dashboard/teacher');
    return response.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  getRecentActivities: async () => {
    const response = await api.get('/dashboard/activities');
    return response.data;
  },

  getUpcomingEvents: async () => {
    const response = await api.get('/dashboard/events');
    return response.data;
  },

  getPerformanceMetrics: async () => {
    const response = await api.get('/dashboard/performance');
    return response.data;
  },

  getClassProgress: async () => {
    const response = await api.get('/dashboard/class-progress');
    return response.data;
  },

  getAssignmentStatus: async () => {
    const response = await api.get('/dashboard/assignment-status');
    return response.data;
  },

  getSystemStats: async () => {
    const response = await api.get('/dashboard/system-stats');
    return response.data;
  }
};

export default dashboardService; 