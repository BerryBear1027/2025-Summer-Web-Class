import React, { useState, useEffect } from 'react';
import { authAPI, tokenManager } from '../api/auth';
import './UserProfile.css';

const UserProfile = ({ user: initialUser, onLogout, onUserUpdate, onBack }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    bio: '',
    birthdate: '',
    gender: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');
      const userData = await authAPI.getProfile();
      if (userData.success) {
        setUser(userData.data);
        setFormData({
          username: userData.data.username || '',
          email: userData.data.email || '',
          phone: userData.data.phone || '',
          bio: userData.data.bio || '',
          birthdate: userData.data.birthdate || '',
          gender: userData.data.gender || ''
        });
      } else {
        setError(userData.message || '获取用户信息失败');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setError('获取用户信息失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccessMessage('');
      const result = await authAPI.updateProfile(formData);
      if (result.success) {
        setUser({ ...user, ...formData });
        setIsEditing(false);
        setSuccessMessage('个人信息更新成功');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.message || '更新失败');
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      setError('更新失败，请重试');
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        birthdate: user.birthdate || '',
        gender: user.gender || ''
      });
    }
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <p>无法加载用户信息</p>
          <button onClick={fetchUserData} className="retry-button">
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="header-left">
          <button onClick={onBack} className="back-button">
            ← 返回主页
          </button>
          <h1>个人资料</h1>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="edit-button"
          >
            编辑资料
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="avatar-section">
            <div className="avatar-container">
              <div className="avatar-placeholder-large">
                {user.username ? user.username[0] : '?'}
              </div>
            </div>
          </div>

          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-label">注册时间</span>
              <span className="stat-value">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '未知'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">用户ID</span>
              <span className="stat-value">{user.id}</span>
            </div>
          </div>
        </div>

        <div className="profile-main">
          <div className="form-section">
            <h2>基本信息</h2>
            
            <div className="form-group">
              <label htmlFor="username">用户名</label>
              {isEditing ? (
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="请输入用户名"
                />
              ) : (
                <div className="form-value">{user.username || '未设置'}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">邮箱</label>
              {isEditing ? (
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="请输入邮箱"
                />
              ) : (
                <div className="form-value">{user.email || '未设置'}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">手机号</label>
              {isEditing ? (
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="请输入手机号"
                />
              ) : (
                <div className="form-value">{user.phone || '未设置'}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="birthdate">生日</label>
              {isEditing ? (
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="form-value">
                  {user.birthdate ? new Date(user.birthdate).toLocaleDateString() : '未设置'}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="gender">性别</label>
              {isEditing ? (
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">请选择</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="other">其他</option>
                </select>
              ) : (
                <div className="form-value">
                  {user.gender === 'male' ? '男' : 
                   user.gender === 'female' ? '女' : 
                   user.gender === 'other' ? '其他' : '未设置'}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="bio">个人简介</label>
              {isEditing ? (
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="请输入个人简介"
                  rows="4"
                />
              ) : (
                <div className="form-value bio-value">
                  {user.bio || '未设置'}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="form-actions">
                <button onClick={handleSave} className="save-button">
                  保存更改
                </button>
                <button onClick={handleCancel} className="cancel-button">
                  取消
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
