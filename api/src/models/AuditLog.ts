import mongoose, { Schema, Document } from 'mongoose';
import { AuditLog as IAuditLog, AuditAction } from '@/types';

/**
 * Audit log model interface extending Mongoose Document
 */
export interface AuditLogDocument extends Omit<IAuditLog, '_id' | 'actor' | 'entityId'>, Document {
  _id: mongoose.Types.ObjectId;
  actor: mongoose.Types.ObjectId;
  entityId: mongoose.Types.ObjectId;
  
  // Additional properties that exist in schema but not in base interface
  riskLevel: string;
  tags: string[];
  metadata: any;
  retentionUntil?: Date;
  
  // Instance methods
  isHighRisk(): boolean;
  isFailed(): boolean;
  calculateChanges(before: any, after: any): any[];
  addTag(tag: string): void;
  removeTag(tag: string): void;
  markAsHighRisk(reason?: string): void;
  setRetention(days: number): void;
  generateDescription(): string;
}

export interface AuditLogModel extends mongoose.Model<AuditLogDocument> {
  createLog(logData: any): Promise<AuditLogDocument>;
  getEntityLogs(entityType: string, entityId: string, options?: any): Promise<AuditLogDocument[]>;
  getUserLogs(userId: string, options?: any): Promise<AuditLogDocument[]>;
  getHighRiskActivities(options?: any): Promise<AuditLogDocument[]>;
  getFailedActivities(options?: any): Promise<AuditLogDocument[]>;
  getAuditStats(dateRange?: { start: Date; end: Date }): Promise<any>;
  searchLogs(query: string, options?: any): Promise<AuditLogDocument[]>;
}

/**
 * Data change sub-schema for tracking field-level changes
 */
const dataChangeSchema = new Schema({
  field: {
    type: String,
    required: true,
  },
  oldValue: Schema.Types.Mixed,
  newValue: Schema.Types.Mixed,
  dataType: {
    type: String,
    enum: ['string', 'number', 'boolean', 'date', 'object', 'array'],
  },
}, { _id: false });

/**
 * Main audit log schema
 */
