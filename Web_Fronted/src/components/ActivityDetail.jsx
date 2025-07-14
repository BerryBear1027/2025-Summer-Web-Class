import React, { useState, useEffect } from 'react';
import { sportsAPI } from '../api/sports';
import './ActivityDetail.css';

const ActivityDetail = ({ activity, user, onBack, onNavigate }) => {
  // 添加安全检查
  if (!activity) {
    return (
      <div className="activity-detail-container">
        <div className="detail-header">
          <button onClick={onBack} className="back-button">
            ← 返回
          </button>
          <h1>活动详情</h1>
        </div>
        <div className="error-message">活动信息不存在</div>
      </div>
    );
  }

  console.log('ActivityDetail received activity:', activity);
  console.log('ActivityDetail received user:', user);
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
      console.log('Load comments response:', response); // 添加调试日志
      if (response.success) {
        setComments(response.data || []);
      }
    } catch (error) {
      console.error('加载评论失败：', error);
    }
  };

  const checkParticipation = () => {
    // 根据后端实体定义，participants是string[]数组，存储的是用户ID
    const participating = activity.participants && 
      activity.participants.includes(user.id);
    setIsParticipating(participating);
  };

  const handleJoinActivity = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await sportsAPI.joinActivity(activity.id);
      console.log('Join activity response:', response); // 添加调试日志
      if (response.success) {
        setIsParticipating(true);
        // 更新参与者列表 - 添加用户ID到数组
        activity.participants = activity.participants || [];
        activity.participants.push(user.id);
        
        // 检查是否已满员，更新状态
        if (activity.participants.length >= activity.maxParticipants) {
          activity.status = 'full';
        }
        
        // 移除alert，直接显示成功状态
        setError(''); // 清除错误信息
      } else {
        setError(response.message || '报名失败');
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
      console.log('Leave activity response:', response); // 添加调试日志
      if (response.success) {
        setIsParticipating(false);
        // 从参与者列表中移除用户ID
        activity.participants = activity.participants.filter(id => id !== user.id);
        
        // 如果原来是满员状态，现在有空位了，改回招募中
        if (activity.status === 'full' && activity.participants.length < activity.maxParticipants) {
          activity.status = 'recruiting';
        }
        
        // 移除alert，直接显示成功状态
        setError(''); // 清除错误信息
      } else {
        setError(response.message || '取消报名失败');
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
      console.log('Cancel activity response:', response); // 添加调试日志
      if (response.success) {
        // 移除alert，直接返回
        onBack();
      } else {
        setError(response.message || '解散活动失败');
      }
    } catch (error) {
      console.error('解散活动失败：', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('确定要删除这条评论吗？')) return;

    try {
      const response = await sportsAPI.deleteComment(commentId);
      console.log('Delete comment response:', response);

      if (response.success) {
        loadComments(); // 重新加载评论列表
      } else {
        setError(response.message || '删除评论失败');
      }
    } catch (error) {
      console.error('删除评论失败：', error);
      setError('网络错误，请稍后重试');
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

      console.log('Comment response:', response); // 添加调试日志

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
    try {
      return new Date(dateString).toLocaleString('zh-CN');
    } catch (error) {
      console.error('Date formatting error:', error);
      return '时间格式错误';
    }
  };

  const isCreator = activity.publisherId === user.id;
  const canJoin = !isParticipating && 
    activity.status === 'recruiting' && 
    (activity.participants?.length || 0) < (activity.maxParticipants || 0);

  // 添加调试信息
  console.log('Activity detail state check:');
  console.log('- isParticipating:', isParticipating);
  console.log('- isCreator:', isCreator);
  console.log('- activity.status:', activity.status);
  console.log('- participants count:', activity.participants?.length || 0);
  console.log('- maxParticipants:', activity.maxParticipants);
  console.log('- canJoin:', canJoin);
  console.log('- user.id:', user.id);
  console.log('- activity.publisherId:', activity.publisherId);

  try {
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
              <h2>{activity.name}</h2>
              <span className="activity-type">{activity.type || '活动'}</span>
            </div>
            <div className="status-section">
              <span className={`status ${activity.status}`}>
                {activity.status === 'recruiting' ? '招募中' : 
                 activity.status === 'full' ? '已满员' :
                 activity.status === 'ongoing' ? '进行中' :
                 activity.status === 'completed' ? '已结束' :
                 activity.status === 'cancelled' ? '已取消' : activity.status}
              </span>
              <span className="participants-status">
                {activity.participants?.length || 0}/{activity.maxParticipants}人
                {(activity.participants?.length || 0) >= activity.maxParticipants ? ' (已满)' : ''}
              </span>
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
                <span>{activity.publisherName || '未知用户'}</span>
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
              {activity.participantDetails && activity.participantDetails.length > 0 ? (
                activity.participantDetails.map((participant, index) => {
                  // 如果是当前用户，显示当前用户名
                  const isCurrentUser = participant.id === user.id;
                  const displayName = isCurrentUser ? user.username : participant.username;
                  
                  return (
                    <div key={participant.id} className="participant-item">
                      <div className="participant-avatar">
                        <div className="avatar-placeholder">{displayName[0]}</div>
                      </div>
                      <span>{displayName}</span>
                    </div>
                  );
                })
              ) : activity.participants && activity.participants.length > 0 ? (
                // 如果没有participantDetails，回退到使用participants
                activity.participants.map((participantId, index) => {
                  const isCurrentUser = participantId === user.id;
                  const displayName = isCurrentUser ? user.username : `用户${index + 1}`;
                  
                  return (
                    <div key={participantId} className="participant-item">
                      <div className="participant-avatar">
                        <div className="avatar-placeholder">{displayName[0]}</div>
                      </div>
                      <span>{displayName}</span>
                    </div>
                  );
                })
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
                {activity.status === 'full' ? '人数已满' :
                 activity.status === 'ongoing' ? '活动进行中' :
                 activity.status === 'completed' ? '活动已结束' :
                 activity.status === 'cancelled' ? '活动已取消' : '无法报名'}
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
                        <div className="avatar-placeholder">{(comment.userName || '?')[0]}</div>
                      </div>
                      <span className="commenter-name">{comment.userName || '未知用户'}</span>
                    </div>
                    {comment.userId === user.id && (
                      <button 
                        className="delete-comment-btn"
                        onClick={() => handleDeleteComment(comment.id)}
                        title="删除评论"
                      >
                        删除
                      </button>
                    )}
                  </div>
                  <div className="comment-content">
                    {comment.content}
                    <div className="comment-time">{formatDate(comment.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('ActivityDetail render error:', error);
    return (
      <div className="activity-detail-container">
        <div className="detail-header">
          <button onClick={onBack} className="back-button">
            ← 返回
          </button>
          <h1>活动详情</h1>
        </div>
        <div className="error-message">页面渲染出错，请返回重试</div>
      </div>
    );
  }
};

export default ActivityDetail;
