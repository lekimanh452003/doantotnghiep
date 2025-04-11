import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import assignmentService from '../services/assignmentService';
import classService from '../services/classService';

const Assignments = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [detailAssignment, setDetailAssignment] = useState(null);
  const [submissionData, setSubmissionData] = useState({
    content: '',
    attachmentUrl: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    type: 'Essay',
    content: '',
    attachmentUrl: '',
    classId: ''
  });
  const [gradeData, setGradeData] = useState({
    score: '',
    feedback: ''
  });
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);

  useEffect(() => {
    fetchClasses();
    if (selectedClass === 'all') {
      fetchAllAssignments();
    } else {
      fetchClassAssignments(selectedClass);
    }
  }, [selectedClass]);

  const fetchAllAssignments = async () => {
    try {
      const data = await assignmentService.getAll();
      setAssignments(data);
    } catch (error) {
      enqueueSnackbar('Không thể tải danh sách bài tập', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchClassAssignments = async (classId) => {
    try {
      const data = await assignmentService.getClassAssignments(classId);
      setAssignments(data);
    } catch (error) {
      enqueueSnackbar('Không thể tải danh sách bài tập của lớp', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await classService.getAll();
      setClasses(data);
    } catch (error) {
      enqueueSnackbar('Không thể tải danh sách lớp học', { variant: 'error' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAssignment) {
        await assignmentService.update(selectedAssignment.id, formData);
        enqueueSnackbar('Cập nhật bài tập thành công', { variant: 'success' });
      } else {
        await assignmentService.create(formData.classId, formData);
        enqueueSnackbar('Tạo bài tập mới thành công', { variant: 'success' });
      }
      if (selectedClass === 'all') {
        fetchAllAssignments();
      } else {
        fetchClassAssignments(selectedClass);
      }
      handleCloseModal();
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || 'Có lỗi xảy ra',
        { variant: 'error' }
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài tập này?')) {
      try {
        await assignmentService.delete(id);
        enqueueSnackbar('Xóa bài tập thành công', { variant: 'success' });
        if (selectedClass === 'all') {
          fetchAllAssignments();
        } else {
          fetchClassAssignments(selectedClass);
        }
      } catch (error) {
        enqueueSnackbar(
          error.response?.data?.message || 'Không thể xóa bài tập',
          { variant: 'error' }
        );
      }
    }
  };

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
      type: assignment.type,
      content: assignment.content || '',
      attachmentUrl: assignment.attachmentUrl || '',
      classId: assignment.classId
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAssignment(null);
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      type: 'Essay',
      content: '',
      attachmentUrl: '',
      classId: ''
    });
  };

  const handleSubmitModalOpen = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionData({
      content: '',
      attachmentUrl: ''
    });
    setIsSubmitModalOpen(true);
  };

  const handleSubmitModalClose = () => {
    setIsSubmitModalOpen(false);
    setSelectedAssignment(null);
    setSubmissionData({
      content: '',
      attachmentUrl: ''
    });
  };

  const handleSubmissionInputChange = (e) => {
    const { name, value } = e.target;
    setSubmissionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    try {
      await assignmentService.submitAssignment(selectedAssignment.id, submissionData);
      enqueueSnackbar('Nộp bài tập thành công', { variant: 'success' });
      if (selectedClass === 'all') {
        fetchAllAssignments();
      } else {
        fetchClassAssignments(selectedClass);
      }
      handleSubmitModalClose();
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || 'Không thể nộp bài tập',
        { variant: 'error' }
      );
    }
  };

  const getStatusColor = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (assignment.submissions?.some(s => s.student.id === user.id)) {
      return 'bg-green-100 text-green-800';
    }
    
    if (dueDate < now) {
      return 'bg-red-100 text-red-800';
    }
    
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (assignment.submissions?.some(s => s.student.id === user.id)) {
      return 'Đã nộp';
    }
    
    if (dueDate < now) {
      return 'Đã hết hạn';
    }
    
    return 'Chưa nộp';
  };

  const handleViewDetail = (assignment) => {
    setDetailAssignment(assignment);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailAssignment(null);
  };

  const handleGradeSubmission = async (submissionId) => {
    setGradingSubmissionId(submissionId);
    const submission = detailAssignment.submissions.find(s => s.id === submissionId);
    setGradeData({
      score: submission.score || '',
      feedback: submission.feedback || ''
    });
  };

  const handleGradeInputChange = (e) => {
    const { name, value } = e.target;
    setGradeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignmentService.gradeSubmission(
        detailAssignment.id,
        gradingSubmissionId,
        {
          score: parseFloat(gradeData.score),
          feedback: gradeData.feedback
        }
      );
      enqueueSnackbar('Chấm điểm thành công', { variant: 'success' });
      if (selectedClass === 'all') {
        fetchAllAssignments();
      } else {
        fetchClassAssignments(selectedClass);
      }
      setGradingSubmissionId(null);
      setGradeData({ score: '', feedback: '' });
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || 'Không thể chấm điểm bài nộp',
        { variant: 'error' }
      );
    }
  };

  const handleCancelGrade = () => {
    setGradingSubmissionId(null);
    setGradeData({ score: '', feedback: '' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Danh sách bài tập</h2>
        {user.role === 1 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Thêm bài tập mới</span>
          </button>
        )}
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Lọc theo lớp học:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedClass('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedClass === 'all'
                ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            {classes.map((classItem) => (
              <button
                key={classItem.id}
                onClick={() => setSelectedClass(classItem.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedClass === classItem.id
                  ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {classItem.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3">
            <div className="text-center p-12 bg-white rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có bài tập</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedClass === 'all' 
                  ? 'Chưa có bài tập nào được tạo.'
                  : 'Lớp học này chưa có bài tập nào.'}
              </p>
            </div>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">
                    {assignment.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment)}`}>
                    {getStatusText(assignment)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {assignment.description || 'Không có mô tả'}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    Loại bài tập: {assignment.type === 0 ? 'Trắc nghiệm' : assignment.type === 1 ? 'Tự luận' : 'File'}
                  </div>
                  {assignment.attachmentUrl && (
                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                      </svg>
                      <a
                        href={assignment.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Tài liệu đính kèm
                      </a>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-end space-x-4 pt-4 border-t">
                  {user.role === 1 ? (
                    <>
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="text-red-600 hover:text-red-900 font-medium text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Xóa
                      </button>
                    </>
                  ) : (
                    !assignment.submissions?.some(s => s.student.id === user.id) && (
                      <button
                        onClick={() => handleSubmitModalOpen(assignment)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium text-sm flex items-center"
                        disabled={new Date(assignment.dueDate) < new Date()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        Nộp bài
                      </button>
                    )
                  )}
                  <button
                    onClick={() => handleViewDetail(assignment)}
                    className="text-indigo-600 hover:text-indigo-900 font-medium text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Create/Edit Assignment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit} className="bg-white">
                <div className="px-6 pt-6 pb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    {selectedAssignment ? 'Chỉnh sửa bài tập' : 'Thêm bài tập mới'}
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Tiêu đề
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Mô tả
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                      ></textarea>
                    </div>
                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                        Hạn nộp
                      </label>
                      <input
                        type="datetime-local"
                        name="dueDate"
                        id="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        Loại bài tập
                      </label>
                      <select
                        name="type"
                        id="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                      >
                        <option value="MultipleChoice">Trắc nghiệm</option>
                        <option value="Essay">Tự luận</option>
                        <option value="File">File</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Nội dung
                      </label>
                      <textarea
                        name="content"
                        id="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        rows="4"
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                      ></textarea>
                    </div>
                    <div>
                      <label htmlFor="attachmentUrl" className="block text-sm font-medium text-gray-700">
                        Link tài liệu đính kèm
                      </label>
                      <input
                        type="url"
                        name="attachmentUrl"
                        id="attachmentUrl"
                        value={formData.attachmentUrl}
                        onChange={handleInputChange}
                        placeholder="https://"
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                    {!selectedAssignment && (
                      <div>
                        <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
                          Lớp học
                        </label>
                        <select
                          name="classId"
                          id="classId"
                          value={formData.classId}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                        >
                          <option value="">-- Chọn lớp học --</option>
                          {classes.map((classItem) => (
                            <option key={classItem.id} value={classItem.id}>
                              {classItem.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse space-x-2 space-x-reverse">
                  <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 font-medium"
                  >
                    {selectedAssignment ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && detailAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {detailAssignment.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(detailAssignment)}`}>
                        {getStatusText(detailAssignment)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseDetailModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-6 space-y-6">
                  {/* Thông tin cơ bản */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Thông tin bài tập</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Mô tả:</span>
                        <p className="mt-1 text-sm text-gray-900">{detailAssignment.description || 'Không có mô tả'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Nội dung:</span>
                        <p className="mt-1 text-sm text-gray-900">{detailAssignment.content || 'Không có nội dung'}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Ngày tạo:</span>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(detailAssignment.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Hạn nộp:</span>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(detailAssignment.dueDate).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      {detailAssignment.attachmentUrl && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Tài liệu đính kèm:</span>
                          <div className="mt-1">
                            <a
                              href={detailAssignment.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                              </svg>
                              Xem tài liệu
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Danh sách bài nộp */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Danh sách bài nộp</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {detailAssignment.submissions && (
                        user.role === 1 ? (
                          // Giảng viên xem được tất cả bài nộp
                          <div className="space-y-4">
                            {detailAssignment.submissions.map((submission) => (
                              <div key={submission.id} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                      {submission.student.fullName[0].toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{submission.student.fullName}</p>
                                      <p className="text-xs text-gray-500">{submission.student.email}</p>
                                      <p className="text-xs text-gray-400">
                                        Nộp lúc: {new Date(submission.submittedAt).toLocaleDateString('vi-VN', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {submission.score !== null ? (
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">Điểm: {submission.score}</p>
                                        <p className="text-xs text-gray-500">Đã chấm điểm</p>
                                        <button
                                          onClick={() => handleGradeSubmission(submission.id)}
                                          className="text-xs text-indigo-600 hover:text-indigo-900 mt-1"
                                        >
                                          Chấm lại
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleGradeSubmission(submission.id)}
                                        className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                                      >
                                        Chấm điểm
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-2 pl-11">
                                  <p className="text-sm text-gray-600">{submission.content}</p>
                                  {submission.attachmentUrl && (
                                    <a
                                      href={submission.attachmentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center mt-2 text-sm text-indigo-600 hover:text-indigo-900"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                      </svg>
                                      Xem bài nộp
                                    </a>
                                  )}
                                  {submission.feedback && gradingSubmissionId !== submission.id && (
                                    <div className="mt-2 text-sm">
                                      <span className="font-medium text-gray-700">Nhận xét:</span>
                                      <p className="text-gray-600">{submission.feedback}</p>
                                    </div>
                                  )}
                                  {gradingSubmissionId === submission.id && (
                                    <form onSubmit={handleGradeSubmit} className="mt-4 space-y-4">
                                      <div>
                                        <label htmlFor="score" className="block text-sm font-medium text-gray-700">
                                          Điểm số (0-100)
                                        </label>
                                        <input
                                          type="number"
                                          name="score"
                                          id="score"
                                          min="0"
                                          max="100"
                                          step="0.1"
                                          required
                                          value={gradeData.score}
                                          onChange={handleGradeInputChange}
                                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                      </div>
                                      <div>
                                        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                                          Nhận xét
                                        </label>
                                        <textarea
                                          name="feedback"
                                          id="feedback"
                                          rows="3"
                                          value={gradeData.feedback}
                                          onChange={handleGradeInputChange}
                                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                      </div>
                                      <div className="flex justify-end space-x-2">
                                        <button
                                          type="button"
                                          onClick={handleCancelGrade}
                                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                          Hủy
                                        </button>
                                        <button
                                          type="submit"
                                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                          Lưu điểm
                                        </button>
                                      </div>
                                    </form>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Sinh viên chỉ xem được bài nộp của mình
                          <div className="space-y-4">
                            {detailAssignment.submissions
                              .filter(submission => submission.student.id === user.id)
                              .map((submission) => (
                                <div key={submission.id} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">Bài nộp của bạn</p>
                                      <p className="text-xs text-gray-400">
                                        Nộp lúc: {new Date(submission.submittedAt).toLocaleDateString('vi-VN', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                    {submission.score !== null && (
                                      <div className="text-right">
                                        <div className="flex items-center space-x-2">
                                          <div className={`px-2.5 py-1 rounded-full text-sm font-medium ${
                                            submission.score >= 80 ? 'bg-green-100 text-green-800' :
                                            submission.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                          }`}>
                                            Điểm: {submission.score}/100
                                          </div>
                                        </div>
                                        {submission.gradedAt && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Chấm lúc: {new Date(submission.gradedAt).toLocaleDateString('vi-VN', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-4 space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">Nội dung bài nộp:</h5>
                                      <p className="text-sm text-gray-600">{submission.content}</p>
                                    </div>
                                    {submission.attachmentUrl && (
                                      <div className="bg-gray-50 rounded-lg p-4">
                                        <h5 className="text-sm font-medium text-gray-700 mb-2">Tài liệu đính kèm:</h5>
                                        <a
                                          href={submission.attachmentUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                          </svg>
                                          Xem bài nộp của bạn
                                        </a>
                                      </div>
                                    )}
                                    {submission.feedback && (
                                      <div className="bg-gray-50 rounded-lg p-4">
                                        <h5 className="text-sm font-medium text-gray-700 mb-2">Nhận xét của giảng viên:</h5>
                                        <p className="text-sm text-gray-600">{submission.feedback}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )
                      )}
                      {(!detailAssignment.submissions || detailAssignment.submissions.length === 0) && (
                        <p className="text-sm text-gray-500">Chưa có bài nộp nào</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleCloseDetailModal}
                  className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Assignment Modal */}
      {isSubmitModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmitAssignment} className="bg-white">
                <div className="px-6 pt-6 pb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Nộp bài tập</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Bài tập: {selectedAssignment.title}
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Nội dung bài nộp
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        rows="4"
                        value={submissionData.content}
                        onChange={handleSubmissionInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Nhập nội dung bài nộp của bạn..."
                      />
                    </div>
                    <div>
                      <label htmlFor="attachmentUrl" className="block text-sm font-medium text-gray-700">
                        Link tài liệu đính kèm
                      </label>
                      <input
                        type="url"
                        id="attachmentUrl"
                        name="attachmentUrl"
                        value={submissionData.attachmentUrl}
                        onChange={handleSubmissionInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                        placeholder="https://"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse space-x-2 space-x-reverse">
                  <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 font-medium"
                  >
                    Nộp bài
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitModalClose}
                    className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments; 