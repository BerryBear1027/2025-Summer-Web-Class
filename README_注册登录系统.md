# Web项目 - 注册/登录系统实现说明

## 项目概述

这是一个完整的Web项目，包含前端（Vite+React）和后端（Midway），实现了用户注册、登录、头像上传等完整功能。

## 功能特性

### ✅ 已实现功能

1. **用户注册**
   - 用户名（必填，3-20字符）
   - 邮箱（可选，格式验证）
   - 手机号（可选，中国手机号格式验证）
   - 密码（必填，最少6位）
   - 密码确认
   - 实时表单验证
   - 防重复注册检查

2. **用户登录**
   - 用户名登录
   - 密码验证
   - JWT令牌认证
   - 自动登录状态保持

3. **用户信息管理**
   - 查看个人信息
   - 头像上传（支持JPG、PNG、GIF，最大5MB）
   - 头像预览
   - 退出登录

4. **安全特性**
   - 密码bcrypt加密存储
   - JWT令牌认证
   - 跨域CORS配置
   - 文件上传类型和大小限制

## 技术栈

### 后端 (Midway)
- **框架**: Midway.js + Koa
- **语言**: TypeScript
- **认证**: JWT + bcryptjs
- **文件上传**: multer
- **跨域**: @midwayjs/cross-domain

### 前端 (React)
- **框架**: React 18 + Vite
- **语言**: JavaScript/JSX
- **HTTP客户端**: Axios
- **样式**: CSS3 (渐变背景，响应式设计)

## 项目结构

```
Web_Backend/                    # 后端项目
├── src/
│   ├── controller/
│   │   ├── auth.controller.ts  # 认证控制器
│   │   ├── api.controller.ts   # API控制器
│   │   └── home.controller.ts  # 首页控制器
│   ├── service/
│   │   └── user.service.ts     # 用户服务
│   ├── entity/
│   │   └── user.entity.ts      # 用户实体
│   ├── config/
│   │   └── config.default.ts   # 配置文件
│   └── configuration.ts        # 应用配置
├── uploads/avatars/            # 头像上传目录
└── package.json

Web_Fronted/                    # 前端项目
├── src/
│   ├── components/
│   │   ├── Register.jsx        # 注册组件
│   │   ├── Login.jsx          # 登录组件
│   │   ├── UserProfile.jsx    # 用户信息组件
│   │   └── Auth.css           # 认证样式
│   ├── api/
│   │   ├── index.js           # API基础配置
│   │   └── auth.js            # 认证API
│   ├── App.jsx                # 主应用组件
│   └── App.css
└── package.json
```

## API接口

### 认证相关 (/api/auth)

| 方法 | 路径 | 功能 | 参数 |
|------|------|------|------|
| POST | /register | 用户注册 | username, email?, phone?, password |
| POST | /login | 用户登录 | username, password |
| GET | /profile | 获取用户信息 | Authorization: Bearer token |
| POST | /upload-avatar | 上传头像 | file, Authorization: Bearer token |
| POST | /logout | 用户登出 | - |
| GET | /users | 获取所有用户(调试) | - |

## 启动说明

### 1. 启动后端
```bash
cd Web_Backend
npm install
npm run dev
```
后端将在 http://localhost:7001 启动

### 2. 启动前端
```bash
cd Web_Fronted
npm install
npm run dev
```
前端将在 http://localhost:3000 启动

### 3. 访问应用
打开浏览器访问 http://localhost:3000

## 使用流程

1. **注册新用户**
   - 填写用户名、邮箱（可选）、手机号（可选）、密码
   - 点击注册按钮
   - 注册成功后自动跳转到登录页面

2. **用户登录**
   - 输入注册时的用户名和密码
   - 点击登录按钮
   - 登录成功后进入用户信息页面

3. **管理个人信息**
   - 查看个人信息（用户名、邮箱、手机号、注册时间）
   - 点击头像区域上传头像
   - 点击退出登录返回登录页面

## 数据存储

当前使用内存存储用户数据（Map结构），重启服务器后数据会丢失。

**生产环境建议**：
- 集成数据库（MySQL、PostgreSQL、MongoDB等）
- 使用Redis存储Session
- 实现数据持久化

## 安全考虑

1. **密码安全**: 使用bcryptjs加密，不明文存储
2. **认证安全**: JWT令牌有效期24小时
3. **文件安全**: 限制上传文件类型和大小
4. **跨域安全**: 配置CORS允许的域名
5. **输入验证**: 前后端双重验证

## 样式特色

- **现代UI设计**: 渐变背景，圆角卡片，阴影效果
- **响应式布局**: 适配手机、平板、桌面端
- **交互反馈**: 按钮悬停效果，加载状态提示
- **用户体验**: 表单验证，错误提示，成功反馈

## 扩展建议

1. **功能扩展**
   - 邮箱验证
   - 手机验证码
   - 密码重置
   - 用户权限管理
   - 个人资料编辑

2. **技术优化**
   - 数据库集成
   - Redis缓存
   - 图片压缩
   - CDN部署
   - Docker容器化

3. **安全增强**
   - 防暴力破解
   - IP限制
   - 图片验证码
   - 双因子认证

## 问题排查

### 常见问题

1. **跨域问题**: 检查后端CORS配置和前端代理设置
2. **文件上传失败**: 检查文件大小和格式限制
3. **登录状态丢失**: 检查JWT令牌有效期和存储
4. **样式异常**: 确保CSS文件正确导入

### 调试技巧

1. 查看浏览器控制台错误信息
2. 检查Network标签页的API请求响应
3. 查看后端服务器日志输出
4. 使用后端 /api/auth/users 接口查看用户数据

---

**开发完成时间**: 2025年7月10日  
**技术支持**: 如有问题请查看控制台日志或检查API响应
