import mongoose, { Schema, Document } from 'mongoose';
import { 
  Job as IJob, 
  JobStatus, 
  JobType, 
  JobUrgency,
  ExperienceLevel,
  JobRequirements 
} from '@/types';

/**
 * Job model interface extending Mongoose Document
 */
export interface JobDocument extends Omit<IJob, '_id' | 'companyId' | 'assignedAgentId' | 'createdBy'>, Document {
  _id: mongoose.Types.ObjectId;
  jobId?: string;
  companyId: mongoose.Types.ObjectId;
  assignedAgentId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  
  // Additional properties that exist in schema but not in base interface
  isRemote: boolean;
  benefits: string[];
  applicationDeadline?: Date;
  views: number;
  lastViewedAt?: Date;
  interviewProcess?: {
    rounds: number;
    estimatedDuration?: string;
  };
  isPublic: boolean;
  sourcingChannels: string[];
  
  // Virtual properties
  isActive: boolean;
  isClosed: boolean;
  daysSincePosted: number;
  isDeadlineApproaching: boolean;
  isDeadlinePassed: boolean;
  formattedSalaryRange: string;
  
  // Instance methods
  assignAgent(agentId: mongoose.Types.ObjectId): void;
  closeJob(reason?: string): void;
  cancelJob(reason?: string): void;
  incrementApplications(): void;
  incrementViews(): void;
  matchesCandidate(candidateSkills: string[]): { matchedSkills: string[]; matchPercentage: number };
}

/**
 * Job model interface with static methods
 */
export interface JobModel extends mongoose.Model<JobDocument> {
  searchJobs(options?: any): Promise<JobDocument[]>;
  getJobsByUrgency(urgency: JobUrgency, options?: any): Promise<JobDocument[]>;
  getJobsByAgent(agentId: mongoose.Types.ObjectId, options?: any): Promise<JobDocument[]>;
  getJobsApproachingDeadline(days?: number): Promise<JobDocument[]>;
  generateJobId(): Promise<string>;
  calculateApplicationsCount(jobId: mongoose.Types.ObjectId): Promise<number>;
}

/**
 * Job requirements sub-schema
 */
const jobRequirementsSchema = new Schema<JobRequirements>({
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters'],
  }],
  
  experience: {
    type: String,
    enum: {
      values: Object.values(ExperienceLevel),
      message: 'Experience level must be one of: {VALUES}'
    },
    required: [true, 'Experience level is required'],
  },
  
  education: [{
    type: String,
    trim: true,
    maxlength: [100, 'Education requirement cannot exceed 100 characters'],
  }],
  
  languages: [{
    type: String,
    trim: true,
    maxlength: [50, 'Language cannot exceed 50 characters'],
  }],
  
  certifications: [{
    type: String,
    trim: true,
    maxlength: [100, 'Certification cannot exceed 100 characters'],
  }],
}, { _id: false });

/**
 * Main job schema
 */
