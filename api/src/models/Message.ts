import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@/types';

/**
 * Message model interface extending Mongoose Document
 */
export interface MessageDocument extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderRole: UserRole;
  content: string;
  messageType: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  readBy: Array<{
    userId: mongoose.Types.ObjectId;
    readAt: Date;
  }>;
  isDeleted: boolean;
  deletedAt?: Date;
  replyTo?: mongoose.Types.ObjectId; // Reference to another message
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Conversation model interface extending Mongoose Document
 */
export interface ConversationDocument extends Document {
  _id: mongoose.Types.ObjectId;
  participants: Array<{
    userId: mongoose.Types.ObjectId;
    role: UserRole;
    joinedAt: Date;
    lastReadAt?: Date;
    isActive: boolean;
  }>;
  conversationType: 'direct' | 'group';
  title?: string; // For group conversations
  createdBy: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageAt?: Date;
  isArchived: boolean;
  archivedBy?: mongoose.Types.ObjectId;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message schema definition
 */
const messageSchema = new Schema<MessageDocument>({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: [true, 'Conversation ID is required'],
    index: true
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required'],
    index: true
  },
  senderRole: {
    type: String,
    enum: Object.values(UserRole),
    required: [true, 'Sender role is required']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'system'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readBy: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Conversation schema definition
 */
const conversationSchema = new Schema<ConversationDocument>({
  participants: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastReadAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  conversationType: {
    type: String,
    enum: ['direct', 'group'],
    required: true,
    default: 'direct'
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  archivedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  archivedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ isRead: 1, conversationId: 1 });

conversationSchema.index({ 'participants.userId': 1, isArchived: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ conversationType: 1, createdAt: -1 });

/**
 * Static method to find or create a direct conversation
 */
conversationSchema.statics['findOrCreateDirectConversation'] = async function(
  userId1: mongoose.Types.ObjectId,
  userId2: mongoose.Types.ObjectId
): Promise<ConversationDocument> {
  // Check if conversation already exists
  const existing = await this.findOne({
    conversationType: 'direct',
    participants: {
      $all: [
        { $elemMatch: { userId: userId1 } },
        { $elemMatch: { userId: userId2 } }
      ]
    },
    isArchived: false
  });

  if (existing) {
    return existing;
  }

  // Get user roles
  const { User } = await import('@/models/User');
  const user1 = await User.findById(userId1);
  const user2 = await User.findById(userId2);

  if (!user1 || !user2) {
    throw new Error('One or both users not found');
  }

  // Create new conversation
  return this.create({
    conversationType: 'direct',
    participants: [
      { userId: userId1, role: user1.role },
      { userId: userId2, role: user2.role }
    ],
    createdBy: userId1
  });
};

/**
 * Static method to get unread message count for a user
 */
messageSchema.statics['getUnreadCount'] = async function(
  userId: mongoose.Types.ObjectId,
  conversationId?: mongoose.Types.ObjectId
): Promise<number> {
  const query: any = {
    isDeleted: false,
    readBy: { $not: { $elemMatch: { userId } } }
  };

  if (conversationId) {
    query.conversationId = conversationId;
  }
  // TODO: Implement Conversation model to enable unread count across all conversations
  // else {
  //   // Get all conversations where user is a participant
  //   const { Conversation } = await import('@/models/Conversation');
  //   const conversations = await Conversation.find({
  //     'participants.userId': userId,
  //     isArchived: false
  //   }).select('_id');
  //   
  //   query.conversationId = { $in: conversations.map(c => c._id) };
  // }

  return this.countDocuments(query);
};

export interface ConversationModel extends mongoose.Model<ConversationDocument> {
  findOrCreateDirectConversation(
    userId1: mongoose.Types.ObjectId,
    userId2: mongoose.Types.ObjectId
  ): Promise<ConversationDocument>;
}

export interface MessageModel extends mongoose.Model<MessageDocument> {
  getUnreadCount(
    userId: mongoose.Types.ObjectId,
    conversationId?: mongoose.Types.ObjectId
  ): Promise<number>;
}

// Create and export the models
export const Conversation = mongoose.model<ConversationDocument, ConversationModel>('Conversation', conversationSchema);
export const Message = mongoose.model<MessageDocument, MessageModel>('Message', messageSchema);