const auditLogSchema = new Schema<AuditLogDocument>({
  actor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Actor reference is required'],
    index: true,
  },
  
  action: {
    type: String,
    enum: {
      values: Object.values(AuditAction),
      message: 'Action must be one of: {VALUES}'
    },
    required: [true, 'Action is required'],
    index: true,
  },
  
  entityType: {
    type: String,
    required: [true, 'Entity type is required'],
    enum: [
      'User',
      'Candidate',
      'Job',
      'Application',
      'Interview',
      'Company',
      'Task',
      'File',
      'AuditLog',
      'CandidateAssignment',
      'AgentAssignment',
    ],
    index: true,
  },
  
  entityId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Entity ID is required'],
    index: true,
    refPath: 'entityType',
  },
  
  before: {
    type: Schema.Types.Mixed,
    default: null,
  },
  
  after: {
    type: Schema.Types.Mixed,
    default: null,
  },
  
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  
  ipAddress: {
    type: String,
    validate: {
      validator: function(v: string) {
        // Allow empty/null values and more flexible IP address formats
        if (!v) return true;
        
        // IPv4 pattern
        const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        
        // IPv6 patterns (including compressed and IPv4-mapped)
        const ipv6Patterns = [
          /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/, // Full IPv6
          /^::1$/, // IPv6 localhost
          /^::$/, // IPv6 any address
          /^::ffff:(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, // IPv4-mapped IPv6
          /^([0-9a-fA-F]{1,4}:){1,7}:$/, // Compressed IPv6
          /^:([0-9a-fA-F]{1,4}:){1,6}[0-9a-fA-F]{1,4}$/, // Compressed IPv6
        ];
        
        return ipv4Pattern.test(v) || ipv6Patterns.some(pattern => pattern.test(v));
      },
      message: 'Invalid IP address format',
    },
    index: true,
  },
  
  userAgent: {
    type: String,
    maxlength: [1000, 'User agent cannot exceed 1000 characters'],
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  
  // Request context
  requestId: {
    type: String,
    index: true,
  },
  
  sessionId: {
    type: String,
    index: true,
  },
  
  // Detailed change tracking
  changes: [dataChangeSchema],
  
  // Risk assessment
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
    index: true,
  },
  
  // Business context
  businessProcess: {
    type: String,
    enum: [
      'authentication',
      'user_management',
      'candidate_management',
      'candidate_profile_management',
      'job_management',
      'application_processing',
      'interview_scheduling',
      'company_management',
      'task_management',
      'file_management',
      'system_administration',
      'data_export',
      'reporting',
      'agent_management',
    ],
    index: true,
  },
  
  // Compliance and regulatory
  complianceCategory: {
    type: String,
    enum: [
      'gdpr',
      'ccpa',
      'sox',
      'hipaa',
      'pci_dss',
      'general',
    ],
    default: 'general',
  },
  
  // System information
  systemInfo: {
    application: {
      type: String,
      default: 'hire-accel-api',
    },
    version: String,
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
    },
    server: String,
  },
  
  // Success/failure tracking
  success: {
    type: Boolean,
    default: true,
  },
  
  errorMessage: String,
  
  errorCode: String,
  
  // Performance metrics
  duration: {
    type: Number, // in milliseconds
    min: [0, 'Duration cannot be negative'],
  },
  
  // Additional context
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters'],
  }],
  
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  
  // Retention policy
  retentionUntil: {
    type: Date,
    index: true,
  },
  
}, {
  timestamps: false, // We use custom timestamp field
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
auditLogSchema.index({ actor: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ businessProcess: 1, timestamp: -1 });
auditLogSchema.index({ riskLevel: 1, timestamp: -1 });
auditLogSchema.index({ success: 1, timestamp: -1 });

// Date-based indexes for time range queries
auditLogSchema.index({ timestamp: -1, actor: 1 });
auditLogSchema.index({ timestamp: -1, entityType: 1 });

// TTL index for automatic cleanup based on retention policy
auditLogSchema.index({ retentionUntil: 1 }, { expireAfterSeconds: 0 });

// Text index for search functionality
auditLogSchema.index({
  description: 'text',
  errorMessage: 'text',
  tags: 'text',
  'metadata.reason': 'text',
});

// ============================================================================
// Virtual Properties
// ============================================================================

/**
 * Human readable timestamp
 */
auditLogSchema.virtual('humanTimestamp').get(function(this: AuditLogDocument) {
  return this.timestamp.toISOString();
});

/**
 * Time since the action occurred
 */
auditLogSchema.virtual('timeAgo').get(function(this: AuditLogDocument) {
  const now = new Date();
  const diffMs = now.getTime() - this.timestamp.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${Math.max(1, diffMinutes)} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }
});

/**
 * Check if this is a high-risk action
 */
auditLogSchema.virtual('isHighRisk').get(function(this: AuditLogDocument) {
  return this.riskLevel ? ['high', 'critical'].includes(this.riskLevel) : false;
});

/**
 * Check if this action failed
 */
auditLogSchema.virtual('isFailed').get(function(this: AuditLogDocument) {
  return !this.success;
});

/**
 * Summary of changes made
 */
auditLogSchema.virtual('changesSummary').get(function(this: AuditLogDocument) {
  if (!this.changes || this.changes.length === 0) {
    return null;
  }
  
  return this.changes.map(change => 
    `${change.field}: ${change.oldValue} → ${change.newValue}`
  ).join(', ');
});

// ============================================================================
// Instance Methods
// ============================================================================

/**
 * Add a tag to the audit log
 */
auditLogSchema.methods['addTag'] = function(this: AuditLogDocument, tag: string) {
  if (!this.tags || !this.tags.includes(tag)) {
    if (!this.tags) this.tags = [];
    this.tags.push(tag);
  }
};

/**
 * Remove a tag from the audit log
 */
auditLogSchema.methods['removeTag'] = function(this: AuditLogDocument, tag: string) {
  if (this.tags) {
    this.tags = this.tags.filter(t => t !== tag);
  }
};

/**
 * Mark as high risk
 */
