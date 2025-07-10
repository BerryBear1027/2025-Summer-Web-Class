import api from './index';

// 认证相关API
export const authAPI = {
    // 用户注册
    register: (userData) => {
        return api.post('/auth/register', userData);
    },

    // 用户登录
    login: (loginData) => {
        return api.post('/auth/login', loginData);
    },

    // 获取用户信息
    getProfile: () => {
        const token = localStorage.getItem('token');
        return api.get('/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    // 上传头像
    uploadAvatar: (file) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        return api.post('/auth/upload-avatar', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // 登出
    logout: () => {
        return api.post('/auth/logout');
    }
};

// Token 管理
export const tokenManager = {
    // 保存token
    setToken: (token) => {
        localStorage.setItem('token', token);
    },

    // 获取token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // 清除token
    clearToken: () => {
        localStorage.removeItem('token');
    },

    // 检查是否已登录
    isLoggedIn: () => {
        return !!localStorage.getItem('token');
    }
};
