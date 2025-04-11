import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../models/types';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: '📊',
      roles: [UserRole.Admin, UserRole.Teacher, UserRole.Student],
    },
    {
      name: 'Classes',
      path: '/classes',
      icon: '👨‍🏫',
      roles: [UserRole.Admin, UserRole.Teacher, UserRole.Student],
    },
    {
      name: 'Assignments',
      path: '/assignments',
      icon: '📝',
      roles: [UserRole.Teacher, UserRole.Student],
    },
    {
      name: 'Discussions',
      path: '/discussions',
      icon: '💬',
      roles: [UserRole.Admin, UserRole.Teacher, UserRole.Student],
    },
    {
      name: 'Resources',
      path: '/resources',
      icon: '📚',
      roles: [UserRole.Teacher, UserRole.Student],
    },
    {
      name: 'Exams',
      path: '/exams',
      icon: '📋',
      roles: [UserRole.Teacher, UserRole.Student],
    },
    {
      name: 'Statistics',
      path: '/statistics',
      icon: '📈',
      roles: [UserRole.Admin, UserRole.Teacher],
    },
    {
      name: 'Từ Điển',
      path: '/dictionary',
      icon: '📚',
      roles: [UserRole.Admin, UserRole.Teacher, UserRole.Student],
    },
  ];

  return (
    <div className="h-screen w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex-1 py-6 overflow-y-auto">
          <nav className="px-2 space-y-1">
            {menuItems
              .filter((item) => item.roles.includes(user?.role))
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <img
                  className="inline-block h-9 w-9 rounded-full"
                  src={user?.avatar || 'https://via.placeholder.com/36'}
                  alt={user?.fullName}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
                <p className="text-xs font-medium text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 