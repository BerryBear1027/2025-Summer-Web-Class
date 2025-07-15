// 活动相关实体
export interface IActivity {
  id: string;
  name: string;
  description?: string;
  location: string;
  startTime: Date;
  endTime: Date;
  maxParticipants: number;
  currentParticipants: number;
  image?: string;
  publisherId: string;
  publisherName: string;
  status: 'recruiting' | 'full' | 'ongoing' | 'completed' | 'cancelled' | 'deleted';
  dynamicStatus?: string; // 动态状态，用于前端显示
  participants: string[]; // 参与者用户ID数组
  participantDetails?: Array<{ id: string; username: string }>; // 参与者详细信息
  createdAt: Date;
  updatedAt: Date;
}

export class Activity implements IActivity {
  id: string;
  name: string;
  description?: string;
  location: string;
  startTime: Date;
  endTime: Date;
  maxParticipants: number;
  currentParticipants: number;
  image?: string;
  publisherId: string;
  publisherName: string;
  status: 'recruiting' | 'full' | 'ongoing' | 'completed' | 'cancelled' | 'deleted';
  dynamicStatus?: string;
  participants: string[];
  participantDetails?: Array<{ id: string; username: string }>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IActivity>) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.description = data.description;
    this.location = data.location || '';
    this.startTime = data.startTime || new Date();
    this.endTime = data.endTime || new Date();
    this.maxParticipants = data.maxParticipants || 1;
    this.currentParticipants = data.currentParticipants || 0;
    this.image = data.image;
    this.publisherId = data.publisherId || '';
    this.publisherName = data.publisherName || '';
    this.status = data.status || 'recruiting';
    this.participants = data.participants || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  private generateId(): string {
    return 'activity_' + Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      location: this.location,
      startTime: this.startTime,
      endTime: this.endTime,
      maxParticipants: this.maxParticipants,
      currentParticipants: this.currentParticipants,
      image: this.image,
      publisherId: this.publisherId,
      publisherName: this.publisherName,
      status: this.status,
      dynamicStatus: this.dynamicStatus,
      participants: this.participants,
      participantDetails: this.participantDetails,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

// 场馆相关实体
export interface IVenue {
  id: string;
  name: string;
  description?: string;
  location: string;
  sportType: string; // 运动类型：篮球、足球、羽毛球等
  capacity?: number; // 容量
  availableHours: string[]; // 可用小时，如 ["09:00", "10:00", "11:00", "14:00", "15:00"]
  price?: number; // 每小时价格
  image?: string;
  publisherId: string;
  publisherName: string;
  status: 'available' | 'maintenance' | 'closed' | 'deleted';
  dynamicStatus?: string; // 动态状态，用于前端显示
  bookings: string[]; // 预约记录ID数组
  createdAt: Date;
  updatedAt: Date;
}

export class Venue implements IVenue {
  id: string;
  name: string;
  description?: string;
  location: string;
  sportType: string;
  capacity?: number;
  availableHours: string[];
  price?: number;
  image?: string;
  publisherId: string;
  publisherName: string;
  status: 'available' | 'maintenance' | 'closed' | 'deleted';
  dynamicStatus?: string;
  bookings: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IVenue>) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.description = data.description;
    this.location = data.location || '';
    this.sportType = data.sportType || '';
    this.capacity = data.capacity;
    this.availableHours = data.availableHours || ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    this.price = data.price;
    this.image = data.image;
    this.publisherId = data.publisherId || '';
    this.publisherName = data.publisherName || '';
    this.status = data.status || 'available';
    this.bookings = data.bookings || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  private generateId(): string {
    return 'venue_' + Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      location: this.location,
      sportType: this.sportType,
      capacity: this.capacity,
      availableHours: this.availableHours,
      price: this.price,
      image: this.image,
      publisherId: this.publisherId,
      publisherName: this.publisherName,
      status: this.status,
      dynamicStatus: this.dynamicStatus,
      bookings: this.bookings,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

// 预约记录实体
export interface IBooking {
  id: string;
  venueId: string;
  venueName: string;
  userId: string;
  userName: string;
  bookingDate: Date;
  startTime: string; // 格式: "14:00"
  endTime: string;   // 格式: "16:00"
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Booking implements IBooking {
  id: string;
  venueId: string;
  venueName: string;
  userId: string;
  userName: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IBooking>) {
    this.id = data.id || this.generateId();
    this.venueId = data.venueId || '';
    this.venueName = data.venueName || '';
    this.userId = data.userId || '';
    this.userName = data.userName || '';
    this.bookingDate = data.bookingDate ? (typeof data.bookingDate === 'string' ? new Date(data.bookingDate) : data.bookingDate) : new Date();
    this.startTime = data.startTime || '09:00';
    this.endTime = data.endTime || '10:00';
    this.status = data.status || 'pending';
    this.totalPrice = data.totalPrice;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  private generateId(): string {
    return 'booking_' + Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  public toJSON() {
    return {
      id: this.id,
      venueId: this.venueId,
      venueName: this.venueName,
      userId: this.userId,
      userName: this.userName,
      bookingDate: this.bookingDate,
      startTime: this.startTime,
      endTime: this.endTime,
      status: this.status,
      totalPrice: this.totalPrice,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

// 评论实体
export interface IComment {
  id: string;
  targetId: string; // 活动或场馆ID
  targetType: 'activity' | 'venue';
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Comment implements IComment {
  id: string;
  targetId: string;
  targetType: 'activity' | 'venue';
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IComment>) {
    this.id = data.id || this.generateId();
    this.targetId = data.targetId || '';
    this.targetType = data.targetType || 'activity';
    this.userId = data.userId || '';
    this.userName = data.userName || '';
    this.content = data.content || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  private generateId(): string {
    return 'comment_' + Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  public toJSON() {
    return {
      id: this.id,
      targetId: this.targetId,
      targetType: this.targetType,
      userId: this.userId,
      userName: this.userName,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

// DTO定义
export interface CreateActivityDto {
  name: string;
  description?: string;
  location: string;
  startTime: Date;
  endTime: Date;
  maxParticipants: number;
  image?: string;
}

export interface CreateVenueDto {
  name: string;
  description?: string;
  location: string;
  sportType: string;
  availableTime: { start: string; end: string; };
  price?: number;
  image?: string;
}

export interface CreateBookingDto {
  venueId: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
}

export interface CreateCommentDto {
  targetId: string;
  targetType: 'activity' | 'venue';
  content: string;
}
