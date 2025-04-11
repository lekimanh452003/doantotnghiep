import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import examService from '../services/examService';
import classService from '../services/classService';
import { useParams } from 'react-router-dom';
import DOMPurify from "dompurify";// thư viện cho dán ảnh
import UploadAudio from "../components/AudioQuestion";
// Tùy chỉnh cấu hình DOMPurify
const purifyConfig = {
  ADD_TAGS: ["audio", "source", "button"],
  ADD_ATTR: ["controls", "src", "onclick", "id", "type"],
};
const Exams = () => {
  const { classId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [createExamData, setCreateExamData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: 60,
    totalPoints: 100,
    maxScore: 100,
    passScore: 50,
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    content: '',
    type: 'MultipleChoice',
    points: 10,
    options: [
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false }
    ]
  });
  const [studentAnswers, setStudentAnswers] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionGrades, setSubmissionGrades] = useState({});
  const [studentSubmission, setStudentSubmission] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          console.log('User data:', userData);
          setUser(userData);
        }
        await fetchClasses();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchExams();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedExam) {
      fetchSubmissions(selectedExam.id);
    }
  }, [selectedExam]);

  const fetchClasses = async () => {
    try {
      console.log('Fetching classes...');
      const data = await classService.getAll();
      console.log('Classes data:', data);
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      enqueueSnackbar('Không thể tải danh sách lớp học', { variant: 'error' });
    }
  };

  const fetchExams = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      const data = await examService.getByClass(selectedClass.id);
      setExams(data);
    } catch (error) {
      enqueueSnackbar('Không thể tải danh sách bài kiểm tra', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (examId) => {
    try {
      const data = await examService.getSubmissions(examId);
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      enqueueSnackbar('Không thể tải danh sách bài nộp', { variant: 'error' });
    }
  };

  const handleCreateExam = async () => {
    try {
      if (!selectedClass) {
        enqueueSnackbar('Vui lòng chọn lớp học', { variant: 'error' });
        return;
      }

      if (createExamData.questions.length === 0) {
        enqueueSnackbar('Vui lòng thêm ít nhất một câu hỏi', { variant: 'error' });
        return;
      }

      const examData = {
        Title: createExamData.title,
        Description: createExamData.description,
        StartTime: createExamData.startTime,
        EndTime: createExamData.endTime,
        Duration: createExamData.duration,
        MaxScore: createExamData.maxScore,
        PassScore: createExamData.passScore,
        ClassId: selectedClass.id,
        Questions: createExamData.questions.map(q => ({
          Content: q.content,
          Type: q.type === 'MultipleChoice' ? 0 : 1,
          Points: q.points,
          Options: q.options.map(o => ({
            Content: o.content,
            IsCorrect: o.isCorrect
          }))
        }))
      };
      
      await examService.create(examData);
      enqueueSnackbar('Tạo bài kiểm tra thành công', { variant: 'success' });
      setIsCreateModalOpen(false);
      setCreateExamData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        duration: 60,
        totalPoints: 100,
        maxScore: 100,
        passScore: 50,
        questions: []
      });
      fetchExams();
    } catch (error) {
      console.error('Error creating exam:', error);
      enqueueSnackbar('Không thể tạo bài kiểm tra', { variant: 'error' });
    }
  };

  const handleAddQuestion = () => {
    console.log('Adding question:', currentQuestion);
    if (!currentQuestion.content) {
      enqueueSnackbar('Vui lòng nhập nội dung câu hỏi', { variant: 'error' });
      return;
    }

    if (currentQuestion.type === 'MultipleChoice') {
      const hasCorrectAnswer = currentQuestion.options.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        enqueueSnackbar('Vui lòng chọn ít nhất một đáp án đúng', { variant: 'error' });
        return;
      }
    }

    setCreateExamData(prev => ({
      ...prev,
      questions: [...prev.questions, currentQuestion]
    }));

    setCurrentQuestion({
      content: '',
      type: 'MultipleChoice',
      points: 10,
      options: [
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false }
      ]
    });
  };

  const handleStartExam = async (examId) => {
    try {
      const exam = exams.find(exam => exam.id === examId);
      setSelectedExam(exam);
      
      // Kiểm tra xem học sinh đã nộp bài chưa
      if (user?.role === 2) {
        const submissions = await examService.getSubmissions(examId);
        const studentSubmission = submissions.find(sub => sub.studentId === user.id);
        setStudentSubmission(studentSubmission);
        
        if (studentSubmission) {
          // Nếu đã nộp bài, hiển thị thông báo và không cho phép làm bài lại
          enqueueSnackbar('Bạn đã nộp bài kiểm tra này', { variant: 'info' });
          setIsDetailModalOpen(true);
          return;
        }
      }

      // Initialize answers structure
      const initialAnswers = {};
      exam.questions.forEach(question => {
        initialAnswers[question.id] = question.type === 0 ? null : '';
      });
      setStudentAnswers(initialAnswers);
      setIsDetailModalOpen(true);
    } catch (error) {
      enqueueSnackbar('Không thể bắt đầu bài kiểm tra', { variant: 'error' });
    }
  };

  const handleAnswerChange = (questionId, value, type) => {
    setStudentAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitExam = async (examId) => {
    try {
      // Kiểm tra xem đã trả lời hết các câu hỏi chưa
      const unansweredQuestions = selectedExam.questions.filter(q => !studentAnswers[q.id]);
      if (unansweredQuestions.length > 0) {
        enqueueSnackbar(`Vui lòng trả lời tất cả câu hỏi trước khi nộp bài`, { variant: 'warning' });
        return;
      }

      const answers = selectedExam.questions.map(question => ({
        questionId: question.id,
        content: studentAnswers[question.id].toString(), // Đổi answer thành content
        selectedOptionId: question.type === 0 ? studentAnswers[question.id] : null // Đổi optionId thành selectedOptionId
      }));

      const submitData = {
        examId: examId,
        answers: answers
      };

      console.log('Submit data:', submitData);
      await examService.submit(submitData);
      enqueueSnackbar('Nộp bài kiểm tra thành công', { variant: 'success' });
      setIsDetailModalOpen(false);
      fetchExams();
    } catch (error) {
      console.error('Submit error:', error);
      enqueueSnackbar('Không thể nộp bài kiểm tra: ' + error.message, { variant: 'error' });
    }
  };

  const handleGradeChange = (submissionId, questionId, field, value) => {
    setSubmissionGrades(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [questionId]: {
          ...prev[submissionId]?.[questionId],
          [field]: value
        }
      }
    }));
  };

  const handleUpdateSubmission = async (submissionId) => {
    try {
      const grades = Object.entries(submissionGrades[submissionId] || {}).map(([questionId, grade]) => ({
        answerId: questionId,
        score: grade.score || 0,
        feedback: grade.feedback || ''
      }));

      await examService.gradeSubmission(submissionId, grades);
      enqueueSnackbar('Cập nhật điểm thành công', { variant: 'success' });
      fetchSubmissions(selectedExam.id);
      setSubmissionGrades(prev => {
        const newGrades = { ...prev };
        delete newGrades[submissionId];
        return newGrades;
      });
    } catch (error) {
      console.error('Error updating submission:', error);
      enqueueSnackbar('Không thể cập nhật điểm', { variant: 'error' });
    }
  };

  const getStatusColor = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (now < startTime) {
      return 'bg-blue-100 text-blue-800'; // Upcoming
    } else if (now >= startTime && now <= endTime) {
      return 'bg-yellow-100 text-yellow-800'; // In Progress
    } else {
      return 'bg-green-100 text-green-800'; // Completed
    }
  };

  const getStatusText = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (now < startTime) {
      return 'Sắp diễn ra';
    } else if (now >= startTime && now <= endTime) {
      return 'Đang diễn ra';
    } else {
      return 'Đã kết thúc';
    }
  };

  const getButtonText = (exam, userRole) => {
    const now = new Date();
    const endTime = new Date(exam.endTime);

    if (userRole === 1) { // Teacher
      return 'Xem & Chấm bài';
    } else { // Student
      if (now > endTime) {
        return 'Xem kết quả';
      }
      return exam.submitted ? 'Xem bài làm' : 'Bắt đầu làm bài';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Danh sách bài kiểm tra</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedClass?.id || ''}
            onChange={(e) => {
              const classId = e.target.value;
              const selectedClass = classes.find(c => c.id === parseInt(classId));
              setSelectedClass(selectedClass);
            }}
            className="block w-48 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Chọn lớp học</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {user?.role === 1 && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Tạo bài kiểm tra mới</span>
            </button>
          )}
        </div>
      </div>

      {!selectedClass ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lớp học được chọn</h3>
          <p className="text-gray-500">Vui lòng chọn một lớp học để xem danh sách bài kiểm tra</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {exam.title}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ring-1 ring-opacity-50 ${getStatusColor(exam)}`}
                  >
                    {getStatusText(exam)}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-4">{exam.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Bắt đầu: {formatDateTime(exam.startTime)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Kết thúc: {formatDateTime(exam.endTime)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Thời lượng: {exam.duration} phút</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Tổng điểm: {exam.totalPoints}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartExam(exam.id)}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    new Date() > new Date(exam.endTime)
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    {new Date() > new Date(exam.endTime) ? (
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    ) : (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    )}
                  </svg>
                  <span>{getButtonText(exam, user?.role)}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Exam Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Tạo bài kiểm tra mới
                    </h3>
                    <div className="mt-6 space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Tiêu đề
                        </label>
                        <input
                          type="text"
                          value={createExamData.title}
                          onChange={(e) => setCreateExamData({ ...createExamData, title: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Mô tả
                        </label>
                        <textarea
                          value={createExamData.description}
                          onChange={(e) => setCreateExamData({ ...createExamData, description: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                          rows="3"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Thời gian bắt đầu
                          </label>
                          <input
                            type="datetime-local"
                            value={createExamData.startTime}
                            onChange={(e) => setCreateExamData({ ...createExamData, startTime: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Thời gian kết thúc
                          </label>
                          <input
                            type="datetime-local"
                            value={createExamData.endTime}
                            onChange={(e) => setCreateExamData({ ...createExamData, endTime: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Thời lượng (phút)
                          </label>
                          <input
                            type="number"
                            value={createExamData.duration}
                            onChange={(e) => setCreateExamData({ ...createExamData, duration: parseInt(e.target.value) })}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Tổng điểm
                          </label>
                          <input
                            type="number"
                            value={createExamData.totalPoints}
                            onChange={(e) => setCreateExamData({ ...createExamData, totalPoints: parseInt(e.target.value) })}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Điểm tối đa
                          </label>
                          <input
                            type="number"
                            value={createExamData.maxScore}
                            onChange={(e) => setCreateExamData({ ...createExamData, maxScore: parseInt(e.target.value) })}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Điểm đạt
                          </label>
                          <input
                            type="number"
                            value={createExamData.passScore}
                            onChange={(e) => setCreateExamData({ ...createExamData, passScore: parseInt(e.target.value) })}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                          />
                        </div>
                      </div>

                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-900">Danh sách câu hỏi</h4>
                          <span className="text-sm text-gray-500">{createExamData.questions.length} câu hỏi</span>
                        </div>
                        <div className="space-y-4">
                          {createExamData.questions.map((question, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium text-gray-900">Câu {index + 1}</h5>
                                  <div
                                    className="mt-1 text-sm text-gray-600 prose"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.content) }}
                                  />

                                  <div className="mt-2 flex items-center text-sm text-gray-500">
                                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                      {question.type === 'MultipleChoice' ? 'Trắc nghiệm' : 'Tự luận'}
                                    </span>
                                    <span className="ml-2">{question.points} điểm</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setCreateExamData(prev => ({
                                      ...prev,
                                      questions: prev.questions.filter((_, i) => i !== index)
                                    }));
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-4">Thêm câu hỏi mới</h5>
                          <div className="space-y-4">
                          <div> 
                          <label className="block text-sm font-medium text-gray-700">
                            Nội dung câu hỏi
                          </label>
                          <textarea
                            value={currentQuestion.content}
                            onChange={(e) =>
                              setCurrentQuestion({ ...currentQuestion, content: e.target.value })
                            }
                            onPaste={(e) => {
                              const items = e.clipboardData.items;
                              for (let item of items) {
                                if (item.type.indexOf("image") !== -1) {
                                  const blob = item.getAsFile();
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const base64Image = event.target.result;
                                    const imageTag = `<img src="${base64Image}" alt="pasted image" style="max-width: 100%;" />`;
                                    const textarea = e.target;
                                    const start = textarea.selectionStart;
                                    const end = textarea.selectionEnd;
                                    const before = currentQuestion.content.substring(0, start);
                                    const after = currentQuestion.content.substring(end);
                                    const newContent = before + imageTag + after;
                                    setCurrentQuestion({ ...currentQuestion, content: newContent });
                                  };
                                  reader.readAsDataURL(blob);
                                  e.preventDefault(); // Ngăn dán ảnh mặc định
                                }
                              }
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                            rows="2"
                          />
                          

                          {/* Xem trước nội dung  */}
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Xem trước
                            </label>
                            <div
                              className="prose border border-gray-200 rounded-lg p-3 bg-gray-50"
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(currentQuestion.content, purifyConfig),
                              }}    
                            />
                          </div>
                         {/* 
                          <UploadAudio
                            currentQuestion={currentQuestion}
                            setCurrentQuestion={setCurrentQuestion}
                          />
                          {currentQuestion.audioUrl && (
  <div className="mt-2 flex items-center gap-2">
    <button
      onClick={() => {
        const audio = document.getElementById("preview-audio");
        if (audio) audio.play();
      }}
      className="text-indigo-600 hover:text-indigo-800"
      title="Nghe audio"
    >
      🔊 Nghe audio
    </button>
    <audio id="preview-audio" src={currentQuestion.audioUrl} />
  </div>
)}

                         */}
                        </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Loại câu hỏi
                                </label>
                                <select
                                  value={currentQuestion.type}
                                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
                                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                                >
                                  <option value="MultipleChoice">Trắc nghiệm</option>
                                  <option value="Essay">Tự luận</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Điểm
                                </label>
                                <input
                                  type="number"
                                  value={currentQuestion.points}
                                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                                />
                              </div>
                            </div>

                            {currentQuestion.type === 'MultipleChoice' && (
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Các lựa chọn
                                </label>
                                {currentQuestion.options.map((option, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <input
                                      type="text"
                                      value={option.content}
                                      onChange={(e) => {
                                        const newOptions = [...currentQuestion.options];
                                        newOptions[index] = { ...option, content: e.target.value };
                                        setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                      }}
                                      className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                                      placeholder={`Lựa chọn ${index + 1}`}
                                    />
                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={option.isCorrect}
                                        onChange={(e) => {
                                          const newOptions = [...currentQuestion.options];
                                          newOptions[index] = { ...option, isCorrect: e.target.checked };
                                          setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                        }}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                      />
                                      <label className="ml-2 text-sm text-gray-500">
                                        Đáp án đúng
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <button
                              onClick={handleAddQuestion}
                              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                              <span>Thêm câu hỏi</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleCreateExam}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Tạo bài kiểm tra
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setCreateExamData({
                      title: '',
                      description: '',
                      startTime: '',
                      endTime: '',
                      duration: 60,
                      totalPoints: 100,
                      maxScore: 100,
                      passScore: 50,
                      questions: []
                    });
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail/Take Exam Modal */}
      {isDetailModalOpen && selectedExam && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm"></div>
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16">
              <div className="w-screen max-w-7xl">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  <div className="flex-1 h-0 overflow-y-auto">
                    <div className="py-6 px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <h2 className="text-lg font-medium text-gray-900">
                          {selectedExam.title}
                        </h2>
                        <div className="ml-3 h-7 flex items-center">
                          <button
                            type="button"
                            onClick={() => setIsDetailModalOpen(false)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <span className="sr-only">Đóng</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex">
                      {user?.role === 2 ? ( // Student view
                        <div className="flex-1 p-6 space-y-6">
                          {studentSubmission ? (
                            // Hiển thị kết quả bài làm
                            <div className="space-y-6">
                              <div className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-medium text-gray-900">Kết quả bài làm</h3>
                                    <p className="text-sm text-gray-500">
                                      Nộp bài lúc: {new Date(studentSubmission.submissionTime).toLocaleString('vi-VN')}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900">Tổng điểm:</span>
                                    <span className="text-sm text-gray-600">{studentSubmission.score || 0}/{selectedExam.totalPoints}</span>
                                  </div>
                                </div>
                              </div>

                              {selectedExam.questions?.map((question, index) => {
                                const answer = studentSubmission.answers.find(a => a.questionId === question.id);
                                return (
                                  <div key={question.id} className="bg-white rounded-lg shadow-sm p-4">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <h4 className="text-base font-medium text-gray-900">
                                          Câu {index + 1}
                                        </h4>
                                        <div
  className="mt-1 text-sm text-gray-600 prose"
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.content) }}
/>

                                        {question.type === 0 ? (
                                          <div className="mt-4 space-y-2">
                                            {question.options?.map((option) => (
                                              <div
                                                key={option.id}
                                                className={`flex items-center space-x-3 p-2 rounded ${
                                                  option.id === answer?.selectedOptionId
                                                    ? option.isCorrect
                                                      ? 'bg-green-50 border border-green-200'
                                                      : 'bg-red-50 border border-red-200'
                                                    : option.isCorrect
                                                      ? 'bg-green-50 border border-green-200'
                                                      : ''
                                                }`}
                                              >
                                                <input
                                                  type="radio"
                                                  checked={option.id === answer?.selectedOptionId}
                                                  disabled
                                                  className={`h-4 w-4 ${
                                                    option.isCorrect
                                                      ? 'text-green-600 border-green-300'
                                                      : option.id === answer?.selectedOptionId
                                                      ? 'text-red-600 border-red-300'
                                                      : 'text-gray-300 border-gray-300'
                                                  }`}
                                                />
                                                <span className={`text-sm ${
                                                  option.isCorrect
                                                    ? 'text-green-700'
                                                    : option.id === answer?.selectedOptionId
                                                    ? 'text-red-700'
                                                    : 'text-gray-700'
                                                }`}>
                                                  {option.content}
                                                </span>
                                                {option.isCorrect && (
                                                  <span className="ml-2 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                                                    Đáp án đúng
                                                  </span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="mt-4">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                              <p className="text-sm text-gray-700">{answer?.content}</p>
                                            </div>
                                          </div>
                                        )}
                                        <div className="mt-4 flex items-center justify-between">
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-900">Điểm:</span>
                                            <span className="text-sm text-gray-600">{answer?.score || 0}/{question.points}</span>
                                          </div>
                                          {answer?.feedback && (
                                            <div className="text-sm text-gray-600">
                                              <span className="font-medium">Nhận xét: </span>
                                              {answer.feedback}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <span className="ml-4 text-sm font-medium text-gray-500">
                                        {question.points} điểm
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            // Hiển thị form làm bài
                            selectedExam.questions?.map((question, index) => (
                              <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="text-base font-medium text-gray-900">
                                      Câu {index + 1}
                                    </h4>
                                    <div
  className="mt-1 text-sm text-gray-600 prose"
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.content) }}
/>
                                    {question.type === 0 ? (
                                      <div className="mt-4 space-y-2">
                                        {question.options?.map((option) => (
                                          <label key={option.id} className="flex items-center space-x-3">
                                            <input
                                              type="radio"
                                              name={`question-${question.id}`}
                                              value={option.id}
                                              checked={studentAnswers[question.id] === option.id}
                                              onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value), question.type)}
                                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                              disabled={new Date() > new Date(selectedExam.endTime)}
                                            />
                                            <span className="text-sm text-gray-700">{option.content}</span>
                                          </label>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="mt-4">
                                        <textarea
                                          value={studentAnswers[question.id] || ''}
                                          onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
                                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                          rows="3"
                                          placeholder="Nhập câu trả lời của bạn..."
                                          disabled={new Date() > new Date(selectedExam.endTime)}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <span className="ml-4 text-sm font-medium text-gray-500">
                                    {question.points} điểm
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                          {!studentSubmission && new Date() <= new Date(selectedExam.endTime) && (
                            <div className="sticky bottom-0 bg-white border-t p-4">
                              <button
                                type="button"
                                onClick={() => handleSubmitExam(selectedExam.id)}
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Nộp bài
                              </button>
                            </div>
                          )}
                        </div>
                      ) : ( // Teacher view
                        <>
                          {/* Left side - Submission details */}
                          <div className="flex-1 p-6 overflow-y-auto">
                            {selectedSubmission ? (
                              <div className="space-y-6">
                                <div className="bg-white rounded-lg shadow-sm p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h3 className="text-lg font-medium text-gray-900">{selectedSubmission.studentName}</h3>
                                      <p className="text-sm text-gray-500">
                                        Nộp bài lúc: {new Date(selectedSubmission.submissionTime).toLocaleString('vi-VN')}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm font-medium text-gray-900">Tổng điểm:</span>
                                      <span className="text-sm text-gray-600">{selectedSubmission.score || 0}/{selectedExam.totalPoints}</span>
                                    </div>
                                  </div>
                                </div>

                                {selectedExam.questions.map((question, index) => {
                                  const answer = selectedSubmission.answers.find(a => a.questionId === question.id);
                                  const grade = submissionGrades[selectedSubmission.id]?.[question.id] || {};
                                  const correctOption = question.options.find(o => o.isCorrect);
                                  return (
                                    <div key={question.id} className="bg-white rounded-lg shadow-sm p-4">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <h4 className="text-base font-medium text-gray-900">
                                            Câu {index + 1}
                                          </h4>
                                          <div
  className="mt-1 text-sm text-gray-600 prose"
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(question.content) }}
/>
                                          <div className="mt-4 space-y-2">
                                            {question.options?.map((option) => (
                                              <div
                                                key={option.id}
                                                className={`flex items-center space-x-3 p-2 rounded ${
                                                  option.id === answer?.selectedOptionId
                                                    ? option.isCorrect
                                                      ? 'bg-green-50 border border-green-200'
                                                      : 'bg-red-50 border border-red-200'
                                                    : option.isCorrect
                                                      ? 'bg-green-50 border border-green-200'
                                                      : ''
                                                }`}
                                              >
                                                <input
                                                  type="radio"
                                                  checked={option.id === answer?.selectedOptionId}
                                                  disabled
                                                  className={`h-4 w-4 ${
                                                    option.isCorrect
                                                      ? 'text-green-600 border-green-300'
                                                      : option.id === answer?.selectedOptionId
                                                      ? 'text-red-600 border-red-300'
                                                      : 'text-gray-300 border-gray-300'
                                                  }`}
                                                />
                                                <span className={`text-sm ${
                                                  option.isCorrect
                                                    ? 'text-green-700'
                                                    : option.id === answer?.selectedOptionId
                                                    ? 'text-red-700'
                                                    : 'text-gray-700'
                                                }`}>
                                                  {option.content}
                                                </span>
                                                {option.isCorrect && (
                                                  <span className="ml-2 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                                                    Đáp án đúng
                                                  </span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="ml-4">
                                          <input
                                            type="number"
                                            className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            placeholder="Điểm"
                                            min="0"
                                            max={question.points}
                                            value={grade.score || answer?.score || ''}
                                            onChange={(e) => handleGradeChange(selectedSubmission.id, question.id, 'score', parseInt(e.target.value) || 0)}
                                          />
                                          <p className="text-xs text-gray-500 mt-1">/{question.points} điểm</p>
                                        </div>
                                      </div>
                                      <div className="mt-4">
                                        <textarea
                                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                          rows="2"
                                          placeholder="Nhận xét..."
                                          value={grade.feedback || answer?.feedback || ''}
                                          onChange={(e) => handleGradeChange(selectedSubmission.id, question.id, 'feedback', e.target.value)}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa chọn học sinh</h3>
                                  <p className="mt-1 text-sm text-gray-500">Vui lòng chọn một học sinh từ danh sách bên phải để chấm điểm</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right side - Student list */}
                          <div className="w-96 border-l border-gray-200 bg-gray-50">
                            <div className="h-full flex flex-col">
                              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Danh sách học sinh</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  {submissions.length} học sinh đã nộp bài
                                </p>
                              </div>
                              <div className="flex-1 overflow-y-auto">
                                <ul className="divide-y divide-gray-200">
                                  {submissions.map((submission) => (
                                    <li
                                      key={submission.id}
                                      className={`px-4 py-4 hover:bg-gray-100 cursor-pointer ${
                                        selectedSubmission?.id === submission.id ? 'bg-indigo-50' : ''
                                      }`}
                                      onClick={() => setSelectedSubmission(submission)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">{submission.studentName}</p>
                                          <p className="text-sm text-gray-500">
                                            Nộp bài lúc: {new Date(submission.submissionTime).toLocaleString('vi-VN')}
                                          </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm font-medium text-gray-900">Điểm:</span>
                                          <span className="text-sm text-gray-600">{submission.score || 0}/{selectedExam.totalPoints}</span>
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              {selectedSubmission && (
                                <div className="px-4 py-4 border-t border-gray-200">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSubmission(selectedSubmission.id)}
                                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    Cập nhật điểm
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams; 