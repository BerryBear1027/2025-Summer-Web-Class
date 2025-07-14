import { Inject, Controller, Post, Get, Del, Body, Headers, Query, Param } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { SportsService } from '../service/sports.service';
import { UserService } from '../service/user.service';
import { CreateActivityDto, CreateVenueDto, CreateBookingDto, CreateCommentDto } from '../entity/sports.entity';

@Controller('/api/sports')
export class SportsController {
  @Inject()
  ctx: Context;

  @Inject()
  sportsService: SportsService;

  @Inject()
  userService: UserService;

  // 验证用户token并获取用户信息
  private async getUserFromToken(authorization: string) {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new Error('未提供有效的token');
    }

    const token = authorization.substring(7);
    const userInfo = await this.userService.getUserByToken(token);
    
    if (!userInfo.success) {
      throw new Error('无效的token');
    }

    return userInfo.data;
  }

  // ============ 活动相关接口 ============

  // 创建活动
  @Post('/activities')
  async createActivity(@Body() activityData: CreateActivityDto, @Headers('authorization') authorization: string) {
    try {
      const user = await this.getUserFromToken(authorization);
      const result = await this.sportsService.createActivity(
        user.id, 
        user.username, 
        activityData
      );
      return result;
    } catch (error) {
      return {
        success: false,
        message: '创建活动失败：' + error.message
      };
    }
  }

  // 获取所有活动
  @Get('/activities')
  async getAllActivities() {
    try {
      const activities = await this.sportsService.getAllActivities();
      return {
        success: true,
        message: '获取活动列表成功',
        data: activities
      };
    } catch (error) {
      return {
        success: false,
        message: '获取活动列表失败：' + error.message
      };
    }
  }

  // 根据ID获取活动详情
  @Get('/activities/:id')
  async getActivityById(@Param('id') id: string) {
    try {
      console.log('获取活动详情，ID:', id);
      const activity = await this.sportsService.getActivityById(id);
      console.log('Service返回的活动数据:', activity);
      
      if (!activity) {
        return {
          success: false,
          message: '活动不存在'
        };
      }

      console.log('活动参与者详情:', activity.participantDetails);
      console.log('活动参与者ID列表:', activity.participants);

      return {
        success: true,
        message: '获取活动详情成功',
        data: activity
      };
    } catch (error) {
      console.error('获取活动详情异常:', error);
      return {
        success: false,
        message: '获取活动详情失败：' + error.message
      };
    }
  }

  // 报名参加活动
  @Post('/activities/:id/join')
  async joinActivity(@Param('id') activityId: string, @Headers('authorization') authorization: string) {
    try {
      const user = await this.getUserFromToken(authorization);
      const result = await this.sportsService.joinActivity(activityId, user.id);
      return result;
    } catch (error) {
      return {
        success: false,
        message: '报名失败：' + error.message
      };
    }
  }

  // 取消报名
  @Post('/activities/:id/leave')
  async leaveActivity(@Param('id') activityId: string, @Headers('authorization') authorization: string) {
    try {
      const user = await this.getUserFromToken(authorization);
      const result = await this.sportsService.leaveActivity(activityId, user.id);
      return result;
    } catch (error) {
      return {
        success: false,
        message: '取消报名失败：' + error.message
      };
    }
  }

  // 解散活动
  @Del('/activities/:id')
  async cancelActivity(@Param('id') activityId: string, @Headers('authorization') authorization: string) {
    try {
      const user = await this.getUserFromToken(authorization);
      const result = await this.sportsService.cancelActivity(activityId, user.id);
      return result;
    } catch (error) {
      return {
        success: false,
        message: '解散活动失败：' + error.message
      };
    }
  }

  // 删除活动
  @Del('/activities/:id/delete')
  async deleteActivity(@Param('id') activityId: string, @Headers('authorization') authorization: string) {
    try {
      const user = await this.getUserFromToken(authorization);
      const result = await this.sportsService.deleteActivity(activityId, user.id);
      return result;
    } catch (error) {
      return {
        success: false,
        message: '删除活动失败：' + error.message
      };
    }
  }

  // 搜索活动
  @Get('/activities/search')
  async searchActivities(@Query('keyword') keyword: string) {
    try {
      const activities = await this.sportsService.searchActivities(keyword || '');
      return {
        success: true,
        message: '搜索活动成功',
        data: activities
      };
    } catch (error) {
      return {
        success: false,
        message: '搜索活动失败：' + error.message
      };
    }
  }

  // ============ 场馆相关接口 ============

  // 创建场馆
  @Post('/venues')
  async createVenue(@Body() venueData: CreateVenueDto, @Headers('authorization') authorization: string) {
    try {
      const user = await this.getUserFromToken(authorization);
      const result = await this.sportsService.createVenue(
        user.id, 
        user.username, 
        venueData
      );
      return result;
    } catch (error) {
      return {
        success: false,
        message: '创建场馆失败：' + error.message
      };
    }
  }

  // 获取所有场馆
  @Get('/venues')
  async getAllVenues() {
    try {
      const venues = await this.sportsService.getAllVenues();
      return {
        success: true,
        message: '获取场馆列表成功',
        data: venues
      };
    } catch (error) {
      return {
        success: false,
        message: '获取场馆列表失败：' + error.message
      };
    }
  }

  // 根据ID获取场馆详情
  @Get('/venues/:id')
  async getVenueById(@Param('id') id: string) {
    try {
      const venue = await this.sportsService.getVenueById(id);
      if (!venue) {
        return {
          success: false,
          message: '场馆不存在'
        };
      }

      return {
        success: true,
        message: '获取场馆详情成功',
        data: venue
      };
    } catch (error) {
      return {
        success: false,
        message: '获取场馆详情失败：' + error.message
      };
    }
  }

  // 删除场馆
  @Del('/venues/:id')
  async deleteVenue(@Param('id') venueId: string, @Headers('authorization') authorization: string) {
    try {
      const user = await this.getUserFromToken(authorization);
      console.log('删除场馆请求 - venueId:', venueId, 'userId:', user.id);
      const result = await this.sportsService.deleteVenue(venueId, user.id);
      console.log('删除场馆结果:', result);
      return result;
    } catch (error) {
      console.error('删除场馆错误:', error);
      return {
        success: false,
        message: '删除场馆失败：' + error.message
      };
    }
  }

  // 搜索场馆
  @Get('/venues/search')
  async searchVenues(@Query('keyword') keyword: string) {
    try {
      const venues = await this.sportsService.searchVenues(keyword || '');
      return {
        success: true,
        message: '搜索场馆成功',
        data: venues
      };
    } catch (error) {
      return {
        success: false,
        message: '搜索场馆失败：' + error.message
      };
    }
  }

  // ============ 预约相关接口 ============

  // 创建预约
  @Post('/bookings')
  async createBooking(@Body() bookingData: CreateBookingDto, @Headers('authorization') authorization: string) {
    try {
      const user = await this.getUserFromToken(authorization);
      const result = await this.sportsService.createBooking(user.id, user.username, bookingData);
      return result;
    } catch (error) {
      return {
        success: false,
        message: '预约失败：' + error.message
      };
    }
  }

  // 取消预约
  @Del('/bookings/:id')
  async cancelBooking(@Param('id') bookingId: string, @Headers('authorization') authorization: string) {
    try {
      const user = await this.getUserFromToken(authorization);
      const result = await this.sportsService.cancelBooking(bookingId, user.id);
      return result;
    } catch (error) {
      return {
        success: false,
        message: '取消预约失败：' + error.message
      };
    }
  }

  // 获取用户预约记录
  @Get('/my-bookings')
  async getUserBookings(@Headers('authorization') authorization: string) {
    try {
      const user = await this.getUserFromToken(authorization);
      const bookings = await this.sportsService.getUserBookings(user.id);
      return {
        success: true,
        message: '获取预约记录成功',
        data: bookings
      };
    } catch (error) {
      return {
        success: false,
        message: '获取预约记录失败：' + error.message
      };
    }
  }

  // 获取场馆预约信息
  @Get('/venues/:id/bookings')
  async getVenueBookings(@Param('id') venueId: string, @Query('date') date?: string) {
    try {
      const result = await this.sportsService.getVenueBookings(venueId, date);
      return result;
    } catch (error) {
      return {
        success: false,
        message: '获取预约信息失败：' + error.message
      };
    }
  }

  // ============ 评论相关接口 ============

  // 添加评论
  @Post('/comments')
  async createComment(@Body() commentData: CreateCommentDto, @Headers('authorization') authorization: string) {
    try {
      const user = await this.getUserFromToken(authorization);
      const result = await this.sportsService.createComment(
        user.id, 
        user.username, 
        commentData
      );
      return result;
    } catch (error) {
      return {
        success: false,
        message: '发表评论失败：' + error.message
      };
    }
  }

  // 获取评论
  @Get('/comments')
  async getComments(@Query('targetId') targetId: string, @Query('targetType') targetType: 'activity' | 'venue') {
    try {
      const comments = await this.sportsService.getComments(targetId, targetType);
      return {
        success: true,
        message: '获取评论成功',
        data: comments
      };
    } catch (error) {
      return {
        success: false,
        message: '获取评论失败：' + error.message
      };
    }
  }

  // 删除评论
  @Del('/comments/:id')
  async deleteComment(@Param('id') commentId: string, @Headers('authorization') authorization: string) {
    try {
      const user = await this.getUserFromToken(authorization);
      const result = await this.sportsService.deleteComment(commentId, user.id);
      return result;
    } catch (error) {
      return {
        success: false,
        message: '删除评论失败：' + error.message
      };
    }
  }

  // ============ 用户历史记录接口 ============

  // 获取用户参与的活动
  @Get('/my-activities')
  async getUserActivities(@Headers('authorization') authorization: string) {
    try {
      const user = await this.getUserFromToken(authorization);
      const activities = await this.sportsService.getUserActivities(user.id);
      return {
        success: true,
        message: '获取用户活动成功',
        data: activities
      };
    } catch (error) {
      return {
        success: false,
        message: '获取用户活动失败：' + error.message
      };
    }
  }

  // 获取用户发布的内容
  @Get('/my-publications')
  async getUserPublications(@Headers('authorization') authorization: string) {
    try {
      const user = await this.getUserFromToken(authorization);
      const publications = await this.sportsService.getUserPublications(user.id);
      return {
        success: true,
        message: '获取用户发布内容成功',
        data: publications
      };
    } catch (error) {
      return {
        success: false,
        message: '获取用户发布内容失败：' + error.message
      };
    }
  }
}
