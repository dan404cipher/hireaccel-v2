import mongoose, { Schema, Document } from 'mongoose';
import { 
  Application as IApplication, 
  ApplicationStatus, 
  ApplicationStage 
} from '@/types';

/**
 * Application model interface extending Mongoose Document
 */
export interface ApplicationDocument extends Omit<IApplication, '_id' | 'candidateId' | 'jobId' | 'documents' | 'notes'>, Document {
  _id: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  documents: mongoose.Types.ObjectId[];
  
  // Additional properties that exist in schema but not in base interface
  notes: Array<{
    content: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    isInternal: boolean;
  }>;
  stageHistory: Array<{
    stage: string;
    status: string;
    timestamp: Date;
    movedBy: mongoose.Types.ObjectId;
    note?: string | undefined;
  }>;
  
  // Instance methods
  advanceStage(newStage: ApplicationStage, newStatus: ApplicationStatus, movedBy: mongoose.Types.ObjectId, note?: string): void;
  reject(reason: string, rejectedBy: mongoose.Types.ObjectId): void;
  scheduledInterviews: mongoose.Types.ObjectId[];
  source: string;
  referredBy?: mongoose.Types.ObjectId;
  communicationPreference: string;
  offerDetails?: {
    salary: {
      amount: number;
      currency: string;
    };
    startDate?: Date;
    benefits: string[];
    additionalTerms?: string | undefined;
    offerSentAt?: Date;
    offerExpiresAt?: Date;
    respondedAt?: Date;
    response?: string;
  };
  viewedByEmployer: boolean;
  viewedAt?: Date;
  lastActivityAt: Date;
  
  // Instance methods
  addNote(content: string, createdBy: mongoose.Types.ObjectId, isInternal?: boolean): void;
  withdrawApplication(reason?: string): void;
  sendOffer(offerData: any): void;
  respondToOffer(response: string, note?: string): void;
  markAsViewed(): void;
}

export interface ApplicationModel extends mongoose.Model<ApplicationDocument> {
  searchApplications(options?: any): Promise<ApplicationDocument[]>;
  getApplicationsByStage(stage: ApplicationStage, options?: any): Promise<ApplicationDocument[]>;
  getCandidateApplications(candidateId: mongoose.Types.ObjectId, options?: any): Promise<ApplicationDocument[]>;
  getStaleApplications(days?: number): Promise<ApplicationDocument[]>;
  getOfferStats(dateRange?: { start: Date; end: Date }): Promise<any>;
}

/**
 * Application note sub-schema
 */
const applicationNoteSchema = new Schema({
  content: {
    type: String,
    required: [true, 'Note content is required'],
    maxlength: [1000, 'Note cannot exceed 1000 characters'],
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Note creator is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isInternal: {
    type: Boolean,
    default: false, // false = visible to candidate, true = internal only
  },
}, { _id: true });

/**
 * Application stage history sub-schema
 */
const stageHistorySchema = new Schema({
  stage: {
    type: String,
    enum: Object.values(ApplicationStage),
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(ApplicationStatus),
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  movedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  note: {
    type: String,
    maxlength: [500, 'Stage note cannot exceed 500 characters'],
  },
}, { _id: false });

/**
 * Main application schema
 */
const applicationSchema = new Schema<ApplicationDocument>({
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: 'Candidate',
    required: [true, 'Candidate reference is required'],
    index: true,
  },
  
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job reference is required'],
    index: true,
  },
  
  status: {
    type: String,
    enum: {
      values: Object.values(ApplicationStatus),
      message: 'Status must be one of: {VALUES}'
    },
    default: ApplicationStatus.SUBMITTED,
    index: true,
  },
  
  stage: {
    type: String,
    enum: {
      values: Object.values(ApplicationStage),
      message: 'Stage must be one of: {VALUES}'
    },
    default: ApplicationStage.APPLIED,
    index: true,
  },
  
  appliedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  
  notes: [applicationNoteSchema],
  
  documents: [{
    type: Schema.Types.ObjectId,
    ref: 'File',
  }],
  
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    index: true,
  },
  
  feedback: {
    type: String,
    maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
  },
  
  rejectionReason: {
    type: String,
    maxlength: [1000, 'Rejection reason cannot exceed 1000 characters'],
  },
  
  // Stage progression tracking
  stageHistory: [stageHistorySchema],
  
  // Interview scheduling information
  scheduledInterviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Interview',
  }],
  
  // Offer information
  offerDetails: {
    salary: {
      amount: {
        type: Number,
        min: [0, 'Salary amount cannot be negative'],
      },
      currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      },
    },
    startDate: Date,
    benefits: [String],
    additionalTerms: {
      type: String,
      maxlength: [1000, 'Additional terms cannot exceed 1000 characters'],
    },
    offerSentAt: Date,
    offerExpiresAt: Date,
    respondedAt: Date,
    response: {
      type: String,
      enum: ['accepted', 'rejected', 'negotiating'],
    },
  },
  
  // Application source tracking
  source: {
    type: String,
    enum: ['direct_apply', 'referral', 'recruiter', 'job_board', 'linkedin', 'company_website'],
    default: 'direct_apply',
  },
  
  referredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // Tracking and analytics
  viewedByEmployer: {
    type: Boolean,
    default: false,
  },
  
  viewedAt: Date,
  
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
  
  // Communication preferences
  communicationPreference: {
    type: String,
    enum: ['email', 'phone', 'both'],
    default: 'email',
  },
  
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(_doc, ret: any) {
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
  },
});

