import mongoose, { Schema, Document } from 'mongoose';
import { User as IUser, UserRole, UserStatus } from '@/types';

/**
 * User model interface extending Mongoose Document
 */
export interface UserDocument extends Omit<IUser, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
  
  // Additional fields for authentication
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshTokens: Array<{
    token: string;
    createdAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }>;
  
  // Instance methods
  addRefreshToken(token: string, userAgent?: string, ipAddress?: string): void;
  removeRefreshToken(token: string): void;
  removeAllRefreshTokens(): void;
  updateLastLogin(): void;
  isPasswordResetTokenValid(token: string): boolean;
  isEmailVerificationTokenValid(token: string): boolean;
}

/**
 * User model interface with static methods
 */
export interface UserModel extends mongoose.Model<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
  findByRole(role: UserRole): Promise<UserDocument[]>;
  searchUsers(searchTerm: string, options?: any): Promise<UserDocument[]>;
}

/**
 * User schema definition
 * Represents all users in the system across different roles
 */
const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ],
    index: true,
  },
  
  customId: {
    type: String,
    unique: true,
    required: [true, 'Custom user ID is required'],
    index: true,
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false, // Don't include password in queries by default
  },
  
  role: {
    type: String,
    enum: {
      values: Object.values(UserRole),
      message: 'Role must be one of: {VALUES}'
    },
    required: [true, 'User role is required'],
    index: true,
  },
  
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  
  status: {
    type: String,
    enum: {
      values: Object.values(UserStatus),
      message: 'Status must be one of: {VALUES}'
    },
    default: UserStatus.ACTIVE,
    index: true,
  },
  
  lastLoginAt: {
    type: Date,
    default: null,
  },
  
  emailVerified: {
    type: Boolean,
    default: false,
  },
  
  // Metadata for password reset
  resetPasswordToken: {
    type: String,
    select: false,
  },
  
  resetPasswordExpires: {
    type: Date,
    select: false,
  },
  
  // Email verification
  emailVerificationToken: {
    type: String,
    select: false,
  },
  
  emailVerificationExpires: {
    type: Date,
    select: false,
  },
  
  // Refresh token for JWT rotation
  refreshTokens: [{
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800, // 7 days in seconds
    },
    userAgent: String,
    ipAddress: String,
  }],
  
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(_doc, ret: any) {
      // Remove sensitive fields from JSON output
      if (ret.password) delete ret.password;
      if (ret.refreshTokens) delete ret.refreshTokens;
      if (ret.resetPasswordToken) delete ret.resetPasswordToken;
      if (ret.resetPasswordExpires) delete ret.resetPasswordExpires;
      if (ret.emailVerificationToken) delete ret.emailVerificationToken;
      if (ret.emailVerificationExpires) delete ret.emailVerificationExpires;
      if (ret.__v) delete ret.__v;
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
userSchema.index({ email: 1, status: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ createdAt: -1 });

// Text index for search functionality
userSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
});

// TTL index for expired tokens
userSchema.index({ 'refreshTokens.createdAt': 1 }, { expireAfterSeconds: 604800 });

// ============================================================================
// Virtual Properties
// ============================================================================

/**
 * Full name virtual property
 */
userSchema.virtual('fullName').get(function(this: UserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Check if user is active
 */
userSchema.virtual('isActive').get(function(this: UserDocument) {
  return this.status === UserStatus.ACTIVE;
});

// ============================================================================
// Instance Methods
// ============================================================================

/**
 * Check if password reset token is valid
 */
userSchema.methods['isPasswordResetTokenValid'] = function(this: UserDocument, token: string): boolean {
  return (
    this.resetPasswordToken === token &&
    this.resetPasswordExpires !== undefined &&
    this.resetPasswordExpires > new Date()
  );
};

/**
 * Check if email verification token is valid
 */
userSchema.methods['isEmailVerificationTokenValid'] = function(this: UserDocument, token: string): boolean {
  return (
    this.emailVerificationToken === token &&
    this.emailVerificationExpires !== undefined &&
    this.emailVerificationExpires > new Date()
  );
};

/**
 * Add refresh token
 */
userSchema.methods['addRefreshToken'] = function(
  this: UserDocument,
  token: string,
  userAgent?: string,
  ipAddress?: string
): void {
  // Remove old tokens (keep only last 5)
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens = this.refreshTokens.slice(-4);
  }
  
  const newToken: any = {
    token,
    createdAt: new Date(),
  };
  
  if (userAgent) newToken.userAgent = userAgent;
  if (ipAddress) newToken.ipAddress = ipAddress;
  
  this.refreshTokens.push(newToken);
};

/**
 * Remove refresh token
 */
userSchema.methods['removeRefreshToken'] = function(this: UserDocument, token: string): void {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
};

/**
 * Remove all refresh tokens (logout from all devices)
 */
userSchema.methods['removeAllRefreshTokens'] = function(this: UserDocument): void {
  this.refreshTokens = [];
};

/**
 * Update last login timestamp
 */
userSchema.methods['updateLastLogin'] = function(this: UserDocument): void {
  this.lastLoginAt = new Date();
};

// ============================================================================
// Static Methods
// ============================================================================

/**
 * Find user by email
 */
userSchema.statics['findByEmail'] = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Find users by role
 */
userSchema.statics['findByRole'] = function(role: UserRole) {
  return this.find({ role, status: UserStatus.ACTIVE });
};

/**
 * Search users by text
 */
userSchema.statics['searchUsers'] = function(searchTerm: string, options: any = {}) {
  const { role, status, limit = 20, skip = 0 } = options;
  
  const query: any = {
    $text: { $search: searchTerm },
  };
  
  if (role) query.role = role;
  if (status) query.status = status;
  
  return this.find(query)
    .score({ score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .skip(skip);
};

// ============================================================================
// Middleware (Hooks)
// ============================================================================

/**
 * Pre-save middleware
 */
userSchema.pre('save', function(this: UserDocument, next) {
  // Ensure email is lowercase
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  
  // Trim and format names
  if (this.isModified('firstName')) {
    this.firstName = this.firstName.trim();
  }
  
  if (this.isModified('lastName')) {
    this.lastName = this.lastName.trim();
  }
  
  next();
});

/**
 * Pre-remove middleware to cleanup related data
 */
userSchema.pre('deleteOne', { document: true, query: false }, async function(this: UserDocument, next) {
  try {
    // TODO: Cleanup related data when user is deleted
    // - Remove candidate profile
    // - Reassign tasks
    // - Update audit logs
    // - etc.
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// ============================================================================
// Model Export
// ============================================================================

export const User = mongoose.model<UserDocument, UserModel>('User', userSchema);
