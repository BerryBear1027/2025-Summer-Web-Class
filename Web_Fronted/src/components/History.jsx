import React, { useState, useEffect } from 'react';
import { sportsAPI } from '../api/sports';
import './History.css';

const History = ({ user, onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('activities'); // 'activities', 'bookings', 'publications'
  const [data, setData] = useState({
    activities: [],
    bookings: [],
    publications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [activitiesRes, bookingsRes, publicationsRes] = await Promise.all([
        sportsAPI.getUserActivities(),
        sportsAPI.getUserBookings(),
        sportsAPI.getUserPublications()
      ]);

      console.log('User activities response:', activitiesRes);
      console.log('User bookings response:', bookingsRes);
      console.log('User publications response:', publicationsRes);

      setData({
        activities: activitiesRes.success ? activitiesRes.data || [] : [],
        bookings: bookingsRes.success ? bookingsRes.data || [] : [],
        publications: publicationsRes.success ? publicationsRes.data || [] : []
      });
    } catch (error) {
      console.error('加载历史记录失败：', error);
      setError('加载历史记录失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('确定要取消这个预约吗？')) return;

    try {
      const response = await sportsAPI.cancelBooking(bookingId);
      if (response.success) {
        alert('预约已取消');
        loadData(); // 重新加载数据
      } else {
        alert(response.message || '取消预约失败');
      }
    } catch (error) {
      console.error('取消预约失败：', error);
      alert('网络错误，请稍后重试');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'recruiting':
      case 'available':
      case 'active':
      case 'confirmed':
        return '#2ed573';
      case 'full':
      case 'ongoing':
        return '#3742fa';
      case 'completed':
        return '#747d8c';
      case 'cancelled':
      case 'deleted':
      case 'closed':
        return '#ff4757';
      case 'pending':
        return '#ffa502';
      case 'maintenance':
        return '#ff6348';
      default:
        return '#666';
    }
  };

  const getStatusText = (status, type = '') => {
    switch (status) {
      case 'recruiting': return '招募中';
      case 'full': return '已满员';
      case 'ongoing': return '进行中';
      case 'completed': return '已结束';
      case 'cancelled': return '已解散';
      case 'deleted': return '已删除';
      case 'available': return '可用';
      case 'maintenance': return '维护中';
      case 'closed': return '已关闭';
      case 'pending': return '待确认';
      case 'confirmed': return '预约成功';
      case 'active': return '活跃';
      default: return status || '未知状态';
    }
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <button onClick={onBack} className="back-button">
          ← 返回
        </button>
        <h1>历史记录</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="history-content">
        <div className="history-tabs">
          <button
            className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            参与活动 ({data.activities.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            场馆预约 ({data.bookings.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'publications' ? 'active' : ''}`}
            onClick={() => setActiveTab('publications')}
          >
            我的发布 ({data.publications.length})
          </button>
        </div>

        <div className="history-list">
          {activeTab === 'activities' && (
            <div className="activities-history">
              {data.activities.length === 0 ? (
                <div className="empty-state">暂无参与的活动</div>
              ) : (
                data.activities.map((activity) => (
                  <div key={activity.id} className="history-item activity-item">
                    <div className="item-header">
                      <h3
                        onClick={() => (activity.status !== 'deleted' && activity.status !== 'cancelled') && onNavigate('activity-detail', activity)}
                        className={`clickable-title ${(activity.status === 'deleted' || activity.status === 'cancelled') ? 'deleted-item' : ''}`}
                        title={(activity.status === 'deleted' || activity.status === 'cancelled') ? '活动已被删除或解散' : "点击查看活动详情"}
                      >
                        {activity.name}
                        {(activity.status === 'deleted' || activity.status === 'cancelled') && <span className="deleted-tag">（{activity.status === 'deleted' ? '已删除' : '已解散'}）</span>}
                      </h3>
                      <div className="item-actions">
                        <span
                          className="status"
                          style={{ backgroundColor: getStatusColor(activity.status) }}
                        >
                          {getStatusText(activity.status)}
                        </span>
                        {(activity.status !== 'deleted' && activity.status !== 'cancelled') && (
                          <button
                            onClick={() => onNavigate('activity-detail', activity)}
                            className="view-detail-btn"
                          >
                            查看详情
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="item-content">
                      <div className="item-info">
                        <span className="info-label">活动类型：</span>
                        <span>{activity.type || '活动'}</span>
                      </div>
                      <div className="item-info">
                        <span className="info-label">活动地点：</span>
                        <span>{activity.location}</span>
                      </div>
                      <div className="item-info">
                        <span className="info-label">开始时间：</span>
                        <span>{formatDate(activity.startTime)}</span>
                      </div>
                      <div className="item-info">
                        <span className="info-label">结束时间：</span>
                        <span>{formatDate(activity.endTime)}</span>
                      </div>
                      <div className="item-info">
                        <span className="info-label">参与人数：</span>
                        <span>{activity.participants?.length || 0}/{activity.maxParticipants}人</span>
                      </div>
                      <div className="item-info">
                        <span className="info-label">发布者：</span>
                        <span>{activity.publisherName || '未知用户'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bookings-history">
              {data.bookings.length === 0 ? (
                <div className="empty-state">暂无场馆预约记录</div>
              ) : (
                data.bookings.map((booking) => (
                  <div key={booking.id} className="history-item booking-item">
                    <div className="item-header">
                      <h3
                        onClick={() => booking.venue && booking.venue.status !== 'deleted' && onNavigate('venue-detail', booking.venue)}
                        className={`clickable-title ${!booking.venue || booking.venue.status === 'deleted' ? 'deleted-item' : ''}`}
                        title={!booking.venue || booking.venue.status === 'deleted' ? '场馆已被删除' : "点击查看场馆详情"}
                      >
                        {booking.venue?.name || booking.venueName || '未知场馆'}
                        {(!booking.venue || booking.venue.status === 'deleted') && <span className="deleted-tag">（已删除）</span>}
                      </h3>
                      <div className="booking-actions">
                        <span
                          className="status"
                          style={{ backgroundColor: getStatusColor(booking.status) }}
                        >
                          {getStatusText(booking.status)}
                        </span>
                        {(booking.status === 'confirmed' || booking.status === 'pending') && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="cancel-booking-btn"
                          >
                            取消预约
                          </button>
                        )}
                        {booking.venue && booking.venue.status !== 'deleted' && (
                          <button
                            onClick={() => onNavigate('venue-detail', booking.venue)}
                            className="view-detail-btn"
                          >
                            查看场馆
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="item-content">
                      <div className="item-info">
                        <span className="info-label">地址：</span>
                        <span>{booking.venue?.location || booking.venue?.address || '地址未知'}</span>
                      </div>
                      <div className="item-info">
                        <span className="info-label">预约日期：</span>
                        <span>{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('zh-CN') : '日期未知'}</span>
                      </div>
                      <div className="item-info">
                        <span className="info-label">预约时间：</span>
                        <span>{booking.startTime} - {booking.endTime}</span>
                      </div>
                      <div className="item-info">
                        <span className="info-label">费用：</span>
                        <span>¥{booking.totalPrice || 0}</span>
                      </div>
                      <div className="item-info">
                        <span className="info-label">预约时间：</span>
                        <span>{formatDate(booking.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'publications' && (
            <div className="publications-history">
              {data.publications.length === 0 ? (
                <div className="empty-state">暂无发布记录</div>
              ) : (
                data.publications.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="history-item publication-item">
                    <div className="item-header">
                      <h3
                        onClick={() => (item.status !== 'deleted' && item.status !== 'cancelled' && item.status !== 'closed') && onNavigate(
                          item.type === 'activity' ? 'activity-detail' : 'venue-detail',
                          item
                        )}
                        className={`clickable-title ${(item.status === 'deleted' || item.status === 'cancelled' || item.status === 'closed') ? 'deleted-item' : ''}`}
                        title={(item.status === 'deleted' || item.status === 'cancelled' || item.status === 'closed') ? `${item.type === 'activity' ? '活动' : '场馆'}已被删除或关闭` : "点击查看详情"}
                      >
                        {item.title || item.name}
                        {(item.status === 'deleted' || item.status === 'cancelled' || item.status === 'closed') &&
                          <span className="deleted-tag">（{item.status === 'deleted' ? '已删除' : item.status === 'cancelled' ? '已解散' : '已关闭'}）</span>
                        }
                      </h3>
                      <div className="publication-info">
                        <span className="publication-type">{item.type === 'activity' ? '活动' : '场馆'}</span>
                        <span
                          className="status"
                          style={{ backgroundColor: getStatusColor(item.status) }}
                        >
                          {getStatusText(item.status, item.type)}
                        </span>
                        {(item.status !== 'deleted' && item.status !== 'cancelled' && item.status !== 'closed') && (
                          <button
                            onClick={() => onNavigate(
                              item.type === 'activity' ? 'activity-detail' : 'venue-detail',
                              item
                            )}
                            className="view-detail-btn"
                          >
                            查看详情
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="item-content">
                      {item.type === 'activity' ? (
                        <>
                          <div className="item-info">
                            <span className="info-label">活动类型：</span>
                            <span>{item.activityType || item.type || '活动'}</span>
                          </div>
                          <div className="item-info">
                            <span className="info-label">活动地点：</span>
                            <span>{item.location}</span>
                          </div>
                          <div className="item-info">
                            <span className="info-label">参与人数：</span>
                            <span>{item.participants?.length || 0}/{item.maxParticipants}人</span>
                          </div>
                          <div className="item-info">
                            <span className="info-label">开始时间：</span>
                            <span>{formatDate(item.startTime)}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="item-info">
                            <span className="info-label">场馆地址：</span>
                            <span>{item.location}</span>
                          </div>
                          <div className="item-info">
                            <span className="info-label">运动类型：</span>
                            <span>{item.sportType}</span>
                          </div>
                          <div className="item-info">
                            <span className="info-label">开放时间：</span>
                            <span>{item.availableHours ?
                              item.availableHours.map(hour => {
                                const startHour = hour.split(':')[0];
                                const endHour = (parseInt(startHour) + 1).toString().padStart(2, '0');
                                return `${hour}-${endHour}:00`;
                              }).slice(0, 3).join(', ') + (item.availableHours.length > 3 ? '...' : '')
                              : '时间待定'}</span>
                          </div>
                          <div className="item-info">
                            <span className="info-label">价格：</span>
                            <span>{item.price ? `¥${item.price}/小时` : '价格面议'}</span>
                          </div>
                        </>
                      )}
                      <div className="item-info">
                        <span className="info-label">发布时间：</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
