import React, { useState } from 'react';
import { sportsAPI } from '../api/sports';
import './CreateActivity.css';

const CreateActivity = ({ user, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    location: '',
    startTime: '',
    endTime: '',
    maxParticipants: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 活动类型选项
  const activityTypes = [
    '篮球', '足球', '羽毛球', '乒乓球', '网球', '排球',
    '游泳', '跑步', '健身', '瑜伽', '舞蹈', '其他'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('只允许上传 JPG、PNG、GIF 格式的图片');
        return;
      }

      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('文件大小不能超过5MB');
        return;
      }

      setImage(file);
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('请输入活动名称');
      return false;
    }

    if (!formData.description.trim()) {
      setError('请输入活动描述');
      return false;
    }

    if (!formData.type) {
      setError('请选择活动类型');
      return false;
    }

    if (!formData.location.trim()) {
      setError('请输入活动地点');
      return false;
    }

    if (!formData.startTime) {
      setError('请选择开始时间');
      return false;
    }

    if (!formData.endTime) {
      setError('请选择结束时间');
      return false;
    }

    if (!formData.maxParticipants || formData.maxParticipants < 1) {
      setError('请输入有效的最大参与人数');
      return false;
    }

    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);

    if (startTime >= endTime) {
      setError('结束时间必须晚于开始时间');
      return false;
    }

    if (startTime < new Date()) {
      setError('开始时间不能早于当前时间');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      let imageUrl = '';
      
      // 如果有图片，先上传图片
      if (image) {
        const uploadResponse = await sportsAPI.uploadImage(image);
        if (uploadResponse.success) {
          imageUrl = uploadResponse.data.url;
        } else {
          setError('图片上传失败');
          setLoading(false);
          return;
        }
      }

      // 创建活动
      const activityData = {
        ...formData,
        maxParticipants: parseInt(formData.maxParticipants),
        image: imageUrl
      };

      const response = await sportsAPI.createActivity(activityData);

      if (response.success) {
        alert('活动发布成功！');
        onSuccess();
      } else {
        setError(response.message || '发布活动失败');
      }
    } catch (error) {
      console.error('发布活动失败：', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 获取今天的日期字符串，用于设置最小时间
  const today = new Date().toISOString().slice(0, 16);

  return (
    <div className="create-activity-container">
      <div className="create-header">
        <button onClick={onBack} className="back-button">
          ← 返回
        </button>
        <h1>发布活动</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="create-content">
        <form onSubmit={handleSubmit} className="activity-form">
          <div className="form-section">
            <h3>基本信息</h3>
            
            <div className="form-group">
              <label htmlFor="name">活动名称 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="输入活动名称"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">活动类型 *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="">请选择活动类型</option>
                {activityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">活动描述 *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="详细描述活动内容、要求、注意事项等"
                rows="4"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>时间地点</h3>
            
            <div className="form-group">
              <label htmlFor="location">活动地点 *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="输入具体地址或场所名称"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">开始时间 *</label>
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  min={today}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endTime">结束时间 *</label>
                <input
                  type="datetime-local"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  min={formData.startTime || today}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="maxParticipants">最大参与人数 *</label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                placeholder="输入数字"
                min="1"
                max="100"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>活动图片</h3>
            
            <div className="form-group">
              <label htmlFor="image">上传图片（可选）</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              <div className="file-hint">
                支持 JPG、PNG、GIF 格式，文件大小不超过5MB
              </div>
              {image && (
                <div className="image-preview">
                  <img src={URL.createObjectURL(image)} alt="预览" />
                  <button 
                    type="button" 
                    onClick={() => setImage(null)}
                    className="remove-image"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onBack} 
              className="cancel-btn"
              disabled={loading}
            >
              取消
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? '发布中...' : '发布活动'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActivity;
