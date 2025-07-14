import { Provide, Singleton, Inject } from '@midwayjs/core';
import { 
  Activity, 
  Venue, 
  Booking, 
  Comment,
  CreateActivityDto, 
  CreateVenueDto, 
  CreateBookingDto, 
  CreateCommentDto 
} from '../entity/sports.entity';
import { UserService } from './user.service';

@Provide()
@Singleton()
export class SportsService {
  @Inject()
  userService: UserService;
  
  private activities: Map<string, Activity> = new Map();
  private venues: Map<string, Venue> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private comments: Map<string, Comment> = new Map();

  // ============ 活动管理 ============

  // 创建活动
  async createActivity(userId: string, userName: string, activityData: CreateActivityDto): Promise<{ success: boolean; message: string; data?: Activity }> {
    try {
      const activity = new Activity({
        ...activityData,
        publisherId: userId,
        publisherName: userName,
      });

      this.activities.set(activity.id, activity);

      return {
        success: true,
        message: '活动创建成功',
        data: activity.toJSON() as Activity
      };
    } catch (error) {
      return {
        success: false,
        message: '创建活动失败：' + error.message
      };
    }
  }

  // 获取所有活动
  async getAllActivities(): Promise<Activity[]> {
    const activities = await Promise.all(
      Array.from(this.activities.values())
        .filter(activity => activity.status !== 'deleted') // 过滤已删除的活动
        .map(async activity => {
          const activityData = activity.toJSON() as Activity;
          // 为每个活动添加参与者详细信息
          const participantDetails = await Promise.all(
            activityData.participants.map(async participantId => {
              const user = await this.userService.getUserById(participantId);
              return {
                id: participantId,
                username: user?.username || `用户${participantId.slice(-4)}`
              };
            })
          );
          activityData.participantDetails = participantDetails;
          return activityData;
        })
    );
    return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // 根据ID获取活动
  async getActivityById(id: string): Promise<Activity | null> {
    console.log('SportsService: 获取活动详情，ID:', id);
    const activity = this.activities.get(id);
    if (!activity) {
      console.log('SportsService: 活动不存在');
      return null;
    }
    
    const activityData = activity.toJSON() as Activity;
    console.log('SportsService: 原始活动数据:', activityData);
    console.log('SportsService: 参与者ID列表:', activityData.participants);
    
    // 为活动添加参与者详细信息
    const participantDetails = await Promise.all(
      activityData.participants.map(async participantId => {
        console.log('SportsService: 获取参与者信息，ID:', participantId);
        const user = await this.userService.getUserById(participantId);
        console.log('SportsService: 用户信息:', user);
        const participantDetail = {
          id: participantId,
          username: user?.username || `用户${participantId.slice(-4)}`
        };
        console.log('SportsService: 参与者详情:', participantDetail);
        return participantDetail;
      })
    );
    
    console.log('SportsService: 所有参与者详情:', participantDetails);
    activityData.participantDetails = participantDetails;
    console.log('SportsService: 最终活动数据:', activityData);
    
    return activityData;
  }

  // 报名参加活动
  async joinActivity(activityId: string, userId: string): Promise<{ success: boolean; message: string; data?: Activity }> {
    try {
      const activity = this.activities.get(activityId);
      if (!activity) {
        return { success: false, message: '活动不存在' };
      }

      if (activity.participants.includes(userId)) {
        return { success: false, message: '您已经报名了此活动' };
      }

      if (activity.currentParticipants >= activity.maxParticipants) {
        return { success: false, message: '活动人数已满' };
      }

      activity.participants.push(userId);
      activity.currentParticipants = activity.participants.length;
      activity.updatedAt = new Date();

      if (activity.currentParticipants >= activity.maxParticipants) {
        activity.status = 'full';
      }

      return {
        success: true,
        message: '报名成功',
        data: activity.toJSON() as Activity
      };
    } catch (error) {
      return {
        success: false,
        message: '报名失败：' + error.message
      };
    }
  }

  // 取消报名
  async leaveActivity(activityId: string, userId: string): Promise<{ success: boolean; message: string; data?: Activity }> {
    try {
      const activity = this.activities.get(activityId);
      if (!activity) {
        return { success: false, message: '活动不存在' };
      }

      const index = activity.participants.indexOf(userId);
      if (index === -1) {
        return { success: false, message: '您未报名此活动' };
      }

      activity.participants.splice(index, 1);
      activity.currentParticipants = activity.participants.length;
      activity.updatedAt = new Date();

      if (activity.status === 'full') {
        activity.status = 'recruiting';
      }

      return {
        success: true,
        message: '取消报名成功',
        data: activity.toJSON() as Activity
      };
    } catch (error) {
      return {
        success: false,
        message: '取消报名失败：' + error.message
      };
    }
  }

  // 解散活动（只有发布者可以）
  async cancelActivity(activityId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const activity = this.activities.get(activityId);
      if (!activity) {
        return { success: false, message: '活动不存在' };
      }

      if (activity.publisherId !== userId) {
        return { success: false, message: '只有发布者可以解散活动' };
      }

      activity.status = 'cancelled';
      activity.updatedAt = new Date();

      return {
        success: true,
        message: '活动已解散'
      };
    } catch (error) {
      return {
        success: false,
        message: '解散活动失败：' + error.message
      };
    }
  }

