import mongoose, { Schema, Document } from 'mongoose';
import { 
  Task as ITask, 
  TaskStatus, 
  TaskPriority, 
  TaskChecklistItem 
} from '@/types';

/**
 * Task model interface extending Mongoose Document
 */
export interface TaskDocument extends Omit<ITask, '_id' | 'assignedTo' | 'createdBy' | 'notes'>, Document {
  _id: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  
  // Override notes to match schema structure
  notes: {
    content: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    isInternal: boolean;
  }[];
  
  // Additional properties that exist in schema
  category: string;
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  timeEntries: {
    startTime: Date;
    endTime: Date;
    duration: number;
    description?: string;
    loggedBy: mongoose.Types.ObjectId;
    loggedAt: Date;
  }[];
  checklistProgress: number;
  recurring: {
    enabled: boolean;
    frequency: string;
    interval: number;
    endDate?: Date;
  };
  dependencies: {
    taskId: mongoose.Types.ObjectId;
    type: string;
  }[];
  attachments: {
    fileId: mongoose.Types.ObjectId;
    fileName: string;
    fileSize: number;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
  }[];
  
  // Virtual properties
  totalTimeSpent: number;
  isOverdue: boolean;
  isDueSoon: boolean;
  isChecklistComplete: boolean;
  
  // Instance methods
  addNote(content: string, createdBy: mongoose.Types.ObjectId, isInternal: boolean): void;
  toggleChecklistItem(itemId: string, completedBy: mongoose.Types.ObjectId): void;
  addChecklistItem(text: string): void;
  removeChecklistItem(itemId: string): void;
  startTask(): void;
  completeTask(completedBy?: mongoose.Types.ObjectId): void;
  cancelTask(reason?: string, cancelledBy?: mongoose.Types.ObjectId): void;
  addTimeEntry(startTime: Date, endTime: Date, description?: string, loggedBy?: mongoose.Types.ObjectId): void;
  updatePriority(): void;
  cloneForRecurrence(): TaskDocument;
  calculateNextDueDate(): Date;
}

/**
 * Task checklist item sub-schema
 */
const checklistItemSchema = new Schema<TaskChecklistItem>({
  id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  text: {
    type: String,
    required: [true, 'Checklist item text is required'],
    maxlength: [200, 'Checklist item cannot exceed 200 characters'],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    required: false,
  },
  completedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
}, { _id: false });

/**
 * Task comment/note sub-schema
 */
