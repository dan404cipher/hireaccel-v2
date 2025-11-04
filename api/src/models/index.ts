/**
 * Models index file
 * Exports all Mongoose models for the Hiring Platform
 */

// Export model classes
export { User, UserDocument } from './User';
export { Candidate, CandidateDocument } from './Candidate';
export { Job, JobDocument } from './Job';
export { Company, CompanyDocument } from './Company';
export { Application, ApplicationDocument } from './Application';
export { Interview, InterviewDocument } from './Interview';
export { Task, TaskDocument } from './Task';
export { File, FileDocument } from './File';
export { AuditLog, AuditLogDocument } from './AuditLog';
export { CandidateAssignment, CandidateAssignmentDocument } from './CandidateAssignment';
export { AgentAssignment, AgentAssignmentDocument } from './AgentAssignment';
export { Notification, NotificationDocument } from './Notification';
export { AnalyticsEvent, AnalyticsEventDocument } from './AnalyticsEvent';
export { Message, MessageDocument, Conversation, ConversationDocument } from './Message';

/**
 * Initialize all models
 * This function ensures all models are registered with Mongoose
 * Call this after connecting to the database
 */
export const initializeModels = () => {
  // Import all models to ensure they are registered
  require('./User');
  require('./Candidate');
  require('./Job');
  require('./Company');
  require('./Application');
  require('./Interview');
  require('./Task');
  require('./File');
  require('./AuditLog');
  require('./CandidateAssignment');
  require('./AgentAssignment');
  require('./Notification');
  require('./AnalyticsEvent');
  require('./Message');
  
  console.log('✅ All models initialized');
};

/**
 * Model names for reference
 */
export const MODEL_NAMES = {
  USER: 'User',
  CANDIDATE: 'Candidate',
  JOB: 'Job',
  COMPANY: 'Company',
  APPLICATION: 'Application',
  INTERVIEW: 'Interview',
  TASK: 'Task',
  FILE: 'File',
  AUDIT_LOG: 'AuditLog',
  CANDIDATE_ASSIGNMENT: 'CandidateAssignment',
  AGENT_ASSIGNMENT: 'AgentAssignment',
  NOTIFICATION: 'Notification',
  ANALYTICS_EVENT: 'AnalyticsEvent',
} as const;

/**
 * Model validation helper
 * Validates that all required models are available
 */
export const validateModels = () => {
  const mongoose = require('mongoose');
  const requiredModels = Object.values(MODEL_NAMES);
  const registeredModels = Object.keys(mongoose.models);
  
  const missingModels = requiredModels.filter(model => !registeredModels.includes(model));
  
  if (missingModels.length > 0) {
    throw new Error(`Missing models: ${missingModels.join(', ')}`);
  }
  
  console.log('✅ All required models are registered');
  return true;
};
