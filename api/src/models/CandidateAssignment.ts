import mongoose, { Schema, Document } from 'mongoose';

/**
 * Candidate Assignment interface
 * Tracks when agents assign candidates to HR users
 */
export interface ICandidateAssignment {
  _id: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId; // HR user
  assignedBy: mongoose.Types.ObjectId; // Agent user
  jobId?: mongoose.Types.ObjectId; // Optional: specific job this assignment is for
  status: 'active' | 'completed' | 'rejected' | 'withdrawn';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  assignedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Candidate Assignment model interface extending Mongoose Document
 */
export interface CandidateAssignmentDocument extends Omit<ICandidateAssignment, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
  
  // Instance methods
  markCompleted(feedback?: string): void;
  reject(reason: string): void;
  withdraw(reason: string): void;
}

/**
 * Candidate Assignment model interface for static methods
 */
export interface CandidateAssignmentModel extends mongoose.Model<CandidateAssignmentDocument> {
  getAssignmentsForHR(hrUserId: mongoose.Types.ObjectId, options?: any): Promise<CandidateAssignmentDocument[]>;
  getAssignmentsByAgent(agentId: mongoose.Types.ObjectId, options?: any): Promise<CandidateAssignmentDocument[]>;
  getActiveAssignments(options?: any): Promise<CandidateAssignmentDocument[]>;
  getAssignmentStats(dateRange?: { start: Date; end: Date }): Promise<any>;
}

/**
 * Main candidate assignment schema
 */
const candidateAssignmentSchema = new Schema<CandidateAssignmentDocument>({
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: 'Candidate',
    required: [true, 'Candidate reference is required'],
    index: true,
  },
  
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'HR user reference is required'],
    index: true,
  },
  
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Agent user reference is required'],
    index: true,
  },
  
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    index: true,
  },
  
  status: {
    type: String,
    enum: ['active', 'completed', 'rejected', 'withdrawn'],
    default: 'active',
    index: true,
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  },
  
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
  
  assignedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  
  dueDate: {
    type: Date,
    index: true,
  },
  
  completedAt: {
    type: Date,
    index: true,
  },
  
  feedback: {
    type: String,
    maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
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
candidateAssignmentSchema.index({ assignedTo: 1, status: 1, assignedAt: -1 });
candidateAssignmentSchema.index({ assignedBy: 1, status: 1, assignedAt: -1 });
candidateAssignmentSchema.index({ candidateId: 1, status: 1 });
candidateAssignmentSchema.index({ jobId: 1, status: 1 });
candidateAssignmentSchema.index({ status: 1, priority: 1, assignedAt: -1 });

// ============================================================================
// Virtual Properties
// ============================================================================

/**
 * Check if assignment is overdue
 */
candidateAssignmentSchema.virtual('isOverdue').get(function(this: CandidateAssignmentDocument) {
  if (!this.dueDate || this.status !== 'active') return false;
  return new Date() > this.dueDate;
});

/**
 * Check if assignment is due soon (within 2 days)
 */
candidateAssignmentSchema.virtual('isDueSoon').get(function(this: CandidateAssignmentDocument) {
  if (!this.dueDate || this.status !== 'active') return false;
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
  return this.dueDate <= twoDaysFromNow;
});

/**
 * Days since assignment
 */
candidateAssignmentSchema.virtual('daysSinceAssigned').get(function(this: CandidateAssignmentDocument) {
  const diffTime = new Date().getTime() - this.assignedAt.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// ============================================================================
// Instance Methods
// ============================================================================

/**
 * Mark assignment as completed
 */
candidateAssignmentSchema.methods['markCompleted'] = function(this: CandidateAssignmentDocument, feedback?: string) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (feedback) {
    this.feedback = feedback;
  }
};

/**
 * Reject assignment
 */
candidateAssignmentSchema.methods['reject'] = function(this: CandidateAssignmentDocument, reason: string) {
  this.status = 'rejected';
  this.completedAt = new Date();
  this.feedback = reason;
};

/**
 * Withdraw assignment
 */
candidateAssignmentSchema.methods['withdraw'] = function(this: CandidateAssignmentDocument, reason: string) {
  this.status = 'withdrawn';
  this.completedAt = new Date();
  this.feedback = reason;
};

// ============================================================================
// Static Methods
// ============================================================================

/**
 * Get assignments for specific HR user
 */
candidateAssignmentSchema.statics['getAssignmentsForHR'] = function(
  hrUserId: mongoose.Types.ObjectId, 
  options: any = {}
) {
  const { status, priority, jobId, limit = 20, skip = 0, sortBy = 'assignedAt', sortOrder = -1 } = options;
  
  const query: any = { assignedTo: hrUserId };
  
  if (status) {
    query.status = status;
  } else {
    query.status = 'active'; // Default to active assignments
  }
  
  if (priority) {
    query.priority = priority;
  }
  
  if (jobId) {
    query.jobId = jobId;
  }
  
  const sort: any = {};
  sort[sortBy] = sortOrder;
  
  return this.find(query)
    .populate({
      path: 'candidateId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    })
    .populate('assignedBy', 'firstName lastName email')
    .populate({
      path: 'jobId',
      select: 'title companyId location',
      populate: {
        path: 'companyId',
        select: 'name industry location'
      }
    })
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

/**
 * Get assignments created by specific agent
 */
candidateAssignmentSchema.statics['getAssignmentsByAgent'] = function(
  agentId: mongoose.Types.ObjectId,
  options: any = {}
) {
  const { status, limit = 20, skip = 0 } = options;
  
  const query: any = { assignedBy: agentId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate({
      path: 'candidateId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    })
    .populate('assignedTo', 'firstName lastName email')
    .populate({
      path: 'jobId',
      select: 'title companyId location',
      populate: {
        path: 'companyId',
        select: 'name industry location'
      }
    })
    .sort({ assignedAt: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Get active assignments
 */
candidateAssignmentSchema.statics['getActiveAssignments'] = function(options: any = {}) {
  const { limit = 50, skip = 0 } = options;
  
  return this.find({ status: 'active' })
    .populate({
      path: 'candidateId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    })
    .populate('assignedBy', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName email')
    .populate({
      path: 'jobId',
      select: 'title companyId location',
      populate: {
        path: 'companyId',
        select: 'name industry location'
      }
    })
    .sort({ priority: -1, assignedAt: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Get assignment statistics
 */
candidateAssignmentSchema.statics['getAssignmentStats'] = function(dateRange?: { start: Date; end: Date }) {
  const pipeline: any[] = [];
  
  if (dateRange) {
    pipeline.push({
      $match: {
        assignedAt: {
          $gte: dateRange.start,
          $lte: dateRange.end,
        },
      },
    });
  }
  
  pipeline.push(
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgCompletionTime: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'completed'] },
              { $subtract: ['$completedAt', '$assignedAt'] },
              null
            ]
          }
        }
      },
    },
    {
      $group: {
        _id: null,
        statusCounts: {
          $push: {
            status: '$_id',
            count: '$count',
            avgCompletionTime: '$avgCompletionTime',
          },
        },
        totalAssignments: { $sum: '$count' },
      },
    }
  );
  
  return this.aggregate(pipeline);
};

// ============================================================================
// Model Export
// ============================================================================

export const CandidateAssignment = mongoose.model<CandidateAssignmentDocument, CandidateAssignmentModel>('CandidateAssignment', candidateAssignmentSchema);
