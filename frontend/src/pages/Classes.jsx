import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import classService from '../services/classService';
import userService from '../services/userService';

const Classes = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [detailClass, setDetailClass] = useState(null);
  const [classCode, setClassCode] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxStudents: 30,
    teacherId: '',
  });

  // Fetch classes and teachers
  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await userService.getAll();
      // Lọc chỉ lấy users có role là giảng viên (role = 1)
      const teachersList = data.filter(user => user.role === 1);
      setTeachers(teachersList);
    } catch (error) {
      enqueueSnackbar('Không thể tải danh sách giảng viên', { variant: 'error' });
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await classService.getAll();
      setClasses(data);
    } catch (error) {
      enqueueSnackbar('Không thể tải danh sách lớp học', { variant: 'error' });
    } finally {
      setLoading(false);
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
      if (selectedClass) {
        await classService.update(selectedClass.id, formData);
        enqueueSnackbar('Cập nhật lớp học thành công', { variant: 'success' });
      } else {
        await classService.create(formData);
        enqueueSnackbar('Tạo lớp học mới thành công', { variant: 'success' });
      }
      fetchClasses();
      handleCloseModal();
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || 'Có lỗi xảy ra',
        { variant: 'error' }
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
      try {
        await classService.delete(id);
        enqueueSnackbar('Xóa lớp học thành công', { variant: 'success' });
        fetchClasses();
      } catch (error) {
        enqueueSnackbar(
          error.response?.data?.message || 'Không thể xóa lớp học',
          { variant: 'error' }
        );
      }
    }
  };

  const handleEdit = (classItem) => {
    setSelectedClass(classItem);
    setFormData({
      name: classItem.name,
      description: classItem.description || '',
      maxStudents: classItem.maxStudents || 30,
      teacherId: classItem.teacherId || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
    setFormData({
      name: '',
      description: '',
      maxStudents: 30,
      teacherId: '',
    });
  };

  const handleViewDetail = (classItem) => {
    setDetailClass(classItem);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailClass(null);
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    try {
      await classService.joinClass({ classCode });
      enqueueSnackbar('Tham gia lớp học thành công', { variant: 'success' });
      fetchClasses();
      setIsJoinModalOpen(false);
      setClassCode('');
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || 'Không thể tham gia lớp học',
        { variant: 'error' }
      );
    }
  };

  const handleCloseJoinModal = () => {
    setIsJoinModalOpen(false);
    setClassCode('');
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
        <h2 className="text-2xl font-bold text-gray-900">Danh sách lớp học</h2>
        <div className="flex space-x-4">
          {user.role === 2 && (
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              <span>Tham gia lớp</span>
            </button>
          )}
          {user.role === 1 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Tạo lớp mới</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <div key={classItem.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{classItem.name}</h3>
                    <span className={`ml-2 px-2.5 py-0.5 text-xs font-medium rounded-full ${classItem.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {classItem.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">{classItem.description}</div>
                  <div className="mt-3 flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      Mã lớp: {classItem.classCode}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {new Date(classItem.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 py-3 border-t border-b border-gray-100">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                    {classItem.teacher?.fullName?.[0]?.toUpperCase() || '?'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {classItem.teacher ? classItem.teacher.fullName : 'Chưa phân công'}
                  </div>
                  {classItem.teacher && (
                    <div className="flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      {classItem.teacher.email}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Số lượng học viên</span>
                  <span className="font-medium">{classItem.students?.length || 0}/{classItem.maxStudents || 30}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((classItem.students?.length || 0) / (classItem.maxStudents || 30)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {classItem.googleClassroomLink && (
                <div className="mt-4 flex items-center text-sm text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  <a href={classItem.googleClassroomLink} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-800">
                    Google Classroom
                  </a>
                </div>
              )}

              <div className="mt-4 flex items-center justify-end space-x-3 border-t pt-4">
                {user.role === 1 && (
                  <>
                    <button
                      onClick={() => handleEdit(classItem)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Chỉnh sửa
                    </button>
                    <div className="w-px h-4 bg-gray-200"></div>
                    <button
                      onClick={() => handleDelete(classItem.id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-900 transition-colors duration-150"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Xóa
                    </button>
                  </>
                )}
                <button 
                  onClick={() => handleViewDetail(classItem)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Create/Edit Class */}
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
                    {selectedClass ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Tên lớp học
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
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
                      <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700">
                        Số lượng học viên tối đa
                      </label>
                      <input
                        type="number"
                        name="maxStudents"
                        id="maxStudents"
                        value={formData.maxStudents}
                        onChange={handleInputChange}
                        min="1"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700">
                        Giảng viên phụ trách
                      </label>
                      <select
                        name="teacherId"
                        id="teacherId"
                        value={formData.teacherId}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                      >
                        <option value="">-- Chọn giảng viên --</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.fullName} ({teacher.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse space-x-2 space-x-reverse">
                  <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 font-medium"
                  >
                    {selectedClass ? 'Cập nhật' : 'Tạo mới'}
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

      {/* Modal for Class Details */}
      {isDetailModalOpen && detailClass && (
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
                      {detailClass.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${detailClass.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {detailClass.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                      </span>
                      <span className="text-sm text-gray-500">
                        Mã lớp: {detailClass.classCode}
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
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Thông tin cơ bản</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Mô tả:</span>
                        <p className="mt-1 text-sm text-gray-900">{detailClass.description || 'Không có mô tả'}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Ngày tạo:</span>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(detailClass.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Số lượng học viên:</span>
                          <p className="mt-1 text-sm text-gray-900">
                            {detailClass.students?.length || 0}/{detailClass.maxStudents || 30} học viên
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin giảng viên */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Thông tin giảng viên</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {detailClass.teacher ? (
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xl">
                            {detailClass.teacher.fullName[0].toUpperCase()}
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">{detailClass.teacher.fullName}</h5>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              {detailClass.teacher.email}
                            </div>
                            {detailClass.teacher.phoneNumber && (
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                {detailClass.teacher.phoneNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Chưa phân công giảng viên</p>
                      )}
                    </div>
                  </div>

                  {/* Google Classroom */}
                  {detailClass.googleClassroomLink && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Liên kết Google Classroom</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <a
                          href={detailClass.googleClassroomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                          Truy cập Google Classroom
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Danh sách học viên */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Danh sách học viên</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {detailClass.students && detailClass.students.length > 0 ? (
                        <div className="space-y-3">
                          {detailClass.students.map((studentData) => (
                            <div key={studentData.student.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                  {studentData.student.fullName[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{studentData.student.fullName}</p>
                                  <p className="text-sm text-gray-500">{studentData.student.email}</p>
                                  <p className="text-xs text-gray-400">Tham gia: {new Date(studentData.joinedAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Chưa có học viên nào trong lớp</p>
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

      {/* Join Class Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleJoinClass} className="bg-white">
                <div className="px-6 pt-6 pb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Tham gia lớp học
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="classCode" className="block text-sm font-medium text-gray-700">
                        Mã lớp học
                      </label>
                      <input
                        type="text"
                        name="classCode"
                        id="classCode"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value)}
                        required
                        placeholder="Nhập mã lớp học"
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse space-x-2 space-x-reverse">
                  <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 font-medium"
                  >
                    Tham gia
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseJoinModal}
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

export default Classes; 