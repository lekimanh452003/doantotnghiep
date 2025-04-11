import { useState, useEffect, createContext, useContext } from 'react';
import authService from '../services/authService';
import { useSnackbar } from 'notistack';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        authService.clearToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      enqueueSnackbar('Login successful!', { variant: 'success' });
      return response.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      enqueueSnackbar(message, { variant: 'error' });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      enqueueSnackbar('Registration successful!', { variant: 'success' });
      return response.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      enqueueSnackbar(message, { variant: 'error' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      enqueueSnackbar('Logged out successfully', { variant: 'success' });
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if server call fails
      setUser(null);
      authService.clearToken();
    }
  };

  const changePassword = async (currentPassword, newPassword, confirmNewPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword, confirmNewPassword);
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      enqueueSnackbar(message, { variant: 'error' });
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    changePassword,
    isAuthenticated: authService.isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth; 