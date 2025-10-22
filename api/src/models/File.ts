import mongoose, { Schema, Document } from 'mongoose'
import { FileDocument as IFileDocument, FileCategory } from '@/types'

/**
 * File model interface extending Mongoose Document
 */
export interface FileDocument extends Omit<IFileDocument, '_id' | 'uploadedBy'>, Document {
    _id: mongoose.Types.ObjectId
    uploadedBy: mongoose.Types.ObjectId

    // Additional properties that exist in schema but not in base interface
    checksum?: string
    checksumAlgorithm: string
    storageProvider: string
    storageLocation?: string
    isPublic: boolean
    permissions: {
        canView: mongoose.Types.ObjectId[]
        canDownload: mongoose.Types.ObjectId[]
        canEdit: mongoose.Types.ObjectId[]
    }
    status: string
    expiresAt?: Date
    downloadCount: number
    lastAccessedAt?: Date
    accessLog: Array<{
        accessedBy: mongoose.Types.ObjectId
        accessedAt: Date
        action: string
        ipAddress?: string | undefined
        userAgent?: string | undefined
    }>
    tags: string[]
    comments: Array<{
        content: string
        createdBy: mongoose.Types.ObjectId
        createdAt: Date
    }>

    // Instance methods
    logAccess(
        accessedBy: mongoose.Types.ObjectId,
        action: 'view' | 'download' | 'share' | 'delete',
        ipAddress?: string,
        userAgent?: string,
    ): void
    addComment(content: string, createdBy: mongoose.Types.ObjectId): void
    addTags(tags: string[]): void
    removeTags(tags: string[]): void
    hasPermission(userId: mongoose.Types.ObjectId, permission: 'view' | 'download' | 'edit'): boolean
    grantPermission(userId: mongoose.Types.ObjectId, permission: 'view' | 'download' | 'edit'): void
    revokePermission(userId: mongoose.Types.ObjectId, permission: 'view' | 'download' | 'edit'): void
    archive(): void
    softDelete(): void
    quarantine(reason?: string): void
}

/**
 * File model interface with static methods
 */
export interface FileModel extends mongoose.Model<FileDocument> {
    findByUser(userId: mongoose.Types.ObjectId, options?: any): Promise<FileDocument[]>
    findByEntity(entityType: string, entityId: mongoose.Types.ObjectId, options?: any): Promise<FileDocument[]>
    searchFiles(searchTerm: string, options?: any): Promise<FileDocument[]>
    getFilesForCleanup(): Promise<FileDocument[]>
    getStorageStats(userId?: mongoose.Types.ObjectId): Promise<any[]>
    findDuplicates(): Promise<any[]>
}

/**
 * File metadata sub-schema for additional file information
 */
const fileMetadataSchema = new Schema(
    {
        // Image metadata
        dimensions: {
            width: Number,
            height: Number,
        },

        // Document metadata
        pageCount: Number,

        // General metadata
        title: String,
        description: String,
        keywords: [String],

        // Processing status
        processed: {
            type: Boolean,
            default: false,
        },

        processingStatus: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending',
        },

        // Virus scan results
        virusScanned: {
            type: Boolean,
            default: false,
        },

        virusScanResult: {
            type: String,
            enum: ['clean', 'infected', 'suspicious', 'error'],
        },

        // Thumbnail information (for images and documents)
        thumbnailPath: String,

        // Text extraction (for searchable content)
        extractedText: String,

        // Version information
        version: {
            type: Number,
            default: 1,
        },

        parentFileId: {
            type: Schema.Types.ObjectId,
            ref: 'File',
        },
    },
    { _id: false },
)

/**
 * File access log sub-schema for tracking file access
 */
const accessLogSchema = new Schema(
    {
        accessedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        accessedAt: {
            type: Date,
            default: Date.now,
        },
        action: {
            type: String,
            enum: ['view', 'download', 'share', 'delete'],
            required: true,
        },
        ipAddress: String,
        userAgent: String,
    },
    { _id: true },
)

/**
 * Main file schema
 */
