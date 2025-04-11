import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import notificationService from '../services/notificationService';

const NotificationSidebar = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      enqueueSnackbar('Không thể tải thông báo', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Chuyển đổi sang múi giờ Việt Nam (UTC+7)
    const vietnamDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    
    // Nếu thời gian chưa đến 1 phút
    if (diff < 60000) {
      return 'Vừa nãy';
    }
    // Nếu thời gian chưa đến 1 giờ
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} phút trước`;
    }
    // Nếu thời gian chưa đến 1 ngày
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} giờ trước`;
    }
    // Nếu thời gian chưa đến 1 tuần
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} ngày trước`;
    }
    // Nếu thời gian chưa đến 1 tháng
    if (diff < 2592000000) {
      const weeks = Math.floor(diff / 604800000);
      return `${weeks} tuần trước`;
    }
    // Nếu thời gian chưa đến 1 năm
    if (diff < 31536000000) {
      const months = Math.floor(diff / 2592000000);
      return `${months} tháng trước`;
    }
    // Nếu thời gian quá 1 năm
    const years = Math.floor(diff / 31536000000);
    return `${years} năm trước`;
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Thông báo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              Không có thông báo mới
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(new Date(notification.createdAt).getTime() + 7 * 60 * 60 * 1000).toLocaleString('vi-VN', {
                          timeZone: 'Asia/Bangkok',
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          second: 'numeric',
                          hour12: false
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSidebar; 