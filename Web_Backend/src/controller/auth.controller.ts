import { Inject, Controller, Post, Get, Put, Body, Headers, Files } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { RegisterUserDto, LoginUserDto, UpdateUserDto } from '../entity/user.entity';
import * as path from 'path';
import * as fs from 'fs';

@Controller('/api/auth')
export class AuthController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  // 用户注册
  @Post('/register')
  async register(@Body() userData: RegisterUserDto) {
    console.log('收到注册请求，数据：', userData);

    // 基本验证
    if (!userData.username || !userData.password) {
      return {
        success: false,
        message: '用户名和密码不能为空'
      };
    }

    // 用户名验证
    if (userData.username.length < 3 || userData.username.length > 20) {
      return {
        success: false,
        message: '用户名长度必须在3-20个字符之间'
      };
    }

    // 手机号验证（如果提供）
    if (userData.phone) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(userData.phone)) {
        return {
          success: false,
          message: '请输入正确的手机号格式'
        };
      }
    }

    // 邮箱验证（如果提供）
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return {
          success: false,
          message: '请输入正确的邮箱格式'
        };
      }
    }

    // 密码验证
    if (userData.password.length < 6) {
      return {
        success: false,
        message: '密码长度不能少于6个字符'
      };
    }

    try {
      const result = await this.userService.register(userData);
      return result;
    } catch (error) {
      return {
        success: false,
        message: '注册失败：' + error.message
      };
    }
  }

  // 用户登录
  @Post('/login')
  async login(@Body() loginData: LoginUserDto) {
    console.log('收到登录请求，数据：', loginData);

    // 基本验证
    if (!loginData.username || !loginData.password) {
      return {
        success: false,
        message: '用户名和密码不能为空'
      };
    }

    try {
      const result = await this.userService.login(loginData);
      return result;
    } catch (error) {
      return {
        success: false,
        message: '登录失败：' + error.message
      };
    }
  }

  // 获取当前用户信息
  @Get('/profile')
  async getProfile(@Headers('authorization') authorization: string) {
    try {
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return {
          success: false,
          message: '未提供有效的token'
        };
      }

      const token = authorization.substring(7);
      const result = await this.userService.getUserByToken(token);
      return result;
    } catch (error) {
      return {
        success: false,
        message: '获取用户信息失败：' + error.message
      };
    }
  }

  // 更新用户信息
  @Put('/profile')
  async updateProfile(@Body() userData: UpdateUserDto, @Headers('authorization') authorization: string) {
    try {
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return {
          success: false,
          message: '未提供有效的token'
        };
      }

      const token = authorization.substring(7);
      const result = await this.userService.updateProfile(token, userData);
      return result;
    } catch (error) {
      return {
        success: false,
        message: '更新用户信息失败：' + error.message
      };
    }
  }

  // 上传图片（用于活动和场馆）
  @Post('/upload-image')
  async uploadImage(@Files() files: any[], @Headers('authorization') authorization: string) {
    try {
      console.log('收到图片上传请求');

      if (!authorization || !authorization.startsWith('Bearer ')) {
        return {
          success: false,
          message: '未提供有效的token'
        };
      }

      const token = authorization.substring(7);
      const decoded = this.userService.verifyToken(token);

      if (!decoded.userId) {
        return {
          success: false,
          message: '无效的token'
        };
      }

      if (!files || files.length === 0) {
        return {
          success: false,
          message: '未选择文件'
        };
      }

      const file = files[0];
      console.log('文件信息：', {
        filename: file.filename,
        mimeType: file.mimeType,
        data: file.data.length
      });

      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.mimeType)) {
        return {
          success: false,
          message: '不支持的文件类型，只允许 JPEG、PNG、GIF 格式'
        };
      }

      // 验证文件大小 (5MB)
      if (file.data.length > 5 * 1024 * 1024) {
        return {
          success: false,
          message: '文件大小不能超过5MB'
        };
      }

      // 创建上传目录
      const uploadDir = path.join(process.cwd(), 'uploads', 'images');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // 生成文件名
      const ext = path.extname(file.filename);
      const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
      const filepath = path.join(uploadDir, filename);

      // 保存文件
      fs.writeFileSync(filepath, file.data);

      console.log('图片保存成功：', filepath);

      // 返回图片URL
      const imageUrl = `/uploads/images/${filename}`;

      return {
        success: true,
        message: '图片上传成功',
        data: {
          url: imageUrl
        }
      };
    } catch (error) {
      console.error('图片上传失败：', error);
      return {
        success: false,
        message: '上传图片失败：' + error.message
      };
    }
  }

  // 登出
  @Post('/logout')
  async logout() {
    return {
      success: true,
      message: '登出成功'
    };
  }

  // 测试文件上传功能
  @Post('/test-upload')
  async testUpload(@Files() files: any[]) {
    try {
      console.log('收到文件上传测试请求');
      console.log('文件信息：', files);

      if (!files || files.length === 0) {
        return {
          success: false,
          message: '没有文件上传'
        };
      }

      const file = files[0];
      return {
        success: true,
        message: '文件上传测试成功',
        data: {
          filename: file.filename,
          mimeType: file.mimeType,
          size: file.data?.length || 'unknown',
          fieldName: file.fieldName
        }
      };
    } catch (error) {
      console.error('文件上传测试失败：', error);
      return {
        success: false,
        message: '文件上传测试失败：' + error.message
      };
    }
  }
}
