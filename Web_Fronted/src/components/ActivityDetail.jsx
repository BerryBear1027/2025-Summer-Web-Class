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
  const [activityData, setActivityData] = useState(activity);

  useEffect(() => {
    loadActivityDetails();
    loadComments();
  }, [activity.id]);

  useEffect(() => {
    checkParticipation();
  }, [activityData]);

  const loadActivityDetails = async () => {
    try {
      console.log('开始加载活动详情，ID:', activity.id);
      const response = await sportsAPI.getActivityById(activity.id);
      console.log('Load activity details response:', response);
      // 检查响应结构
      const success = response.success;
      const data = response.data;

      if (success && data) {
        console.log('Activity details data:', data);
        console.log('参与者详情:', data.participantDetails);
        console.log('参与者ID列表:', data.participants);
        setActivityData(data);
      } else {
        console.warn('获取活动详情失败，使用传入数据');
        console.log('传入的活动数据:', activity);
        setActivityData(activity);
      }
    } catch (error) {
      console.error('加载活动详情失败：', error);
      // 如果获取失败，使用传入的活动数据
      setActivityData(activity);
    }
  };

  const loadComments = async () => {
    try {
      const response = await sportsAPI.getComments(activityData.id, 'activity');
      console.log('Load comments response:', response); // 添加调试日志
      // 检查响应结构
      const success = response.success;
      const data = response.data;

      if (success) {
        setComments(data || []);
      }
    } catch (error) {
      console.error('加载评论失败：', error);
    }
  };

  const checkParticipation = () => {
    // 根据后端实体定义，participants是string[]数组，存储的是用户ID
    const participating = activityData.participants &&
      activityData.participants.includes(user.id);
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
        const updatedActivity = { ...activityData };
        updatedActivity.participants = updatedActivity.participants || [];
        updatedActivity.participants.push(user.id);

        // 检查是否已满员，更新状态
        if (updatedActivity.participants.length >= updatedActivity.maxParticipants) {
          updatedActivity.status = 'full';
        }

        setActivityData(updatedActivity);
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
        const updatedActivity = { ...activityData };
        updatedActivity.participants = updatedActivity.participants.filter(id => id !== user.id);

        // 如果原来是满员状态，现在有空位了，改回招募中
        if (updatedActivity.status === 'full' && updatedActivity.participants.length < updatedActivity.maxParticipants) {
          updatedActivity.status = 'recruiting';
        }

        setActivityData(updatedActivity);

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

  const isCreator = activityData.publisherId === user.id;
  const canJoin = !isParticipating &&
    activityData.status === 'recruiting' &&
    (activityData.participants?.length || 0) < (activityData.maxParticipants || 0);

  // 添加调试信息
  console.log('Activity detail state check:');
  console.log('- isParticipating:', isParticipating);
  console.log('- isCreator:', isCreator);
  console.log('- activityData.status:', activityData.status);
  console.log('- participants count:', activityData.participants?.length || 0);
  console.log('- maxParticipants:', activityData.maxParticipants);
  console.log('- canJoin:', canJoin);
  console.log('- user.id:', user.id);
  console.log('- activityData.publisherId:', activityData.publisherId);

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
                <h2>{activityData.name}</h2>
                <span className="activity-type">{activityData.type || '活动'}</span>
              </div>
              <div className="status-section">
                <span className={`status ${activityData.status}`}>
                  {activityData.status === 'recruiting' ? '招募中' :
                    activityData.status === 'full' ? '已满员' :
                      activityData.status === 'ongoing' ? '进行中' :
                        activityData.status === 'completed' ? '已结束' :
                          activityData.status === 'cancelled' ? '已取消' : activityData.status}
                </span>
                <span className="participants-status">
                  {activityData.participants?.length || 0}/{activityData.maxParticipants}人
                  {(activityData.participants?.length || 0) >= activityData.maxParticipants ? ' (已满)' : ''}
                </span>
              </div>
            </div>

            <div className="activity-info">
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">开始时间：</span>
                  <span>{formatDate(activityData.startTime)}</span>
                </div>
                <div className="info-item">
                  <span className="label">结束时间：</span>
                  <span>{formatDate(activityData.endTime)}</span>
                </div>
                <div className="info-item">
                  <span className="label">活动地点：</span>
                  <span>{activityData.location}</span>
                </div>
                <div className="info-item">
                  <span className="label">参与人数：</span>
                  <span>{activityData.participants?.length || 0}/{activityData.maxParticipants}</span>
                </div>
                <div className="info-item">
                  <span className="label">发布者：</span>
                  <span>{activityData.publisherName || '未知用户'}</span>
                </div>
                <div className="info-item">
                  <span className="label">发布时间：</span>
                  <span>{formatDate(activityData.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="description-section">
              <h3>活动描述</h3>
              <p>{activityData.description}</p>
            </div>

            <div className="participants-section">
              <h3>参与者 ({activityData.participants?.length || 0})</h3>
              <div className="participants-list">
                {(() => {
                  console.log('渲染参与者列表，activityData:', activityData);
                  console.log('participantDetails:', activityData.participantDetails);
                  console.log('participants:', activityData.participants);

                  if (activityData.participantDetails && activityData.participantDetails.length > 0) {
                    return activityData.participantDetails.map((participant, index) => {
                      // 如果是当前用户，显示当前用户名
                      const isCurrentUser = participant.id === user.id;
                      const displayName = isCurrentUser ? user.username : participant.username;

                      console.log(`参与者 ${index}:`, participant, '显示名称:', displayName);

                      return (
                        <div key={participant.id} className="participant-item">
                          <div className="participant-avatar">
                            <div className="avatar-placeholder">{displayName[0]}</div>
                          </div>
                          <span>{displayName}</span>
                        </div>
                      );
                    });
                  } else if (activityData.participants && activityData.participants.length > 0) {
                    console.log('使用回退逻辑显示参与者');
                    // 如果没有participantDetails，回退到使用participants
                    return activityData.participants.map((participantId, index) => {
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
                    });
                  } else {
                    return <div className="empty-participants">暂无参与者</div>;
                  }
                })()}
              </div>
            </div>

            <div className="action-section">
              {canJoin ? (
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

              {isCreator && (
                <button
                  onClick={handleCancelActivity}
                  className="action-btn danger"
                  disabled={loading}
                  style={{ marginTop: '10px' }}
                >
                  {loading ? '处理中...' : '解散活动'}
                </button>
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
