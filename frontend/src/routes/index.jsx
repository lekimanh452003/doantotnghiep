import { createBrowserRouter, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import LoginPage from '../pages/LoginPage';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import Classes from '../pages/Classes';
import Assignments from '../pages/Assignments';
import Discussions from '../pages/Discussions';
import Lessons from '../pages/Lessons';
import Resources from '../pages/Resources';
import Exams from '../pages/Exams';
import Statistics from '../pages/Statistics';
import Users from '../pages/Users';
import Dictionary from '../pages/Dictionary';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import LandingPage from '../pages/LandingPage';
import Register from '../pages/Register';
import UpdateProfile from '../pages/UpdateProfile';

// Admin route guard component
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  console.log(user);
  if (user?.role !== 0) {
    return <Navigate to="/" />;
  }
  return children;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <LandingPage />
        </AuthProvider>
      </SnackbarProvider>
    ),
  },
  {
    path: '/login',
    element: (
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </SnackbarProvider>
    ),
  },
  {
    path: '/register',
    element: (
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </SnackbarProvider>
    ),
  },
  {
    path: '/app',
    element: (
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        </AuthProvider>
      </SnackbarProvider>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'users',
        element: (
          <AdminRoute>
            <Users />
          </AdminRoute>
        ),
      },
      {
        path: 'classes',
        element: <Classes />,
      },
      {
        path: 'assignments',
        element: <Assignments />,
      },
      {
        path: 'discussions',
        element: <Discussions />,
      },
      {
        path: 'lessons',
        element: <Lessons />,
      },
      {
        path: 'resources',
        element: <Resources />,
      },
      {
        path: 'exams',
        element: <Exams />,
      },
      {
        path: 'statistics',
        element: <Statistics />,
      },
      {
        path: 'profile',
        element: <UpdateProfile />,
      },
      {
        path: 'dictionary',
        element: <Dictionary />,
      },
    ],
  },
]);

export default router; 