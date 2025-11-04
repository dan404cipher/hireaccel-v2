import mongoose, { Schema, Document } from 'mongoose';

/**
 * Analytics Event Document Interface
 */
export interface AnalyticsEventDocument extends Document {
  _id: mongoose.Types.ObjectId;
  eventName: string;
  page: string;
  referrer?: string;
  userId?: mongoose.Types.ObjectId;
  sessionId: string;
  timestamp: Date;
  eventData: Record<string, any>;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  duration?: number; // Session duration in seconds
}

/**
 * Analytics Event Model Interface
 */
export interface AnalyticsEventModel extends mongoose.Model<AnalyticsEventDocument> {
  // Static methods can be added here if needed
}

/**
 * Analytics Event Schema
 */
const analyticsEventSchema = new Schema<AnalyticsEventDocument>(
  {
    eventName: {
      type: String,
      required: [true, 'Event name is required'],
      index: true,
    },
    page: {
      type: String,
      required: [true, 'Page URL is required'],
      index: true,
    },
    referrer: {
      type: String,
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    eventData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    utm: {
      source: String,
      medium: String,
      campaign: String,
    },
    duration: {
      type: Number,
      default: null, // Session duration in seconds
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Create indexes for common queries
analyticsEventSchema.index({ sessionId: 1, timestamp: 1 });
analyticsEventSchema.index({ eventName: 1, timestamp: 1 });
analyticsEventSchema.index({ userId: 1, timestamp: 1 });
analyticsEventSchema.index({ 'utm.source': 1, timestamp: 1 });
analyticsEventSchema.index({ timestamp: -1 });

// Export the model
export const AnalyticsEvent = mongoose.model<AnalyticsEventDocument, AnalyticsEventModel>(
  'AnalyticsEvent',
  analyticsEventSchema
);

