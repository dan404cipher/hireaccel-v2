import { Schema, model } from 'mongoose';

export interface IBanner {
  mediaUrl: string;
  mediaType: 'image' | 'gif' | 'video';
  category: 'hr' | 'candidate';
  isActive: boolean;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    mediaUrl: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ['image', 'gif', 'video'],
      required: true,
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
