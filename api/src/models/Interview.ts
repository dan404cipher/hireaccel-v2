import mongoose, { Schema, Document } from 'mongoose';
import { 
  Interview as IInterview, 
  InterviewType, 
  InterviewStatus, 
  InterviewRound 
} from '@/types';

/**
 * Interview model interface extending Mongoose Document
 */
export interface InterviewDocument extends Omit<IInterview, '_id' | 'applicationId' | 'interviewers' | 'createdBy' | 'notes'>, Document {
  _id: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  interviewers: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  
  // Override notes to match schema structure
  notes: {
    content: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    isPrivate: boolean;
  }[];
  
  // Additional properties that exist in schema
  interviewerFeedback: {
    interviewer: mongoose.Types.ObjectId;
    rating: number;
    recommendation: string;
    strengths: string;
    weaknesses: string;
    comments: string;
    submittedAt: Date;
  }[];
  meetingDetails?: {
    platform: string;
    roomNumber?: string;
    dialInNumber?: string;
    meetingId?: string;
    passcode?: string;
  };
  preparationMaterials: {
    title: string;
    description?: string;
    fileId?: mongoose.Types.ObjectId;
    url?: string;
    type: string;
  }[];
  questions: {
    question: string;
    type: string;
    expectedAnswer?: string;
    timeAllowed?: number;
  }[];
  rescheduleHistory: {
    previousTime: Date;
    newTime: Date;
    reason: string;
    rescheduledBy: mongoose.Types.ObjectId;
    rescheduledAt: Date;
  }[];
  actualStartTime?: Date;
  actualEndTime?: Date;
  followUpActions: {
    action: string;
    assignedTo?: mongoose.Types.ObjectId;
    dueDate?: Date;
    completed: boolean;
    completedAt?: Date;
  }[];
  
  // Virtual properties
  averageRating: number;
  overallRecommendation: string;
  
  // Instance methods
  addNote(content: string, createdBy: mongoose.Types.ObjectId, isPrivate: boolean): void;
  reschedule(newTime: Date, reason: string, rescheduledBy: mongoose.Types.ObjectId): void;
  startInterview(): void;
  completeInterview(): void;
  cancelInterview(reason?: string): void;
  addInterviewerFeedback(feedback: any): void;
  updateOverallRating(): void;
  addFollowUpAction(action: string, assignedTo?: mongoose.Types.ObjectId, dueDate?: Date): void;
}

/**
 * Interview feedback sub-schema
 */
