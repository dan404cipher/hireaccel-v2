import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import crypto from 'crypto';
import path from 'path';

interface UploadOptions {
  fileBuffer: Buffer;
  filename: string;
  mimetype: string;
  folder?: string;
  makePublic?: boolean;
}

interface UploadResult {
  key: string;
  url: string;
  location: string;
}

class S3Service {
  private client: S3Client | null = null;
  public bucketName: string;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = env.AWS_S3_ENABLED && !!env.AWS_S3_BUCKET_NAME;
    this.bucketName = env.AWS_S3_BUCKET_NAME || '';

    if (this.isEnabled) {
      if (!env.AWS_REGION || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
        logger.warn('S3 is enabled but AWS credentials are missing. S3 uploads will be disabled.');
        this.isEnabled = false;
        return;
      }

      this.client = new S3Client({
        region: env.AWS_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      });

      logger.info('S3 service initialized', {
        region: env.AWS_REGION,
        bucket: this.bucketName,
        businessProcess: 's3_init',
      });
    } else {
      logger.info('S3 service disabled - using local storage', {
        businessProcess: 's3_init',
      });
    }
  }

  /**
   * Check if S3 is enabled and configured
   */
  isS3Enabled(): boolean {
    return this.isEnabled && this.client !== null;
  }

  /**
   * Get S3 client instance
   */
  getClient(): S3Client | null {
    return this.client;
  }

  /**
   * Generate S3 key for file storage
   * Format: {folder}/{YYYY}/{MM}/{filename}
   */
  private generateS3Key(filename: string, folder?: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Sanitize filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(filename);
    const baseName = path
      .basename(filename, extension)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);

    const sanitizedFilename = `${baseName}-${timestamp}-${randomSuffix}${extension}`;

    if (folder) {
      return `${folder}/${year}/${month}/${sanitizedFilename}`;
    }
    return `${year}/${month}/${sanitizedFilename}`;
  }

  /**
   * Upload file to S3
   */
  async uploadFile(options: UploadOptions): Promise<UploadResult> {
    if (!this.isS3Enabled() || !this.client) {
      throw new Error('S3 service is not enabled or not configured');
    }

    const { fileBuffer, filename, mimetype, folder, makePublic = false } = options;
    const key = this.generateS3Key(filename, folder);

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
        ACL: makePublic ? 'public-read' : 'private',
        Metadata: {
          originalName: filename,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.client.send(command);

      // Generate URL
      const url = `https://${this.bucketName}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

      logger.info('File uploaded to S3', {
        key,
        bucket: this.bucketName,
        size: fileBuffer.length,
        businessProcess: 's3_upload',
      });

      return {
        key,
        url,
        location: url,
      };
    } catch (error) {
      logger.error('Failed to upload file to S3', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key,
        bucket: this.bucketName,
        businessProcess: 's3_upload',
      });
      throw error;
    }
  }

  /**
   * Get signed URL for private file access
   * @param key S3 object key
   * @param expiresIn URL expiration time in seconds (default: 1 hour)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.isS3Enabled() || !this.client) {
      throw new Error('S3 service is not enabled or not configured');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });

      return url;
    } catch (error) {
      logger.error('Failed to generate signed URL', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key,
        bucket: this.bucketName,
        businessProcess: 's3_signed_url',
      });
      throw error;
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.isS3Enabled() || !this.client) {
      throw new Error('S3 service is not enabled or not configured');
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);

      logger.info('File deleted from S3', {
        key,
        bucket: this.bucketName,
        businessProcess: 's3_delete',
      });
    } catch (error) {
      logger.error('Failed to delete file from S3', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key,
        bucket: this.bucketName,
        businessProcess: 's3_delete',
      });
      throw error;
    }
  }

  /**
   * Calculate file checksum
   */
  calculateChecksum(buffer: Buffer, algorithm: 'md5' | 'sha256' = 'sha256'): string {
    return crypto.createHash(algorithm).update(buffer).digest('hex');
  }
}

export const s3Service = new S3Service();

