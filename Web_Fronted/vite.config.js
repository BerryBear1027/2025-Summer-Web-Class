import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // 指定前端端口
    proxy: {
      '/api': {
        target: 'http://localhost:7001', // 后端服务器地址
        changeOrigin: true, // 改变请求头中的Origin字段
        secure: false, // 如果是https接口，需要配置这个参数
        // 路径重写，这里保持不变，因为后端路由就是/api开头
      }
    }
  }
})
