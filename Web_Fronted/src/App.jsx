import React, { useState, useEffect } from 'react';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import { authAPI, tokenManager } from './api/auth';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'profile'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 检查是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenManager.getToken();
      if (token) {
        try {
          const response = await authAPI.getProfile();
          if (response.success) {
            setUser(response.data);
            setCurrentView('profile');
          } else {
            tokenManager.clearToken();
          }
        } catch (error) {
          console.error('获取用户信息失败：', error);
          tokenManager.clearToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('profile');
  };

  const handleRegisterSuccess = (userData) => {
    // 注册成功后自动切换到登录页面
    setCurrentView('login');
  };

  const handleLogout = () => {
    tokenManager.clearToken();
    setUser(null);
    setCurrentView('login');
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {currentView === 'login' && (
        <Login
          onSwitchToRegister={() => setCurrentView('register')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentView === 'register' && (
        <Register
          onSwitchToLogin={() => setCurrentView('login')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}

      {currentView === 'profile' && user && (
        <UserProfile
          user={user}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
}

export default App;