const taskNoteSchema = new Schema({
  content: {
    type: String,
    required: [true, 'Note content is required'],
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
  isInternal: {
    type: Boolean,
    default: false,
  },
}, { _id: true });

/**
 * Main task schema
 */
const taskSchema = new Schema<TaskDocument>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters'],
    index: true,
  },
  
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [2000, 'Task description cannot exceed 2000 characters'],
  },
  
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must be assigned to someone'],
    index: true,
  },
  
  relatedEntity: {
    type: {
      type: String,
      enum: ['candidate', 'job', 'application', 'interview', 'company'],
    },
    id: {
      type: Schema.Types.ObjectId,
      refPath: function(this: TaskDocument) {
        const modelMap = {
          candidate: 'Candidate',
          job: 'Job',
          application: 'Application',
          interview: 'Interview',
          company: 'Company',
        };
        return this.relatedEntity?.type ? modelMap[this.relatedEntity.type] : undefined;
      },
    },
  },
  
  status: {
    type: String,
    enum: {
      values: Object.values(TaskStatus),
      message: 'Status must be one of: {VALUES}'
    },
    default: TaskStatus.TODO,
    index: true,
  },
  
  priority: {
    type: String,
    enum: {
      values: Object.values(TaskPriority),
      message: 'Priority must be one of: {VALUES}'
    },
    default: TaskPriority.MEDIUM,
    index: true,
  },
  
  dueDate: {
    type: Date,
    index: true,
    validate: {
      validator: function(this: TaskDocument, value: Date) {
        return !value || value > new Date();
      },
      message: 'Due date must be in the future',
    },
  },
  
  checklist: [checklistItemSchema],
  
  notes: [taskNoteSchema],
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator reference is required'],
    index: true,
  },
  
  completedAt: Date,
  
  // Task categorization
  category: {
    type: String,
    enum: [
      'recruitment',
      'interview',
      'onboarding',
      'documentation',
      'follow_up',
      'administrative',
      'client_communication',
      'other'
    ],
    default: 'recruitment',
    index: true,
  },
  
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
  }],
  
  // Time tracking
  estimatedHours: {
    type: Number,
    min: [0.25, 'Estimated hours must be at least 0.25'],
    max: [100, 'Estimated hours cannot exceed 100'],
  },
  
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
  },
  
  timeEntries: [{
    startTime: {
      type: Date,
      required: true,
    },
    endTime: Date,
    duration: {
      type: Number, // in minutes
      required: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Time entry description cannot exceed 500 characters'],
    },
    loggedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Recurrence settings
  recurring: {
    enabled: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly'],
    },
    interval: {
      type: Number,
      min: [1, 'Interval must be at least 1'],
      max: [52, 'Interval cannot exceed 52'],
    },
    endDate: Date,
    lastGenerated: Date,
  },
  
  // Dependencies
  dependencies: [{
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked_by', 'related'],
      default: 'blocks',
    },
  }],
  
  // Attachments
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'File',
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
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ status: 1, priority: -1, dueDate: 1 });
taskSchema.index({ createdBy: 1, createdAt: -1 });
taskSchema.index({ dueDate: 1, status: 1 });
taskSchema.index({ category: 1, status: 1 });
taskSchema.index({ 'relatedEntity.type': 1, 'relatedEntity.id': 1 });

// Text index for search functionality
taskSchema.index({
  title: 'text',
  description: 'text',
  'notes.content': 'text',
  tags: 'text',
});

// ============================================================================
// Virtual Properties
// ============================================================================

/**
 * Check if task is overdue
 */
taskSchema.virtual('isOverdue').get(function(this: TaskDocument) {
  return this.dueDate && 
         this.dueDate < new Date() && 
         this.status !== TaskStatus.COMPLETED;
});

/**
 * Check if task is due soon (within 24 hours)
 */
taskSchema.virtual('isDueSoon').get(function(this: TaskDocument) {
  if (!this.dueDate || this.status === TaskStatus.COMPLETED) return false;
  
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
  
  return this.dueDate <= twentyFourHoursFromNow;
});

/**
 * Checklist completion percentage
 */
taskSchema.virtual('checklistProgress').get(function(this: TaskDocument) {
  if (!this.checklist || this.checklist.length === 0) return 100;
  
  const completed = this.checklist.filter(item => item.completed).length;
  return Math.round((completed / this.checklist.length) * 100);
});

/**
 * Total time spent on task (in hours)
 */
taskSchema.virtual('totalTimeSpent').get(function(this: TaskDocument) {
  if (!this.timeEntries || this.timeEntries.length === 0) return 0;
  
  const totalMinutes = this.timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  return Math.round((totalMinutes / 60) * 100) / 100; // Round to 2 decimal places
});

/**
 * Days until due date
 */
