import mongoose, { Schema, Document } from 'mongoose';

/**
 * Agent Assignment interface
 * Tracks when admin assigns HR users and candidates to agents
 */
export interface IAgentAssignment {
  _id: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  assignedHRs: mongoose.Types.ObjectId[];
  assignedCandidates: mongoose.Types.ObjectId[];
  assignedBy: mongoose.Types.ObjectId; // Admin user who made the assignment
  status: 'active' | 'inactive';
  notes?: string;
  assignedAt: Date;
  updatedAt: Date;
  createdAt: Date;
}

/**
 * Agent Assignment model interface extending Mongoose Document
 */
export interface AgentAssignmentDocument extends Omit<IAgentAssignment, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
  
  // Instance methods
  addHR(hrId: mongoose.Types.ObjectId): void;
  removeHR(hrId: mongoose.Types.ObjectId): void;
  addCandidate(candidateId: mongoose.Types.ObjectId): void;
  removeCandidate(candidateId: mongoose.Types.ObjectId): void;
  deactivate(): void;
  activate(): void;
}

/**
 * Agent Assignment model interface for static methods
 */
export interface AgentAssignmentModel extends mongoose.Model<AgentAssignmentDocument> {
  getAssignmentForAgent(agentId: mongoose.Types.ObjectId): Promise<AgentAssignmentDocument | null>;
  getAgentsWithAssignments(): Promise<AgentAssignmentDocument[]>;
  getHRsForAgent(agentId: mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId[]>;
  getCandidatesForAgent(agentId: mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId[]>;
}

/**
 * Main agent assignment schema
 */
const agentAssignmentSchema = new Schema<AgentAssignmentDocument>({
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Agent reference is required'],
    unique: true, // Each agent can have only one assignment record
    index: true,
  },
  
  assignedHRs: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  }],
  
  assignedCandidates: [{
    type: Schema.Types.ObjectId,
    ref: 'Candidate',
    index: true,
  }],
  
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin user reference is required'],
    index: true,
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
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
agentAssignmentSchema.index({ agentId: 1, status: 1 });
agentAssignmentSchema.index({ assignedBy: 1, status: 1, assignedAt: -1 });
agentAssignmentSchema.index({ 'assignedHRs': 1, status: 1 });
agentAssignmentSchema.index({ 'assignedCandidates': 1, status: 1 });

// ============================================================================
// Virtual Properties
// ============================================================================

/**
 * Count of assigned HRs
 */
agentAssignmentSchema.virtual('hrCount').get(function(this: AgentAssignmentDocument) {
  return this.assignedHRs.length;
});

/**
 * Count of assigned candidates
 */
agentAssignmentSchema.virtual('candidateCount').get(function(this: AgentAssignmentDocument) {
  return this.assignedCandidates.length;
});

/**
 * Check if assignment is active
 */
agentAssignmentSchema.virtual('isActive').get(function(this: AgentAssignmentDocument) {
  return this.status === 'active';
});

// ============================================================================
// Instance Methods
// ============================================================================

/**
 * Add HR to agent's assignment
 */
agentAssignmentSchema.methods['addHR'] = function(this: AgentAssignmentDocument, hrId: mongoose.Types.ObjectId) {
  if (!this.assignedHRs.includes(hrId)) {
    this.assignedHRs.push(hrId);
  }
};

/**
 * Remove HR from agent's assignment
 */
agentAssignmentSchema.methods['removeHR'] = function(this: AgentAssignmentDocument, hrId: mongoose.Types.ObjectId) {
  this.assignedHRs = this.assignedHRs.filter(id => !id.equals(hrId));
};

/**
 * Add candidate to agent's assignment
 */
agentAssignmentSchema.methods['addCandidate'] = function(this: AgentAssignmentDocument, candidateId: mongoose.Types.ObjectId) {
  if (!this.assignedCandidates.includes(candidateId)) {
    this.assignedCandidates.push(candidateId);
  }
};

/**
 * Remove candidate from agent's assignment
 */
agentAssignmentSchema.methods['removeCandidate'] = function(this: AgentAssignmentDocument, candidateId: mongoose.Types.ObjectId) {
  this.assignedCandidates = this.assignedCandidates.filter(id => !id.equals(candidateId));
};

/**
 * Deactivate assignment
 */
agentAssignmentSchema.methods['deactivate'] = function(this: AgentAssignmentDocument) {
  this.status = 'inactive';
};

/**
 * Activate assignment
 */
agentAssignmentSchema.methods['activate'] = function(this: AgentAssignmentDocument) {
  this.status = 'active';
};

// ============================================================================
// Static Methods
// ============================================================================

/**
 * Get assignment record for specific agent
 */
agentAssignmentSchema.statics['getAssignmentForAgent'] = async function(agentId: mongoose.Types.ObjectId) {
  console.log(`[AgentAssignment] Getting assignment details for agent: ${agentId}`);
  const assignment = await this.findOne({ agentId, status: 'active' })
    .populate('agentId', 'firstName lastName email')
    .populate('assignedHRs', 'firstName lastName email')
    .populate({
      path: 'assignedCandidates',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    })
    .populate('assignedBy', 'firstName lastName email');
  console.log(`[AgentAssignment] Assignment details:`, {
    id: assignment?._id,
    hrCount: assignment?.assignedHRs?.length || 0,
    candidateCount: assignment?.assignedCandidates?.length || 0,
    status: assignment?.status
  });
  return assignment;
};

/**
 * Get all agents with their assignments
 */
agentAssignmentSchema.statics['getAgentsWithAssignments'] = function() {
  return this.find({ status: 'active' })
    .populate('agentId', 'firstName lastName email')
    .populate('assignedHRs', 'firstName lastName email')
    .populate({
      path: 'assignedCandidates',
      populate: {
        path: 'userId',
        select: 'firstName lastName email'
      }
    })
    .populate('assignedBy', 'firstName lastName email')
    .sort({ assignedAt: -1 });
};

/**
 * Get HR users assigned to specific agent
 */
agentAssignmentSchema.statics['getHRsForAgent'] = async function(agentId: mongoose.Types.ObjectId) {
  const assignment = await this.findOne({ agentId, status: 'active' }).select('assignedHRs');
  return assignment ? assignment.assignedHRs : [];
};

/**
 * Get candidates assigned to specific agent
 */
agentAssignmentSchema.statics['getCandidatesForAgent'] = async function(agentId: mongoose.Types.ObjectId) {
  console.log(`[AgentAssignment] Getting candidates for agent: ${agentId}`);
  const assignment = await this.findOne({ agentId, status: 'active' }).select('assignedCandidates');
  console.log(`[AgentAssignment] Found assignment: ${assignment?._id}, Candidate count: ${assignment?.assignedCandidates?.length || 0}`);
  return assignment ? assignment.assignedCandidates : [];
};

// ============================================================================
// Model Export
// ============================================================================

export const AgentAssignment = mongoose.model<AgentAssignmentDocument, AgentAssignmentModel>('AgentAssignment', agentAssignmentSchema);
