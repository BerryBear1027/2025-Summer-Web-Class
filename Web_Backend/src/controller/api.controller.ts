import { Inject, Controller, Get, Post, Body, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';

@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Get('/get_user')
  async getUser(@Query('uid') uid) {
    const user = await this.userService.getUser({ uid });
    return { success: true, message: 'OK', data: user };
  }

  // 新增：简单的Hello接口
  @Get('/hello')
  async getHello(@Query() query: any) {
    console.log('收到GET /api/hello请求，参数：', query);
    return {
      success: true,
      message: 'Hello from Midway Backend!',
      timestamp: new Date().toISOString(),
      query: query,
      serverInfo: {
        framework: 'Midway',
        version: '3.x',
        port: 7001
      }
    };
  }

  // 新增：POST接口示例
  @Post('/data')
  async postData(@Body() body: any) {
    console.log('收到POST /api/data请求，数据：', body);
    return {
      success: true,
      message: 'Data received successfully',
      receivedData: body,
      processedAt: new Date().toISOString(),
      dataSize: JSON.stringify(body).length
    };
  }

  // 新增：获取用户列表
  @Get('/users')
  async getUsers() {
    console.log('收到GET /api/users请求');
    return {
      success: true,
      message: '用户列表获取成功',
      data: [
        {
          id: 1,
          name: 'Alice',
          email: 'alice@example.com',
          role: 'admin',
          createdAt: '2024-01-01'
        },
        {
          id: 2,
          name: 'Bob',
          email: 'bob@example.com',
          role: 'user',
          createdAt: '2024-01-02'
        },
        {
          id: 3,
          name: 'Charlie',
          email: 'charlie@example.com',
          role: 'user',
          createdAt: '2024-01-03'
        }
      ],
      total: 3,
      timestamp: new Date().toISOString()
    };
  }

  // 新增：测试连接状态
  @Get('/status')
  async getStatus() {
    console.log('收到GET /api/status请求');
    return {
      success: true,
      message: '后端服务正常运行',
      data: {
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
      }
    };
  }

  // 新增：测试错误处理
  @Get('/error')
  async testError(@Query('type') type: string) {
    console.log('收到GET /api/error请求，错误类型：', type);

    if (type === 'server') {
      throw new Error('这是一个服务器错误测试');
    } else if (type === 'validation') {
      return {
        success: false,
        message: '参数验证失败',
        error: 'Invalid parameter type',
        code: 400
      };
    } else {
      return {
        success: true,
        message: '错误测试正常',
        data: {
          supportedErrorTypes: ['server', 'validation'],
          currentType: type || 'none'
        }
      };
    }
  }

  // 调试：查看当前存储的所有用户
  @Get('/debug/users')
  async getDebugUsers() {
    const users = await this.userService.getAllUsers();
    return {
      success: true,
      message: 'Debug: All users',
      data: {
        count: users.length,
        users: users
      }
    };
  }

  // 测试：多用户同时在线状态
  @Get('/debug/online-users')
  async getOnlineUsers() {
    const users = await this.userService.getAllUsers();
    return {
      success: true,
      message: 'Current registered users (can all login simultaneously)',
      data: {
        totalUsers: users.length,
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt
        })),
        note: 'Each user can login and get their own JWT token for concurrent access'
      }
    };
  }
}
