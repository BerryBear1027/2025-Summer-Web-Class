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
        const token = tokenManager.getToken();
        return api.get('/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    // 更新用户资料
    updateProfile: (userData) => {
        const token = tokenManager.getToken();
        return api.put('/auth/profile', userData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    // 登出
    logout: () => {
        return api.post('/auth/logout');
    }
};

// Token 管理 - 支持多用户同时登录
export const tokenManager = {
    // 生成会话ID
    generateSessionId: () => {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // 获取当前会话ID
    getCurrentSessionId: () => {
        let sessionId = sessionStorage.getItem('currentSessionId');
        if (!sessionId) {
            sessionId = tokenManager.generateSessionId();
            sessionStorage.setItem('currentSessionId', sessionId);
        }
        return sessionId;
    },

    // 保存token（使用会话ID作为键）
    setToken: (token) => {
        const sessionId = tokenManager.getCurrentSessionId();
        const tokenKey = `token_${sessionId}`;
        sessionStorage.setItem(tokenKey, token);
        sessionStorage.setItem('token', token); // 保持兼容性
    },

    // 获取token
    getToken: () => {
        const sessionId = tokenManager.getCurrentSessionId();
        const tokenKey = `token_${sessionId}`;
        return sessionStorage.getItem(tokenKey) || sessionStorage.getItem('token');
    },

    // 清除token
    clearToken: () => {
        const sessionId = tokenManager.getCurrentSessionId();
        const tokenKey = `token_${sessionId}`;
        sessionStorage.removeItem(tokenKey);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('currentSessionId');
    },

    // 检查是否已登录
    isLoggedIn: () => {
        return !!tokenManager.getToken();
    }
};