taskSchema.virtual('daysUntilDue').get(function(this: TaskDocument) {
  if (!this.dueDate) return null;
  
  const now = new Date();
  const diffTime = this.dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

/**
 * Check if all checklist items are completed
 */
taskSchema.virtual('isChecklistComplete').get(function(this: TaskDocument) {
  return this.checklistProgress === 100;
});

// ============================================================================
// Instance Methods
// ============================================================================

/**
 * Add a note to the task
 */
(taskSchema.methods as any).addNote = function(
  this: TaskDocument, 
  content: string, 
  createdBy: mongoose.Types.ObjectId,
  isInternal = false
) {
  this.notes.push({
    content,
    createdBy,
    createdAt: new Date(),
    isInternal,
  });
};

/**
 * Toggle checklist item completion
 */
(taskSchema.methods as any).toggleChecklistItem = function(
  this: TaskDocument,
  itemId: string,
  completedBy: mongoose.Types.ObjectId
) {
  const item = this.checklist.find(item => item.id === itemId);
  if (!item) {
    throw new Error('Checklist item not found');
  }
  
  item.completed = !item.completed;
  
  if (item.completed) {
    item.completedAt = new Date();
    item.completedBy = completedBy;
  } else {
    (item as any).completedAt = undefined;
    (item as any).completedBy = undefined;
  }
  
  // Auto-complete task if all checklist items are done
  if (this.isChecklistComplete && this.status !== TaskStatus.COMPLETED) {
    this.completeTask(completedBy);
  }
};

/**
 * Add checklist item
 */
(taskSchema.methods as any).addChecklistItem = function(this: TaskDocument, text: string) {
  this.checklist.push({
    id: new mongoose.Types.ObjectId().toString(),
    text,
    completed: false,
  });
};

/**
 * Remove checklist item
 */
(taskSchema.methods as any).removeChecklistItem = function(this: TaskDocument, itemId: string) {
  this.checklist = this.checklist.filter(item => item.id !== itemId);
};

/**
 * Start working on task
 */
(taskSchema.methods as any).startTask = function(this: TaskDocument) {
  this.status = TaskStatus.IN_PROGRESS;
};

/**
 * Complete the task
 */
(taskSchema.methods as any).completeTask = function(this: TaskDocument, completedBy?: mongoose.Types.ObjectId) {
  this.status = TaskStatus.COMPLETED;
  this.completedAt = new Date();
  
  if (completedBy) {
    this.addNote('Task completed', completedBy, true);
  }
};

/**
 * Cancel the task
 */
(taskSchema.methods as any).cancelTask = function(this: TaskDocument, reason?: string, cancelledBy?: mongoose.Types.ObjectId) {
  this.status = TaskStatus.CANCELLED;
  
  if (reason && cancelledBy) {
    this.addNote(`Task cancelled: ${reason}`, cancelledBy, true);
  }
};

/**
 * Add time entry
 */
(taskSchema.methods as any).addTimeEntry = function(
  this: TaskDocument,
  entry: {
    startTime: Date;
    endTime?: Date;
    duration: number;
    description?: string;
  },
  loggedBy: mongoose.Types.ObjectId
) {
  this.timeEntries.push({
    startTime: entry.startTime,
    endTime: entry.endTime || new Date(),
    duration: entry.duration,
    ...(entry.description ? { description: entry.description } : {}),
    loggedBy,
    loggedAt: new Date(),
  });
  
  // Update actual hours
  this.actualHours = this.totalTimeSpent;
};

/**
 * Update priority based on due date and related entity urgency
 */
(taskSchema.methods as any).updatePriority = function(this: TaskDocument) {
  if (this.isOverdue) {
    this.priority = TaskPriority.URGENT;
  } else if (this.isDueSoon) {
    this.priority = TaskPriority.HIGH;
  }
  // Could add logic to check related entity urgency (e.g., job urgency)
};

/**
 * Clone task for recurring tasks
 */
(taskSchema.methods as any).cloneForRecurrence = function(this: TaskDocument) {
  if (!this.recurring.enabled) {
    throw new Error('Task is not set for recurrence');
  }
  
  const newDueDate = this.calculateNextDueDate();
  
  const clonedTask = new (this.constructor as any)({
    title: this.title,
    description: this.description,
    assignedTo: this.assignedTo,
    relatedEntity: this.relatedEntity,
    priority: this.priority,
    category: this.category,
    tags: [...this.tags],
    estimatedHours: this.estimatedHours,
    checklist: this.checklist.map(item => ({
      id: new mongoose.Types.ObjectId().toString(),
      text: item.text,
      completed: false,
    })),
    dueDate: newDueDate,
    recurring: this.recurring,
    createdBy: this.createdBy,
  });
  
  return clonedTask;
};

/**
 * Calculate next due date for recurring tasks
 */
(taskSchema.methods as any).calculateNextDueDate = function(this: TaskDocument): Date {
  if (!this.dueDate || !this.recurring.enabled) {
    throw new Error('Cannot calculate next due date for non-recurring task');
  }
  
  const nextDate = new Date(this.dueDate);
  const interval = this.recurring.interval || 1;
  
  switch (this.recurring.frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (interval * 7));
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + (interval * 3));
      break;
    default:
      throw new Error('Invalid recurrence frequency');
  }
  
  return nextDate;
};

