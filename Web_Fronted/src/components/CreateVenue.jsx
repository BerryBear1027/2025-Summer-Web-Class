import React, { useState, useEffect } from 'react';
import { sportsAPI } from '../api/sports';
import './CreateVenue.css';

const CreateVenue = ({ user, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    location: '',
    capacity: '',
    price: '',
    sportType: '',
    availableHours: []
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 场馆类型选项
  const venueTypes = [
    '室内场馆', '室外场地', '游泳池', '健身房', '舞蹈室', '瑜伽室', '其他'
  ];

  // 运动类型选项
  const sportTypes = [
    '篮球', '足球', '羽毛球', '乒乓球', '网球', '排球',
    '游泳', '健身', '瑜伽', '舞蹈', '跑步', '其他'
  ];

  // 24小时时间段选项
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const startHour = i.toString().padStart(2, '0');
    const endHour = ((i + 1) % 24).toString().padStart(2, '0');
    return {
      value: `${startHour}:00`,
      label: `${startHour}:00-${endHour}:00`
    };
  });

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

  const handleTimeSelection = (timeSlot) => {
    // 检查是否为已过去的时间段
    const currentHour = new Date().getHours();
    const slotHour = parseInt(timeSlot.value.split(':')[0]);
    
    if (slotHour <= currentHour) {
      setError('不能选择已过去的时间段');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      availableHours: prev.availableHours.includes(timeSlot.value)
        ? prev.availableHours.filter(h => h !== timeSlot.value)
        : [...prev.availableHours, timeSlot.value].sort()
    }));
    
    // 清除错误信息
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('请输入场馆名称');
      return false;
    }

    if (!formData.description.trim()) {
      setError('请输入场馆描述');
      return false;
    }

    if (!formData.type) {
      setError('请选择场馆类型');
      return false;
    }

    if (!formData.location.trim()) {
      setError('请输入场馆地址');
      return false;
    }

    if (!formData.capacity || formData.capacity < 1) {
      setError('请输入有效的容量');
      return false;
    }

    if (!formData.price || formData.price < 0) {
      setError('请输入有效的价格');
      return false;
    }

    if (!formData.sportType) {
      setError('请选择运动类型');
      return false;
    }

    if (!formData.availableHours || formData.availableHours.length === 0) {
      setError('请选择至少一个可用时间段');
      return false;
    }

    // 检查是否为当天发布
    const today = new Date();
    const currentHour = today.getHours();
    
    // 过滤掉已经过去的时间段
    const validTimeSlots = formData.availableHours.filter(hour => {
      const hourValue = parseInt(hour.split(':')[0]);
      return hourValue > currentHour;
    });

    if (validTimeSlots.length === 0) {
      setError('所选时间段已过去，请选择当前时间之后的时间段');
      return false;
    }

    // 更新formData中的可用时间为有效时间段
    setFormData(prev => ({
      ...prev,
      availableHours: validTimeSlots
    }));

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

      // 创建场馆
      const venueData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price),
        availableHours: formData.availableHours,
        image: imageUrl
      };

      const response = await sportsAPI.createVenue(venueData);

      if (response.success) {
        alert('场馆发布成功！');
        onSuccess();
      } else {
        setError(response.message || '发布场馆失败');
      }
    } catch (error) {
      console.error('发布场馆失败：', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时清除已过去的时间段
  useEffect(() => {
    const currentHour = new Date().getHours();
    const validHours = formData.availableHours.filter(hour => {
      const hourValue = parseInt(hour.split(':')[0]);
      return hourValue > currentHour;
    });
    
    if (validHours.length !== formData.availableHours.length) {
      setFormData(prev => ({
        ...prev,
        availableHours: validHours
      }));
    }
  }, []);

  return (
    <div className="create-venue-container">
      <div className="create-header">
        <button onClick={onBack} className="back-button">
          ← 返回
        </button>
        <h1>发布场馆</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="create-content">
        <form onSubmit={handleSubmit} className="venue-form">
          <div className="form-section">
            <h3>基本信息</h3>
            
            <div className="form-group">
              <label htmlFor="name">场馆名称 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="输入场馆名称"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">场馆类型 *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">请选择场馆类型</option>
                  {venueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="sportType">运动类型 *</label>
                <select
                  id="sportType"
                  name="sportType"
                  value={formData.sportType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">请选择运动类型</option>
                  {sportTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">场馆描述 *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="详细描述场馆设施、服务、环境等"
                rows="4"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>地址信息</h3>
            
            <div className="form-group">
              <label htmlFor="location">场馆地址 *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="输入详细地址"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>规格与价格</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="capacity">容量（人数）*</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="输入数字"
                  min="1"
                  max="1000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">价格（元/小时）*</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="输入价格"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>可用时间段 *</label>
              <div className="time-restriction-notice">
                <strong>注意：只可发布当天场馆！</strong>
                <p>已过去的时间段将被自动禁用，请选择当前时间之后的时间段。</p>
              </div>
              <div className="time-selection-grid">
                {timeOptions.map(timeSlot => {
                  const currentHour = new Date().getHours();
                  const slotHour = parseInt(timeSlot.value.split(':')[0]);
                  const isPastTime = slotHour <= currentHour;
                  
                  return (
                    <label 
                      key={timeSlot.value} 
                      className={`time-option ${isPastTime ? 'disabled' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.availableHours.includes(timeSlot.value)}
                        onChange={() => handleTimeSelection(timeSlot)}
                        disabled={isPastTime}
                      />
                      <span className="time-label">
                        {timeSlot.label}
                        {isPastTime && <small> (已过去)</small>}
                      </span>
                    </label>
                  );
                })}
              </div>
              {formData.availableHours.length > 0 && (
                <div className="selected-times">
                  已选择: {formData.availableHours.map(hour => {
                    const slot = timeOptions.find(t => t.value === hour);
                    return slot ? slot.label : hour;
                  }).join(', ')}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>场馆图片</h3>
            
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
              {loading ? '发布中...' : '发布场馆'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVenue;
