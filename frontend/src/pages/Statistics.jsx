import React from 'react';

const Statistics = () => {
  const overviewStats = [
    {
      id: 1,
      title: 'Tổng số lớp học',
      value: '12',
      change: '+2',
      trend: 'increase',
      period: 'so với tháng trước',
    },
    {
      id: 2,
      title: 'Số học viên',
      value: '156',
      change: '+23',
      trend: 'increase',
      period: 'so với tháng trước',
    },
    {
      id: 3,
      title: 'Điểm trung bình',
      value: '8.5',
      change: '+0.3',
      trend: 'increase',
      period: 'so với tháng trước',
    },
    {
      id: 4,
      title: 'Tỷ lệ hoàn thành',
      value: '85%',
      change: '-2%',
      trend: 'decrease',
      period: 'so với tháng trước',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'assignment',
      title: 'Nộp bài tập JavaScript',
      timestamp: '2024-03-21T10:30:00',
      status: 'completed',
    },
    {
      id: 2,
      type: 'exam',
      title: 'Kiểm tra giữa kỳ HTML & CSS',
      timestamp: '2024-03-20T14:00:00',
      status: 'completed',
    },
    {
      id: 3,
      type: 'lesson',
      title: 'Hoàn thành bài học React Components',
      timestamp: '2024-03-19T16:45:00',
      status: 'completed',
    },
  ];

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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'assignment':
        return '📝';
      case 'exam':
        return '📋';
      case 'lesson':
        return '📚';
      default:
        return '📌';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Thống kê tổng quan</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex flex-col">
              <div className="text-sm font-medium text-gray-500">{stat.title}</div>
              <div className="mt-2 flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </div>
                <div
                  className={`ml-2 text-sm font-medium ${
                    stat.trend === 'increase'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500">{stat.period}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Hoạt động gần đây
        </h3>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="divide-y divide-gray-200">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {formatDateTime(activity.timestamp)}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {activity.status === 'completed'
                          ? 'Đã hoàn thành'
                          : 'Đang thực hiện'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Biểu đồ tiến độ
        </h3>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center text-gray-500">
            [Placeholder cho biểu đồ - Sẽ được thêm sau khi tích hợp thư viện biểu đồ]
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 