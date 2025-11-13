import { createWorker } from 'tesseract.js';
import mammoth from 'mammoth';
const pdfParse = require('pdf-parse');
import fs from 'fs';
import { logger } from '@/config/logger';

/**
 * Utility class for extracting text from different file types
 */
export class TextExtractor {
  // Maximum file size for processing (10MB to prevent memory issues)
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  
  // Maximum time for OCR processing (30 seconds)
  private static readonly OCR_TIMEOUT = 30000; // 30 seconds
  
  /**
   * Extract text from a file based on its mime type
   * @param filePath Path to the file
   * @param mimeType MIME type of the file
   * @returns Extracted text content
   */
  static async extractText(filePath: string, mimeType: string): Promise<string> {
    try {
      // Validate file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      // Check file size
      const stats = fs.statSync(filePath);
      if (stats.size > TextExtractor.MAX_FILE_SIZE) {
        throw new Error(`File size (${(stats.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${TextExtractor.MAX_FILE_SIZE / 1024 / 1024}MB)`);
      }
      
      logger.info('Starting text extraction', {
        filePath,
        mimeType,
        fileSize: stats.size,
        businessProcess: 'text_extraction',
      });
      
      switch (mimeType) {
        case 'application/pdf':
          return await TextExtractor.extractFromPDF(filePath);
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await TextExtractor.extractFromDOCX(filePath);
        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      logger.error('Error extracting text from file:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        filePath,
        mimeType,
        businessProcess: 'text_extraction',
      });
      
      // Re-throw with more user-friendly message
      if (error instanceof Error) {
        if (error.message.includes('File size')) {
          throw error; // Pass through file size errors as-is
        }
        if (error.message.includes('timed out')) {
          throw new Error('Text extraction timed out. The file may be too complex or corrupted.');
        }
      }
      throw new Error('Failed to extract text from file. Please ensure the file is not corrupted.');
    }
  }

  /**
   * Extract text from a PDF file
   * @param filePath Path to the PDF file
   * @returns Extracted text content
   */
  private static async extractFromPDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      
      // Add timeout to PDF parsing
      const data = await Promise.race([
        pdfParse(dataBuffer),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('PDF parsing timed out')), 30000)
        ),
      ]);
      
      // If the PDF has searchable text
      if (data.text && data.text.trim().length > 50) {
        logger.info('Successfully extracted text from PDF', {
          textLength: data.text.length,
          businessProcess: 'text_extraction',
        });
        return data.text;
      }

      // If the PDF is scanned (image-based), use OCR
      logger.info('PDF appears to be scanned, attempting OCR', {
        businessProcess: 'text_extraction',
      });
      return await TextExtractor.performOCR(filePath);
    } catch (error) {
      logger.error('Error extracting text from PDF:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        businessProcess: 'text_extraction',
      });
      throw error;
    }
  }

  /**
   * Extract text from a Word document
   * @param filePath Path to the Word document
   * @returns Extracted text content
   */
  private static async extractFromDOCX(filePath: string): Promise<string> {
    try {
      const buffer = fs.readFileSync(filePath);
      
      // Add timeout to DOCX parsing
      const result = await Promise.race([
        mammoth.extractRawText({ buffer }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('DOCX parsing timed out')), 20000)
        ),
      ]);
      
      if (!result.value || result.value.trim().length < 50) {
        throw new Error('Could not extract sufficient text from Word document');
      }
      
      logger.info('Successfully extracted text from DOCX', {
        textLength: result.value.length,
        businessProcess: 'text_extraction',
      });
      
      return result.value;
    } catch (error) {
      logger.error('Error extracting text from DOCX:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        businessProcess: 'text_extraction',
      });
      throw error;
    }
  }

  /**
   * Perform OCR on an image or scanned document
   * @param filePath Path to the image file
   * @returns Extracted text content
   */
  private static async performOCR(filePath: string): Promise<string> {
    let worker = null;
    try {
      // Create worker with timeout
      const workerPromise = createWorker('eng');
      worker = await Promise.race([
        workerPromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('OCR worker initialization timed out')), 10000)
        ),
      ]);
      
      logger.info('OCR worker created, starting recognition', {
        businessProcess: 'text_extraction',
      });
      
      // Perform OCR with timeout
      const result = await Promise.race([
        worker.recognize(filePath),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('OCR recognition timed out')), TextExtractor.OCR_TIMEOUT)
        ),
      ]);
      
      const text = result.data.text;
      
      // Terminate worker
      await worker.terminate();
      worker = null;
      
      if (!text || text.trim().length < 50) {
        throw new Error('OCR extracted insufficient text. The document may be empty or of poor quality.');
      }
      
      logger.info('Successfully extracted text via OCR', {
        textLength: text.length,
        businessProcess: 'text_extraction',
      });
      
      return text;
    } catch (error) {
      // Ensure worker is terminated even on error
      if (worker) {
        try {
          await worker.terminate();
        } catch (terminateError) {
          logger.warn('Failed to terminate OCR worker', {
            error: terminateError instanceof Error ? terminateError.message : 'Unknown error',
          });
        }
      }
      
      logger.error('Error performing OCR:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        businessProcess: 'text_extraction',
      });
      
      throw error;
    }
  }
}
