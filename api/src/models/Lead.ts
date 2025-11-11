import mongoose, { Document, Schema, Model } from 'mongoose';
import { UserRole } from '@/types';

/**
 * Lead Interface - Temporary storage for unverified registrations
 */
export interface ILead {
    name: string;
    phoneNumber: string;
    email?: string;
    role: UserRole.CANDIDATE | UserRole.HR;
    source?: string;
    designation?: string; // For HR role only
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    isVerified: boolean; // Master verification flag
    verificationMethod?: 'sms' | 'email';
    // UTM tracking data
    utmData?: {
        utm_source?: string;
        utm_medium?: string;
        utm_campaign?: string;
        utm_content?: string;
        utm_term?: string;
        referrer?: string;
        landing_page?: string;
        captured_at?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Lead Document Interface
 */
export interface LeadDocument extends ILead, Document {
    _id: mongoose.Types.ObjectId;
}

/**
 * Lead Model Interface
 */
export interface LeadModel extends Model<LeadDocument> {
    findByPhoneNumber(phoneNumber: string): Promise<LeadDocument | null>;
}

/**
 * Lead Schema
 */
const leadSchema = new Schema<LeadDocument>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        phoneNumber: {
            type: String,
            required: [true, 'Phone number is required'],
            unique: true,
            trim: true,
            match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number'],
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        role: {
            type: String,
            required: [true, 'Role is required'],
            enum: {
                values: [UserRole.CANDIDATE, UserRole.HR],
                message: 'Role must be either candidate or hr',
            },
        },
        source: {
            type: String,
            required: false,
            enum: [
                'Email',
                'WhatsApp',
                'Telegram',
                'Instagram',
                'Facebook',
                'Journals',
                'Posters',
                'Brochures',
                'Forums',
                'Google',
                'Conversational AI (GPT, Gemini etc)',
                'Direct',
                'Referral',
                'Other',
            ],
        },
        designation: {
            type: String,
            trim: true,
            maxlength: [100, 'Designation cannot exceed 100 characters'],
        },
        // UTM tracking data for detailed campaign attribution
        utmData: {
            utm_source: { type: String, trim: true },
            utm_medium: { type: String, trim: true },
            utm_campaign: { type: String, trim: true },
            utm_content: { type: String, trim: true },
            utm_term: { type: String, trim: true },
            referrer: { type: String, trim: true },
            landing_page: { type: String, trim: true },
            captured_at: { type: Date, default: Date.now },
        },
        isPhoneVerified: {
            type: Boolean,
            default: false,
            required: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
            required: true,
        },
        verificationMethod: {
            type: String,
            enum: ['sms', 'email'],
        },
    },
    {
        timestamps: true,
    },
);

/**
 * Indexes
 */
// Note: TTL index removed - leads are kept permanently for manual management/dashboard analytics
// Can be deleted manually or via planned dashboard feature

// Compound index for queries
leadSchema.index({ phoneNumber: 1, isPhoneVerified: 1 });

/**
 * Pre-save middleware
 */
leadSchema.pre('save', function (this: LeadDocument, next) {
    // Trim and format name
    if (this.isModified('name')) {
        this.name = this.name.trim();
    }

    // Format phone number (add +91 prefix for Indian numbers if not present)
    if (this.isModified('phoneNumber') && this.phoneNumber) {
        this.phoneNumber = this.phoneNumber.trim();
        // Add +91 prefix for Indian numbers if not already prefixed
        if (this.phoneNumber.length === 10 && /^[6-9]\d{9}$/.test(this.phoneNumber)) {
            this.phoneNumber = '+91' + this.phoneNumber;
        }
    }

    // Ensure email is lowercase
    if (this.isModified('email') && this.email) {
        this.email = this.email.toLowerCase();
    }

    next();
});

/**
 * Static Methods
 */

/**
 * Find lead by phone number
 */
leadSchema.statics['findByPhoneNumber'] = function (phoneNumber: string) {
    return this.findOne({ phoneNumber: phoneNumber.trim() });
};

/**
 * Export Lead Model
 */
export const Lead = mongoose.model<LeadDocument, LeadModel>('Lead', leadSchema);