// ============================================================================
// Static Methods
// ============================================================================

/**
 * Get tasks assigned to user
 */
(taskSchema.statics as any).getUserTasks = function(
  userId: mongoose.Types.ObjectId,
  options: any = {}
) {
  const { status, priority, category, overdue, limit = 20, skip = 0 } = options;
  
  const query: any = { assignedTo: userId };
  
  if (status) {
    query.status = Array.isArray(status) ? { $in: status } : status;
  }
  if (priority) query.priority = priority;
  if (category) query.category = category;
  
  if (overdue) {
    query.dueDate = { $lt: new Date() };
    query.status = { $ne: TaskStatus.COMPLETED };
  }
  
  return this.find(query)
    .populate('createdBy', 'firstName lastName')
    .populate('assignedTo', 'firstName lastName')
    .populate('relatedEntity.id')
    .sort({ priority: -1, dueDate: 1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Get overdue tasks
 */
(taskSchema.statics as any).getOverdueTasks = function(options: any = {}) {
  const { assignedTo, limit = 50 } = options;
  
  const query: any = {
    dueDate: { $lt: new Date() },
    status: { $ne: TaskStatus.COMPLETED },
  };
  
  if (assignedTo) query.assignedTo = assignedTo;
  
  return this.find(query)
    .populate('assignedTo', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName')
    .sort({ dueDate: 1 })
    .limit(limit);
};

/**
 * Get tasks by related entity
 */
(taskSchema.statics as any).getTasksByEntity = function(
  entityType: string,
  entityId: mongoose.Types.ObjectId,
  options: any = {}
) {
  const { status, limit = 20, skip = 0 } = options;
  
  const query: any = {
    'relatedEntity.type': entityType,
    'relatedEntity.id': entityId,
  };
  
  if (status) query.status = status;
  
  return this.find(query)
    .populate('assignedTo', 'firstName lastName')
    .populate('createdBy', 'firstName lastName')
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Get task statistics for dashboard
 */
(taskSchema.statics as any).getTaskStats = function(
  userId?: mongoose.Types.ObjectId,
  dateRange?: { start: Date; end: Date }
) {
  const pipeline: any[] = [];
  
  // Match stage
  const matchConditions: any = {};
  if (userId) matchConditions.assignedTo = userId;
  if (dateRange) {
    matchConditions.createdAt = {
      $gte: dateRange.start,
      $lte: dateRange.end,
    };
  }
  
  if (Object.keys(matchConditions).length > 0) {
    pipeline.push({ $match: matchConditions });
  }
  
  // Group by status
  pipeline.push({
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      avgHours: { $avg: '$actualHours' },
      totalHours: { $sum: '$actualHours' },
    },
  });
  
  return this.aggregate(pipeline);
};

// ============================================================================
// Middleware (Hooks)
// ============================================================================

/**
 * Pre-save middleware
 */
taskSchema.pre('save', function(this: TaskDocument, next) {
  // Auto-update priority based on due date
  if (this.isModified('dueDate') || this.isNew) {
    this.updatePriority();
  }
  
  // Validate recurring settings
  if (this.recurring.enabled) {
    if (!this.recurring.frequency || !this.recurring.interval) {
      return next(new Error('Frequency and interval are required for recurring tasks'));
    }
  }
  
  next();
});

// ============================================================================
// Model Export
// ============================================================================

export const Task = mongoose.model<TaskDocument>('Task', taskSchema);
