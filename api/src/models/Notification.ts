import mongoose, { Schema, Document } from 'mongoose';
import { INotification, NotificationType, NotificationPriority } from '@/types/notifications';
import { UserRole } from '@/types';

/**
 * Notification model interface extending Mongoose Document
 */
export interface NotificationDocument extends Omit<INotification, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

/**
 * Notification model interface with static methods
 */
export interface NotificationModel extends mongoose.Model<NotificationDocument> {
  findByRecipient(recipientId: string, options?: any): Promise<NotificationDocument[]>;
  findByRecipientAndRole(recipientId: string, role: UserRole, options?: any): Promise<NotificationDocument[]>;
  getUnreadCount(recipientId: string): Promise<number>;
  markAsRead(notificationId: string, recipientId: string): Promise<NotificationDocument | null>;
  markAllAsRead(recipientId: string): Promise<number>;
  archiveNotification(notificationId: string, recipientId: string): Promise<NotificationDocument | null>;
  deleteExpiredNotifications(): Promise<number>;
}

/**
 * Notification schema definition
 * Represents notifications sent to users in the system
 */
const notificationSchema = new Schema<NotificationDocument>({
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  recipientId: {
    type: String,
    required: [true, 'Recipient ID is required'],
    index: true
  },
  recipientRole: {
    type: String,
    enum: Object.values(UserRole),
    required: [true, 'Recipient role is required'],
    index: true
  },
  entityType: {
    type: String,
    required: [true, 'Entity type is required'],
    trim: true
  },
  entityId: {
    type: String,
    required: [true, 'Entity ID is required'],
    trim: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: String,
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.MEDIUM,
    index: true
  },
  actionUrl: {
    type: String,
    trim: true
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // TTL index
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isArchived: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, type: 1, createdAt: -1 });
notificationSchema.index({ entityType: 1, entityId: 1 });

/**
 * Static method to find notifications by recipient
 */
notificationSchema.statics['findByRecipient'] = async function(
  recipientId: string, 
  options: { 
    limit?: number; 
    offset?: number; 
    includeArchived?: boolean;
    type?: NotificationType;
  } = {}
): Promise<NotificationDocument[]> {
  const { limit = 20, offset = 0, includeArchived = false, type } = options;
  
  const query: any = { recipientId };
  
  if (!includeArchived) {
    query.isArchived = false;
  }
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();
};

/**
 * Static method to find notifications by recipient and role
 */
notificationSchema.statics['findByRecipientAndRole'] = async function(
  recipientId: string,
  role: UserRole,
  options: any = {}
): Promise<NotificationDocument[]> {
  return (this as any)['findByRecipient'](recipientId, { ...options, role });
};

/**
 * Static method to get unread count for a recipient
 */
notificationSchema.statics['getUnreadCount'] = async function(
  recipientId: string
): Promise<number> {
  return this.countDocuments({
    recipientId,
    isRead: false,
    isArchived: false
  });
};

/**
 * Static method to mark notification as read
 */
notificationSchema.statics['markAsRead'] = async function(
  notificationId: string,
  recipientId: string
): Promise<NotificationDocument | null> {
  return this.findOneAndUpdate(
    { _id: notificationId, recipientId },
    { isRead: true },
    { new: true }
  );
};

/**
 * Static method to mark all notifications as read for a recipient
 */
notificationSchema.statics['markAllAsRead'] = async function(
  recipientId: string
): Promise<number> {
  const result = await this.updateMany(
    { recipientId, isRead: false },
    { isRead: true }
  );
  return result.modifiedCount;
};

/**
 * Static method to archive a notification
 */
notificationSchema.statics['archiveNotification'] = async function(
  notificationId: string,
  recipientId: string
): Promise<NotificationDocument | null> {
  return this.findOneAndUpdate(
    { _id: notificationId, recipientId },
    { isArchived: true },
    { new: true }
  );
};

/**
 * Static method to delete expired notifications
 */
notificationSchema.statics['deleteExpiredNotifications'] = async function(): Promise<number> {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  return result.deletedCount || 0;
};

// Create and export the model
export const Notification = mongoose.model<NotificationDocument, NotificationModel>('Notification', notificationSchema);