const fileSchema = new Schema<FileDocument>(
    {
        filename: {
            type: String,
            required: [true, 'Filename is required'],
            trim: true,
            maxlength: [255, 'Filename cannot exceed 255 characters'],
            index: true,
        },

        originalName: {
            type: String,
            required: [true, 'Original filename is required'],
            trim: true,
            maxlength: [255, 'Original filename cannot exceed 255 characters'],
        },

        mimetype: {
            type: String,
            required: [true, 'MIME type is required'],
            index: true,
        },

        size: {
            type: Number,
            required: [true, 'File size is required'],
            min: [0, 'File size cannot be negative'],
            index: true,
        },

        path: {
            type: String,
            required: [true, 'File path is required'],
            unique: true,
        },

        url: {
            type: String,
            required: [true, 'File URL is required'],
        },

        category: {
            type: String,
            enum: {
                values: Object.values(FileCategory),
                message: 'Category must be one of: {VALUES}',
            },
            required: [true, 'File category is required'],
            index: true,
        },

        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Uploader reference is required'],
            index: true,
        },

        relatedEntity: {
            type: {
                type: String,
                enum: ['candidate', 'job', 'application', 'interview', 'company', 'user', 'task'],
            },
            id: {
                type: Schema.Types.ObjectId,
                refPath: function (this: FileDocument) {
                    const modelMap: { [key: string]: string } = {
                        candidate: 'Candidate',
                        job: 'Job',
                        application: 'Application',
                        interview: 'Interview',
                        company: 'Company',
                        user: 'User',
                        task: 'Task',
                    }
                    return this.relatedEntity?.type ? modelMap[this.relatedEntity.type] : undefined
                },
            },
        },

        metadata: fileMetadataSchema,

        // File permissions and sharing
        isPublic: {
            type: Boolean,
            default: false,
        },

        permissions: {
            canView: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
            ],
            canDownload: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
            ],
            canEdit: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
            ],
        },

        // File status and lifecycle
        status: {
            type: String,
            enum: ['active', 'archived', 'deleted', 'quarantined'],
            default: 'active',
            index: true,
        },

        // Expiration and cleanup
        expiresAt: {
            type: Date,
        },

        // Download and access tracking
        downloadCount: {
            type: Number,
            default: 0,
            min: [0, 'Download count cannot be negative'],
        },

        lastAccessedAt: Date,

        accessLog: [accessLogSchema],

        // File verification
        checksum: {
            type: String,
            index: true,
        } as any,

        checksumAlgorithm: {
            type: String,
            enum: ['md5', 'sha1', 'sha256'],
            default: 'sha256',
        },

        // Storage information
        storageProvider: {
            type: String,
            enum: ['local', 'aws_s3', 'google_cloud', 'azure_blob'],
            default: 'local',
        },

        storageLocation: String, // Bucket name, container name, etc.

        // File tags for organization
        tags: [
            {
                type: String,
                trim: true,
                maxlength: [30, 'Tag cannot exceed 30 characters'],
            },
        ],

        // Comments and notes
        comments: [
            {
                content: {
                    type: String,
                    required: true,
                    maxlength: [500, 'Comment cannot exceed 500 characters'],
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
            },
        ],
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (_doc, ret: any) {
                delete ret.__v
                delete ret.path // Don't expose internal file path
                return ret
            },
        },
        toObject: {
            virtuals: true,
        },
    },
)

// ============================================================================
// Indexes
// ============================================================================

// Compound indexes for common queries
fileSchema.index({ uploadedBy: 1, category: 1 })
fileSchema.index({ 'relatedEntity.type': 1, 'relatedEntity.id': 1 })
fileSchema.index({ status: 1, createdAt: -1 })
fileSchema.index({ mimetype: 1, category: 1 })
fileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Text index for search functionality
fileSchema.index({
    originalName: 'text',
    'metadata.title': 'text',
    'metadata.description': 'text',
    'metadata.extractedText': 'text',
    tags: 'text',
    'comments.content': 'text',
})

// Unique index for checksum to prevent duplicates
fileSchema.index({ checksum: 1, uploadedBy: 1 }, { sparse: true })

// ============================================================================
// Virtual Properties
// ============================================================================

/**
 * File extension
 */
fileSchema.virtual('extension').get(function (this: FileDocument) {
    const lastDotIndex = this.originalName.lastIndexOf('.')
    return lastDotIndex >= 0 ? this.originalName.substring(lastDotIndex + 1).toLowerCase() : ''
})

/**
 * Human readable file size
 */
fileSchema.virtual('humanReadableSize').get(function (this: FileDocument) {
    const bytes = this.size
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
})

/**
 * Check if file is an image
 */
