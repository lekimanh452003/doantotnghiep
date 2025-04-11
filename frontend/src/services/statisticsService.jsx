import api from './api';

const statisticsService = {
  getOverallStats: async () => {
    const response = await api.get('/statistics/overall');
    return response.data;
  },

  getClassStats: async (classId) => {
    const response = await api.get(`/statistics/class/${classId}`);
    return response.data;
  },

  getStudentProgress: async (classId, studentId) => {
    const response = await api.get(`/statistics/student-progress/${classId}/${studentId}`);
    return response.data;
  },

  getAssignmentStats: async (assignmentId) => {
    const response = await api.get(`/statistics/assignment/${assignmentId}`);
    return response.data;
  },

  getTeacherStats: async (teacherId) => {
    const response = await api.get(`/statistics/teacher/${teacherId}`);
    return response.data;
  },

  getMonthlyReport: async (year, month) => {
    const response = await api.get(`/statistics/monthly/${year}/${month}`);
    return response.data;
  },

  getYearlyReport: async (year) => {
    const response = await api.get(`/statistics/yearly/${year}`);
    return response.data;
  },

  getClassStatistics: async (classId) => {
    const response = await api.get(`/statistics/class-statistics/${classId}`);
    return response.data;
  },

  getAttendanceReport: async (lessonId) => {
    const response = await api.get(`/statistics/attendance-report/${lessonId}`);
    return response.data;
  },

  getAssignmentGradeReport: async (assignmentId) => {
    const response = await api.get(`/statistics/assignment-grade-report/${assignmentId}`);
    return response.data;
  },

  getExamGradeReport: async (examId) => {
    const response = await api.get(`/statistics/exam-grade-report/${examId}`);
    return response.data;
  },

  getStudyTimeReport: async (classId, studentId) => {
    const response = await api.get(`/statistics/study-time-report/${classId}/${studentId}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return null;

    try {
      // Fetch user's classes first
      const classesResponse = await api.get(`/class/${user.role === 'Teacher' ? 'teaching' : 'admin'}`);
      const classes = classesResponse.data;

      if (classes.length === 0) {
        return {
          totalClasses: 0,
          totalAssignments: 0,
          totalDiscussions: 0,
          totalAttendance: 0,
          assignmentStats: {
            completed: 0,
            pending: 0,
            overdue: 0
          },
          examStats: {
            completed: 0,
            average: 0
          },
          attendanceRate: 0
        };
      }

      if (user.role === 'Teacher') {
        // Fetch statistics for each class
        const classStats = await Promise.all(
          classes.map(classItem => statisticsService.getClassStatistics(classItem.id))
        );

        // Calculate totals and averages
        const stats = classStats.reduce((acc, curr) => ({
          totalClasses: acc.totalClasses + 1,
          totalAssignments: acc.totalAssignments + curr.totalAssignments,
          totalDiscussions: acc.totalDiscussions + curr.totalDiscussions,
          totalAttendance: acc.totalAttendance + curr.totalLessons,
          assignmentStats: {
            completed: acc.assignmentStats.completed + Math.round(curr.totalAssignments * curr.averageAssignmentCompletionRate / 100),
            pending: acc.assignmentStats.pending + Math.round(curr.totalAssignments * (100 - curr.averageAssignmentCompletionRate) / 100),
            overdue: acc.assignmentStats.overdue + 0
          },
          examStats: {
            completed: acc.examStats.completed + curr.totalExams,
            average: acc.examStats.average + curr.averageExamScore
          },
          attendanceRate: acc.attendanceRate + curr.averageAttendanceRate
        }), {
          totalClasses: 0,
          totalAssignments: 0,
          totalDiscussions: 0,
          totalAttendance: 0,
          assignmentStats: {
            completed: 0,
            pending: 0,
            overdue: 0
          },
          examStats: {
            completed: 0,
            average: 0
          },
          attendanceRate: 0
        });

        // Calculate averages for rates
        stats.examStats.average = stats.examStats.average / stats.totalClasses;
        stats.attendanceRate = stats.attendanceRate / stats.totalClasses;

        return stats;

      } else {
        // Fetch progress for each class
        const progressStats = await Promise.all(
          classes.map(classItem => statisticsService.getStudentProgress(classItem.id, user.id))
        );

        // Calculate totals
        const stats = progressStats.reduce((acc, curr) => ({
          totalClasses: acc.totalClasses + 1,
          totalAssignments: acc.totalAssignments + curr.totalAssignments,
          totalDiscussions: acc.totalDiscussions + curr.totalDiscussions,
          totalAttendance: acc.totalAttendance + curr.totalAttendance,
          assignmentStats: {
            completed: acc.assignmentStats.completed + curr.completedAssignments,
            pending: acc.assignmentStats.pending + (curr.totalAssignments - curr.completedAssignments),
            overdue: acc.assignmentStats.overdue + 0
          },
          examStats: {
            completed: acc.examStats.completed + curr.completedExams,
            average: acc.examStats.average + curr.averageExamScore
          },
          attendanceRate: acc.attendanceRate + curr.attendanceRate
        }), {
          totalClasses: 0,
          totalAssignments: 0,
          totalDiscussions: 0,
          totalAttendance: 0,
          assignmentStats: {
            completed: 0,
            pending: 0,
            overdue: 0
          },
          examStats: {
            completed: 0,
            average: 0
          },
          attendanceRate: 0
        });

        // Calculate averages for rates
        stats.examStats.average = stats.examStats.average / stats.totalClasses;
        stats.attendanceRate = stats.attendanceRate / stats.totalClasses;

        return stats;
      }
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  }
};

export default statisticsService; 