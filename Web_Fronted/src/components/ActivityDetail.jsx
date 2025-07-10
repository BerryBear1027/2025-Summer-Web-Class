import React, { useState, useEffect } from 'react';
import { sportsAPI } from '../api/sports';
import './ActivityDetail.css';

const ActivityDetail = ({ activity, user, onBack, onNavigate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isParticipating, setIsParticipating] = useState(false);

  useEffect(() => {
    loadComments();
    checkParticipation();
  }, [activity.id]);

  const loadComments = async () => {
    try {
      const response = await sportsAPI.getComments(activity.id, 'activity');
      if (response.data.success) {
        setComments(response.data.data || []);
      }
    } catch (error) {
      console.error('加载评论失败：', error);
    }
  };

  const checkParticipation = () => {
    const participating = activity.participants && 
      activity.participants.some(p => p.id === user.id);
    setIsParticipating(participating);
  };

  const handleJoinActivity = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await sportsAPI.joinActivity(activity.id);
      if (response.data.success) {
        setIsParticipating(true);
        // 更新参与者列表
        activity.participants = activity.participants || [];
        activity.participants.push({
          id: user.id,
          username: user.username,
          avatar: user.avatar
        });
        alert('报名成功！');
      } else {
        setError(response.data.message || '报名失败');
      }
    } catch (error) {
      console.error('报名失败：', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveActivity = async () => {
    if (!window.confirm('确定要取消报名吗？')) return;

    setLoading(true);
    setError('');
    try {
      const response = await sportsAPI.leaveActivity(activity.id);
      if (response.data.success) {
        setIsParticipating(false);
        // 从参与者列表中移除
        activity.participants = activity.participants.filter(p => p.id !== user.id);
        alert('取消报名成功！');
      } else {
        setError(response.data.message || '取消报名失败');
      }
    } catch (error) {
      console.error('取消报名失败：', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelActivity = async () => {
    if (!window.confirm('确定要解散这个活动吗？此操作不可撤销！')) return;

    setLoading(true);
    setError('');
    try {
      const response = await sportsAPI.cancelActivity(activity.id);
      if (response.data.success) {
        alert('活动已解散');
        onBack();
      } else {
        setError(response.data.message || '解散活动失败');
      }
    } catch (error) {
      console.error('解散活动失败：', error);
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
        targetId: activity.id,
        targetType: 'activity',
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

  const isCreator = activity.creatorId === user.id;
  const canJoin = !isParticipating && !isCreator && 
    activity.status === 'active' && 
    (activity.participants?.length || 0) < activity.maxParticipants;

  return (
    <div className="activity-detail-container">
      <div className="detail-header">
        <button onClick={onBack} className="back-button">
          ← 返回
        </button>
        <h1>活动详情</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="activity-content">
        <div className="activity-main">
          <div className="activity-header">
            <div className="title-section">
              <h2>{activity.title}</h2>
              <span className="activity-type">{activity.type}</span>
            </div>
            <div className="status-section">
              <span className={`status ${activity.status}`}>{activity.status}</span>
            </div>
          </div>

          <div className="activity-info">
            <div className="info-grid">
              <div className="info-item">
                <span className="label">开始时间：</span>
                <span>{formatDate(activity.startTime)}</span>
              </div>
              <div className="info-item">
                <span className="label">结束时间：</span>
                <span>{formatDate(activity.endTime)}</span>
              </div>
              <div className="info-item">
                <span className="label">活动地点：</span>
                <span>{activity.location}</span>
              </div>
              <div className="info-item">
                <span className="label">参与人数：</span>
                <span>{activity.participants?.length || 0}/{activity.maxParticipants}</span>
              </div>
              <div className="info-item">
                <span className="label">发布者：</span>
                <span>{activity.creatorName}</span>
              </div>
              <div className="info-item">
                <span className="label">发布时间：</span>
                <span>{formatDate(activity.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="description-section">
            <h3>活动描述</h3>
            <p>{activity.description}</p>
          </div>

          <div className="participants-section">
            <h3>参与者 ({activity.participants?.length || 0})</h3>
            <div className="participants-list">
              {activity.participants && activity.participants.length > 0 ? (
                activity.participants.map(participant => (
                  <div key={participant.id} className="participant-item">
                    <div className="participant-avatar">
                      {participant.avatar ? (
                        <img src={`http://localhost:7001${participant.avatar}`} alt="" />
                      ) : (
                        <div className="avatar-placeholder">{participant.username[0]}</div>
                      )}
                    </div>
                    <span>{participant.username}</span>
                  </div>
                ))
              ) : (
                <div className="empty-participants">暂无参与者</div>
              )}
            </div>
          </div>

          <div className="action-section">
            {isCreator ? (
              <button 
                onClick={handleCancelActivity} 
                className="action-btn danger"
                disabled={loading}
              >
                {loading ? '处理中...' : '解散活动'}
              </button>
            ) : canJoin ? (
              <button 
                onClick={handleJoinActivity} 
                className="action-btn primary"
                disabled={loading}
              >
                {loading ? '处理中...' : '报名参加'}
              </button>
            ) : isParticipating ? (
              <button 
                onClick={handleLeaveActivity} 
                className="action-btn secondary"
                disabled={loading}
              >
                {loading ? '处理中...' : '取消报名'}
              </button>
            ) : (
              <div className="cannot-join">
                {activity.status !== 'active' ? '活动已结束' : '人数已满'}
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
                        {comment.userAvatar ? (
                          <img src={`http://localhost:7001${comment.userAvatar}`} alt="" />
                        ) : (
                          <div className="avatar-placeholder">{comment.username[0]}</div>
                        )}
                      </div>
                      <span className="commenter-name">{comment.username}</span>
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

export default ActivityDetail;
