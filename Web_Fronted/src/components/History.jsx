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
      case 'active':
      case 'confirmed':
        return '#2ed573';
      case 'completed':
        return '#747d8c';
      case 'cancelled':
        return '#ff4757';
      default:
        return '#666';
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
                      <h3 onClick={() => onNavigate('activity-detail', activity)}>
                        {activity.title}
                      </h3>
                      <span 
                        className="status"
                        style={{ backgroundColor: getStatusColor(activity.status) }}
                      >
                        {activity.status}
                      </span>
                    </div>
                    <div className="item-content">
                      <div className="item-info">
                        <span className="info-label">类型：</span>
                        <span>{activity.type}</span>
                      </div>
                      <div className="item-info">
                        <span className="info-label">地点：</span>
                        <span>{activity.location}</span>
                      </div>
                      <div className="item-info">
                        <span className="info-label">时间：</span>
                        <span>{formatDate(activity.startTime)} - {formatDate(activity.endTime)}</span>
                      </div>
                      <div className="item-info">
                        <span className="info-label">参与时间：</span>
                        <span>{formatDate(activity.joinedAt)}</span>
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
                      <h3 onClick={() => onNavigate('venue-detail', booking.venue)}>
                        {booking.venue.name}
                      </h3>
                      <div className="booking-actions">
                        <span 
                          className="status"
                          style={{ backgroundColor: getStatusColor(booking.status) }}
                        >
                          {booking.status}
                        </span>
                        {booking.status === 'confirmed' && (
                          <button 
                            onClick={() => handleCancelBooking(booking.id)}
                            className="cancel-booking-btn"
                          >
                            取消预约
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="item-content">
                      <div className="item-info">
                        <span className="info-label">地址：</span>
                        <span>{booking.venue.address}</span>
                      </div>
                      <div className="item-info">
                        <span className="info-label">预约时间：</span>
                        <span>{formatDate(booking.startTime)} - {formatDate(booking.endTime)}</span>
                      </div>
                      <div className="item-info">
                        <span className="info-label">费用：</span>
                        <span>¥{booking.totalPrice}</span>
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
                      <h3 onClick={() => onNavigate(
                        item.type === 'activity' ? 'activity-detail' : 'venue-detail', 
                        item
                      )}>
                        {item.title || item.name}
                      </h3>
                      <div className="publication-info">
                        <span className="publication-type">{item.type === 'activity' ? '活动' : '场馆'}</span>
                        <span 
                          className="status"
                          style={{ backgroundColor: getStatusColor(item.status) }}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <div className="item-content">
                      {item.type === 'activity' ? (
                        <>
                          <div className="item-info">
                            <span className="info-label">类型：</span>
                            <span>{item.type}</span>
                          </div>
                          <div className="item-info">
                            <span className="info-label">地点：</span>
                            <span>{item.location}</span>
                          </div>
                          <div className="item-info">
                            <span className="info-label">参与人数：</span>
                            <span>{item.participants?.length || 0}/{item.maxParticipants}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="item-info">
                            <span className="info-label">地址：</span>
                            <span>{item.address}</span>
                          </div>
                          <div className="item-info">
                            <span className="info-label">容量：</span>
                            <span>{item.capacity}人</span>
                          </div>
                          <div className="item-info">
                            <span className="info-label">价格：</span>
                            <span>¥{item.price}/小时</span>
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
