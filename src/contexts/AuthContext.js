import React, { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import toast from 'react-hot-toast';
import api, { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp > currentTime) {
          setUser(decodedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Fetch full user profile
          fetchUserProfile();
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Token decode error:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authService.getProfile();
      setUserProfile(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const decodedToken = jwtDecode(token);
      setUser(decodedToken);
      setUserProfile(userData);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register({
        ...userData,
        role: 'customer' // Default role for frontend registration
      });
      const { token, user: newUser } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const decodedToken = jwtDecode(token);
      setUser(decodedToken);
      setUserProfile(newUser);
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      setUserProfile(response.data.user);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setUserProfile(null);
    toast.success('Logged out successfully!');
  };

  const value = {
    user,
    userProfile,
    login,
    register,
    updateProfile,
    logout,
    loading,
    isAuthenticated: !!user,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