auditLogSchema.methods['markAsHighRisk'] = function(this: AuditLogDocument, reason?: string) {
  this.riskLevel = 'high';
  if (reason && this.metadata) {
    this.metadata['riskReason'] = reason;
  }
};

/**
 * Set retention period
 */
auditLogSchema.methods['setRetention'] = function(this: AuditLogDocument, days: number) {
  const retentionDate = new Date();
  retentionDate.setDate(retentionDate.getDate() + days);
  this.retentionUntil = retentionDate;
};

/**
 * Generate human-readable description of the action
 */
auditLogSchema.methods['generateDescription'] = function(this: AuditLogDocument) {
  const actionMap = {
    [AuditAction.CREATE]: 'created',
    [AuditAction.READ]: 'viewed',
    [AuditAction.UPDATE]: 'updated',
    [AuditAction.DELETE]: 'deleted',
    [AuditAction.LOGIN]: 'logged in',
    [AuditAction.LOGOUT]: 'logged out',
    [AuditAction.UPLOAD]: 'uploaded',
    [AuditAction.DOWNLOAD]: 'downloaded',
    [AuditAction.APPROVE]: 'approved',
    [AuditAction.REJECT]: 'rejected',
    [AuditAction.ASSIGN]: 'assigned',
    [AuditAction.ADVANCE]: 'advanced',
  };
  
  const actionText = actionMap[this.action] || this.action;
  const entityTypeText = this.entityType.toLowerCase();
  
  return `User ${actionText} ${entityTypeText} ${this.entityId}`;
};

// ============================================================================
// Static Methods
// ============================================================================

/**
 * Create audit log entry
 */
auditLogSchema.statics['createLog'] = function(logData: {
  actor: mongoose.Types.ObjectId;
  action: AuditAction;
  entityType: string;
  entityId: mongoose.Types.ObjectId;
  before?: any;
  after?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;
  riskLevel?: string;
  businessProcess?: string;
  description?: string;
  duration?: number;
}) {
  // Determine risk level based on action if not provided
  if (!logData.riskLevel) {
    const highRiskActions = [
      AuditAction.DELETE,
      AuditAction.LOGIN,
      AuditAction.LOGOUT,
    ];
    logData.riskLevel = highRiskActions.includes(logData.action) ? 'medium' : 'low';
  }
  
  // Set retention period based on risk level and compliance requirements
  const retentionDays = {
    low: 365,      // 1 year
    medium: 2555,  // 7 years
    high: 2555,    // 7 years
    critical: 3650, // 10 years
  };
  
  const auditLog = new this({
    ...logData,
    timestamp: new Date(),
    systemInfo: {
      application: 'hire-accel-api',
      version: process.env['npm_package_version'] || '1.0.0',
      environment: process.env['NODE_ENV'] || 'development',
    },
  });
  
  auditLog.setRetention(retentionDays[logData.riskLevel as keyof typeof retentionDays] || 365);
  
  return auditLog.save();
};

/**
 * Get audit logs for a specific entity
 */
