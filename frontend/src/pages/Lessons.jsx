import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import lessonService from '../services/lessonService';
import classService from '../services/classService';

const Lessons = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [lessons, setLessons] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledTime: '',
    meetingLink: '',
    materialUrl: '',
    classId: ''
  });

  useEffect(() => {
    fetchClasses();
    if (selectedClass === 'all') {
      fetchAllLessons();
    } else {
      fetchClassLessons(selectedClass);
    }
  }, [selectedClass]);

  const fetchAllLessons = async () => {
    try {
      const data = await lessonService.getAll();
      setLessons(data);
    } catch (error) {
      enqueueSnackbar('Không thể tải danh sách bài học', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchClassLessons = async (classId) => {
    try {
      const data = await lessonService.getClassLessons(classId);
      setLessons(data);
    } catch (error) {
      enqueueSnackbar('Không thể tải danh sách bài học của lớp', { variant: 'error' });
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
      if (selectedLesson) {
        await lessonService.update(selectedLesson.id, formData);
        enqueueSnackbar('Cập nhật bài học thành công', { variant: 'success' });
      } else {
        await lessonService.create(formData.classId, formData);
        enqueueSnackbar('Tạo bài học mới thành công', { variant: 'success' });
      }
      if (selectedClass === 'all') {
        fetchAllLessons();
      } else {
        fetchClassLessons(selectedClass);
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
    if (window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
      try {
        await lessonService.delete(id);
        enqueueSnackbar('Xóa bài học thành công', { variant: 'success' });
        if (selectedClass === 'all') {
          fetchAllLessons();
        } else {
          fetchClassLessons(selectedClass);
        }
      } catch (error) {
        enqueueSnackbar(
          error.response?.data?.message || 'Không thể xóa bài học',
          { variant: 'error' }
        );
      }
    }
  };

  const handleEdit = (lesson) => {
    setSelectedLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      scheduledTime: new Date(lesson.scheduledTime).toISOString().slice(0, 16),
      meetingLink: lesson.meetingLink || '',
      materialUrl: lesson.materialUrl || '',
      classId: lesson.classId
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLesson(null);
    setFormData({
      title: '',
      description: '',
      scheduledTime: '',
      meetingLink: '',
      materialUrl: '',
      classId: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <h2 className="text-2xl font-bold text-gray-900">Danh sách bài học</h2>
        {user.role === 1 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Thêm bài học mới</span>
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

      {/* Lessons Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lessons.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3">
            <div className="text-center p-12 bg-white rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có bài học</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedClass === 'all' 
                  ? 'Chưa có bài học nào được tạo.'
                  : 'Lớp học này chưa có bài học nào.'}
              </p>
            </div>
          </div>
        ) : (
          lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">
                    {lesson.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      lesson.isCompleted
                        ? 'bg-green-100 text-green-800'
                        : new Date(lesson.scheduledTime) < new Date()
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {lesson.isCompleted
                      ? 'Đã hoàn thành'
                      : new Date(lesson.scheduledTime) < new Date()
                      ? 'Đã diễn ra'
                      : 'Sắp diễn ra'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {lesson.description || 'Không có mô tả'}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {formatDate(lesson.scheduledTime)}
                  </div>
                  {lesson.meetingLink && (
                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      <a
                        href={lesson.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Tham gia buổi học
                      </a>
                    </div>
                  )}
                  {lesson.materialUrl && (
                    <div className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <a
                        href={lesson.materialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Tài liệu học tập
                      </a>
                    </div>
                  )}
                </div>
                {user.role === 1 && (
                  <div className="mt-4 flex items-center justify-end space-x-4 pt-4 border-t">
                    <button
                      onClick={() => handleEdit(lesson)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(lesson.id)}
                      className="text-red-600 hover:text-red-900 font-medium text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Create/Edit Lesson */}
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
                    {selectedLesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
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
                      <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700">
                        Thời gian
                      </label>
                      <input
                        type="datetime-local"
                        name="scheduledTime"
                        id="scheduledTime"
                        value={formData.scheduledTime}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700">
                        Link buổi học
                      </label>
                      <input
                        type="url"
                        name="meetingLink"
                        id="meetingLink"
                        value={formData.meetingLink}
                        onChange={handleInputChange}
                        placeholder="https://"
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="materialUrl" className="block text-sm font-medium text-gray-700">
                        Link tài liệu
                      </label>
                      <input
                        type="url"
                        name="materialUrl"
                        id="materialUrl"
                        value={formData.materialUrl}
                        onChange={handleInputChange}
                        placeholder="https://"
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                    {!selectedLesson && (
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
                    {selectedLesson ? 'Cập nhật' : 'Thêm mới'}
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
    </div>
  );
};

export default Lessons; 