const feedbackSchema = new Schema({
  interviewer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  comments: {
    type: String,
    maxlength: [2000, 'Comments cannot exceed 2000 characters'],
  },
  recommendation: {
    type: String,
    enum: ['hire', 'no_hire', 'maybe', 'next_round'],
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

/**
 * Main interview schema
 */
const interviewSchema = new Schema<InterviewDocument>({
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: [true, 'Application reference is required'],
    index: true,
  },
  
  type: {
    type: String,
    enum: {
      values: Object.values(InterviewType),
      message: 'Interview type must be one of: {VALUES}'
    },
    required: [true, 'Interview type is required'],
    index: true,
  },
  
  round: {
    type: String,
    enum: {
      values: Object.values(InterviewRound),
      message: 'Interview round must be one of: {VALUES}'
    },
    required: [true, 'Interview round is required'],
    index: true,
  },
  
  scheduledAt: {
    type: Date,
    required: [true, 'Scheduled time is required'],
    index: true,
    validate: {
      validator: function(this: InterviewDocument, value: Date) {
        // Allow past dates for completed or cancelled interviews
        if (this.status === InterviewStatus.COMPLETED || this.status === InterviewStatus.CANCELLED) {
          return true;
        }
        // For updates, be more permissive - allow past dates if status is not scheduled/confirmed
        if (!this.isNew && this.status !== InterviewStatus.SCHEDULED && this.status !== InterviewStatus.CONFIRMED) {
          return true;
        }
        // Only enforce future dates for new interviews or when status is scheduled/confirmed
        return value > new Date();
      },
      message: 'Interview must be scheduled for a future date and time',
    },
  },
  
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Interview duration must be at least 15 minutes'],
    max: [480, 'Interview duration cannot exceed 8 hours'],
  },
  
  location: {
    type: String,
    maxlength: [500, 'Location cannot exceed 500 characters'],
  },
  
  interviewers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  
  status: {
    type: String,
    enum: {
      values: Object.values(InterviewStatus),
      message: 'Status must be one of: {VALUES}'
    },
    default: InterviewStatus.SCHEDULED,
    index: true,
  },
  
  feedback: {
    type: String,
    maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
  },
  
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    index: true,
  },
  
  notes: [{
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Note cannot exceed 1000 characters'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  }],
  
  meetingLink: {
    type: String,
    match: [
      /^https?:\/\/.+$/,
      'Please provide a valid meeting link'
    ],
  },
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator reference is required'],
    index: true,
  },
  
  // Detailed feedback from each interviewer
  interviewerFeedback: [feedbackSchema],
  
  // Meeting room or virtual meeting details
  meetingDetails: {
    platform: {
      type: String,
      enum: ['zoom', 'teams', 'google_meet', 'phone', 'in_person', 'other'],
    },
    roomNumber: String,
    dialInNumber: String,
    meetingId: String,
    passcode: String,
  },
  
  // Preparation materials
  preparationMaterials: [{
    title: {
      type: String,
      required: true,
      maxlength: [200, 'Material title cannot exceed 200 characters'],
    },
    description: String,
    fileId: {
      type: Schema.Types.ObjectId,
      ref: 'File',
    },
    url: String,
  }],
  
  // Interview questions (for consistency across interviewers)
  questions: [{
    question: {
      type: String,
      required: true,
      maxlength: [1000, 'Question cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: ['technical', 'behavioral', 'cultural', 'leadership', 'problem_solving'],
    },
    expectedAnswer: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
  }],
  
  // Actual start and end times
  actualStartTime: Date,
  actualEndTime: Date,
  
  // Reschedule history
  rescheduleHistory: [{
    previousTime: Date,
    newTime: Date,
    reason: String,
    rescheduledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rescheduledAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Follow-up actions
  followUpActions: [{
    action: {
      type: String,
      required: true,
      maxlength: [200, 'Action cannot exceed 200 characters'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
  }],
  
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(_doc, ret) {
      delete (ret as any).__v;
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
interviewSchema.index({ applicationId: 1, status: 1 });
interviewSchema.index({ scheduledAt: 1, status: 1 });
interviewSchema.index({ 'interviewers': 1, scheduledAt: 1 });
interviewSchema.index({ type: 1, round: 1 });
interviewSchema.index({ createdBy: 1, createdAt: -1 });
interviewSchema.index({ status: 1, scheduledAt: 1 });

// Text index for search
interviewSchema.index({
  'notes.content': 'text',
  feedback: 'text',
  location: 'text',
});

// ============================================================================
// Virtual Properties
// ============================================================================

/**
 * Check if interview is upcoming
 */
interviewSchema.virtual('isUpcoming').get(function(this: InterviewDocument) {
  return this.scheduledAt > new Date() && this.status === InterviewStatus.SCHEDULED;
});

/**
 * Check if interview is overdue
 */
interviewSchema.virtual('isOverdue').get(function(this: InterviewDocument) {
  return this.scheduledAt < new Date() && 
         [InterviewStatus.SCHEDULED, InterviewStatus.CONFIRMED].includes(this.status);
});

/**
 * Interview duration in hours
 */
interviewSchema.virtual('durationHours').get(function(this: InterviewDocument) {
  return this.duration / 60;
});

/**
 * Average interviewer rating
 */
interviewSchema.virtual('averageRating').get(function(this: InterviewDocument) {
  if (!this.interviewerFeedback || this.interviewerFeedback.length === 0) {
    return this.rating || null;
  }
  
  const ratings = this.interviewerFeedback
    .map(f => f.rating)
    .filter(r => r !== undefined) as number[];
  
  if (ratings.length === 0) return this.rating || null;
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
});

/**
 * Recommendation summary
 */
interviewSchema.virtual('recommendationSummary').get(function(this: InterviewDocument) {
  if (!this.interviewerFeedback || this.interviewerFeedback.length === 0) {
    return null;
  }
  
  const recommendations = this.interviewerFeedback.map(f => f.recommendation);
  const counts = recommendations.reduce((acc: any, rec) => {
    acc[rec] = (acc[rec] || 0) + 1;
    return acc;
  }, {});
  
  return counts;
});

// ============================================================================
// Instance Methods
// ============================================================================

/**
 * Add a note to the interview
 */
(interviewSchema.methods as any).addNote = function(
  this: InterviewDocument, 
  content: string, 
  createdBy: mongoose.Types.ObjectId,
  isPrivate = false
) {
  this.notes.push({
    content,
    createdBy,
    createdAt: new Date(),
    isPrivate,
  });
};

/**
 * Reschedule the interview
 */
(interviewSchema.methods as any).reschedule = function(
  this: InterviewDocument,
  newTime: Date,
  reason: string,
  rescheduledBy: mongoose.Types.ObjectId
) {
  if (newTime <= new Date()) {
    throw new Error('New interview time must be in the future');
  }
  
  // Add to reschedule history
  this.rescheduleHistory.push({
    previousTime: this.scheduledAt,
    newTime,
    reason,
    rescheduledBy,
    rescheduledAt: new Date(),
  });
  
  // Update scheduled time and status
  this.scheduledAt = newTime;
  this.status = InterviewStatus.RESCHEDULED;
};

/**
 * Start the interview
 */
(interviewSchema.methods as any).startInterview = function(this: InterviewDocument) {
  this.status = InterviewStatus.IN_PROGRESS;
  this.actualStartTime = new Date();
};

/**
 * Complete the interview
 */
(interviewSchema.methods as any).completeInterview = function(this: InterviewDocument) {
  this.status = InterviewStatus.COMPLETED;
  this.actualEndTime = new Date();
};

/**
 * Cancel the interview
 */
(interviewSchema.methods as any).cancelInterview = function(this: InterviewDocument, reason?: string) {
  this.status = InterviewStatus.CANCELLED;
  
  if (reason) {
    this.addNote(`Interview cancelled: ${reason}`, this.createdBy, true);
  }
};

/**
 * Add interviewer feedback
 */
(interviewSchema.methods as any).addInterviewerFeedback = function(
  this: InterviewDocument,
  interviewer: mongoose.Types.ObjectId,
  feedback: {
    rating: number;
    comments: string;
    recommendation: 'hire' | 'no_hire' | 'maybe' | 'next_round';
  }
) {
  // Check if interviewer already provided feedback
  const existingFeedback = this.interviewerFeedback.find(
    f => f.interviewer.toString() === interviewer.toString()
  );
  
  if (existingFeedback) {
    // Update existing feedback
    Object.assign(existingFeedback, feedback, { submittedAt: new Date() });
  } else {
    // Add new feedback
    this.interviewerFeedback.push({
      interviewer,
      rating: feedback.rating,
      recommendation: feedback.recommendation,
      strengths: (feedback as any).strengths || '',
      weaknesses: (feedback as any).weaknesses || '',
      comments: feedback.comments,
      submittedAt: new Date(),
    });
  }
  
  // Update overall rating if all interviewers have provided feedback
  this.updateOverallRating();
};

/**
 * Update overall rating based on interviewer feedback
 */
(interviewSchema.methods as any).updateOverallRating = function(this: InterviewDocument) {
  if (this.interviewerFeedback.length === this.interviewers.length) {
    const avgRating = this.averageRating;
    if (avgRating) {
      this.rating = avgRating;
    }
  }
};

/**
 * Add follow-up action
 */
(interviewSchema.methods as any).addFollowUpAction = function(
  this: InterviewDocument,
  action: string,
  assignedTo: mongoose.Types.ObjectId,
  dueDate?: Date
) {
  this.followUpActions.push({
    action,
    assignedTo,
    ...(dueDate ? { dueDate } : {}),
    completed: false,
  });
};

// ============================================================================
// Static Methods
// ============================================================================

/**
 * Get interviews by date range
 */
(interviewSchema.statics as any).getInterviewsByDateRange = function(
  startDate: Date,
  endDate: Date,
  options: any = {}
) {
  const { status, interviewer, type, limit = 50, skip = 0 } = options;
  
  const query: any = {
    scheduledAt: {
      $gte: startDate,
      $lte: endDate,
    },
  };
  
  if (status) query.status = status;
  if (interviewer) query.interviewers = interviewer;
  if (type) query.type = type;
  
  return this.find(query)
    .populate('applicationId')
    .populate('interviewers', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName')
    .sort({ scheduledAt: 1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Get interviewer's schedule
 */
(interviewSchema.statics as any).getInterviewerSchedule = function(
  interviewerId: mongoose.Types.ObjectId,
  dateRange?: { start: Date; end: Date }
) {
  const query: any = {
    interviewers: interviewerId,
    status: { $in: [InterviewStatus.SCHEDULED, InterviewStatus.CONFIRMED, InterviewStatus.IN_PROGRESS] },
  };
  
  if (dateRange) {
    query.scheduledAt = {
      $gte: dateRange.start,
      $lte: dateRange.end,
    };
  }
  
  return this.find(query)
    .populate('applicationId')
    .sort({ scheduledAt: 1 });
};

/**
 * Get upcoming interviews
 */
(interviewSchema.statics as any).getUpcomingInterviews = function(options: any = {}) {
  const { hours = 24, interviewer, limit = 20 } = options;
  
  const now = new Date();
  const futureTime = new Date(now.getTime() + (hours * 60 * 60 * 1000));
  
  const query: any = {
    scheduledAt: {
      $gte: now,
      $lte: futureTime,
    },
    status: { $in: [InterviewStatus.SCHEDULED, InterviewStatus.CONFIRMED] },
  };
  
  if (interviewer) query.interviewers = interviewer;
  
  return this.find(query)
    .populate('applicationId')
    .populate('interviewers', 'firstName lastName email')
    .sort({ scheduledAt: 1 })
    .limit(limit);
};

/**
 * Get interview statistics
 */
(interviewSchema.statics as any).getInterviewStats = function(dateRange?: { start: Date; end: Date }) {
  const matchStage: any = {};
  
  if (dateRange) {
    matchStage.scheduledAt = {
      $gte: dateRange.start,
      $lte: dateRange.end,
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        avgDuration: { $avg: '$duration' },
      },
    },
    {
      $group: {
        _id: null,
        statusCounts: {
          $push: {
            status: '$_id',
            count: '$count',
            avgRating: '$avgRating',
            avgDuration: '$avgDuration',
          },
        },
        totalInterviews: { $sum: '$count' },
      },
    },
  ]);
};

// ============================================================================
// Middleware (Hooks)
// ============================================================================

/**
 * Pre-save middleware
 */
interviewSchema.pre('save', function(this: InterviewDocument, next) {
  // Validate that interviewers are provided (only for new documents or when explicitly modified)
  if (this.isNew || this.isModified('interviewers')) {
    if (this.interviewers.length === 0) {
      return next(new Error('At least one interviewer must be assigned'));
    }
  }
  
  // Set meeting link requirement for virtual interviews
  if (this.isModified('type') && 
      [InterviewType.VIDEO, InterviewType.PHONE].includes(this.type) && 
      !this.meetingLink && 
      !this.meetingDetails?.dialInNumber) {
    return next(new Error('Meeting link or dial-in number is required for virtual interviews'));
  }
  
  next();
});

// ============================================================================
// Model Export
// ============================================================================

export const Interview = mongoose.model<InterviewDocument>('Interview', interviewSchema);
