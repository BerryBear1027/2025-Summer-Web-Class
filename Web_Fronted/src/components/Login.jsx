import React, { useState } from 'react';
import './Auth.css';
import { authAPI, tokenManager } from '../api/auth';

const Login = ({ onSwitchToRegister, onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError(''); // 清除错误信息
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            setError('请填写所有必填字段');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authAPI.login(formData);

            if (response.success) {
                // 保存token
                tokenManager.setToken(response.data.token);
                onLoginSuccess(response.data.user);
            } else {
                setError(response.message || '登录失败');
            }
        } catch (error) {
            console.error('登录错误：', error);
            setError('网络错误，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">欢迎登录</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>用户名</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="请输入用户名"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>密码</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="请输入密码"
                            required
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? '登录中...' : '登录'}
                    </button>
                </form>

                <div className="auth-switch">
                    <span>还没有账号？</span>
                    <button type="button" onClick={onSwitchToRegister} className="switch-button">
                        立即注册
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;