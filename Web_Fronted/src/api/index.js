import axios from 'axios';

// 创建axios实例
const api = axios.create({
    baseURL: '/api', // 基础URL，会自动添加到所有请求前
    timeout: 10000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json',
    }
});

// 请求拦截器 - 在发送请求前执行
api.interceptors.request.use(
    (config) => {
        console.log('🚀 发送请求:', config.method?.toUpperCase(), config.url);
        console.log('📤 请求数据:', config.data || config.params);

        // 可以在这里添加认证token
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }

        return config;
    },
    (error) => {
        console.error('❌ 请求错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器 - 在收到响应后执行
api.interceptors.response.use(
    (response) => {
        console.log('✅ 收到响应:', response.status, response.config.url);
        console.log('📥 响应数据:', response.data);

        // 直接返回data部分，简化调用
        return response.data;
    },
    (error) => {
        console.error('❌ 响应错误:', error.response?.status, error.message);

        // 统一错误处理
        if (error.response?.status === 401) {
            // 处理未授权
            console.log('用户未授权，请重新登录');
        } else if (error.response?.status >= 500) {
            // 处理服务器错误
            console.log('服务器错误，请稍后重试');
        }

        return Promise.reject(error);
    }
);

// API方法封装
export const apiService = {
    // GET请求：获取Hello消息
    getHello: (params = {}) => {
        return api.get('/hello', { params });
    },

    // POST请求：发送数据
    postData: (data) => {
        return api.post('/data', data);
    },

    // GET请求：获取用户列表
    getUsers: () => {
        return api.get('/users');
    },

    // GET请求：获取特定用户
    getUser: (uid) => {
        return api.get('/get_user', { params: { uid } });
    },

    // GET请求：获取服务器状态
    getStatus: () => {
        return api.get('/status');
    },

    // GET请求：测试错误处理
    testError: (type) => {
        return api.get('/error', { params: { type } });
    },
};

export default api;