fileSchema.virtual('isImage').get(function (this: FileDocument) {
    return this.mimetype.startsWith('image/')
})

/**
 * Check if file is a document
 */
fileSchema.virtual('isDocument').get(function (this: FileDocument) {
    const documentTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
    ]
    return documentTypes.includes(this.mimetype)
})

/**
 * Check if file is expired
 */
fileSchema.virtual('isExpired').get(function (this: FileDocument) {
    return this.expiresAt && this.expiresAt < new Date()
})

/**
 * Check if file can be previewed
 */
fileSchema.virtual('canPreview').get(function (this: FileDocument) {
    const previewableTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain']
    return previewableTypes.includes(this.mimetype)
})

/**
 * Days since upload
 */
fileSchema.virtual('daysSinceUpload').get(function (this: FileDocument) {
    const now = new Date()
    const uploaded = new Date(this.createdAt)
    const diffTime = Math.abs(now.getTime() - uploaded.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// ============================================================================
// Instance Methods
// ============================================================================

/**
 * Log file access
 */
fileSchema.methods['logAccess'] = function (
    this: FileDocument,
    accessedBy: mongoose.Types.ObjectId,
    action: 'view' | 'download' | 'share' | 'delete',
    ipAddress?: string,
    userAgent?: string,
) {
    this.accessLog.push({
        accessedBy,
        action,
        accessedAt: new Date(),
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
    })

    // Update download count and last accessed timestamp
    if (action === 'download') {
        this.downloadCount = (this.downloadCount || 0) + 1
    }

    this.lastAccessedAt = new Date()

    // Keep only last 100 access logs
    if (this.accessLog.length > 100) {
        this.accessLog = this.accessLog.slice(-100)
    }
}

/**
 * Add comment to file
 */
fileSchema.methods['addComment'] = function (this: FileDocument, content: string, createdBy: mongoose.Types.ObjectId) {
    this.comments.push({
        content,
        createdBy,
        createdAt: new Date(),
    })
}

/**
 * Add tags to file
 */
fileSchema.methods['addTags'] = function (this: FileDocument, tags: string[]) {
    const newTags = tags.filter((tag) => !this.tags.includes(tag))
    this.tags.push(...newTags)
}

/**
 * Remove tags from file
 */
fileSchema.methods['removeTags'] = function (this: FileDocument, tags: string[]) {
    this.tags = this.tags.filter((tag) => !tags.includes(tag))
}

/**
 * Check if user has permission
 */
fileSchema.methods['hasPermission'] = function (
    this: FileDocument,
    userId: mongoose.Types.ObjectId,
    permission: 'view' | 'download' | 'edit',
) {
    // Owner has all permissions
    if (this.uploadedBy.toString() === userId.toString()) {
        return true
    }

    // Public files can be viewed and downloaded
    if (this.isPublic && (permission === 'view' || permission === 'download')) {
        return true
    }

    // Check specific permissions
    const permissionKey = `can${
        permission.charAt(0).toUpperCase() + permission.slice(1)
    }` as keyof typeof this.permissions
    const permissionArray = this.permissions[permissionKey]
    return permissionArray?.some((id: mongoose.Types.ObjectId) => id.toString() === userId.toString()) || false
}

/**
 * Grant permission to user
 */
fileSchema.methods['grantPermission'] = function (
    this: FileDocument,
    userId: mongoose.Types.ObjectId,
    permission: 'view' | 'download' | 'edit',
) {
    const permissionKey = `can${
        permission.charAt(0).toUpperCase() + permission.slice(1)
    }` as keyof typeof this.permissions
    const permissionArray = this.permissions[permissionKey]

    if (!permissionArray.some((id) => id.toString() === userId.toString())) {
        permissionArray.push(userId)
    }
}

/**
 * Revoke permission from user
 */
fileSchema.methods['revokePermission'] = function (
    this: FileDocument,
    userId: mongoose.Types.ObjectId,
    permission: 'view' | 'download' | 'edit',
) {
    const permissionKey = `can${
        permission.charAt(0).toUpperCase() + permission.slice(1)
    }` as keyof typeof this.permissions
    this.permissions[permissionKey] = this.permissions[permissionKey].filter(
        (id) => id.toString() !== userId.toString(),
    )
}

/**
 * Archive the file
 */
fileSchema.methods['archive'] = function (this: FileDocument) {
    this.status = 'archived'
}

/**
 * Soft delete the file
 */
fileSchema.methods['softDelete'] = function (this: FileDocument) {
    this.status = 'deleted'
}

/**
 * Quarantine the file (e.g., if virus detected)
 */
fileSchema.methods['quarantine'] = function (this: FileDocument, reason?: string) {
    this.status = 'quarantined'
    if (reason) {
        this.addComment(`File quarantined: ${reason}`, this.uploadedBy)
    }
}

// ============================================================================
// Static Methods
// ============================================================================

/**
 * Find files by user
 */
fileSchema.statics['findByUser'] = function (userId: mongoose.Types.ObjectId, options: any = {}) {
    const { category, status = 'active', limit = 20, skip = 0 } = options

    const query: any = {
        uploadedBy: userId,
        status,
    }

    if (category) query.category = category

    return this.find(query)
        .populate('uploadedBy', 'firstName lastName')
        .populate('relatedEntity.id')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
}

/**
 * Find files by related entity
 */
fileSchema.statics['findByEntity'] = function (
    entityType: string,
    entityId: mongoose.Types.ObjectId,
    options: any = {},
) {
    const { category, status = 'active', limit = 20 } = options

    const query: any = {
        'relatedEntity.type': entityType,
        'relatedEntity.id': entityId,
        status,
    }

    if (category) query.category = category

    return this.find(query).populate('uploadedBy', 'firstName lastName').sort({ createdAt: -1 }).limit(limit)
}

/**
 * Search files with text search
 */
fileSchema.statics['searchFiles'] = function (searchTerm: string, options: any = {}) {
    const { category, mimetype, uploadedBy, limit = 20, skip = 0 } = options

    const query: any = {
        $text: { $search: searchTerm },
        status: 'active',
    }

    if (category) query.category = category
    if (mimetype) query.mimetype = mimetype
    if (uploadedBy) query.uploadedBy = uploadedBy

    return this.find(query)
        .score({ score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .populate('uploadedBy', 'firstName lastName')
        .limit(limit)
        .skip(skip)
}

/**
 * Get files requiring cleanup (expired or marked for deletion)
 */
fileSchema.statics['getFilesForCleanup'] = function () {
    const now = new Date()

    return this.find({
        $or: [
            { expiresAt: { $lt: now } },
            { status: 'deleted', updatedAt: { $lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } }, // 30 days old
        ],
    })
}

/**
 * Get storage statistics
 */
fileSchema.statics['getStorageStats'] = function (userId?: mongoose.Types.ObjectId) {
    const pipeline: any[] = []

    if (userId) {
        pipeline.push({ $match: { uploadedBy: userId, status: 'active' } })
    } else {
        pipeline.push({ $match: { status: 'active' } })
    }

    pipeline.push({
        $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalSize: { $sum: '$size' },
            avgSize: { $avg: '$size' },
        },
    })

    return this.aggregate(pipeline)
}

/**
 * Find duplicate files by checksum
 */
fileSchema.statics['findDuplicates'] = function () {
    return this.aggregate([
        {
            $match: {
                checksum: { $ne: null },
                status: 'active',
            },
        },
        {
            $group: {
                _id: '$checksum',
                files: { $push: '$$ROOT' },
                count: { $sum: 1 },
            },
        },
        {
            $match: {
                count: { $gt: 1 },
            },
        },
    ])
}

// ============================================================================
// Middleware (Hooks)
// ============================================================================

/**
 * Pre-save middleware
 */
fileSchema.pre('save', function (this: FileDocument, next) {
    // Generate URL if not provided
    if (!this.url && this.path) {
        this.url = `/uploads/${this.path}`
    }

    // Set default permissions based on category
    if (this.isNew) {
        switch (this.category) {
            case FileCategory.PROFILE_IMAGE:
            case FileCategory.COMPANY_LOGO:
                this.isPublic = true
                break
            default:
                this.isPublic = false
        }
    }

    next()
})

/**
 * Pre-delete middleware
 */
fileSchema.pre('deleteOne', { document: true, query: false }, async function (this: FileDocument, next) {
    try {
        // TODO: Delete physical file from storage
        // TODO: Remove from related entities
        // TODO: Clean up thumbnails

        next()
    } catch (error) {
        next(error as Error)
    }
})

// ============================================================================
// Model Export
// ============================================================================

export const File = mongoose.model<FileDocument, FileModel>('File', fileSchema)
