import React, { useState } from 'react';
import './Auth.css';
import { authAPI } from '../api/auth';

const Register = ({ onSwitchToLogin, onRegisterSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
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

    const validateForm = () => {
        if (!formData.username || !formData.password) {
            setError('用户名和密码不能为空');
            return false;
        }

        if (formData.username.length < 3 || formData.username.length > 20) {
            setError('用户名长度必须在3-20个字符之间');
            return false;
        }

        if (formData.password.length < 6) {
            setError('密码长度不能少于6个字符');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('两次输入的密码不一致');
            return false;
        }

        if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
            setError('请输入正确的手机号格式');
            return false;
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            setError('请输入正确的邮箱格式');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { confirmPassword, ...registerData } = formData;
            const response = await authAPI.register(registerData);

            if (response.success) {
                alert('注册成功！请登录');
                onRegisterSuccess(response.data);
            } else {
                setError(response.message || '注册失败');
            }
        } catch (error) {
            console.error('注册错误：', error);
            setError('网络错误，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">用户注册</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>用户名 *</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="请输入用户名（3-20字符）"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>邮箱</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="请输入邮箱地址（可选）"
                        />
                    </div>

                    <div className="form-group">
                        <label>手机号</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="请输入手机号（可选）"
                        />
                    </div>

                    <div className="form-group">
                        <label>密码 *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="请输入密码（至少6位）"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>确认密码 *</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="请再次输入密码"
                            required
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? '注册中...' : '注册'}
                    </button>
                </form>

                <div className="auth-switch">
                    <span>已有账号？</span>
                    <button type="button" onClick={onSwitchToLogin} className="switch-button">
                        立即登录
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;