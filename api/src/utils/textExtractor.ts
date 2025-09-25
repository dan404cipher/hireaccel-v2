import { createWorker } from 'tesseract.js';
import mammoth from 'mammoth';
const pdfParse = require('pdf-parse');
import fs from 'fs';
import { logger } from '@/config/logger';

/**
 * Utility class for extracting text from different file types
 */
export class TextExtractor {
  /**
   * Extract text from a file based on its mime type
   * @param filePath Path to the file
   * @param mimeType MIME type of the file
   * @returns Extracted text content
   */
  static async extractText(filePath: string, mimeType: string): Promise<string> {
    try {
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
        filePath,
        mimeType,
        businessProcess: 'text_extraction',
      });
      throw new Error('Failed to extract text from file');
    }
  }

  /**
   * Extract text from a PDF file
   * @param filePath Path to the PDF file
   * @returns Extracted text content
   */
  private static async extractFromPDF(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    // If the PDF has searchable text
    if (data.text.trim().length > 0) {
      return data.text;
    }

    // If the PDF is scanned (image-based), use OCR
    return await TextExtractor.performOCR(filePath);
  }

  /**
   * Extract text from a Word document
   * @param filePath Path to the Word document
   * @returns Extracted text content
   */
  private static async extractFromDOCX(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  /**
   * Perform OCR on an image or scanned document
   * @param filePath Path to the image file
   * @returns Extracted text content
   */
  private static async performOCR(filePath: string): Promise<string> {
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(filePath);
    await worker.terminate();
    
    return text;
  }
}
