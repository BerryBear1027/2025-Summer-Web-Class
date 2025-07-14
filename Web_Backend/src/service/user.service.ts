import { Provide, Singleton } from '@midwayjs/core';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { IUserOptions } from '../interface';
import { User, RegisterUserDto, LoginUserDto, UserResponseDto, UpdateUserDto } from '../entity/user.entity';

@Provide()
@Singleton()  // 确保这是单例
export class UserService {
  private users: Map<string, User> = new Map();
  private readonly jwtSecret = 'your-jwt-secret-key-change-in-production';

  async getUser(options: IUserOptions) {
    return {
      uid: options.uid,
      username: 'mockedName',
      phone: '12345678901',
      email: 'xxx.xxx@xxx.com',
    };
  }  // 注册用户
  async register(userData: RegisterUserDto): Promise<{ success: boolean; message: string; data?: UserResponseDto }> {
    try {
      console.log('📝 注册尝试:', userData);
      console.log('📊 注册前用户数量:', this.users.size);

      // 检查用户名是否已存在
      const existingUser = Array.from(this.users.values()).find(
        user => user.username === userData.username
      );

      if (existingUser) {
        console.log('❌ 用户名已存在:', existingUser.username);
        return {
          success: false,
          message: '用户名已存在'
        };
      }

      // 检查手机号是否已存在（如果提供了手机号）
      if (userData.phone) {
        const existingPhone = Array.from(this.users.values()).find(
          user => user.phone === userData.phone
        );
        if (existingPhone) {
          return {
            success: false,
            message: '手机号已注册'
          };
        }
      }

      // 检查邮箱是否已存在（如果提供了邮箱）
      if (userData.email) {
        const existingEmail = Array.from(this.users.values()).find(
          user => user.email === userData.email
        );
        if (existingEmail) {
          return {
            success: false,
            message: '邮箱已注册'
          };
        }
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // 创建新用户
      const user = new User({
        ...userData,
        password: hashedPassword,
      });

      this.users.set(user.id, user);

      console.log('✅ 用户注册成功:', { id: user.id, username: user.username });
      console.log('📊 注册后用户数量:', this.users.size);

      return {
        success: true,
        message: '注册成功',
        data: user.toJSON() as UserResponseDto
      };
    } catch (error) {
      return {
        success: false,
        message: '注册失败：' + error.message
      };
    }
  }

  // 用户登录
  async login(loginData: LoginUserDto): Promise<{ success: boolean; message: string; data?: { user: UserResponseDto; token: string } }> {
    try {
      console.log('🔍 登录尝试:', loginData);
      console.log('📊 当前用户数量:', this.users.size);
      console.log('👥 所有用户:', Array.from(this.users.values()).map(u => ({ id: u.id, username: u.username })));

      // 查找用户
      const user = Array.from(this.users.values()).find(
        u => u.username === loginData.username
      );

      console.log('🔎 查找到的用户:', user ? { id: user.id, username: user.username } : '未找到');

      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        };
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: '密码错误'
        };
      }

      // 生成 JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        this.jwtSecret,
        { expiresIn: '24h' }
      );

      return {
        success: true,
        message: '登录成功',
        data: {
          user: user.toJSON() as UserResponseDto,
          token,
        }
      };
    } catch (error) {
      return {
        success: false,
        message: '登录失败：' + error.message
      };
    }
  }

  // 根据 token 获取用户信息
  async getUserByToken(token: string): Promise<{ success: boolean; message: string; data?: UserResponseDto }> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      const user = this.users.get(decoded.userId);

      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        };
      }

      return {
        success: true,
        message: '获取用户信息成功',
        data: user.toJSON() as UserResponseDto
      };
    } catch (error) {
      return {
        success: false,
        message: '无效的token'
      };
    }
  }

  // 根据 ID 获取用户
  async getUserById(id: string): Promise<UserResponseDto | null> {
    const user = this.users.get(id);
    return user ? user.toJSON() as UserResponseDto : null;
  }

  // 更新用户信息
  async updateProfile(token: string, userData: UpdateUserDto): Promise<{ success: boolean; message: string; data?: UserResponseDto }> {
    try {
      const decoded = this.verifyToken(token);
      const user = this.users.get(decoded.userId);

      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        };
      }

      // 检查用户名是否已被其他用户占用
      if (userData.username && userData.username !== user.username) {
        const existingUser = Array.from(this.users.values()).find(
          u => u.username === userData.username && u.id !== user.id
        );
        if (existingUser) {
          return {
            success: false,
            message: '用户名已存在'
          };
        }
      }

      // 检查邮箱是否已被其他用户占用
      if (userData.email && userData.email !== user.email) {
        const existingEmail = Array.from(this.users.values()).find(
          u => u.email === userData.email && u.id !== user.id
        );
        if (existingEmail) {
          return {
            success: false,
            message: '邮箱已被其他用户使用'
          };
        }
      }

      // 检查手机号是否已被其他用户占用
      if (userData.phone && userData.phone !== user.phone) {
        const existingPhone = Array.from(this.users.values()).find(
          u => u.phone === userData.phone && u.id !== user.id
        );
        if (existingPhone) {
          return {
            success: false,
            message: '手机号已被其他用户使用'
          };
        }
      }

      // 更新用户信息
      Object.assign(user, {
        ...userData,
        updatedAt: new Date()
      });

      console.log('✅ 用户信息更新成功:', { id: user.id, username: user.username });

      return {
        success: true,
        message: '更新成功',
        data: user.toJSON() as UserResponseDto
      };
    } catch (error) {
      return {
        success: false,
        message: '更新失败：' + error.message
      };
    }
  }

  // 获取所有用户（用于测试）
  async getAllUsers(): Promise<UserResponseDto[]> {
    return Array.from(this.users.values()).map(user => user.toJSON() as UserResponseDto);
  }

  // 验证 token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('无效的token');
    }
  }
}

