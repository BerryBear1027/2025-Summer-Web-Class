import { MidwayConfig } from '@midwayjs/core';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1751445550771_5821',
  koa: {
    port: 7001,
  },
  cors: {
    origin: function (ctx) {
      // 动态判断允许的域名
      const origin = ctx.get('origin');
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
      if (allowedOrigins.includes(origin)) {
        return origin;
      }
      return 'http://localhost:3000'; // 默认允许的域名
    },
    allowMethods: 'GET,POST,PUT,DELETE,OPTIONS', // 允许的HTTP方法
    allowHeaders: 'Content-Type,Authorization,Accept', // 允许的请求头
    credentials: true, // 允许携带cookie
    maxAge: 86400, // 预检请求的缓存时间（秒）
  },
} as MidwayConfig;