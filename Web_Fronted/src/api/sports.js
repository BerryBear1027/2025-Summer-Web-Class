import api from './index';
import { tokenManager } from './auth';

// 体育活动相关API
export const sportsAPI = {
  // ============ 活动相关 ============

  // 创建活动
  createActivity: (activityData) => {
    const token = tokenManager.getToken();
    return api.post('/sports/activities', activityData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 获取所有活动
  getAllActivities: () => {
    return api.get('/sports/activities');
  },

  // 根据ID获取活动详情
  getActivityById: (id) => {
    return api.get(`/sports/activities/${id}`);
  },

  // 报名参加活动
  joinActivity: (id) => {
    const token = tokenManager.getToken();
    return api.post(`/sports/activities/${id}/join`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 取消报名
  leaveActivity: (id) => {
    const token = tokenManager.getToken();
    return api.post(`/sports/activities/${id}/leave`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 解散活动
  cancelActivity: (id) => {
    const token = tokenManager.getToken();
    return api.delete(`/sports/activities/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 删除活动
  deleteActivity: (id) => {
    const token = tokenManager.getToken();
    return api.delete(`/sports/activities/${id}/delete`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 搜索活动
  searchActivities: (keyword) => {
    return api.get(`/sports/activities/search?keyword=${encodeURIComponent(keyword || '')}`);
  },

  // ============ 场馆相关 ============

  // 创建场馆
  createVenue: (venueData) => {
    const token = tokenManager.getToken();
    return api.post('/sports/venues', venueData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 获取所有场馆
  getAllVenues: () => {
    return api.get('/sports/venues');
  },

  // 根据ID获取场馆详情
  getVenueById: (id) => {
    return api.get(`/sports/venues/${id}`);
  },

  // 删除场馆
  deleteVenue: (id) => {
    const token = tokenManager.getToken();
    return api.delete(`/sports/venues/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 搜索场馆
  searchVenues: (keyword) => {
    return api.get(`/sports/venues/search?keyword=${encodeURIComponent(keyword || '')}`);
  },

  // ============ 预约相关 ============

  // 创建预约
  createBooking: (bookingData) => {
    const token = tokenManager.getToken();
    return api.post('/sports/bookings', bookingData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 取消预约
  cancelBooking: (id) => {
    const token = tokenManager.getToken();
    return api.delete(`/sports/bookings/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 获取用户预约记录
  getUserBookings: () => {
    const token = tokenManager.getToken();
    return api.get('/sports/my-bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 获取场馆预约信息
  getVenueBookings: (venueId, date) => {
    const params = date ? `?date=${encodeURIComponent(date)}` : '';
    return api.get(`/sports/venues/${venueId}/bookings${params}`);
  },

  // ============ 评论相关 ============

  // 添加评论
  createComment: (commentData) => {
    const token = tokenManager.getToken();
    return api.post('/sports/comments', commentData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 获取评论
  getComments: (targetId, targetType) => {
    return api.get(`/sports/comments?targetId=${targetId}&targetType=${targetType}`);
  },

  // 删除评论
  deleteComment: (commentId) => {
    const token = tokenManager.getToken();
    return api.delete(`/sports/comments/${commentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // ============ 用户历史记录 ============

  // 获取用户参与的活动
  getUserActivities: () => {
    const token = tokenManager.getToken();
    return api.get('/sports/my-activities', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 获取用户的预约记录
  getUserBookings: () => {
    const token = tokenManager.getToken();
    return api.get('/sports/my-bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 获取用户发布的内容
  getUserPublications: () => {
    const token = tokenManager.getToken();
    return api.get('/sports/my-publications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // ============ 文件上传 ============

  // 上传活动/场馆图片
  uploadImage: (file) => {
    const token = tokenManager.getToken();
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/auth/upload-image', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};
