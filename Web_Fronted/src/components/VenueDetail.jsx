import React, { useState, useEffect } from 'react';
import { sportsAPI } from '../api/sports';
import './VenueDetail.css';

const VenueDetail = ({ venue, user, onBack, onNavigate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingForm, setBookingForm] = useState({
    startTime: '',
    endTime: '',
    show: false
  });

  useEffect(() => {
    loadComments();
  }, [venue.id]);

  const loadComments = async () => {
    try {
      const response = await sportsAPI.getComments(venue.id, 'venue');
      if (response.data.success) {
        setComments(response.data.data || []);
      }
    } catch (error) {
      console.error('加载评论失败：', error);
    }
  };

  const handleDeleteVenue = async () => {
    if (!window.confirm('确定要删除这个场馆吗？此操作不可撤销！')) return;

    setLoading(true);
    setError('');
    try {
      const response = await sportsAPI.deleteVenue(venue.id);
      if (response.data.success) {
        alert('场馆已删除');
        onBack();
      } else {
        setError(response.data.message || '删除场馆失败');
      }
    } catch (error) {
      console.error('删除场馆失败：', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleBookVenue = async () => {
    if (!bookingForm.startTime || !bookingForm.endTime) {
      setError('请选择预约时间');
      return;
    }

    const startTime = new Date(bookingForm.startTime);
    const endTime = new Date(bookingForm.endTime);

    if (startTime >= endTime) {
      setError('结束时间必须晚于开始时间');
      return;
    }

    if (startTime < new Date()) {
      setError('预约时间不能早于当前时间');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await sportsAPI.createBooking({
        venueId: venue.id,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime
      });

      if (response.data.success) {
        alert('预约成功！');
        setBookingForm({ startTime: '', endTime: '', show: false });
      } else {
        setError(response.data.message || '预约失败');
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

      if (response.data.success) {
        setNewComment('');
        loadComments(); // 重新加载评论
      } else {
        setError(response.data.message || '发表评论失败');
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

  const isCreator = venue.creatorId === user.id;

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
                <span>{venue.address}</span>
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
                <span>{venue.creatorName}</span>
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
                {!bookingForm.show ? (
                  <button 
                    onClick={() => setBookingForm({ ...bookingForm, show: true })}
                    className="action-btn primary"
                    disabled={venue.status !== 'available'}
                  >
                    预约场馆
                  </button>
                ) : (
                  <div className="booking-form">
                    <h4>预约时间</h4>
                    <div className="time-inputs">
                      <div className="input-group">
                        <label>开始时间：</label>
                        <input
                          type="datetime-local"
                          value={bookingForm.startTime}
                          min={today}
                          onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label>结束时间：</label>
                        <input
                          type="datetime-local"
                          value={bookingForm.endTime}
                          min={bookingForm.startTime || today}
                          onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="booking-actions">
                      <button 
                        onClick={handleBookVenue}
                        className="action-btn primary"
                        disabled={loading}
                      >
                        {loading ? '预约中...' : '确认预约'}
                      </button>
                      <button 
                        onClick={() => setBookingForm({ startTime: '', endTime: '', show: false })}
                        className="action-btn secondary"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
                {venue.status !== 'available' && (
                  <div className="unavailable-notice">
                    场馆暂不可预约
                  </div>
                )}
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
