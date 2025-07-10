import React, { useState, useEffect } from 'react';
import { sportsAPI } from '../api/sports';
import './Dashboard.css';

const Dashboard = ({ user, onNavigate, onLogout }) => {
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
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [activitiesRes, venuesRes] = await Promise.all([
        sportsAPI.getAllActivities(),
        sportsAPI.getAllVenues()
      ]);

      if (activitiesRes.data.success) {
        setActivities(activitiesRes.data.data || []);
      }
      if (venuesRes.data.success) {
        setVenues(venuesRes.data.data || []);
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
        if (res.data.success) {
          setActivities(res.data.data || []);
        }
      } else {
        const res = await sportsAPI.searchVenues(searchKeyword);
        if (res.data.success) {
          setVenues(res.data.data || []);
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
                {user.avatar ? (
                  <img src={`http://localhost:7001${user.avatar}`} alt="头像" />
                ) : (
                  <div className="avatar-placeholder">{user.username[0]}</div>
                )}
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
                  {user.avatar ? (
                    <img src={`http://localhost:7001${user.avatar}`} alt="头像" />
                  ) : (
                    <div className="avatar-placeholder-large">{user.username[0]}</div>
                  )}
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
                <h4 className={`nav-title ${sidebarCollapsed ? 'hidden' : ''}`}>内容</h4>
                <ul className="nav-list">
                  <li className={`nav-item ${activeTab === 'activities' ? 'active' : ''}`}>
                    <button 
                      onClick={() => setActiveTab('activities')}
                      className="nav-link"
                      title="活动"
                    >
                      <span className="nav-icon">活动</span>
                      {!sidebarCollapsed && <span>活动列表</span>}
                    </button>
                  </li>
                  <li className={`nav-item ${activeTab === 'venues' ? 'active' : ''}`}>
                    <button 
                      onClick={() => setActiveTab('venues')}
                      className="nav-link"
                      title="场馆"
                    >
                      <span className="nav-icon">场馆</span>
                      {!sidebarCollapsed && <span>场馆列表</span>}
                    </button>
                  </li>
                </ul>
              </div>

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
                  activities.map((activity) => (
                    <div key={activity.id} className="item-card activity-card" onClick={() => onNavigate('activity-detail', activity)}>
                      <div className="card-content">
                        <div className="item-header">
                          <div className="item-title">
                            <h3>{activity.title}</h3>
                            <span className="item-type">{activity.type}</span>
                          </div>
                          <div className="item-meta">
                            <span className={`status-badge status-${activity.status}`}>
                              {activity.status}
                            </span>
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
                              {activity.creatorAvatar ? (
                                <img src={`http://localhost:7001${activity.creatorAvatar}`} alt="" />
                              ) : (
                                <div className="avatar-placeholder-sm">{activity.creatorName[0]}</div>
                              )}
                            </div>
                            <span>{activity.creatorName}</span>
                          </div>
                          <div className="publish-time">
                            {formatDate(activity.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
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
                  venues.map((venue) => (
                    <div key={venue.id} className="item-card venue-card" onClick={() => onNavigate('venue-detail', venue)}>
                      <div className="card-content">
                        <div className="item-header">
                          <div className="item-title">
                            <h3>{venue.name}</h3>
                            <span className="item-type">{venue.type}</span>
                          </div>
                          <div className="item-meta">
                            <span className={`status-badge status-${venue.status}`}>
                              {venue.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="item-description">
                          {venue.description}
                        </div>
                        
                        <div className="item-details">
                          <div className="detail-item">
                            <span className="detail-icon">📍</span>
                            <span>{venue.address}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">🏃</span>
                            <span>{venue.sportType}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">👥</span>
                            <span>{venue.capacity}人</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">💰</span>
                            <span>¥{venue.price}/小时</span>
                          </div>
                        </div>
                        
                        <div className="item-footer">
                          <div className="creator-info">
                            <div className="creator-avatar">
                              {venue.creatorAvatar ? (
                                <img src={`http://localhost:7001${venue.creatorAvatar}`} alt="" />
                              ) : (
                                <div className="avatar-placeholder-sm">{venue.creatorName[0]}</div>
                              )}
                            </div>
                            <span>{venue.creatorName}</span>
                          </div>
                          <div className="publish-time">
                            {formatDate(venue.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
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
