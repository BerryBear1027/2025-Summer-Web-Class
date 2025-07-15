import React, { useState, useEffect } from 'react';
import { sportsAPI } from '../api/sports';
import './VenueDetail.css';

const VenueDetail = ({ venue, user, onBack, onNavigate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingForm, setBookingForm] = useState({
    selectedTimeSlots: [], // 改为数组支持多选
    show: false
  });
  const [venueBookings, setVenueBookings] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    loadComments();
  }, [venue.id]);

  useEffect(() => {
    if (bookingForm.show) {
      // 只加载今天的预约信息
      const today = new Date().toISOString().split('T')[0];
      loadVenueBookings(today);
    }
  }, [bookingForm.show]);

  const loadComments = async () => {
    try {
      const response = await sportsAPI.getComments(venue.id, 'venue');
      // 由于axios拦截器返回response.data，这里直接检查success
      if (response.success) {
        setComments(response.data || []);
      }
    } catch (error) {
      console.error('加载评论失败：', error);
    }
  };

  const loadVenueBookings = async (date) => {
    try {
      const response = await sportsAPI.getVenueBookings(venue.id, date);
      console.log('Load venue bookings response:', response);
      
      // 由于axios拦截器返回response.data，这里直接检查success
      if (response.success && response.data) {
        setVenueBookings(response.data);
        setAvailableSlots(response.data.availableSlots || []);
      } else {
        console.warn('获取场馆预约信息失败:', response.message);
      }
    } catch (error) {
      console.error('加载预约信息失败：', error);
    }
  };

  const handleDeleteVenue = async () => {
    if (!window.confirm('确定要删除这个场馆吗？此操作不可撤销！')) return;

    console.log('准备删除场馆，venue ID:', venue.id, 'user ID:', user.id);
    setLoading(true);
    setError('');
    try {
      const response = await sportsAPI.deleteVenue(venue.id);
      console.log('删除场馆响应：', response);
      
      // 检查响应结构
      const success = response.success;
      const message = response.message;
      
      if (success) {
        alert('场馆已删除');
        onBack();
      } else {
        setError(message || '删除场馆失败');
      }
    } catch (error) {
      console.error('删除场馆失败：', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleBookVenue = async () => {
    if (!bookingForm.selectedTimeSlots || bookingForm.selectedTimeSlots.length === 0) {
      setError('请选择预约时间段');
      return;
    }

    const currentHour = new Date().getHours();
    
    // 检查选择的时间段是否都在当前时间之后
    for (const timeSlot of bookingForm.selectedTimeSlots) {
      const [startTime] = timeSlot.split('-');
      const selectedHour = parseInt(startTime.split(':')[0]);
      
      if (selectedHour <= currentHour) {
        setError('预约时间不能早于当前时间');
        return;
      }
    }

    setLoading(true);
    setError('');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 为每个时间段创建预约
      const bookingPromises = bookingForm.selectedTimeSlots.map(timeSlot => {
        const [startTime, endTime] = timeSlot.split('-');
        return sportsAPI.createBooking({
          venueId: venue.id,
          bookingDate: today,
          startTime: startTime,
          endTime: endTime
        });
      });

      const responses = await Promise.all(bookingPromises);
      console.log('预约响应：', responses);
      
      // 检查是否所有预约都成功
      const allSuccess = responses.every(response => response.success);
      
      if (allSuccess) {
        alert(`预约成功！已预约 ${bookingForm.selectedTimeSlots.length} 个时间段`);
        setBookingForm({ selectedTimeSlots: [], show: false });
        // 重新加载今天的预约信息
        loadVenueBookings(today);
      } else {
        // 找到失败的预约
        const failedBookings = responses.filter(response => !response.success);
        
        if (failedBookings.length > 0) {
          const firstError = failedBookings[0];
          const message = firstError.message;
          
          if (message && (message.includes('已被预约') || message.includes('时间段冲突') || message.includes('该时间段'))) {
            setError('部分时间段已经被预约！请重新选择');
          } else {
            setError(message || '部分预约失败');
          }
        }
        
        // 重新加载预约信息以更新可用时间段
        loadVenueBookings(today);
      }
    } catch (error) {
      console.error('预约失败：', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await sportsAPI.createComment({
        targetId: venue.id,
        targetType: 'venue',
        content: newComment.trim()
      });

      if (response.success) {
        setNewComment('');
        loadComments(); // 重新加载评论
      } else {
        setError(response.message || '发表评论失败');
      }
    } catch (error) {
      console.error('发表评论失败：', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const isCreator = venue.publisherId === user.id;

  // 获取今天的日期字符串，用于设置最小时间
  const today = new Date().toISOString().slice(0, 16);

  return (
    <div className="venue-detail-container">
      <div className="detail-header">
        <button onClick={onBack} className="back-button">
          ← 返回
        </button>
        <h1>场馆详情</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="venue-content">
        <div className="venue-main">
          <div className="venue-header">
            <div className="title-section">
              <h2>{venue.name}</h2>
              <span className="venue-type">{venue.type}</span>
            </div>
            <div className="status-section">
              <span className={`status ${venue.status}`}>{venue.status}</span>
            </div>
          </div>

          <div className="venue-info">
            <div className="info-grid">
              <div className="info-item">
                <span className="label">地址：</span>
                <span>{venue.location}</span>
              </div>
              <div className="info-item">
                <span className="label">容量：</span>
                <span>{venue.capacity}人</span>
              </div>
              <div className="info-item">
                <span className="label">价格：</span>
                <span>¥{venue.price}/小时</span>
              </div>
              <div className="info-item">
                <span className="label">运动类型：</span>
                <span>{venue.sportType}</span>
              </div>
              <div className="info-item">
                <span className="label">发布者：</span>
                <span>{venue.publisherName}</span>
              </div>
              <div className="info-item">
                <span className="label">发布时间：</span>
                <span>{formatDate(venue.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="description-section">
            <h3>场馆描述</h3>
            <p>{venue.description}</p>
          </div>

          <div className="action-section">
            {isCreator ? (
              <button 
                onClick={handleDeleteVenue} 
                className="action-btn danger"
                disabled={loading}
              >
                {loading ? '处理中...' : '删除场馆'}
              </button>
            ) : (
              <div className="booking-section">
                {(() => {
                  const displayStatus = venue.dynamicStatus || venue.status;
                  const isExpired = displayStatus === 'expired';
                  const isFullyBooked = displayStatus === 'fully_booked';
                  const isAvailable = displayStatus === 'available';
                  
                  if (isExpired) {
                    return (
                      <div className="unavailable-notice expired-notice">
                        场馆时间已过期，无法预约
                      </div>
                    );
                  }
                  
                  if (isFullyBooked) {
                    return (
                      <div>
                        <button 
                          className="action-btn primary disabled"
                          disabled={true}
                        >
                          已满约
                        </button>
                        <div className="unavailable-notice">
                          今日时间段已全部被预约
                        </div>
                      </div>
                    );
                  }
                  
                  if (!isAvailable) {
                    return (
                      <div className="unavailable-notice">
                        场馆暂不可预约
                      </div>
                    );
                  }
                  
                  return !bookingForm.show ? (
                    <button 
                      onClick={() => setBookingForm({ ...bookingForm, show: true })}
                      className="action-btn primary"
                    >
                      预约场馆
                    </button>
                  ) : (
                    <div className="booking-form">
                      <h4>预约时间</h4>
                      <div className="venue-time-info">
                        <p className="today-booking-notice">⚡ 只能预约当天时间段</p>
                        <p>可用时间段：{venue.availableHours?.map(hour => {
                          const startHour = hour.split(':')[0];
                          const endHour = (parseInt(startHour) + 1).toString().padStart(2, '0');
                          return `${hour}-${endHour}:00`;
                        }).join(', ') || '暂无设置'}</p>
                        <p>价格：¥{venue.price || 0}/小时</p>
                      </div>
                      
                      <div className="time-inputs">
                        <div className="input-group">
                          <label>今日可预约时间段：</label>
                          <div className="time-slots-grid">
                            {venue.availableHours?.map(hour => {
                              const startHour = hour.split(':')[0];
                              const endHour = (parseInt(startHour) + 1).toString().padStart(2, '0');
                              const timeSlot = `${hour}-${endHour}:00`;
                              const currentHour = new Date().getHours();
                              const slotHour = parseInt(startHour);
                              const isPastTime = slotHour <= currentHour;
                              const isBooked = venueBookings?.bookings?.some(booking => 
                                booking.startTime === hour
                              );
                              const isSelected = bookingForm.selectedTimeSlots.includes(timeSlot);
                              const isDisabled = isPastTime || isBooked;
                              
                              const handleTimeSlotClick = () => {
                                if (isDisabled) return;
                                
                                if (isSelected) {
                                  // 取消选择
                                  setBookingForm({
                                    ...bookingForm,
                                    selectedTimeSlots: bookingForm.selectedTimeSlots.filter(slot => slot !== timeSlot)
                                  });
                                } else {
                                  // 添加选择
                                  setBookingForm({
                                    ...bookingForm,
                                    selectedTimeSlots: [...bookingForm.selectedTimeSlots, timeSlot]
                                  });
                                }
                              };
                              
                              return (
                                <button
                                  key={hour}
                                  type="button"
                                  className={`time-slot-btn ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''} ${isPastTime ? 'past-time' : ''}`}
                                  disabled={isDisabled}
                                  onClick={handleTimeSlotClick}
                                >
                                  {timeSlot}
                                  {isBooked && <span className="booked-label">已预约</span>}
                                  {isPastTime && !isBooked && <span className="past-time-label">已过期</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {bookingForm.selectedTimeSlots.length > 0 && (
                        <div className="booking-summary">
                          <p>已选择时间段：{bookingForm.selectedTimeSlots.join(', ')}</p>
                          <p>预约时长：{bookingForm.selectedTimeSlots.length} 小时</p>
                          {venue.price && (
                            <p>总费用：¥{venue.price * bookingForm.selectedTimeSlots.length}</p>
                          )}
                        </div>
                      )}
                      
                      <div className="booking-actions">
                        <button 
                          onClick={handleBookVenue}
                          className="action-btn primary"
                          disabled={loading || bookingForm.selectedTimeSlots.length === 0}
                        >
                          {loading ? '预约中...' : '确认预约'}
                        </button>
                        <button 
                          onClick={() => setBookingForm({ selectedTimeSlots: [], show: false })}
                          className="action-btn secondary"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        <div className="comments-section">
          <h3>评论 ({comments.length})</h3>
          
          <div className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="发表你的看法..."
              rows="3"
            />
            <button 
              onClick={handleAddComment}
              disabled={loading || !newComment.trim()}
              className="comment-btn"
            >
              {loading ? '发表中...' : '发表评论'}
            </button>
          </div>

          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="empty-comments">暂无评论</div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <div className="commenter-info">
                      <div className="commenter-avatar">
                        <div className="avatar-placeholder">{(comment.userName || comment.username || '?')[0]}</div>
                      </div>
                      <span className="commenter-name">{comment.userName || comment.username || '未知用户'}</span>
                    </div>
                    <span className="comment-time">{formatDate(comment.createdAt)}</span>
                  </div>
                  <div className="comment-content">
                    {comment.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetail;
