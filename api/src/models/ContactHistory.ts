import mongoose, { Schema, Document } from 'mongoose';

/**
 * Contact History model interface
 */
export interface ContactHistoryDocument extends Document {
  _id: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  contactType: 'hr' | 'candidate';
  contactId: mongoose.Types.ObjectId; // HR User ID or Candidate ID
  contactMethod: 'phone' | 'email' | 'meeting' | 'whatsapp' | 'other';
  subject: string;
  notes: string;
  duration?: number; // in minutes
  outcome?: 'positive' | 'neutral' | 'negative' | 'follow_up_required';
  followUpDate?: Date;
  followUpNotes?: string;
  tags?: string[];
  attachments?: mongoose.Types.ObjectId[]; // File IDs
  relatedJobId?: mongoose.Types.ObjectId;
  relatedCandidateAssignmentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

/**
 * Contact History model interface with static methods
 */
export interface ContactHistoryModel extends mongoose.Model<ContactHistoryDocument> {
  getContactHistoryForAgent(agentId: mongoose.Types.ObjectId, options?: any): Promise<ContactHistoryDocument[]>;
  getContactHistoryForContact(contactType: 'hr' | 'candidate', contactId: mongoose.Types.ObjectId, options?: any): Promise<ContactHistoryDocument[]>;
  getContactHistoryStats(agentId?: mongoose.Types.ObjectId, dateRange?: { start: Date; end: Date }): Promise<any>;
}

/**
 * Contact History schema
 */
const contactHistorySchema = new Schema<ContactHistoryDocument>(
  {
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Agent ID is required'],
      index: true,
    },
    contactType: {
      type: String,
      enum: ['hr', 'candidate'],
      required: [true, 'Contact type is required'],
      index: true,
    },
    contactId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Contact ID is required'],
      refPath: function(this: ContactHistoryDocument) {
        return this.contactType === 'hr' ? 'User' : 'Candidate';
      },
      index: true,
    },
    contactMethod: {
      type: String,
      enum: ['phone', 'email', 'meeting', 'whatsapp', 'other'],
      required: [true, 'Contact method is required'],
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    notes: {
      type: String,
      required: [true, 'Notes are required'],
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
    },
    duration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
      max: [1440, 'Duration cannot exceed 1440 minutes (24 hours)'],
    },
    outcome: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'follow_up_required'],
      index: true,
    },
    followUpDate: {
      type: Date,
      index: true,
    },
    followUpNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Follow-up notes cannot exceed 2000 characters'],
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, 'Tag cannot exceed 50 characters'],
    }],
    attachments: [{
      type: Schema.Types.ObjectId,
      ref: 'File',
    }],
    relatedJobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      index: true,
    },
    relatedCandidateAssignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'CandidateAssignment',
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for efficient queries
contactHistorySchema.index({ agentId: 1, createdAt: -1 });
contactHistorySchema.index({ contactType: 1, contactId: 1, createdAt: -1 });
contactHistorySchema.index({ relatedJobId: 1 });
contactHistorySchema.index({ followUpDate: 1 });
contactHistorySchema.index({ outcome: 1 });

/**
 * Static method: Get contact history for an agent
 */
contactHistorySchema.statics.getContactHistoryForAgent = function(
  agentId: mongoose.Types.ObjectId,
  options: any = {}
) {
  const { page = 1, limit = 20, contactType, dateFrom, dateTo } = options;
  const skip = (page - 1) * limit;

  const query: any = { agentId };

  if (contactType) {
    query.contactType = contactType;
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = dateFrom;
    if (dateTo) query.createdAt.$lte = dateTo;
  }

  return this.find(query)
    .populate('agentId', 'firstName lastName email customId')
    .populate('contactId')
    .populate('relatedJobId', 'title companyId')
    .populate('relatedCandidateAssignmentId', 'status priority')
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Static method: Get contact history for a specific contact (HR or Candidate)
 */
contactHistorySchema.statics.getContactHistoryForContact = function(
  contactType: 'hr' | 'candidate',
  contactId: mongoose.Types.ObjectId,
  options: any = {}
) {
  const { page = 1, limit = 20, dateFrom, dateTo } = options;
  const skip = (page - 1) * limit;

  const query: any = {
    contactType,
    contactId,
  };

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = dateFrom;
    if (dateTo) query.createdAt.$lte = dateTo;
  }

  return this.find(query)
    .populate('agentId', 'firstName lastName email customId')
    .populate('contactId')
    .populate('relatedJobId', 'title companyId')
    .populate('relatedCandidateAssignmentId', 'status priority')
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Static method: Get contact history statistics
 */
contactHistorySchema.statics.getContactHistoryStats = async function(
  agentId?: mongoose.Types.ObjectId,
  dateRange?: { start: Date; end: Date }
) {
  const query: any = {};
  if (agentId) {
    query.agentId = agentId;
  }
  if (dateRange) {
    query.createdAt = {
      $gte: dateRange.start,
      $lte: dateRange.end,
    };
  }

  const [
    total,
    byType,
    byMethod,
    byOutcome,
    upcomingFollowUps,
  ] = await Promise.all([
    this.countDocuments(query),
    this.aggregate([
      { $match: query },
      { $group: { _id: '$contactType', count: { $sum: 1 } } },
    ]),
    this.aggregate([
      { $match: query },
      { $group: { _id: '$contactMethod', count: { $sum: 1 } } },
    ]),
    this.aggregate([
      { $match: { ...query, outcome: { $exists: true } } },
      { $group: { _id: '$outcome', count: { $sum: 1 } } },
    ]),
    this.countDocuments({
      ...query,
      followUpDate: { $gte: new Date() },
    }),
  ]);

  return {
    total,
    byType: byType.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byMethod: byMethod.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byOutcome: byOutcome.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    upcomingFollowUps,
  };
};

export const ContactHistory = mongoose.model<ContactHistoryDocument, ContactHistoryModel>(
  'ContactHistory',
  contactHistorySchema
);

