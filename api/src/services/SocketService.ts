import { Server as SocketIOServer } from 'socket.io';
import { logger } from '@/config/logger';
import { INotification } from '@/types/notifications';

export class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  /**
   * Initialize the Socket.IO instance
   */
  public initialize(io: SocketIOServer): void {
    this.io = io;
    logger.info('SocketService initialized');
  }

  /**
   * Emit notification to specific user
   */
  public emitNotificationToUser(userId: string, notification: INotification): void {
    if (!this.io) {
      logger.warn('SocketService not initialized, cannot emit notification');
      return;
    }

    try {
      this.io.to(`user:${userId}`).emit('notification:new', notification);
      logger.debug('Emitted notification to user', { userId, notificationId: notification._id });
    } catch (error) {
      logger.error('Failed to emit notification to user', { error, userId });
    }
  }

  /**
   * Emit notification to all users with specific role
   */
  public emitNotificationToRole(role: string, notification: INotification): void {
    if (!this.io) {
      logger.warn('SocketService not initialized, cannot emit notification');
      return;
    }

    try {
      this.io.to(`role:${role}`).emit('notification:new', notification);
      logger.debug('Emitted notification to role', { role, notificationId: notification._id });
    } catch (error) {
      logger.error('Failed to emit notification to role', { error, role });
    }
  }

  /**
   * Emit notification to all connected users
   */
  public emitNotificationToAll(notification: INotification): void {
    if (!this.io) {
      logger.warn('SocketService not initialized, cannot emit notification');
      return;
    }

    try {
      this.io.emit('notification:new', notification);
      logger.debug('Emitted notification to all users', { notificationId: notification._id });
    } catch (error) {
      logger.error('Failed to emit notification to all users', { error });
    }
  }

  /**
   * Emit unread count update to specific user
   */
  public emitUnreadCountUpdate(userId: string, count: number): void {
    if (!this.io) {
      logger.warn('SocketService not initialized, cannot emit unread count update');
      return;
    }

    try {
      this.io.to(`user:${userId}`).emit('notification:unread-count', { count });
      logger.debug('Emitted unread count update to user', { userId, count });
    } catch (error) {
      logger.error('Failed to emit unread count update to user', { error, userId });
    }
  }

  /**
   * Get connected users count
   */
  public getConnectedUsersCount(): number {
    if (!this.io) {
      return 0;
    }
    return this.io.sockets.sockets.size;
  }

  /**
   * Get connected users by role
   */
  public getConnectedUsersByRole(role: string): number {
    if (!this.io) {
      return 0;
    }

    const room = this.io.sockets.adapter.rooms.get(`role:${role}`);
    return room ? room.size : 0;
  }
}
