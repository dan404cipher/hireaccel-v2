import mongoose, { Schema, Document } from 'mongoose';
import { 
  Candidate as ICandidate, 
  CandidateStatus, 
  ExperienceLevel,
  Education,
  WorkExperience,
  CandidateProfile 
} from '@/types';

/**
 * Candidate model interface extending Mongoose Document
 */
export interface CandidateDocument extends Omit<ICandidate, '_id' | 'userId' | 'resumeFileId' | 'notes' | 'assignedAgentId'>, Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  assignedAgentId?: mongoose.Types.ObjectId;
  resumeFileId?: mongoose.Types.ObjectId;
  
  // Override notes to match schema structure
  notes: {
    content: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  
  // Additional properties that exist in schema
  profileViews: number;
  lastActivityAt: Date;
  totalExperience: number;
  
  // Instance methods
  addNote(content: string, createdBy: mongoose.Types.ObjectId, isInternal?: boolean): void;
  addTags(tags: string[]): void;
  removeTags(tags: string[]): void;
  updateActivity(): void;
  incrementViews(): void;
}

/**
 * Education sub-schema
 */
const educationSchema = new Schema<Education>({
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true,
    maxlength: [100, 'Degree cannot exceed 100 characters'],
  },
  field: {
    type: String,
    required: [true, 'Field of study is required'],
    trim: true,
    maxlength: [100, 'Field cannot exceed 100 characters'],
  },
  institution: {
    type: String,
    required: [true, 'Institution is required'],
    trim: true,
    maxlength: [200, 'Institution name cannot exceed 200 characters'],
  },
  graduationYear: {
    type: Number,
    required: [true, 'Graduation year is required'],
    min: [1950, 'Graduation year must be after 1950'],
    max: [new Date().getFullYear() + 10, 'Graduation year cannot be more than 10 years in the future'],
  },
  gpa: {
    type: Number,
    min: [0, 'GPA cannot be negative'],
    max: [4.0, 'GPA cannot exceed 4.0'],
  },
}, { _id: false });

/**
 * Work experience sub-schema
 */
const workExperienceSchema = new Schema<WorkExperience>({
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters'],
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
    maxlength: [200, 'Position cannot exceed 200 characters'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(this: WorkExperience, value: Date) {
        if (this.current) return true;
        return value && value > this.startDate;
      },
      message: 'End date must be after start date',
    },
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  current: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

/**
 * Certification sub-schema
 */
const certificationSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Certification name is required'],
    trim: true,
    maxlength: [200, 'Certification name cannot exceed 200 characters'],
  },
  issuer: {
    type: String,
    required: [true, 'Issuer is required'],
    trim: true,
    maxlength: [200, 'Issuer name cannot exceed 200 characters'],
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
  },
  expiryDate: {
    type: Date,
    validate: {
      validator: function(this: any, value: Date) {
        return !value || value > this.issueDate;
      },
      message: 'Expiry date must be after issue date',
    },
  },
  credentialId: {
    type: String,
    trim: true,
    maxlength: [100, 'Credential ID cannot exceed 100 characters'],
  },
  credentialUrl: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/.+$/,
      'Please provide a valid credential URL'
    ],
  },
}, { _id: false });

/**
 * Project sub-schema
 */
const projectSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [200, 'Project title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [2000, 'Project description cannot exceed 2000 characters'],
  },
  technologies: [{
    type: String,
    trim: true,
    maxlength: [50, 'Technology name cannot exceed 50 characters'],
  }],
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(this: any, value: Date) {
        if (this.current) return true;
        return value && value > this.startDate;
      },
      message: 'End date must be after start date',
    },
  },
  current: {
    type: Boolean,
    default: false,
  },
  projectUrl: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/.+$/,
      'Please provide a valid project URL'
    ],
  },
  githubUrl: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/(www\.)?github\.com\/.+$/,
      'Please provide a valid GitHub URL'
    ],
  },
  role: {
    type: String,
    trim: true,
    maxlength: [100, 'Role cannot exceed 100 characters'],
  },
}, { _id: false });

/**
 * Candidate profile sub-schema
 */
