import mongoose, { Schema, Document } from 'mongoose';
import { 
  Company as ICompany, 
  CompanyStatus, 
  PartnershipLevel,
  CompanyContact 
} from '@/types';

/**
 * Company model interface extending Mongoose Document
 */
export interface CompanyDocument extends Omit<ICompany, '_id' | 'createdBy'>, Document {
  _id: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  companyId: string;
  
  // Additional properties that exist in schema but not in base interface
  foundedYear?: number;
  employees?: number;
  revenue?: {
    amount: number;
    currency: string;
    year: number;
  };
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
  };
  benefits: string[];
  culture: string[];
  billingInfo?: {
    billingContact: string;
    billingEmail: string;
    billingAddress: string;
    paymentTerms: string;
    taxId?: string;
  };
  contractEndDate?: Date;
  lastActivityAt: Date;
  hireRate?: number;
  partnershipStartDate: Date;
  successRate?: number;
  avgTimeToHire?: number;
  
  // Instance methods
  addContact(contact: CompanyContact): void;
  removeContact(email: string): void;
  updateContact(email: string, updates: Partial<CompanyContact>): void;
  incrementJobs(): void;
  incrementHires(): void;
  updatePartnership(level: PartnershipLevel, endDate?: Date): void;
  calculateScore(): number;
}

/**
 * Company model interface with static methods
 */
export interface CompanyModel extends mongoose.Model<CompanyDocument> {
  searchCompanies(options?: any): Promise<CompanyDocument[]>;
  getTopPerformers(options?: any): Promise<CompanyDocument[]>;
  getByPartnership(partnership: PartnershipLevel, options?: any): Promise<CompanyDocument[]>;
  getExpiringContracts(days?: number): Promise<CompanyDocument[]>;
  generateCompanyId(): Promise<string>;
}

/**
 * Company contact sub-schema
 */
const companyContactSchema = new Schema<CompanyContact>({
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
    maxlength: [100, 'Contact name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Contact email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ],
  },
  phone: {
    type: String,
    required: [true, 'Contact phone is required'],
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please provide a valid phone number'
    ],
  },
  position: {
    type: String,
    required: [true, 'Contact position is required'],
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters'],
  },
}, { _id: false });

/**
 * Main company schema
 */
