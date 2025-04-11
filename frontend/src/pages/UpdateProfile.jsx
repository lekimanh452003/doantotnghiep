import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [formData, setFormData] = useState({
    id: currentUser?.id || '',
    fullName: currentUser?.fullName || '',
    phoneNumber: currentUser?.phoneNumber || '',
    avatar: currentUser?.avatar || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');

    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      setMessage('Mật khẩu xác nhận không khớp.');
      setMessageType('error');
      return;
    }

    setLoading(true);

    try {
      await authService.updateProfile(formData);
      setMessage('Cập nhật thành công!');
      setMessageType('success');
      if (formData.newPassword) {
        authService.logout();
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Có lỗi xảy ra!');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 md:py-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Cập nhật thông tin cá nhân</h2>
        </div>
        
        <div className="p-5">
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm flex items-center ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-700 border-l-4 border-green-500' 
                : 'bg-red-50 text-red-700 border-l-4 border-red-500'
            }`}>
              <span className="mr-2">
                {messageType === 'success' ? '✓' : '✕'}
              </span>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">   
            {/* Basic Info Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>
            
            {/* Password Section */}
            <div className="pt-2 mt-2 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-3 text-gray-700">Đổi mật khẩu</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                    placeholder="Để trống nếu không đổi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 outline-none transition"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition w-full sm:w-1/2"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition w-full sm:w-1/2 disabled:bg-blue-400 flex justify-center items-center"
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;