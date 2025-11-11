import mongoose, { Schema, Document } from 'mongoose'

export interface OTPDocument extends Document {
    email?: string         // Optional for SMS-based signup
    phoneNumber?: string   // Optional for email-based signup  
    otp: string
    type: 'email' | 'sms'  // OTP delivery method
    userData: {
        email?: string     // Optional for phone-first signup
        phoneNumber?: string // Optional for email-first signup
        password?: string  // Optional for simplified SMS signup
        firstName: string
        lastName?: string  // Optional for SMS signup (can be same as firstName)
        role: string
        source?: string
        department?: string
        currentLocation?: string
        yearsOfExperience?: string
    }
    attempts: number
    createdAt: Date
    expiresAt: Date
}

const otpSchema = new Schema<OTPDocument>(
    {
        email: {
            type: String,
            required: function() {
                return this.type === 'email';
            },
            lowercase: true,
            trim: true,
            index: true,
        },
        phoneNumber: {
            type: String,
            required: function() {
                return this.type === 'sms';
            },
            trim: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['email', 'sms'],
            required: true,
            index: true,
        },
        otp: {
            type: String,
            required: true,
        },
        userData: {
            email: { type: String, required: false },
            phoneNumber: { type: String, required: false },
            password: { type: String, required: false }, // Optional for SMS signup
            firstName: { type: String, required: true },
            lastName: { type: String, required: false }, // Optional for SMS signup
            role: { type: String, required: true },
            source: { type: String, required: false },
            department: { type: String, required: false },
            currentLocation: { type: String, required: false },
            yearsOfExperience: { type: String, required: false },
        },
        attempts: {
            type: Number,
            default: 0,
            max: 5, // Maximum 5 attempts
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
    },
    {
        timestamps: true,
    },
)

// Compound indexes for efficient queries
otpSchema.index({ email: 1, otp: 1 })
otpSchema.index({ phoneNumber: 1, otp: 1 })
otpSchema.index({ type: 1 })
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const OTP = mongoose.model<OTPDocument>('OTP', otpSchema)
