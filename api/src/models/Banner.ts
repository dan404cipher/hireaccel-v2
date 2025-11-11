import { Schema, model } from 'mongoose';

export interface IBanner {
  mediaUrl?: string;
  mediaType?: 'image' | 'gif' | 'video';
  category: 'hr' | 'candidate';
  isActive: boolean;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // Text-based ad fields
  adType: 'media' | 'text';
  title?: string;
  subtitle?: string;
  content?: string;
  backgroundMediaUrl?: string;
  backgroundMediaType?: 'image' | 'gif' | 'video';
  textColor?: string;
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  // Text sizing options
  titleSize?: 'small' | 'medium' | 'large' | 'xlarge';
  subtitleSize?: 'small' | 'medium' | 'large';
  contentSize?: 'small' | 'medium' | 'large';
  // Text alignment
  textAlignment?: 'left' | 'center' | 'right';
  // Storage provider tracking
  storageProvider?: 'local' | 'aws_s3';
  storageLocation?: string; // S3 key or local path
  backgroundStorageProvider?: 'local' | 'aws_s3';
  backgroundStorageLocation?: string; // S3 key or local path for background media
  originalName?: string;
  backgroundOriginalName?: string;
}

const bannerSchema = new Schema<IBanner>(
  {
    mediaUrl: {
      type: String,
      required: function() {
        return this.adType === 'media';
      },
    },
    mediaType: {
      type: String,
      enum: ['image', 'gif', 'video'],
      required: function() {
        return this.adType === 'media';
      },
    },
    category: {
      type: String,
      enum: ['hr', 'candidate'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Text-based ad fields
    adType: {
      type: String,
      enum: ['media', 'text'],
      required: true,
      default: 'media',
    },
    title: {
      type: String,
      required: function() {
        return this.adType === 'text';
      },
    },
    subtitle: {
      type: String,
    },
    content: {
      type: String,
    },
    backgroundMediaUrl: {
      type: String,
    },
    backgroundMediaType: {
      type: String,
      enum: ['image', 'gif', 'video'],
    },
    textColor: {
      type: String,
      default: '#000000',
    },
    backgroundColor: {
      type: String,
      default: '#ffffff',
    },
    titleColor: {
      type: String,
      default: '#000000',
    },
    subtitleColor: {
      type: String,
      default: '#666666',
    },
    // Text sizing options
    titleSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'xlarge'],
      default: 'large',
    },
    subtitleSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    contentSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'small',
    },
    // Text alignment
    textAlignment: {
      type: String,
      enum: ['left', 'center', 'right'],
      default: 'center',
    },
    // Storage provider tracking
    storageProvider: {
      type: String,
      enum: ['local', 'aws_s3'],
      default: 'local',
    },
    storageLocation: {
      type: String,
    },
    backgroundStorageProvider: {
      type: String,
      enum: ['local', 'aws_s3'],
      default: 'local',
    },
    backgroundStorageLocation: {
      type: String,
    },
    originalName: {
      type: String,
    },
    backgroundOriginalName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one banner per category is active at a time
bannerSchema.pre('save', async function (next) {
  console.log('=== BANNER PRE-SAVE HOOK ===');
  console.log('Banner being saved:', {
    _id: this._id,
    category: this.category,
    isActive: this.isActive,
    isModified: this.isModified('isActive'),
    isNew: this.isNew
  });
  
  if (this.isActive) {
    console.log('Deactivating other banners in category:', this.category);
    const result = await (this.constructor as any).updateMany(
      { 
        _id: { $ne: this._id }, 
        category: this.category,
        isActive: true 
      },
      { $set: { isActive: false } }
    );
    console.log('Deactivated banners result:', result);
  }
  next();
});

export const Banner = model<IBanner>('Banner', bannerSchema);