const candidateProfileSchema = new Schema<CandidateProfile>({
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters'],
  }],
  
  experience: [workExperienceSchema],
  
  education: [educationSchema],
  
  certifications: [certificationSchema],
  
  projects: [projectSchema],
  
  summary: {
    type: String,
    trim: true,
    maxlength: [1000, 'Summary cannot exceed 1000 characters'],
  },
  
  location: {
    type: String,
    required: false, // Temporarily make it optional
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters'],
  },
  
  phoneNumber: {
    type: String,
    required: false, // Make it optional for partial updates
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please provide a valid phone number'
    ],
  },
  
  linkedinUrl: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-]+\/?$/,
      'Please provide a valid LinkedIn URL'
    ],
  },
  
  portfolioUrl: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/.+$/,
      'Please provide a valid portfolio URL'
    ],
  },
  
  preferredSalaryRange: {
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
  
  availability: {
    type: {
      startDate: {
        type: Date,
        required: false,
      },
      remote: {
        type: Boolean,
        default: false,
      },
      relocation: {
        type: Boolean,
        default: false,
      },
    },
    required: false,
  },
}, { _id: false });

/**
 * Main candidate schema
 */
const candidateSchema = new Schema<CandidateDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true,
  },

  assignedAgentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  
  profile: {
    type: candidateProfileSchema,
    required: [true, 'Candidate profile is required'],
  },
  
  resumeFileId: {
    type: Schema.Types.ObjectId,
    ref: 'File',
    index: true,
  },
  
  status: {
    type: String,
    enum: {
      values: Object.values(CandidateStatus),
      message: 'Status must be one of: {VALUES}'
    },
    default: CandidateStatus.ACTIVE,
    index: true,
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
  }],
  
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
  }],
  

  
  // Analytics and tracking
  profileViews: {
    type: Number,
    default: 0,
  },
  
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
  
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
candidateSchema.index({ status: 1, rating: -1 });
candidateSchema.index({ 'profile.location': 1, status: 1 });
candidateSchema.index({ 'profile.skills': 1, status: 1 });
candidateSchema.index({ createdAt: -1 });
candidateSchema.index({ lastActivityAt: -1 });

// Text index for search functionality
candidateSchema.index({
  'profile.skills': 'text',
  'profile.summary': 'text',
  'profile.experience.company': 'text',
  'profile.experience.position': 'text',
  'profile.education.degree': 'text',
  'profile.education.field': 'text',
  'profile.education.institution': 'text',
  tags: 'text',
});

// Geospatial index for location-based searches (if implementing geo features)
// candidateSchema.index({ 'profile.location': '2dsphere' });

// ============================================================================
// Virtual Properties
// ============================================================================

/**
 * Total years of experience
 */
candidateSchema.virtual('totalExperience').get(function(this: CandidateDocument) {
  if (!this.profile || !this.profile.experience || this.profile.experience.length === 0) {
    return 0;
  }
  
  let totalMonths = 0;
  
  this.profile.experience.forEach(exp => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.current ? new Date() : new Date(exp.endDate!);
    
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    
    totalMonths += Math.max(0, months);
  });
  
  return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
});

/**
 * Experience level based on total experience
 */
candidateSchema.virtual('experienceLevel').get(function(this: CandidateDocument) {
  const years = this.totalExperience;
  
  if (years === 0) return ExperienceLevel.ENTRY;
  if (years <= 2) return ExperienceLevel.JUNIOR;
  if (years <= 5) return ExperienceLevel.MID;
  if (years <= 8) return ExperienceLevel.SENIOR;
  if (years <= 12) return ExperienceLevel.LEAD;
  return ExperienceLevel.EXECUTIVE;
});

/**
 * Check if candidate has resume
 */
candidateSchema.virtual('hasResume').get(function(this: CandidateDocument) {
  return !!this.resumeFileId;
});

/**
 * Profile completion percentage
 */
candidateSchema.virtual('profileCompletion').get(function(this: CandidateDocument) {
  let completed = 0;
  const total = 10;
  
  if (!this.profile) {
    return 0; // Return 0% if profile doesn't exist
  }
  
  if (this.profile.summary) completed++;
  if (this.profile.skills && this.profile.skills.length > 0) completed++;
  if (this.profile.experience && this.profile.experience.length > 0) completed++;
  if (this.profile.education && this.profile.education.length > 0) completed++;
  if (this.profile.phoneNumber) completed++;
  if (this.profile.location) completed++;
  if (this.profile.linkedinUrl) completed++;
  if (this.profile.portfolioUrl) completed++;
  if (this.profile.preferredSalaryRange?.min && this.profile.preferredSalaryRange?.max) completed++;
  if (this.resumeFileId) completed++;
  
  return Math.round((completed / total) * 100);
});

// ============================================================================
// Instance Methods
// ============================================================================

/**
 * Add a note to the candidate
 */
