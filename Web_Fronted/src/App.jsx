import React, { useState, useEffect } from 'react';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import Dashboard from './components/Dashboard';
import ActivityDetail from './components/ActivityDetail';
import VenueDetail from './components/VenueDetail';
import CreateActivity from './components/CreateActivity';
import CreateVenue from './components/CreateVenue';
import History from './components/History';
import { authAPI, tokenManager } from './api/auth';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'dashboard', 'profile', 'activity-detail', 'venue-detail', 'create-activity', 'create-venue', 'history'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); // 用于存储选中的活动或场馆

  // 检查是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenManager.getToken();
      if (token) {
        try {
          const response = await authAPI.getProfile();
          if (response.success) {
            setUser(response.data);
            setCurrentView('dashboard'); // 登录后进入主页面
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
    setCurrentView('dashboard'); // 登录成功后进入主页面
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

  // 页面导航函数
  const navigateTo = (view, item = null) => {
    setCurrentView(view);
    setSelectedItem(item);
  };

  // 返回上一页
  const goBack = () => {
    if (currentView === 'profile' || currentView === 'create-activity' || 
        currentView === 'create-venue' || currentView === 'history') {
      setCurrentView('dashboard');
    } else if (currentView === 'activity-detail' || currentView === 'venue-detail') {
      setCurrentView('dashboard');
    } else {
      setCurrentView('dashboard');
    }
    setSelectedItem(null);
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

      {currentView === 'dashboard' && user && (
        <Dashboard
          user={user}
          onNavigate={navigateTo}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'profile' && user && (
        <UserProfile
          user={user}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
          onBack={goBack}
        />
      )}

      {currentView === 'activity-detail' && selectedItem && (
        <ActivityDetail
          activity={selectedItem}
          user={user}
          onBack={goBack}
          onNavigate={navigateTo}
        />
      )}

      {currentView === 'venue-detail' && selectedItem && (
        <VenueDetail
          venue={selectedItem}
          user={user}
          onBack={goBack}
          onNavigate={navigateTo}
        />
      )}

      {currentView === 'create-activity' && user && (
        <CreateActivity
          user={user}
          onBack={goBack}
          onSuccess={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'create-venue' && user && (
        <CreateVenue
          user={user}
          onBack={goBack}
          onSuccess={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'history' && user && (
        <History
          user={user}
          onBack={goBack}
          onNavigate={navigateTo}
        />
      )}
    </div>
  );
}

export default App;