const jobSchema = new Schema<JobDocument>({
  jobId: {
    type: String,
    required: false, // Will be generated automatically by pre-save middleware
    unique: true,
    index: true,
  },
  
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Job title cannot exceed 200 characters'],
    index: true,
  },
  
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: [5000, 'Job description cannot exceed 5000 characters'],
  },
  
  requirements: {
    type: jobRequirementsSchema,
    required: [true, 'Job requirements are required'],
  },
  
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters'],
    index: true,
  },
  
  type: {
    type: String,
    enum: {
      values: Object.values(JobType),
      message: 'Job type must be one of: {VALUES}'
    },
    required: [true, 'Job type is required'],
    index: true,
  },
  
  salaryRange: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative'],
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative'],
      validate: {
        validator: function(this: any, value: number) {
          return !this.min || value >= this.min;
        },
        message: 'Maximum salary must be greater than or equal to minimum salary',
      },
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    },
  },
  
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company reference is required'],
    index: true,
  },
  
  status: {
    type: String,
    enum: {
      values: Object.values(JobStatus),
      message: 'Status must be one of: {VALUES}'
    },
    default: JobStatus.OPEN,
    index: true,
  },
  
  urgency: {
    type: String,
    enum: {
      values: Object.values(JobUrgency),
      message: 'Urgency must be one of: {VALUES}'
    },
    default: JobUrgency.MEDIUM,
    index: true,
  },
  
  assignedAgentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator reference is required'],
    index: true,
  },
  
  applications: {
    type: Number,
    default: 0,
    min: [0, 'Applications count cannot be negative'],
  },
  
  postedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  
  closedAt: {
    type: Date,
    index: true,
  },
  
  // Additional job metadata
  isRemote: {
    type: Boolean,
    default: false,
    index: true,
  } as any,
  
  benefits: [{
    type: String,
    trim: true,
    maxlength: [100, 'Benefit cannot exceed 100 characters'],
  }],
  
  // Application deadline
  applicationDeadline: {
    type: Date,
    validate: {
      validator: function(this: JobDocument, value: Date) {
        return !value || value > new Date();
      },
      message: 'Application deadline must be in the future',
    },
  },
  
  // Interview process information
  interviewProcess: {
    rounds: {
      type: Number,
      min: [1, 'Interview rounds must be at least 1'],
      max: [10, 'Interview rounds cannot exceed 10'],
      default: 3,
    },
    estimatedDuration: {
      type: String,
      maxlength: [100, 'Estimated duration cannot exceed 100 characters'],
    },
  },
  
  // Job visibility and sourcing
  isPublic: {
    type: Boolean,
    default: true,
  },
  
  sourcingChannels: [{
    type: String,
    enum: ['internal', 'job_board', 'referral', 'linkedin', 'headhunting', 'university'],
  }],
  
  // Performance tracking
  views: {
    type: Number,
    default: 0,
  },
  
  lastViewedAt: {
    type: Date,
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
jobSchema.index({ status: 1, urgency: -1, postedAt: -1 });
jobSchema.index({ companyId: 1, status: 1 });
jobSchema.index({ assignedAgentId: 1, status: 1 });
jobSchema.index({ type: 1, location: 1, status: 1 });
jobSchema.index({ 'requirements.skills': 1, status: 1 });
jobSchema.index({ postedAt: -1, status: 1 });
jobSchema.index({ applicationDeadline: 1, status: 1 });

// Text index for search functionality
jobSchema.index({
  title: 'text',
  description: 'text',
  'requirements.skills': 'text',
  location: 'text',
  benefits: 'text',
});

// Geospatial index for location-based searches
// jobSchema.index({ location: '2dsphere' });

// ============================================================================
// Virtual Properties
// ============================================================================

/**
 * Check if job is active
 */
jobSchema.virtual('isActive').get(function(this: JobDocument) {
  return this.status === JobStatus.OPEN || this.status === JobStatus.ASSIGNED;
});

/**
 * Check if job is closed
 */
jobSchema.virtual('isClosed').get(function(this: JobDocument) {
  return this.status === JobStatus.CLOSED || this.status === JobStatus.CANCELLED;
});

/**
 * Days since posted
 */
jobSchema.virtual('daysSincePosted').get(function(this: JobDocument) {
  const now = new Date();
  const posted = new Date(this.postedAt);
  const diffTime = Math.abs(now.getTime() - posted.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

/**
 * Check if application deadline is approaching (within 7 days)
 */
jobSchema.virtual('isDeadlineApproaching').get(function(this: JobDocument) {
  if (!this.applicationDeadline) return false;
  
  const now = new Date();
  const deadline = new Date(this.applicationDeadline);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 7 && diffDays > 0;
});

/**
 * Check if application deadline has passed
 */
jobSchema.virtual('isDeadlinePassed').get(function(this: JobDocument) {
  if (!this.applicationDeadline) return false;
  return new Date() > new Date(this.applicationDeadline);
});

/**
 * Formatted salary range
 */
jobSchema.virtual('formattedSalaryRange').get(function(this: JobDocument) {
  if (!this.salaryRange?.min || !this.salaryRange?.max) {
    return 'Salary not specified';
  }
  
  const { min, max, currency = 'USD' } = this.salaryRange;
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return `${formatter.format(min)} - ${formatter.format(max)}`;
});

// ============================================================================
// Instance Methods
// ============================================================================

/**
 * Assign agent to job
 */
jobSchema.methods['assignAgent'] = function(this: JobDocument, agentId: mongoose.Types.ObjectId) {
  this.assignedAgentId = agentId;
  this.status = JobStatus.ASSIGNED;
};

/**
 * Close the job
 */
jobSchema.methods['closeJob'] = function(this: JobDocument, _reason?: string) {
  this.status = JobStatus.CLOSED;
  this.closedAt = new Date();
  
  // Could add reason to a separate field if needed
  // this.closureReason = reason;
};

/**
 * Cancel the job
 */
jobSchema.methods['cancelJob'] = function(this: JobDocument, _reason?: string) {
  this.status = JobStatus.CANCELLED;
  this.closedAt = new Date();
  
  // Could add reason to a separate field if needed
  // this.cancellationReason = reason;
};

/**
 * Increment application count
 */
jobSchema.methods['incrementApplications'] = function(this: JobDocument) {
  this.applications = (this.applications || 0) + 1;
};

/**
 * Increment view count
 */
jobSchema.methods['incrementViews'] = function(this: JobDocument) {
  this.views = (this.views || 0) + 1;
  this.lastViewedAt = new Date();
};

/**
 * Check if job matches candidate skills
 */
jobSchema.methods['matchesCandidate'] = function(this: JobDocument, candidateSkills: string[]) {
  const requiredSkills = this.requirements.skills || [];
  const matchedSkills = requiredSkills.filter(skill => 
    candidateSkills.some(candidateSkill => 
      candidateSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  return {
    matchedSkills,
    matchPercentage: requiredSkills.length > 0 ? 
      (matchedSkills.length / requiredSkills.length) * 100 : 0,
  };
};

// ============================================================================
// Static Methods
// ============================================================================

/**
 * Search jobs with advanced filters
 */
jobSchema.statics['searchJobs'] = function(options: any = {}) {
  const {
    searchTerm,
    skills,
    location,
    type,
    company,
    salaryMin,
    salaryMax,
    remote,
    status = [JobStatus.OPEN, JobStatus.ASSIGNED],
    urgency,
    experienceLevel,
    assignedAgent,
    limit = 20,
    skip = 0,
    sort = { urgency: -1, postedAt: -1 }
  } = options;
  
  const query: any = {};
  
  // Status filter
  if (Array.isArray(status)) {
    query.status = { $in: status };
  } else {
    query.status = status;
  }
  
  // Text search
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  // Skills filter
  if (skills && skills.length > 0) {
    query['requirements.skills'] = { $in: skills };
  }
  
  // Location filter
  if (location) {
    query.location = new RegExp(location, 'i');
  }
  
  // Job type filter
  if (type) {
    query.type = type;
  }
  
  // Company filter
  if (company) {
    query.companyId = company;
  }
  
  // Salary range filter
  if (salaryMin || salaryMax) {
    const salaryQuery: any = {};
    if (salaryMin) salaryQuery['salaryRange.min'] = { $gte: salaryMin };
    if (salaryMax) salaryQuery['salaryRange.max'] = { $lte: salaryMax };
    Object.assign(query, salaryQuery);
  }
  
  // Remote filter
  if (remote !== undefined) {
    query.isRemote = remote;
  }
  
  // Urgency filter
  if (urgency) {
    query.urgency = urgency;
  }
  
  // Experience level filter
  if (experienceLevel) {
    query['requirements.experience'] = experienceLevel;
  }
  
  // Assigned agent filter
  if (assignedAgent) {
    query.assignedAgentId = assignedAgent;
  }
  
  return this.find(query)
    .populate('companyId', 'name industry location')
    .populate('assignedAgentId', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

/**
 * Get jobs by urgency
 */
jobSchema.statics['getJobsByUrgency'] = function(urgency: JobUrgency, options: any = {}) {
  const { limit = 20, skip = 0 } = options;
  
  return this.find({
    urgency,
    status: { $in: [JobStatus.OPEN, JobStatus.ASSIGNED] },
  })
  .populate('companyId', 'name industry')
  .populate('assignedAgentId', 'firstName lastName')
  .sort({ postedAt: -1 })
  .limit(limit)
  .skip(skip);
};

/**
 * Get jobs assigned to specific agent
 */
jobSchema.statics['getJobsByAgent'] = function(agentId: mongoose.Types.ObjectId, options: any = {}) {
  const { status, limit = 20, skip = 0 } = options;
  
  const query: any = { assignedAgentId: agentId };
  
  if (status) {
    query.status = status;
  } else {
    query.status = { $in: [JobStatus.ASSIGNED, JobStatus.INTERVIEW] };
  }
  
  return this.find(query)
    .populate('companyId', 'name industry location')
    .sort({ urgency: -1, postedAt: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Get jobs approaching deadline
 */
jobSchema.statics['getJobsApproachingDeadline'] = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    applicationDeadline: {
      $lte: futureDate,
      $gte: new Date(),
    },
    status: { $in: [JobStatus.OPEN, JobStatus.ASSIGNED] },
  })
  .populate('companyId', 'name')
  .populate('assignedAgentId', 'firstName lastName email')
  .sort({ applicationDeadline: 1 });
};

/**
 * Generate next job ID in format JOB00001, JOB00002, etc.
 */
jobSchema.statics['generateJobId'] = async function() {
  const lastJob = await this.findOne({}, { jobId: 1 })
    .sort({ jobId: -1 })
    .limit(1);
  
  let nextNumber = 1;
  if (lastJob && lastJob.jobId) {
    const match = lastJob.jobId.match(/JOB(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  return `JOB${nextNumber.toString().padStart(5, '0')}`;
};

/**
 * Calculate applications count based on candidate assignments for this job
 */
jobSchema.statics['calculateApplicationsCount'] = async function(jobId: mongoose.Types.ObjectId) {
  const { CandidateAssignment } = await import('./CandidateAssignment');
  
  const count = await CandidateAssignment.countDocuments({
    jobId: jobId,
    status: { $in: ['active', 'completed'] } // Only count active and completed assignments
  });
  
  return count;
};

// ============================================================================
// Middleware (Hooks)
// ============================================================================

/**
 * Pre-save middleware
 */
jobSchema.pre('save', async function(this: JobDocument, next) {
  // Generate jobId if it doesn't exist
  if (!this.jobId) {
    try {
      console.log('Generating jobId for new job...');
      this.jobId = await (this.constructor as any).generateJobId();
      console.log('Generated jobId:', this.jobId);
    } catch (error: any) {
      console.error('Error generating jobId:', error);
      return next(error);
    }
  }
  
  // Auto-detect remote work
  if (this.isModified('location')) {
    this.isRemote = /remote|work from home|wfh/i.test(this.location);
  }
  
  // Set status to interview if it has applications
  if (this.isModified('applications') && this.applications && this.applications > 0 && this.status === JobStatus.OPEN) {
    this.status = JobStatus.INTERVIEW;
  }
  
  next();
});

/**
 * Pre-delete middleware
 */
jobSchema.pre('deleteOne', { document: true, query: false }, async function(this: JobDocument, next) {
  try {
    // TODO: Cleanup related data
    // - Remove applications
    // - Update tasks
    // - Notify assigned agent
    // - etc.
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// ============================================================================
// Model Export
// ============================================================================

export const Job = mongoose.model<JobDocument, JobModel>('Job', jobSchema);
