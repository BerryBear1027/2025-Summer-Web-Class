import React, { useState } from 'react';
import './Auth.css';
import { authAPI, tokenManager } from '../api/auth';

const UserProfile = ({ user, onLogout, onUserUpdate }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setError('只允许上传 JPG、PNG、GIF 格式的图片');
            return;
        }

        // 验证文件大小 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('文件大小不能超过5MB');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const response = await authAPI.uploadAvatar(file);

            if (response.success) {
                onUserUpdate(response.data);
                alert('头像上传成功！');
            } else {
                setError(response.message || '头像上传失败');
            }
        } catch (error) {
            console.error('头像上传错误：', error);
            setError('网络错误，请稍后重试');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('确定要退出登录吗？')) {
            onLogout();
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card profile-card">
                <h2 className="auth-title">个人信息</h2>

                {error && <div className="error-message">{error}</div>}

                <div className="profile-content">
                    <div className="avatar-section">
                        <div className="avatar-container">
                            {user.avatar ? (
                                <img
                                    src={`http://localhost:7001${user.avatar}`}
                                    alt="用户头像"
                                    className="avatar-image"
                                />
                            ) : (
                                <div className="avatar-placeholder">
                                    <span>头像</span>
                                </div>
                            )}
                        </div>

                        <div className="avatar-upload">
                            <input
                                type="file"
                                id="avatar-upload"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="avatar-upload" className="upload-button">
                                {uploading ? '上传中...' : '更换头像'}
                            </label>
                        </div>
                    </div>

                    <div className="user-info">
                        <div className="info-item">
                            <label>用户名：</label>
                            <span>{user.username}</span>
                        </div>

                        {user.email && (
                            <div className="info-item">
                                <label>邮箱：</label>
                                <span>{user.email}</span>
                            </div>
                        )}

                        {user.phone && (
                            <div className="info-item">
                                <label>手机号：</label>
                                <span>{user.phone}</span>
                            </div>
                        )}

                        <div className="info-item">
                            <label>注册时间：</label>
                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="profile-actions">
                    <button onClick={handleLogout} className="logout-button">
                        退出登录
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;