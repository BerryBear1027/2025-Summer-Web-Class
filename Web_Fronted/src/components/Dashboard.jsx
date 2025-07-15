import React, { useState, useEffect } from 'react';
import { sportsAPI } from '../api/sports';
import './Dashboard.css';

const Dashboard = ({ user, onNavigate, onLogout, refreshTrigger }) => {
  const [activities, setActivities] = useState([]);
  const [venues, setVenues] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeTab, setActiveTab] = useState('activities'); // 'activities' or 'venues'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]); // 当refreshTrigger变化时重新加载数据

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [activitiesRes, venuesRes] = await Promise.all([
        sportsAPI.getAllActivities(),
        sportsAPI.getAllVenues()
      ]);

      console.log('Activities response:', activitiesRes);
      console.log('Venues response:', venuesRes);

      if (activitiesRes.success) {
        setActivities(activitiesRes.data || []);
      } else {
        console.log('Activities request failed:', activitiesRes);
      }
      if (venuesRes.success) {
        setVenues(venuesRes.data || []);
      } else {
        console.log('Venues request failed:', venuesRes);
      }
    } catch (error) {
      console.error('加载数据失败：', error);
      setError('加载数据失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      loadData();
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'activities') {
        const res = await sportsAPI.searchActivities(searchKeyword);
        if (res.success) {
          setActivities(res.data || []);
        }
      } else {
        const res = await sportsAPI.searchVenues(searchKeyword);
        if (res.success) {
          setVenues(res.data || []);
        }
      }
    } catch (error) {
      console.error('搜索失败：', error);
      setError('搜索失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchKeyword('');
    loadData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="github-layout">
      {/* GitHub风格的顶部导航栏 */}
      <header className="github-header">
        <div className="header-content">
          <div className="header-left">            <button
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              ≡
            </button>
            <h1 className="site-title">体育活动室</h1>
          </div>
          
          <div className="header-center">
            <div className="search-container">
              <input
                type="text"
                placeholder={`搜索${activeTab === 'activities' ? '活动' : '场馆'}...`}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="header-search"
              />
              <button onClick={handleSearch} className="search-button">
                搜索
              </button>
            </div>
          </div>

          <div className="header-right">
            <div className="create-dropdown">
              <button 
                onClick={() => setShowCreateMenu(!showCreateMenu)} 
                className="create-button"
                title="发布内容"
              >
                <span className="plus-icon">+</span>
                <span className="create-text">发布</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              {showCreateMenu && (
                <div className="create-menu">
                  <button 
                    onClick={() => {
                      setShowCreateMenu(false);
                      onNavigate('create-activity');
                    }} 
                    className="menu-item"
                  >
                    发布活动
                  </button>
                  <button 
                    onClick={() => {
                      setShowCreateMenu(false);
                      onNavigate('create-venue');
                    }} 
                    className="menu-item"
                  >
                    发布场馆
                  </button>
                </div>
              )}
            </div>
            <div className="user-menu">
              <div className="user-avatar" onClick={() => onNavigate('profile')}>
                <div className="avatar-placeholder">{user.username[0]}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="github-body">
        {/* GitHub风格的左侧边栏 */}
        <aside className={`github-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-content">
            {/* 用户信息区域 */}
            <div className="user-section">
              <div className="user-profile" onClick={() => onNavigate('profile')}>
                <div className="user-avatar-large">
                  <div className="avatar-placeholder-large">{user.username[0]}</div>
                </div>
                {!sidebarCollapsed && (
                  <div className="user-info">
                    <h3>{user.username}</h3>
                    <p>@{user.username}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 导航菜单 */}
            <nav className="sidebar-nav">
              <div className="nav-section">
                <h4 className={`nav-title ${sidebarCollapsed ? 'hidden' : ''}`}>个人</h4>
                <ul className="nav-list">
                  <li className="nav-item">
                    <button 
                      onClick={() => onNavigate('history')}
                      className="nav-link"
                      title="历史记录"
                    >
                      <span className="nav-icon">历史</span>
                      {!sidebarCollapsed && <span>历史记录</span>}
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      onClick={() => onNavigate('profile')}
                      className="nav-link"
                      title="个人资料"
                    >
                      <span className="nav-icon">设置</span>
                      {!sidebarCollapsed && <span>个人资料</span>}
                    </button>
                  </li>
                </ul>
              </div>

              {!sidebarCollapsed && (
                <div className="nav-section">
                  <button onClick={onLogout} className="logout-button">
                    退出登录
                  </button>
                </div>
              )}
            </nav>
          </div>
        </aside>

        {/* 主内容区域 */}
        <main className="github-main">
          <div className="main-header">
            <div className="tab-navigation">
              <div className="tab-container">
                <button 
                  className={`tab-button ${activeTab === 'activities' ? 'active' : ''}`}
                  onClick={() => setActiveTab('activities')}
                >
                  <span className="tab-icon">🏃</span>
                  活动 ({activities.length})
                </button>
                <button 
                  className={`tab-button ${activeTab === 'venues' ? 'active' : ''}`}
                  onClick={() => setActiveTab('venues')}
                >
                  <span className="tab-icon">🏟️</span>
                  场馆 ({venues.length})
                </button>
              </div>
              
              <div className="view-options">
                <button 
                  onClick={() => onNavigate(activeTab === 'activities' ? 'create-activity' : 'create-venue')}
                  className="new-button"
                >
                  <span className="plus-icon">+</span>
                  新建{activeTab === 'activities' ? '活动' : '场馆'}
                </button>
              </div>
            </div>
          </div>

          {/* 错误提示 */}
          {error && <div className="error-alert">{error}</div>}

          {/* 内容列表 */}
          <div className="content-list">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>加载中...</p>
              </div>
            ) : activeTab === 'activities' ? (
              <div className="activities-list">
                {activities.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🏃</div>
                    <h3>暂无活动</h3>
                    <p>创建你的第一个活动吧！</p>
                    <button 
                      onClick={() => onNavigate('create-activity')}
                      className="create-first-button"
                    >
                      创建活动
                    </button>
                  </div>
                ) : (
                  activities.map((activity) => {
                    const displayStatus = activity.dynamicStatus || activity.status;
                    const isExpired = displayStatus === 'expired';
                    const isDeleted = activity.status === 'deleted';
                    const isCancelled = activity.status === 'cancelled';
                    const isNonInteractive = isExpired || isDeleted || isCancelled;
                    
                    return (
                      <div key={activity.id} className={`item-card activity-card ${isExpired ? 'expired-card' : ''} ${isDeleted ? 'deleted-card' : ''} ${isCancelled ? 'cancelled-card' : ''}`} onClick={() => {
                        if (!isNonInteractive) {
                          console.log('Clicking activity:', activity);
                          onNavigate('activity-detail', activity);
                        }
                      }}>
                        <div className="card-content">
                          <div className="item-header">
                            <div className="item-title">
                              <h3 style={{ cursor: isNonInteractive ? 'not-allowed' : 'pointer' }}>{activity.name}</h3>
                              <span className="item-type">{activity.type || '活动'}</span>
                            </div>
                          <div className="item-meta">
                            <span className={`status-badge status-${displayStatus}`}>
                              {displayStatus === 'recruiting' ? '招募中' : 
                               displayStatus === 'full' ? '已满员' :
                               displayStatus === 'ongoing' ? '进行中' :
                               displayStatus === 'completed' ? '已结束' :
                               displayStatus === 'cancelled' ? '已解散' :
                               displayStatus === 'deleted' ? '已删除' :
                               displayStatus === 'expired' ? '已过期' : displayStatus}
                            </span>
                            {!isDeleted && !isCancelled && (
                              <span className="participants-count">
                                {activity.participants?.length || 0}/{activity.maxParticipants}人
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="item-description">
                          {activity.description}
                        </div>
                        
                        <div className="item-details">
                          <div className="detail-item">
                            <span className="detail-icon">📍</span>
                            <span>{activity.location}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">⏰</span>
                            <span>{formatDate(activity.startTime)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">👥</span>
                            <span>{activity.participants?.length || 0}/{activity.maxParticipants}</span>
                          </div>
                        </div>
                        
                        <div className="item-footer">
                          <div className="creator-info">
                            <div className="creator-avatar">
                              <div className="avatar-placeholder-sm">{(activity.publisherName || '?')[0]}</div>
                            </div>
                            <span>{activity.publisherName || '未知用户'}</span>
                          </div>
                          <div className="publish-time">
                            {formatDate(activity.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="venues-list">
                {venues.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🏟️</div>
                    <h3>暂无场馆</h3>
                    <p>创建你的第一个场馆吧！</p>
                    <button 
                      onClick={() => onNavigate('create-venue')}
                      className="create-first-button"
                    >
                      创建场馆
                    </button>
                  </div>
                ) : (
                  venues.map((venue) => {
                    const displayStatus = venue.dynamicStatus || venue.status;
                    const isExpired = displayStatus === 'expired';
                    const isFullyBooked = displayStatus === 'fully_booked';
                    const isDeleted = venue.status === 'deleted';
                    const isClosed = venue.status === 'closed';
                    const isNonInteractive = isExpired || isDeleted || isClosed;
                    
                    return (
                      <div key={venue.id} className={`item-card venue-card ${isExpired ? 'expired-card' : ''} ${isFullyBooked ? 'fully-booked-card' : ''} ${isDeleted ? 'deleted-card' : ''} ${isClosed ? 'closed-card' : ''}`} onClick={() => {
                        if (!isNonInteractive) {
                          onNavigate('venue-detail', venue);
                        }
                      }}>
                        <div className="card-content">
                          <div className="item-header">
                            <div className="item-title">
                              <h3 style={{ cursor: isNonInteractive ? 'not-allowed' : 'pointer' }}>{venue.name}</h3>
                              <span className="item-type">{venue.type}</span>
                            </div>
                            <div className="item-meta">
                              <span className={`status-badge status-${displayStatus}`}>
                                {displayStatus === 'available' ? '可用' :
                                 displayStatus === 'maintenance' ? '维护中' :
                                 displayStatus === 'closed' ? '已关闭' :
                                 displayStatus === 'deleted' ? '已删除' :
                                 displayStatus === 'expired' ? '已过期' :
                                 displayStatus === 'fully_booked' ? '已满约' : displayStatus}
                              </span>
                              {!isDeleted && !isClosed && (
                                <span className={`remaining-slots ${(venue.remainingSlots || 0) === 0 ? 'no-slots' : ''}`}>
                                  剩余{venue.remainingSlots || 0}个时间段
                                </span>
                              )}
                            </div>
                          </div>
                        
                        <div className="item-description">
                          {venue.description}
                        </div>
                        
                        <div className="item-details">
                          <div className="detail-item">
                            <span className="detail-icon">📍</span>
                            <span>{venue.location}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">🏃</span>
                            <span>{venue.sportType}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">👥</span>
                            <span>容量{venue.capacity || 0}人</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">⏰</span>
                            <span>{venue.availableHours ? 
                              venue.availableHours.map(hour => {
                                const startHour = hour.split(':')[0];
                                const endHour = (parseInt(startHour) + 1).toString().padStart(2, '0');
                                return `${hour}-${endHour}:00`;
                              }).slice(0, 3).join(', ') + (venue.availableHours.length > 3 ? '...' : '')
                              : '时间待定'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">💰</span>
                            <span>{venue.price ? `¥${venue.price}/小时` : '价格面议'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">📊</span>
                            <span className={`status-text status-${venue.status}`}>
                              {venue.status === 'available' ? '可用' :
                               venue.status === 'maintenance' ? '维护中' :
                               venue.status === 'closed' ? '关闭' : venue.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="item-footer">
                          <div className="creator-info">
                            <div className="creator-avatar">
                              <div className="avatar-placeholder-sm">{(venue.publisherName || '?')[0]}</div>
                            </div>
                            <span>{venue.publisherName || '未知用户'}</span>
                          </div>
                          <div className="publish-time">
                            {formatDate(venue.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