const companySchema = new Schema<CompanyDocument>({
  companyId: {
    type: String,
    required: [true, 'Company ID is required'],
    unique: true,
    index: true,
  },
  
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters'],
    unique: true,
    index: true,
  },
  
  description: {
    type: String,
    required: [true, 'Company description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
    maxlength: [100, 'Industry cannot exceed 100 characters'],
    index: true,
  },
  
  size: {
    type: String,
    required: [true, 'Company size is required'],
    enum: {
      values: [
        '1-10',
        '11-25',
        '26-50',
        '51-100',
        '101-250',
        '251-500',
        '501-1000',
        '1000+',
      ],
      message: 'Company size must be one of the predefined ranges'
    },
    index: true,
  },
  
  location: {
    type: String,
    required: [true, 'Company location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters'],
    index: true,
  },
  
  website: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/.+$/,
      'Please provide a valid website URL'
    ],
  },
  
  logoUrl: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/.+$/,
      'Please provide a valid logo URL'
    ],
  },
  
  contacts: {
    type: [companyContactSchema],
    validate: {
      validator: function(contacts: CompanyContact[]) {
        return contacts.length > 0;
      },
      message: 'At least one contact is required',
    },
  },
  
  partnership: {
    type: String,
    enum: {
      values: Object.values(PartnershipLevel),
      message: 'Partnership level must be one of: {VALUES}'
    },
    default: PartnershipLevel.BASIC,
    index: true,
  },
  
  status: {
    type: String,
    enum: {
      values: Object.values(CompanyStatus),
      message: 'Status must be one of: {VALUES}'
    },
    default: CompanyStatus.ACTIVE,
    index: true,
  },
  
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    index: true,
  },
  
  totalJobs: {
    type: Number,
    default: 0,
    min: [0, 'Total jobs cannot be negative'],
  },
  
  totalHires: {
    type: Number,
    default: 0,
    min: [0, 'Total hires cannot be negative'],
  },
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator reference is required'],
    index: true,
  },
  
  // Additional company information
  foundedYear: {
    type: Number,
    min: [1800, 'Founded year must be after 1800'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future'],
  },
  
  employees: {
    type: Number,
    min: [1, 'Number of employees must be at least 1'],
  },
  
  revenue: {
    amount: {
      type: Number,
      min: [0, 'Revenue cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    },
    year: {
      type: Number,
      min: [2000, 'Revenue year must be after 2000'],
      max: [new Date().getFullYear(), 'Revenue year cannot be in the future'],
    },
  },
  
  socialMedia: {
    linkedin: {
      type: String,
      match: [
        /^https?:\/\/(www\.)?linkedin\.com\/company\/[\w\-]+\/?$/,
        'Please provide a valid LinkedIn company URL'
      ],
    },
    twitter: {
      type: String,
      match: [
        /^https?:\/\/(www\.)?twitter\.com\/[\w\-]+\/?$/,
        'Please provide a valid Twitter URL'
      ],
    },
    facebook: {
      type: String,
      match: [
        /^https?:\/\/(www\.)?facebook\.com\/[\w\-\.]+\/?$/,
        'Please provide a valid Facebook URL'
      ],
    },
  },
  
  benefits: [{
    type: String,
    trim: true,
    maxlength: [100, 'Benefit cannot exceed 100 characters'],
  }],
  
  culture: [{
    type: String,
    trim: true,
    maxlength: [100, 'Culture value cannot exceed 100 characters'],
  }],
  
  // Partnership details
  partnershipStartDate: {
    type: Date,
    default: Date.now,
  },
  
  contractEndDate: {
    type: Date,
  },
  
  billingInfo: {
    contactEmail: {
      type: String,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid billing email'
      ],
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'invoice'],
    },
  },
  
  // Performance metrics
  avgTimeToHire: {
    type: Number, // in days
    min: [0, 'Average time to hire cannot be negative'],
  },
  
  successRate: {
    type: Number, // percentage
    min: [0, 'Success rate cannot be negative'],
    max: [100, 'Success rate cannot exceed 100%'],
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
companySchema.index({ status: 1, partnership: 1 });
companySchema.index({ industry: 1, status: 1 });
companySchema.index({ size: 1, location: 1 });
companySchema.index({ rating: -1, status: 1 });
companySchema.index({ totalJobs: -1, totalHires: -1 });
companySchema.index({ createdAt: -1 });
companySchema.index({ lastActivityAt: -1 });

// Text index for search functionality
companySchema.index({
  name: 'text',
  description: 'text',
  industry: 'text',
  location: 'text',
  benefits: 'text',
  culture: 'text',
});

// Unique compound index for email contacts to prevent duplicates
companySchema.index({ 'contacts.email': 1 }, { sparse: true });

// ============================================================================
// Virtual Properties
// ============================================================================

/**
 * Check if company is active
 */
companySchema.virtual('isActive').get(function(this: CompanyDocument) {
  return this.status === CompanyStatus.ACTIVE;
});

/**
 * Primary contact
 */
companySchema.virtual('primaryContact').get(function(this: CompanyDocument) {
  return this.contacts && this.contacts.length > 0 ? this.contacts[0] : null;
});

/**
 * Partnership duration in months
 */
companySchema.virtual('partnershipDuration').get(function(this: CompanyDocument) {
  if (!this.partnershipStartDate) return 0;
  
  const now = new Date();
  const start = new Date(this.partnershipStartDate);
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  
  return diffMonths;
});

/**
 * Hire rate percentage
 */
companySchema.virtual('hireRate').get(function(this: CompanyDocument) {
  if (this.totalJobs === 0) return 0;
  return Math.round((this.totalHires / this.totalJobs) * 100);
});

/**
 * Company size category
 */
companySchema.virtual('sizeCategory').get(function(this: CompanyDocument) {
  const sizeMap: { [key: string]: string } = {
    '1-10': 'Startup',
    '11-25': 'Small',
    '26-50': 'Small',
    '51-100': 'Medium',
    '101-250': 'Medium',
    '251-500': 'Large',
    '501-1000': 'Large',
    '1000+': 'Enterprise',
  };
  
  return sizeMap[this.size] || 'Unknown';
});

/**
 * Check if contract is expiring soon (within 30 days)
 */
companySchema.virtual('isContractExpiringSoon').get(function(this: CompanyDocument) {
  if (!this.contractEndDate) return false;
  
  const now = new Date();
  const endDate = new Date(this.contractEndDate);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 30 && diffDays > 0;
});

// ============================================================================
// Instance Methods
// ============================================================================

/**
 * Add a new contact
 */
companySchema.methods['addContact'] = function(this: CompanyDocument, contact: CompanyContact) {
  // Check if contact email already exists
  const existingContact = this.contacts.find(c => c.email === contact.email);
  if (existingContact) {
    throw new Error('Contact with this email already exists');
  }
  
  this.contacts.push(contact);
};

/**
 * Remove a contact by email
 */
companySchema.methods['removeContact'] = function(this: CompanyDocument, email: string) {
  if (this.contacts.length <= 1) {
    throw new Error('Cannot remove the last contact. At least one contact is required.');
  }
  
  this.contacts = this.contacts.filter(contact => contact.email !== email);
};

/**
 * Update contact information
 */
companySchema.methods['updateContact'] = function(this: CompanyDocument, email: string, updates: Partial<CompanyContact>) {
  const contact = this.contacts.find(c => c.email === email);
  if (!contact) {
    throw new Error('Contact not found');
  }
  
  Object.assign(contact, updates);
};

/**
 * Increment total jobs count
 */
companySchema.methods['incrementJobs'] = function(this: CompanyDocument) {
  this.totalJobs = (this.totalJobs || 0) + 1;
  this.lastActivityAt = new Date();
};

/**
 * Increment total hires count
 */
companySchema.methods['incrementHires'] = function(this: CompanyDocument) {
  this.totalHires = (this.totalHires || 0) + 1;
  this.lastActivityAt = new Date();
};

/**
 * Update partnership level
 */
companySchema.methods['updatePartnership'] = function(this: CompanyDocument, level: PartnershipLevel, endDate?: Date) {
  this.partnership = level;
  if (endDate) {
    this.contractEndDate = endDate;
  }
  this.lastActivityAt = new Date();
};

/**
 * Calculate company score based on various metrics
 */
companySchema.methods['calculateScore'] = function(this: CompanyDocument) {
  let score = 0;
  
  // Rating contribution (40%)
  if (this.rating) {
    score += (this.rating / 5) * 40;
  }
  
  // Hire rate contribution (30%)
  if (this.totalJobs > 0 && this.hireRate) {
    score += (this.hireRate / 100) * 30;
  }
  
  // Partnership level contribution (20%)
  const partnershipScores = {
    [PartnershipLevel.BASIC]: 5,
    [PartnershipLevel.STANDARD]: 10,
    [PartnershipLevel.PREMIUM]: 15,
    [PartnershipLevel.ENTERPRISE]: 20,
  };
  score += partnershipScores[this.partnership] || 0;
  
  // Activity contribution (10%)
  const daysSinceActivity = this.lastActivityAt ? 
    Math.floor((Date.now() - this.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24)) : 999;
  
  if (daysSinceActivity <= 7) score += 10;
  else if (daysSinceActivity <= 30) score += 7;
  else if (daysSinceActivity <= 90) score += 3;
  
  return Math.round(score);
};

// ============================================================================
// Static Methods
// ============================================================================

/**
 * Search companies with advanced filters
 */
companySchema.statics['searchCompanies'] = function(options: any = {}) {
  const {
    searchTerm,
    industry,
    size,
    location,
    partnership,
    status = CompanyStatus.ACTIVE,
    rating,
    limit = 20,
    skip = 0,
    sort = { rating: -1, totalHires: -1 }
  } = options;
  
  const query: any = { status };
  
  // Text search
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  // Industry filter
  if (industry) {
    query.industry = new RegExp(industry, 'i');
  }
  
  // Size filter
  if (size) {
    query.size = size;
  }
  
  // Location filter
  if (location) {
    query.location = new RegExp(location, 'i');
  }
  
  // Partnership filter
  if (partnership) {
    query.partnership = partnership;
  }
  
  // Rating filter
  if (rating) {
    query.rating = { $gte: rating };
  }
  
  return this.find(query)
    .populate('createdBy', 'firstName lastName email')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

/**
 * Get top performing companies
 */
companySchema.statics['getTopPerformers'] = function(options: any = {}) {
  const { limit = 10, minJobs = 5 } = options;
  
  return this.find({
    status: CompanyStatus.ACTIVE,
    totalJobs: { $gte: minJobs },
  })
  .sort({ 
    rating: -1, 
    totalHires: -1,
    successRate: -1 
  })
  .limit(limit)
  .populate('createdBy', 'firstName lastName');
};

/**
 * Get companies by partnership level
 */
companySchema.statics['getByPartnership'] = function(partnership: PartnershipLevel, options: any = {}) {
  const { limit = 20, skip = 0 } = options;
  
  return this.find({
    partnership,
    status: CompanyStatus.ACTIVE,
  })
  .sort({ rating: -1, totalJobs: -1 })
  .limit(limit)
  .skip(skip);
};

/**
 * Get companies with expiring contracts
 */
companySchema.statics['getExpiringContracts'] = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    contractEndDate: {
      $lte: futureDate,
      $gte: new Date(),
    },
    status: CompanyStatus.ACTIVE,
  })
  .populate('createdBy', 'firstName lastName email')
  .sort({ contractEndDate: 1 });
};