(candidateSchema.methods as any).addNote = function(this: CandidateDocument, content: string, createdBy: mongoose.Types.ObjectId, _isInternal: boolean = false) {
  this.notes.push({
    content,
    createdBy,
    createdAt: new Date(),
  });
};

/**
 * Add tags to the candidate
 */
(candidateSchema.methods as any).addTags = function(this: CandidateDocument, tags: string[]) {
  const newTags = tags.filter(tag => !this.tags.includes(tag));
  this.tags.push(...newTags);
};

/**
 * Remove tags from the candidate
 */
(candidateSchema.methods as any).removeTags = function(this: CandidateDocument, tags: string[]) {
  this.tags = this.tags.filter(tag => !tags.includes(tag));
};

/**
 * Update last activity timestamp
 */
(candidateSchema.methods as any).updateActivity = function(this: CandidateDocument) {
  this.lastActivityAt = new Date();
};

/**
 * Increment profile views
 */
(candidateSchema.methods as any).incrementViews = function(this: CandidateDocument) {
  this.profileViews = (this.profileViews || 0) + 1;
};

// ============================================================================
// Static Methods
// ============================================================================

/**
 * Search candidates with advanced filters
 */
(candidateSchema.statics as any).searchCandidates = function(options: any = {}) {
  const {
    searchTerm,
    skills,
    location,
    experienceMin,
    experienceMax,
    status = CandidateStatus.ACTIVE,
    rating,
    availability,
    limit = 20,
    skip = 0,
    sort = { createdAt: -1 }
  } = options;
  
  const query: any = { status };
  
  // Text search
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  // Skills filter
  if (skills && skills.length > 0) {
    query['profile.skills'] = { $in: skills };
  }
  
  // Location filter
  if (location) {
    query['profile.location'] = new RegExp(location, 'i');
  }
  
  // Experience range filter (computed via aggregation)
  if (experienceMin !== undefined || experienceMax !== undefined) {
    // This would require aggregation pipeline for virtual field filtering
    // Simplified for now - could be enhanced with aggregation
  }
  
  // Rating filter
  if (rating) {
    query.rating = { $gte: rating };
  }
  
  // Availability filter
  if (availability) {
    const availabilityDate = new Date(availability);
    query['profile.availability.startDate'] = { $lte: availabilityDate };
  }
  
  return this.find(query)
    .populate('userId', 'firstName lastName email')
    .populate('resumeFileId', 'filename originalName url')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

/**
 * Find candidates by skills
 */
(candidateSchema.statics as any).findBySkills = function(skills: string[], options: any = {}) {
  const { limit = 20, skip = 0 } = options;
  
  return this.find({
    'profile.skills': { $in: skills },
    status: CandidateStatus.ACTIVE,
  })
  .populate('userId', 'firstName lastName email')
  .sort({ rating: -1, createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

/**
 * Get candidates available for new positions
 */
(candidateSchema.statics as any).getAvailableCandidates = function(options: any = {}) {
  const { location, skills, limit = 20, skip = 0 } = options;
  
  const query: any = {
    status: CandidateStatus.ACTIVE,
    'profile.availability.startDate': { $lte: new Date() },
  };
  
  if (location) {
    query['profile.location'] = new RegExp(location, 'i');
  }
  
  if (skills && skills.length > 0) {
    query['profile.skills'] = { $in: skills };
  }
  
  return this.find(query)
    .populate('userId', 'firstName lastName email')
    .sort({ rating: -1, lastActivityAt: -1 })
    .limit(limit)
    .skip(skip);
};

// ============================================================================
// Middleware (Hooks)
// ============================================================================

/**
 * Pre-save middleware
 */
candidateSchema.pre('save', function(this: CandidateDocument, next) {
  // Update last activity on any change
  if (this.isModified()) {
    this.lastActivityAt = new Date();
  }
  
  // Validate availability start date
  if (this.isModified('profile.availability.startDate') && this.profile.availability?.startDate) {
    const startDate = this.profile.availability.startDate;
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);
    
    if (startDate < now || startDate > oneYearFromNow) {
      return next(new Error('Availability start date must be between now and one year from now'));
    }
  }
  
  next();
});

/**
 * Pre-deleteOne middleware
 */
candidateSchema.pre('deleteOne', async function(this: CandidateDocument) {
  try {
    // TODO: Cleanup related data
    // - Remove applications
    // - Update tasks
    // - Delete resume file
    // - etc.
  } catch (error) {
    throw error;
  }
});

// ============================================================================
// Model Export
// ============================================================================

export const Candidate = mongoose.model<CandidateDocument>('Candidate', candidateSchema);