// ============================================================================
// Indexes
// ============================================================================

// Compound indexes for common queries
applicationSchema.index({ candidateId: 1, status: 1 });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ status: 1, stage: 1 });
applicationSchema.index({ appliedAt: -1, status: 1 });
applicationSchema.index({ rating: -1, status: 1 });
applicationSchema.index({ lastActivityAt: -1 });

// Unique constraint - candidate can only apply once per job
applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

// Text index for search functionality
applicationSchema.index({
  'notes.content': 'text',
  feedback: 'text',
  rejectionReason: 'text',
});

// ============================================================================
// Virtual Properties
// ============================================================================

/**
 * Check if application is active
 */
applicationSchema.virtual('isActive').get(function(this: ApplicationDocument) {
  return ![
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN,
    ApplicationStatus.ACCEPTED
  ].includes(this.status);
});

/**
 * Days since application
 */
applicationSchema.virtual('daysSinceApplied').get(function(this: ApplicationDocument) {
  const now = new Date();
  const applied = new Date(this.appliedAt);
  const diffTime = Math.abs(now.getTime() - applied.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

/**
 * Current stage progress percentage
 */
applicationSchema.virtual('stageProgress').get(function(this: ApplicationDocument) {
  const stageOrder = [
    ApplicationStage.APPLIED,
    ApplicationStage.SCREENING,
    ApplicationStage.TECHNICAL,
    ApplicationStage.FINAL,
    ApplicationStage.OFFER,
    ApplicationStage.HIRED,
  ];
  
  const currentIndex = stageOrder.indexOf(this.stage);
  return currentIndex >= 0 ? Math.round(((currentIndex + 1) / stageOrder.length) * 100) : 0;
});

/**
 * Check if offer is pending
 */
applicationSchema.virtual('hasOfferPending').get(function(this: ApplicationDocument) {
  return this.stage === ApplicationStage.OFFER && 
         this.offerDetails?.offerSentAt && 
         !this.offerDetails?.respondedAt;
});

/**
 * Check if offer is expired
 */
applicationSchema.virtual('isOfferExpired').get(function(this: ApplicationDocument) {
  return this.offerDetails?.offerExpiresAt && 
         new Date() > new Date(this.offerDetails.offerExpiresAt);
});

/**
 * Total number of interviews
 */
applicationSchema.virtual('interviewCount').get(function(this: ApplicationDocument) {
  return this.scheduledInterviews ? this.scheduledInterviews.length : 0;
});

// ============================================================================
// Instance Methods
// ============================================================================

/**
 * Add a note to the application
 */
applicationSchema.methods['addNote'] = function(
  this: ApplicationDocument, 
  content: string, 
  createdBy: mongoose.Types.ObjectId,
  isInternal = false
) {
  this.notes.push({
    content,
    createdBy,
    createdAt: new Date(),
    isInternal: isInternal || false,
  });
  this.lastActivityAt = new Date();
};

/**
 * Advance application to next stage
 */
applicationSchema.methods['advanceStage'] = function(
  this: ApplicationDocument,
  newStage: ApplicationStage,
  newStatus: ApplicationStatus,
  movedBy: mongoose.Types.ObjectId,
  note?: string
) {
  // Validate stage progression
  const stageOrder = [
    ApplicationStage.APPLIED,
    ApplicationStage.SCREENING,
    ApplicationStage.TECHNICAL,
    ApplicationStage.FINAL,
    ApplicationStage.OFFER,
    ApplicationStage.HIRED,
  ];
  
  const currentIndex = stageOrder.indexOf(this.stage);
  const newIndex = stageOrder.indexOf(newStage);
  
  // Allow moving to the next stage or any previous stage (for corrections)
  if (newIndex > currentIndex + 1) {
    throw new Error(`Cannot skip stages. Current: ${this.stage}, Attempted: ${newStage}`);
  }
  
  // Record stage history
  this.stageHistory.push({
    stage: newStage,
    status: newStatus,
    timestamp: new Date(),
    movedBy,
    note: note || undefined,
  });
  
  // Update current stage and status
  this.stage = newStage;
  this.status = newStatus;
  this.lastActivityAt = new Date();
};

/**
 * Reject application
 */
applicationSchema.methods['reject'] = function(
  this: ApplicationDocument,
  reason: string,
  rejectedBy: mongoose.Types.ObjectId
) {
  this.status = ApplicationStatus.REJECTED;
  this.rejectionReason = reason;
  this.lastActivityAt = new Date();
  
  // Add to stage history
  this.stageHistory.push({
    stage: this.stage,
    status: ApplicationStatus.REJECTED,
    timestamp: new Date(),
    movedBy: rejectedBy,
    note: `Rejected: ${reason}`,
  });
};

/**
 * Withdraw application
 */
applicationSchema.methods['withdraw'] = function(this: ApplicationDocument, reason?: string) {
  this.status = ApplicationStatus.WITHDRAWN;
  this.lastActivityAt = new Date();
  
  if (reason) {
    this.addNote(`Application withdrawn: ${reason}`, this.candidateId, false);
  }
};

/**
 * Send offer
 */
applicationSchema.methods['sendOffer'] = function(
  this: ApplicationDocument,
  offerDetails: {
    salary: { amount: number; currency?: string };
    startDate: Date;
    benefits?: string[];
    additionalTerms?: string;
    expiresAt: Date;
  },
  sentBy: mongoose.Types.ObjectId
) {
  this.stage = ApplicationStage.OFFER;
  this.status = ApplicationStatus.OFFER;
  
  this.offerDetails = {
    salary: {
      amount: offerDetails.salary.amount,
      currency: offerDetails.salary.currency || 'USD',
    },
    startDate: offerDetails.startDate,
    benefits: offerDetails.benefits || [],
    additionalTerms: offerDetails.additionalTerms || undefined,
    offerSentAt: new Date(),
    offerExpiresAt: offerDetails.expiresAt,
  };
  
  this.lastActivityAt = new Date();
  
  // Add to stage history
  this.stageHistory.push({
    stage: ApplicationStage.OFFER,
    status: ApplicationStatus.OFFER,
    timestamp: new Date(),
    movedBy: sentBy,
    note: `Offer sent with salary ${offerDetails.salary.amount} ${offerDetails.salary.currency || 'USD'}`,
  });
};

/**
 * Respond to offer
 */
applicationSchema.methods['respondToOffer'] = function(
  this: ApplicationDocument,
  response: 'accepted' | 'rejected' | 'negotiating',
  note?: string
) {
  if (!this.offerDetails?.offerSentAt) {
    throw new Error('No offer has been sent');
  }
  
  this.offerDetails.response = response;
  this.offerDetails.respondedAt = new Date();
  
  switch (response) {
    case 'accepted':
      this.status = ApplicationStatus.ACCEPTED;
      this.stage = ApplicationStage.HIRED;
      break;
    case 'rejected':
      this.status = ApplicationStatus.REJECTED;
      this.rejectionReason = 'Offer rejected by candidate';
      break;
    case 'negotiating':
      this.status = ApplicationStatus.OFFER; // Keep in offer stage
      break;
  }
  
  this.lastActivityAt = new Date();
  
  if (note) {
    this.addNote(`Offer ${response}: ${note}`, this.candidateId, false);
  }
};

/**
 * Mark as viewed by employer
 */
applicationSchema.methods['markAsViewed'] = function(this: ApplicationDocument) {
  this.viewedByEmployer = true;
  this.viewedAt = new Date();
};

// ============================================================================
// Static Methods
// ============================================================================

/**
 * Search applications with filters
 */
applicationSchema.statics['searchApplications'] = function(options: any = {}) {
  const {
    candidateId,
    jobId,
    status,
    stage,
    rating,
    dateRange,
    limit = 20,
    skip = 0,
    sort = { appliedAt: -1 }
  } = options;
  
  const query: any = {};
  
  if (candidateId) query.candidateId = candidateId;
  if (jobId) query.jobId = jobId;
  if (status) {
    query.status = Array.isArray(status) ? { $in: status } : status;
  }
  if (stage) {
    query.stage = Array.isArray(stage) ? { $in: stage } : stage;
  }
  if (rating) query.rating = { $gte: rating };
  
  if (dateRange) {
    const { start, end } = dateRange;
    query.appliedAt = {};
    if (start) query.appliedAt.$gte = new Date(start);
    if (end) query.appliedAt.$lte = new Date(end);
  }
  
  return this.find(query)
    .populate({
      path: 'candidateId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email',
      },
    })
    .populate('jobId', 'title company status urgency')
    .populate('notes.createdBy', 'firstName lastName')
    .populate('stageHistory.movedBy', 'firstName lastName')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

/**
 * Get applications by stage
 */
applicationSchema.statics['getApplicationsByStage'] = function(stage: ApplicationStage, options: any = {}) {
  const { jobId, limit = 20, skip = 0 } = options;
  
  const query: any = { stage };
  if (jobId) query.jobId = jobId;
  
  return this.find(query)
    .populate('candidateId')
    .populate('jobId', 'title company')
    .sort({ lastActivityAt: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Get candidate's applications
 */
applicationSchema.statics['getCandidateApplications'] = function(
  candidateId: mongoose.Types.ObjectId, 
  options: any = {}
) {
  const { status, limit = 20, skip = 0 } = options;
  
  const query: any = { candidateId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('jobId')
    .populate('scheduledInterviews')
    .sort({ appliedAt: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Get applications requiring attention (stale applications)
 */
applicationSchema.statics['getStaleApplications'] = function(days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    status: { $in: [ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.INTERVIEW] },
    lastActivityAt: { $lt: cutoffDate },
  })
  .populate('candidateId')
  .populate('jobId', 'title company urgency')
  .sort({ lastActivityAt: 1 });
};

/**
 * Get offer statistics
 */
applicationSchema.statics['getOfferStats'] = function(dateRange?: { start: Date; end: Date }) {
  const pipeline: any[] = [
    {
      $match: {
        stage: ApplicationStage.OFFER,
        ...(dateRange && {
          'offerDetails.offerSentAt': {
            $gte: dateRange.start,
            $lte: dateRange.end,
          },
        }),
      },
    },
    {
      $group: {
        _id: '$offerDetails.response',
        count: { $sum: 1 },
        avgSalary: { $avg: '$offerDetails.salary.amount' },
      },
    },
  ];
  
  return this.aggregate(pipeline);
};

// ============================================================================
// Middleware (Hooks)
// ============================================================================

/**
 * Pre-save middleware
 */
applicationSchema.pre('save', function(this: ApplicationDocument, next) {
  // Update last activity on any change
  if (this.isModified() && !this.isModified('lastActivityAt')) {
    this.lastActivityAt = new Date();
  }
  
  // Validate offer expiration date
  if (this.isModified('offerDetails.offerExpiresAt') && this.offerDetails?.offerExpiresAt) {
    const now = new Date();
    const expiry = new Date(this.offerDetails.offerExpiresAt);
    
    if (expiry <= now) {
      return next(new Error('Offer expiration date must be in the future'));
    }
  }
  
  next();
});

/**
 * Post-save middleware to update related models
 */
applicationSchema.post('save', async function(this: ApplicationDocument) {
  try {
    // Update job application count
    if (this.isNew) {
      await mongoose.model('Job').findByIdAndUpdate(
        this.jobId,
        { $inc: { applications: 1 } }
      );
    }
    
    // Update candidate last activity
    await mongoose.model('Candidate').findByIdAndUpdate(
      this.candidateId,
      { lastActivityAt: new Date() }
    );
    
  } catch (error) {
    console.error('Error updating related models:', error);
  }
});

// ============================================================================
// Model Export
// ============================================================================

export const Application = mongoose.model<ApplicationDocument, ApplicationModel>('Application', applicationSchema);