/**
 * Generate next company ID in format COMP00001, COMP00002, etc.
 */
companySchema.statics['generateCompanyId'] = async function() {
  const lastCompany = await this.findOne({}, { companyId: 1 })
    .sort({ companyId: -1 })
    .limit(1);
  
  let nextNumber = 1;
  if (lastCompany && lastCompany.companyId) {
    const match = lastCompany.companyId.match(/COMP(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  return `COMP${nextNumber.toString().padStart(5, '0')}`;
};

// ============================================================================
// Middleware (Hooks)
// ============================================================================

/**
 * Pre-save middleware
 */
companySchema.pre('save', async function(this: CompanyDocument, next) {
  // Generate companyId if it doesn't exist
  if (!this.companyId) {
    try {
      this.companyId = await (this.constructor as any).generateCompanyId();
    } catch (error: any) {
      return next(error);
    }
  }
  
  // Update last activity timestamp
  if (this.isModified()) {
    this.lastActivityAt = new Date();
  }
  
  // Ensure at least one contact exists
  if (this.isModified('contacts') && this.contacts.length === 0) {
    return next(new Error('At least one contact is required'));
  }
  
  // Calculate success rate if we have data
  if (this.isModified('totalJobs') || this.isModified('totalHires')) {
    if (this.totalJobs > 0) {
      const rate = (this.totalHires / this.totalJobs) * 100;
      this.successRate = Math.min(100, Math.max(0, Math.round(rate)));
    } else {
      this.successRate = 0;
    }
  }
  
  next();
});

/**
 * Pre-delete middleware
 */
companySchema.pre('deleteOne', { document: true, query: false }, async function(this: CompanyDocument, next) {
  try {
    // TODO: Cleanup related data
    // - Close all active jobs
    // - Notify assigned agents
    // - Update billing information
    // - etc.
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// ============================================================================
// Model Export
// ============================================================================

export const Company = mongoose.model<CompanyDocument, CompanyModel>('Company', companySchema);
