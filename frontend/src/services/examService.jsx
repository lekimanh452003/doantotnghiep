import api from './api';

const examService = {
  getAll: async () => {
    const response = await api.get('/exams');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/exam/${id}`);
    return response.data;
  },

  create: async (examData) => {
    const response = await api.post('/exam', examData);
    return response.data;
  },

  update: async (id, examData) => {
    const response = await api.put(`/exams/${id}`, examData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },

  startExam: async (id) => {
    const response = await api.post(`/exams/${id}/start`);
    return response.data;
  },

  submitExam: async (id, answers) => {
    const response = await api.post(`/exams/${id}/submit`, answers);
    return response.data;
  },

  getResults: async (id) => {
    const response = await api.get(`/exams/${id}/results`);
    return response.data;
  },

  getStudentResults: async (id, studentId) => {
    const response = await api.get(`/exams/${id}/results/${studentId}`);
    return response.data;
  },

  addQuestion: async (id, questionData) => {
    const response = await api.post(`/exams/${id}/questions`, questionData);
    return response.data;
  },

  updateQuestion: async (id, questionId, questionData) => {
    const response = await api.put(`/exams/${id}/questions/${questionId}`, questionData);
    return response.data;
  },

  deleteQuestion: async (id, questionId) => {
    const response = await api.delete(`/exams/${id}/questions/${questionId}`);
    return response.data;
  },

  getByClass: async (classId) => {
    const response = await api.get(`/exam/class/${classId}`);
    return response.data;
  },

  submit: async (submissionData) => {
    const response = await api.post('/exam/submit', submissionData);
    return response.data;
  },

  getSubmissions: async (examId) => {
    const response = await api.get(`/exam/${examId}/submissions`);
    return response.data;
  },

  gradeSubmission: async (submissionId, grades) => {
    const response = await api.post(`/exam/submission/${submissionId}/grade`, grades);
    return response.data;
  }
};

export default examService; 