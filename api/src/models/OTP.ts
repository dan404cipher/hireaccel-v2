import mongoose, { Schema, Document } from 'mongoose';

export interface OTPDocument extends Document {
  email: string;
  otp: string;
  userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    department?: string;
    currentLocation?: string;
    yearsOfExperience?: string;
  };
  attempts: number;
  createdAt: Date;
  expiresAt: Date;
}

const otpSchema = new Schema<OTPDocument>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  userData: {
    email: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, required: true },
    phone: { type: String },
    department: { type: String },
    currentLocation: { type: String },
    yearsOfExperience: { type: String },
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
    index: { expireAfterSeconds: 0 },
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
otpSchema.index({ email: 1, otp: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.model<OTPDocument>('OTP', otpSchema);