  // 删除活动
  async deleteActivity(activityId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('deleteActivity 调用 - activityId:', activityId, 'userId:', userId);
      
      const activity = this.activities.get(activityId);
      if (!activity) {
        console.log('活动不存在，activityId:', activityId);
        return { success: false, message: '活动不存在' };
      }

      console.log('找到活动，publisherId:', activity.publisherId, 'userId:', userId);
      if (activity.publisherId !== userId) {
        return { success: false, message: '只有发布者可以删除活动' };
      }

      // 不删除活动，而是标记为已删除状态
      activity.status = 'deleted';
      activity.updatedAt = new Date();
      console.log('活动标记为已删除成功');

      return {
        success: true,
        message: '活动已删除'
      };
    } catch (error) {
      console.error('删除活动异常:', error);
      return {
        success: false,
        message: '删除活动失败：' + error.message
      };
    }
  }

  // ============ 场馆管理 ============

  // 创建场馆
  async createVenue(userId: string, userName: string, venueData: CreateVenueDto): Promise<{ success: boolean; message: string; data?: Venue }> {
    try {
      const venue = new Venue({
        ...venueData,
        publisherId: userId,
        publisherName: userName,
      });

      this.venues.set(venue.id, venue);

      return {
        success: true,
        message: '场馆创建成功',
        data: venue.toJSON() as Venue
      };
    } catch (error) {
      return {
        success: false,
        message: '创建场馆失败：' + error.message
      };
    }
  }

  // 获取所有场馆
  async getAllVenues(): Promise<Venue[]> {
    return Array.from(this.venues.values())
      .filter(venue => venue.status !== 'deleted') // 过滤已删除的场馆
      .map(venue => venue.toJSON() as Venue)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // 根据ID获取场馆
  async getVenueById(id: string): Promise<Venue | null> {
    const venue = this.venues.get(id);
    return venue ? venue.toJSON() as Venue : null;
  }

  // 删除场馆（只有发布者可以）
  async deleteVenue(venueId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('deleteVenue 调用 - venueId:', venueId, 'userId:', userId);
      console.log('当前存储的场馆:', Array.from(this.venues.keys()));
      
      const venue = this.venues.get(venueId);
      if (!venue) {
        console.log('场馆不存在，venueId:', venueId);
        return { success: false, message: '场馆不存在' };
      }

      console.log('找到场馆，publisherId:', venue.publisherId, 'userId:', userId);
      if (venue.publisherId !== userId) {
        return { success: false, message: '只有发布者可以删除场馆' };
      }

      // 不删除场馆，而是标记为已删除状态
      venue.status = 'deleted';
      venue.updatedAt = new Date();
      console.log('场馆标记为已删除成功');

      return {
        success: true,
        message: '场馆已删除'
      };
    } catch (error) {
      console.error('删除场馆异常:', error);
      return {
        success: false,
        message: '删除场馆失败：' + error.message
      };
    }
  }

  // 获取场馆预约信息（包括已预约时间段）
  async getVenueBookings(venueId: string, date?: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const venue = this.venues.get(venueId);
      if (!venue) {
        return { success: false, message: '场馆不存在' };
      }

      let targetDate = date ? new Date(date) : new Date();
      
      // 获取指定日期的所有预约
      const bookings = Array.from(this.bookings.values())
        .filter(booking => 
          booking.venueId === venueId && 
          booking.bookingDate.toDateString() === targetDate.toDateString() &&
          booking.status !== 'cancelled'
        )
        .map(booking => ({
          id: booking.id,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          userName: booking.userName
        }))
        .sort((a, b) => this.timeStringToMinutes(a.startTime) - this.timeStringToMinutes(b.startTime));

      // 生成可用时间段
      const availableSlots = this.generateAvailableSlots(venue.availableHours, bookings);

      return {
        success: true,
        message: '获取预约信息成功',
        data: {
          venue: {
            id: venue.id,
            name: venue.name,
            availableHours: venue.availableHours,
            price: venue.price
          },
          date: targetDate.toDateString(),
          bookings: bookings,
          availableSlots: availableSlots
        }
      };
    } catch (error) {
      return {
        success: false,
        message: '获取预约信息失败：' + error.message
      };
    }
  }

  // 生成可用时间段
  private generateAvailableSlots(availableHours: string[], bookings: any[]): string[] {
    return availableHours.filter(hour => {
      // 检查这个时间段是否被预约
      const isBooked = bookings.some(booking => {
        const bookingStart = this.timeStringToMinutes(booking.startTime);
        const bookingEnd = this.timeStringToMinutes(booking.endTime);
        const hourMinutes = this.timeStringToMinutes(hour);
        return hourMinutes >= bookingStart && hourMinutes < bookingEnd;
      });
      return !isBooked;
    });
  }

  // ============ 预约管理 ============

  // 创建预约
  async createBooking(userId: string, userName: string, bookingData: CreateBookingDto): Promise<{ success: boolean; message: string; data?: Booking }> {
    try {
      const venue = this.venues.get(bookingData.venueId);
      if (!venue) {
        return { success: false, message: '场馆不存在' };
      }

      if (venue.status !== 'available') {
        return { success: false, message: '场馆当前不可预约' };
      }

      // 检查预约时间是否在场馆可用时间内
      if (!venue.availableHours.includes(bookingData.startTime)) {
        return { 
          success: false, 
          message: `预约开始时间不在场馆可用时间内，可用时间: ${venue.availableHours.join(', ')}` 
        };
      }

      // 检查预约时间是否为整点
      const startTime = bookingData.startTime.split(':');
      const endTime = bookingData.endTime.split(':');
      if (startTime[1] !== '00' || endTime[1] !== '00') {
        return { success: false, message: '预约时间必须为整点（如：14:00-16:00）' };
      }

      // 检查时间冲突
      const existingBookings = Array.from(this.bookings.values()).filter(
        booking => booking.venueId === bookingData.venueId && 
        booking.bookingDate.toDateString() === bookingData.bookingDate.toDateString() &&
        booking.status !== 'cancelled'
      );

      // 检查是否有时间冲突
      const hasConflict = existingBookings.some(booking => {
        const existingStart = this.timeStringToMinutes(booking.startTime);
        const existingEnd = this.timeStringToMinutes(booking.endTime);
        const newStart = this.timeStringToMinutes(bookingData.startTime);
        const newEnd = this.timeStringToMinutes(bookingData.endTime);
        
        return (newStart < existingEnd && newEnd > existingStart);
      });

      if (hasConflict) {
        return { success: false, message: '当前时间段已经被预约！' };
      }

      const booking = new Booking({
        ...bookingData,
        userId,
        userName,
        venueName: venue.name,
        totalPrice: venue.price ? this.calculatePrice(venue.price, bookingData.startTime, bookingData.endTime) : undefined
      });

      this.bookings.set(booking.id, booking);
      venue.bookings.push(booking.id);

      return {
        success: true,
        message: '预约成功',
        data: booking.toJSON() as Booking
      };
    } catch (error) {
      return {
        success: false,
        message: '预约失败：' + error.message
      };
    }
  }

  // 取消预约
  async cancelBooking(bookingId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const booking = this.bookings.get(bookingId);
      if (!booking) {
        return { success: false, message: '预约不存在' };
      }

      if (booking.userId !== userId) {
        return { success: false, message: '只能取消自己的预约' };
      }

      booking.status = 'cancelled';
      booking.updatedAt = new Date();

      return {
        success: true,
        message: '预约已取消'
      };
    } catch (error) {
      return {
        success: false,
        message: '取消预约失败：' + error.message
      };
    }
  }

  // 获取用户的预约记录
  async getUserBookings(userId: string): Promise<any[]> {
    const bookings = Array.from(this.bookings.values())
      .filter(booking => booking.userId === userId)
      .map(booking => {
        const bookingData = booking.toJSON();
        // 添加场馆信息
        const venue = this.venues.get(booking.venueId);
        if (venue) {
          (bookingData as any).venue = venue.toJSON();
        }
        return bookingData;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return bookings;
  }

  // ============ 评论管理 ============

  // 添加评论
  async createComment(userId: string, userName: string, commentData: CreateCommentDto): Promise<{ success: boolean; message: string; data?: Comment }> {
    try {
      const comment = new Comment({
        ...commentData,
        userId,
        userName,
      });

      this.comments.set(comment.id, comment);

      return {
        success: true,
        message: '评论发表成功',
        data: comment.toJSON() as Comment
      };
    } catch (error) {
      return {
        success: false,
        message: '发表评论失败：' + error.message
      };
    }
  }

  // 获取目标的评论
  async getComments(targetId: string, targetType: 'activity' | 'venue'): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.targetId === targetId && comment.targetType === targetType)
      .map(comment => comment.toJSON() as Comment)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // 删除评论
  async deleteComment(commentId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const comment = this.comments.get(commentId);
      if (!comment) {
        return { success: false, message: '评论不存在' };
      }

      if (comment.userId !== userId) {
        return { success: false, message: '只能删除自己的评论' };
      }

      this.comments.delete(commentId);

      return {
        success: true,
        message: '评论已删除'
      };
    } catch (error) {
      return {
        success: false,
        message: '删除评论失败：' + error.message
      };
    }
  }

  // ============ 搜索功能 ============

  // 搜索活动
  async searchActivities(keyword: string): Promise<Activity[]> {
    const allActivities = await this.getAllActivities();
    if (!keyword) return allActivities;

    return allActivities.filter(activity => 
      activity.name.toLowerCase().includes(keyword.toLowerCase()) ||
      activity.location.toLowerCase().includes(keyword.toLowerCase()) ||
      (activity.description && activity.description.toLowerCase().includes(keyword.toLowerCase()))
    );
  }

  // 搜索场馆
  async searchVenues(keyword: string): Promise<Venue[]> {
    const allVenues = await this.getAllVenues();
    if (!keyword) return allVenues;

    return allVenues.filter(venue => 
      venue.name.toLowerCase().includes(keyword.toLowerCase()) ||
      venue.location.toLowerCase().includes(keyword.toLowerCase()) ||
      venue.sportType.toLowerCase().includes(keyword.toLowerCase()) ||
      (venue.description && venue.description.toLowerCase().includes(keyword.toLowerCase()))
    );
  }

  // ============ 用户历史记录 ============

  // 获取用户参与的活动
  async getUserActivities(userId: string): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.participants.includes(userId) || activity.publisherId === userId)
      .map(activity => activity.toJSON() as Activity)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // 获取用户发布的内容
  async getUserPublications(userId: string): Promise<any[]> {
    const activities = Array.from(this.activities.values())
      .filter(activity => activity.publisherId === userId)
      .map(activity => ({
        ...activity.toJSON(),
        type: 'activity'
      }));

    const venues = Array.from(this.venues.values())
      .filter(venue => venue.publisherId === userId)
      .map(venue => ({
        ...venue.toJSON(),
        type: 'venue'
      }));

    // 合并并按创建时间排序
    const allPublications = [...activities, ...venues];
    return allPublications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // ============ 辅助方法 ============

  // 计算预约价格
  private calculatePrice(hourlyPrice: number, startTime: string, endTime: string): number {
    const start = this.timeStringToMinutes(startTime);
    const end = this.timeStringToMinutes(endTime);
    const hours = (end - start) / 60;
    return hourlyPrice * hours;
  }

  private timeStringToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
