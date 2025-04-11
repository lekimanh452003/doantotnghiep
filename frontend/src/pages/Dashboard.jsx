import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import statisticsService from '../services/statisticsService';
import classService from '../services/classService';
import { useSnackbar } from 'notistack';
import { Link } from 'react-router-dom';
import Chatbox from '../components/common/Chatbox.tsx';

const Dashboard = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({
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

  const slides = [
    {
      title: 'Chào mừng đến với EduSync',
      description: 'Nền tảng học tập trực tuyến hiện đại và hiệu quả',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      title: 'Học tập mọi lúc mọi nơi',
      description: 'Truy cập tài liệu và bài giảng từ bất kỳ thiết bị nào',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      title: 'Tương tác và cộng tác',
      description: 'Kết nối với giáo viên và học sinh khác dễ dàng',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
  ];

  useEffect(() => {
    fetchStatistics();
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // 1. Lấy danh sách lớp học
      const classesResponse = await classService.getAll();
      const classes = classesResponse;

      if (classes.length === 0) {
        setStats({
          totalClasses: 0,
          totalAssignments: 0,
          totalDiscussions: 0,
          totalAttendance: 0,
          assignmentStats: { completed: 0, pending: 0, overdue: 0 },
          examStats: { completed: 0, average: 0 },
          attendanceRate: 0
        });
        return;
      }

      // 2. Lấy thống kê cho từng lớp
      const classStats = await Promise.all(
        classes.map(classItem => 
          user.role === 'Teacher' 
            ? statisticsService.getClassStatistics(classItem.id)
            : statisticsService.getStudentProgress(classItem.id, user.id)
        )
      );

      // 3. Tổng hợp thống kê
      const combinedStats = classStats.reduce((acc, curr) => {
        if (user.role === 'Teacher') {
          // Thống kê cho giáo viên
          return {
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
          };
        } else {
          // Thống kê cho học sinh
          return {
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
          };
        }
      }, {
        totalClasses: 0,
        totalAssignments: 0,
        totalDiscussions: 0,
        totalAttendance: 0,
        assignmentStats: { completed: 0, pending: 0, overdue: 0 },
        examStats: { completed: 0, average: 0 },
        attendanceRate: 0
      });

      // 4. Tính trung bình cho các tỷ lệ
      combinedStats.examStats.average = combinedStats.examStats.average / combinedStats.totalClasses;
      combinedStats.attendanceRate = combinedStats.attendanceRate / combinedStats.totalClasses;

      setStats(combinedStats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      enqueueSnackbar('Không thể tải thông tin thống kê', { variant: 'error' });
    } finally {
      setLoading(false);
    }
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
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-indigo-600 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Welcome Section with Slider */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative h-[400px]">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-black/50"></div>
              </div>
              <div className="relative h-full flex items-center px-12">
                <div className="max-w-4xl">
                  <h1 className="text-4xl font-bold text-white mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-gray-100 text-xl">
                    {slide.description}
                  </p>
                  <button className="mt-8 px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Bắt đầu ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
          <Chatbox />
          {/* Slider Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tổng số lớp học */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 transition-transform duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-800">Tổng số lớp học</p>
                <h3 className="text-3xl font-bold text-indigo-600 mt-2">{stats.totalClasses}</h3>
              </div>
              <div className="p-3 rounded-full bg-indigo-600/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                  <path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bài tập đã nộp */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 transition-transform duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Bài tập đã nộp</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">{stats.assignmentStats.completed}</h3>
              </div>
              <div className="p-3 rounded-full bg-green-600/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bài tập chờ nộp */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 transition-transform duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Bài tập chờ nộp</p>
                <h3 className="text-3xl font-bold text-yellow-600 mt-2">{stats.assignmentStats.pending}</h3>
              </div>
              <div className="p-3 rounded-full bg-yellow-600/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bài tập quá hạn */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 transition-transform duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Bài tập quá hạn</p>
                <h3 className="text-3xl font-bold text-red-600 mt-2">{stats.assignmentStats.overdue}</h3>
              </div>
              <div className="p-3 rounded-full bg-red-600/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/app/classes" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-center">
            <div className="p-4 rounded-full bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">Lớp học</h3>
              <p className="text-gray-500 mt-1">Xem danh sách lớp học</p>
            </div>
          </div>
        </Link>

        <Link to="/app/assignments" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-center">
            <div className="p-4 rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">Bài tập</h3>
              <p className="text-gray-500 mt-1">Xem và nộp bài tập</p>
            </div>
          </div>
        </Link>

        <Link to="/app/resources" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-center">
            <div className="p-4 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">Tài liệu</h3>
              <p className="text-gray-500 mt-1">Truy cập tài liệu học tập</p>
            </div>
          </div>
        </Link>

        <Link to="/app/exams" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="flex items-center">
            <div className="p-4 rounded-full bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">Bài kiểm tra</h3>
              <p className="text-gray-500 mt-1">Xem và làm bài kiểm tra</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          Tiến độ học tập
        </h2>
        <div className="space-y-8">
          {/* Tiến độ bài tập */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-gray-800">Tiến độ bài tập</span>
              </div>
              <span className="text-lg font-bold text-indigo-600">
                {((stats.assignmentStats.completed / (stats.totalAssignments || 1)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all duration-700 ease-in-out"
                style={{ width: `${((stats.assignmentStats.completed / (stats.totalAssignments || 1)) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>


          {/* Tỷ lệ điểm danh */}
<div>
  <div className="flex justify-between items-center mb-2">
    <div className="flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-green-600 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className="font-medium text-gray-800">Tỷ lệ điểm danh</span>
    </div>
    <span className="text-lg font-bold text-indigo-600">
      {stats.attendanceRate.toFixed(1)}%
    </span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-3">
    <div
      className="bg-green-600 h-3 rounded-full transition-all duration-700 ease-in-out"
      style={{ width: `${stats.attendanceRate}%` }}
    ></div>
  </div>
  <div className="flex justify-between text-sm text-gray-500 mt-1">
    <span>0%</span>
    <span>100%</span>
  </div>
</div>

{/* Điểm trung bình kiểm tra */}
<div>
  <div className="flex justify-between items-center mb-2">
    <div className="flex items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-amber-500 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
      <span className="font-medium text-gray-800">Điểm trung bình kiểm tra</span>
    </div>
    <span className="text-lg font-bold text-indigo-600">
      {stats.examStats.average.toFixed(1)}/10
    </span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-3">
    <div
      className="bg-yellow-600 h-3 rounded-full transition-all duration-700 ease-in-out"
      style={{ width: `${(stats.examStats.average / 10) * 100}%` }}
    ></div>
  </div>
  <div className="flex justify-between text-sm text-gray-500 mt-1">
    <span>0</span>
    <span>10</span>
  </div>
</div>


        </div>
      </div>
    </div>
  );
};

export default Dashboard; 