auditLogSchema.statics['getEntityLogs'] = function(
  entityType: string,
  entityId: mongoose.Types.ObjectId,
  options: any = {}
) {
  const { limit = 50, skip = 0, actions, actors, dateRange } = options;
  
  const query: any = {
    entityType,
    entityId,
  };
  
  if (actions && actions.length > 0) {
    query.action = { $in: actions };
  }
  
  if (actors && actors.length > 0) {
    query.actor = { $in: actors };
  }
  
  if (dateRange) {
    query.timestamp = {};
    if (dateRange.start) query.timestamp.$gte = new Date(dateRange.start);
    if (dateRange.end) query.timestamp.$lte = new Date(dateRange.end);
  }
  
  return this.find(query)
    .populate('actor', 'firstName lastName email role')
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Get audit logs for a specific user
 */
auditLogSchema.statics['getUserLogs'] = function(
  userId: mongoose.Types.ObjectId,
  options: any = {}
) {
  const { limit = 50, skip = 0, actions, entityTypes, dateRange } = options;
  
  const query: any = { actor: userId };
  
  if (actions && actions.length > 0) {
    query.action = { $in: actions };
  }
  
  if (entityTypes && entityTypes.length > 0) {
    query.entityType = { $in: entityTypes };
  }
  
  if (dateRange) {
    query.timestamp = {};
    if (dateRange.start) query.timestamp.$gte = new Date(dateRange.start);
    if (dateRange.end) query.timestamp.$lte = new Date(dateRange.end);
  }
  
  return this.find(query)
    .populate('actor', 'firstName lastName email role')
    .populate('entityId')
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Get high-risk activities
 */
auditLogSchema.statics['getHighRiskActivities'] = function(options: any = {}) {
  const { limit = 100, hours = 24 } = options;
  
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hours);
  
  return this.find({
    riskLevel: { $in: ['high', 'critical'] },
    timestamp: { $gte: cutoffTime },
  })
  .populate('actor', 'firstName lastName email role')
  .sort({ timestamp: -1 })
  .limit(limit);
};

/**
 * Get failed activities
 */
auditLogSchema.statics['getFailedActivities'] = function(options: any = {}) {
  const { limit = 100, hours = 24 } = options;
  
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hours);
  
  return this.find({
    success: false,
    timestamp: { $gte: cutoffTime },
  })
  .populate('actor', 'firstName lastName email role')
  .sort({ timestamp: -1 })
  .limit(limit);
};

/**
 * Get audit statistics
 */
auditLogSchema.statics['getAuditStats'] = function(dateRange?: { start: Date; end: Date }) {
  const pipeline: any[] = [];
  
  if (dateRange) {
    pipeline.push({
      $match: {
        timestamp: {
          $gte: dateRange.start,
          $lte: dateRange.end,
        },
      },
    });
  }
  
  pipeline.push(
    {
      $group: {
        _id: {
          action: '$action',
          entityType: '$entityType',
          success: '$success',
        },
        count: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
      },
    },
    {
      $group: {
        _id: null,
        actionStats: {
          $push: {
            action: '$_id.action',
            entityType: '$_id.entityType',
            success: '$_id.success',
            count: '$count',
            avgDuration: '$avgDuration',
          },
        },
        totalLogs: { $sum: '$count' },
      },
    }
  );
  
  return this.aggregate(pipeline);
};

/**
 * Search audit logs
 */
auditLogSchema.statics['searchLogs'] = function(
  searchTerm: string,
  options: any = {}
) {
  const { limit = 50, skip = 0, dateRange } = options;
  
  const query: any = {
    $text: { $search: searchTerm },
  };
  
  if (dateRange) {
    query.timestamp = {};
    if (dateRange.start) query.timestamp.$gte = new Date(dateRange.start);
    if (dateRange.end) query.timestamp.$lte = new Date(dateRange.end);
  }
  
  return this.find(query)
    .score({ score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, timestamp: -1 })
    .populate('actor', 'firstName lastName email role')
    .limit(limit)
    .skip(skip);
};

// ============================================================================
// Middleware (Hooks)
// ============================================================================

/**
 * Pre-save middleware
 */
auditLogSchema.pre('save', function(this: AuditLogDocument, next) {
  // Generate description if not provided
  if (!this.description) {
    this.description = this.generateDescription();
  }
  
  // Calculate changes if before and after are provided
  if (this.before && this.after && (!this.changes || this.changes.length === 0)) {
    this.changes = this.calculateChanges(this.before, this.after);
  }
  
  next();
});

/**
 * Calculate field-level changes between before and after states
 */
auditLogSchema.methods['calculateChanges'] = function(before: any, after: any) {
  const changes: any[] = [];
  
  // Simple field comparison (can be enhanced for nested objects)
  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  
  for (const key of allKeys) {
    const oldValue = before?.[key];
    const newValue = after?.[key];
    
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        oldValue,
        newValue,
        dataType: typeof newValue,
      });
    }
  }
  
  return changes;
};

// ============================================================================
// Model Export
// ============================================================================

export const AuditLog = mongoose.model<AuditLogDocument, AuditLogModel>('AuditLog', auditLogSchema);
