import { useState, useEffect } from 'react'
import { apiService } from './api'
import './App.css'

function App() {
  // 状态管理
  const [users, setUsers] = useState([]) // 用户列表
  const [message, setMessage] = useState('') // 服务器消息
  const [loading, setLoading] = useState(false) // 加载状态
  const [postData, setPostData] = useState('') // POST数据输入
  const [serverStatus, setServerStatus] = useState(null) // 服务器状态

  // 测试GET请求 - /api/hello
  const testGetHello = async () => {
    setLoading(true)
    try {
      const result = await apiService.getHello({
        name: 'React前端',
        timestamp: new Date().toISOString()
      })
      setMessage(`✅ ${result.message} (服务器时间: ${result.timestamp})`)
    } catch (error) {
      setMessage(`❌ GET /api/hello 请求失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 测试POST请求 - /api/data
  const testPostData = async () => {
    if (!postData.trim()) {
      setMessage('❌ 请输入要发送的数据')
      return
    }

    setLoading(true)
    try {
      const result = await apiService.postData({
        message: postData,
        source: 'React前端',
        timestamp: new Date().toISOString()
      })
      setMessage(`✅ ${result.message} (数据大小: ${result.dataSize} 字节)`)
      setPostData('') // 清空输入
    } catch (error) {
      setMessage(`❌ POST /api/data 请求失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 获取用户列表 - /api/users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const result = await apiService.getUsers()
      setUsers(result.data)
      setMessage(`✅ 成功获取 ${result.total} 个用户`)
    } catch (error) {
      setMessage(`❌ 获取用户列表失败: ${error.message}`)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  // 测试获取特定用户 - /api/get_user
  const testGetUser = async () => {
    setLoading(true)
    try {
      const result = await apiService.getUser('123')
      setMessage(`✅ 获取用户信息成功: ${JSON.stringify(result.data)}`)
    } catch (error) {
      setMessage(`❌ 获取用户信息失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 获取服务器状态 - /api/status
  const fetchServerStatus = async () => {
    setLoading(true)
    try {
      const result = await apiService.getStatus()
      setServerStatus(result.data)
      setMessage(`✅ 服务器状态: ${result.data.status}`)
    } catch (error) {
      setMessage(`❌ 获取服务器状态失败: ${error.message}`)
      setServerStatus(null)
    } finally {
      setLoading(false)
    }
  }

  // 测试错误处理 - /api/error
  const testErrorHandling = async (errorType) => {
    setLoading(true)
    try {
      const result = await apiService.testError(errorType)
      if (result.success) {
        setMessage(`✅ 错误测试成功: ${result.message}`)
      } else {
        setMessage(`⚠️ 预期错误: ${result.message}`)
      }
    } catch (error) {
      setMessage(`❌ 错误测试: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 组件挂载时自动获取数据
  useEffect(() => {
    fetchUsers()
    fetchServerStatus()
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔗 前后端连通测试</h1>
      <p style={{ color: '#666' }}>
        前端: React + Vite (http://localhost:3000) ↔️ 后端: Midway (http://localhost:7001)
      </p>

      {/* 控制按钮区域 */}
      <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h2>🧪 API测试</h2>

        <div style={{ marginBottom: '15px' }}>
          <h3>GET 请求测试</h3>
          <button
            onClick={testGetHello}
            disabled={loading}
            style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            测试 GET /api/hello
          </button>

          <button
            onClick={testGetUser}
            disabled={loading}
            style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            测试 GET /api/get_user
          </button>

          <button
            onClick={fetchUsers}
            disabled={loading}
            style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            刷新用户列表
          </button>

          <button
            onClick={fetchServerStatus}
            disabled={loading}
            style={{ padding: '8px 16px', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            获取服务器状态
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h3>POST 请求测试</h3>
          <input
            type="text"
            value={postData}
            onChange={(e) => setPostData(e.target.value)}
            placeholder="输入要POST的数据..."
            style={{ marginRight: '10px', padding: '8px', width: '250px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button
            onClick={testPostData}
            disabled={loading || !postData.trim()}
            style={{ padding: '8px 16px', backgroundColor: '#F44336', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            测试 POST /api/data
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h3>错误处理测试</h3>
          <button
            onClick={() => testErrorHandling('server')}
            disabled={loading}
            style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#795548', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            测试服务器错误
          </button>

          <button
            onClick={() => testErrorHandling('validation')}
            disabled={loading}
            style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#607D8B', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            测试验证错误
          </button>

          <button
            onClick={() => testErrorHandling('')}
            disabled={loading}
            style={{ padding: '8px 16px', backgroundColor: '#009688', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            测试正常流程
          </button>
        </div>
      </div>

      {/* 状态显示区域 */}
      <div style={{ margin: '20px 0', padding: '15px', backgroundColor: loading ? '#fff3cd' : '#f5f5f5', borderRadius: '8px', border: `1px solid ${loading ? '#ffeaa7' : '#ddd'}` }}>
        <h3>📡 连接状态</h3>
        {loading && <p style={{ color: '#856404' }}>🔄 请求处理中...</p>}
        {message && (
          <p style={{
            color: message.includes('✅') ? 'green' : message.includes('❌') ? 'red' : '#ff9800',
            fontWeight: 'bold',
            margin: '10px 0'
          }}>
            {message}
          </p>
        )}
      </div>

      {/* 服务器状态显示 */}
      {serverStatus && (
        <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px', border: '1px solid #4CAF50' }}>
          <h3>🖥️ 服务器状态</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div><strong>状态:</strong> {serverStatus.status}</div>
            <div><strong>运行时间:</strong> {Math.round(serverStatus.uptime)}秒</div>
            <div><strong>平台:</strong> {serverStatus.platform}</div>
            <div><strong>Node版本:</strong> {serverStatus.nodeVersion}</div>
            <div><strong>内存使用:</strong> {Math.round(serverStatus.memory.used / 1024 / 1024)}MB</div>
          </div>
        </div>
      )}

      {/* 用户列表显示区域 */}
      <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fafafa' }}>
        <h2>👥 用户列表 ({users.length})</h2>
        {users.length > 0 ? (
          <div style={{ display: 'grid', gap: '10px' }}>
            {users.map(user => (
              <div
                key={user.id}
                style={{
                  padding: '15px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '8px',
                  border: '1px solid #2196F3'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '16px' }}>{user.name}</strong>
                    <span style={{ marginLeft: '10px', padding: '2px 8px', backgroundColor: user.role === 'admin' ? '#ff5722' : '#4CAF50', color: 'white', borderRadius: '12px', fontSize: '12px' }}>
                      {user.role}
                    </span>
                  </div>
                  <small style={{ color: '#666' }}>创建于: {user.createdAt}</small>
                </div>
                <div style={{ marginTop: '5px', color: '#666' }}>
                  📧 {user.email}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>暂无用户数据</p>
        )}
      </div>

      {/* 技术说明 */}
      <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#fffbe6', borderRadius: '8px', border: '1px solid #ffc107' }}>
        <h3>🔧 技术实现说明</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>代理配置</strong>: Vite将 /api/* 请求代理到 localhost:7001</li>
          <li><strong>CORS配置</strong>: 后端允许 localhost:3000 跨域访问</li>
          <li><strong>请求拦截</strong>: axios自动添加日志和错误处理</li>
          <li><strong>状态管理</strong>: React hooks管理加载和数据状态</li>
          <li><strong>错误处理</strong>: 统一的错误处理和用户提示</li>
          <li><strong>实时状态</strong>: 显示服务器运行状态和性能信息</li>
        </ul>
      </div>
    </div>
  )
}

export default App