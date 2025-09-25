import { google, Auth, sheets_v4 } from 'googleapis';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { UserRole } from '@/types';

export class GoogleSheetsService {
  private static auth: Auth.GoogleAuth;
  private static sheets: sheets_v4.Sheets;

  private static initializeAuth() {
    try {
      if (!env.GOOGLE_SHEETS_CREDENTIALS) {
        throw new Error('Google Sheets credentials not found in environment variables');
      }

      // Parse and fix private key formatting
      const credentials = JSON.parse(env.GOOGLE_SHEETS_CREDENTIALS);
      
      // Fix private key formatting if needed
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key
          .replace(/\\n/g, '\n')
          .replace(/\n/g, '\n');
      }
      
      // Verify required credential fields
      const requiredFields = ['client_email', 'private_key', 'project_id'];
      const missingFields = requiredFields.filter(field => !credentials[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required credential fields: ${missingFields.join(', ')}`);
      }

      // Initialize auth with credentials
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      // Initialize sheets API client
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });

      logger.info('Google Sheets authentication initialized successfully', {
        projectId: credentials.project_id,
        clientEmail: credentials.client_email
      });
    } catch (error) {
      logger.error('Failed to initialize Google Sheets authentication', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  static {
    // Initialize service when loaded
    (async () => {
      try {
        logger.info('Starting Google Sheets service initialization');
        
        // Initialize authentication
        this.initializeAuth();
        
        // Test connection
        const isConnected = await this.testConnection();
        if (!isConnected) {
          throw new Error('Failed to connect to Google Sheets');
        }
        
         // Initialize sheet headers
         await this.initializeSheet();

         // Test write operation
         await this.testWriteSampleData();
         
         logger.info('Google Sheets service initialization completed successfully');
      } catch (error) {
        logger.error('Failed to initialize Google Sheets service', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    })().catch(error => {
      logger.error('Unhandled error during Google Sheets initialization', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    });
  }

  /**
   * Submit user registration data to Google Sheets
   */
  private static ensureInitialized() {
    if (!this.auth || !this.sheets) {
      logger.error('Google Sheets service not initialized');
      throw new Error('Google Sheets service not initialized. Please check credentials and try again.');
    }
  }

  /**
   * Test connection to Google Sheets
   */
  static async runFullTest(): Promise<void> {
    try {
      logger.info('Starting full Google Sheets integration test...');

      // Step 1: Initialize auth
      logger.info('Step 1: Initializing authentication...');
      this.initializeAuth();
      logger.info('Authentication initialized successfully');

      // Step 2: Test connection
      logger.info('Step 2: Testing connection...');
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error('Connection test failed');
      }
      logger.info('Connection test passed successfully');

      // Step 3: Initialize sheet
      logger.info('Step 3: Initializing sheet...');
      await this.initializeSheet();
      logger.info('Sheet initialized successfully');

      // Step 4: Write test data
      logger.info('Step 4: Writing test data...');
      await this.testWriteSampleData();
      logger.info('Full test completed successfully');
    } catch (error) {
      logger.error('Full test failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  static async testWriteSampleData(): Promise<void> {
    try {
      logger.info('Attempting to write sample data to Google Sheets...');
      
      const testData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.HR,
        phone: '+1234567890',
        department: 'Engineering',
        currentLocation: 'New York',
        yearsOfExperience: '5'
      };

      await this.submitRegistrationData(testData);
      logger.info('Successfully wrote test data to Google Sheets');
    } catch (error) {
      logger.error('Failed to write test data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  static async testConnection(): Promise<boolean> {
    logger.info('Testing Google Sheets connection...');
    try {
      this.ensureInitialized();

      if (!env.GOOGLE_SHEETS_ID) {
        throw new Error('Google Sheets ID not configured');
      }

      // Try to get sheet metadata
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: env.GOOGLE_SHEETS_ID,
        fields: 'properties.title,sheets.properties'
      });

      const sheetTitle = response.data.properties?.title;
      const sheets = response.data.sheets?.map(s => s.properties?.title).filter(Boolean);

      logger.info('Successfully connected to Google Sheet', {
        title: sheetTitle,
        sheets,
        sheetId: env.GOOGLE_SHEETS_ID
      });

      return true;
    } catch (error) {
      const errorDetails = {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        sheetId: env.GOOGLE_SHEETS_ID,
        credentials: {
          hasCredentials: !!env.GOOGLE_SHEETS_CREDENTIALS,
          serviceAccount: env.GOOGLE_SHEETS_CREDENTIALS ? JSON.parse(env.GOOGLE_SHEETS_CREDENTIALS).client_email : undefined
        }
      };
      
      logger.error('Failed to connect to Google Sheets', errorDetails);
      console.error('Google Sheets Connection Error:', error);
      return false;
    }
  }

  static async submitRegistrationData(userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    department?: string;
    currentLocation?: string;
    yearsOfExperience?: string;
  }): Promise<void> {
    try {
      this.ensureInitialized();
      if (!env.GOOGLE_SHEETS_ID) {
        logger.warn('Google Sheets ID not configured, skipping data submission');
        return;
      }

      // Prepare row data
      const rowData = [
        userData.email,
        userData.firstName,
        userData.lastName,
        userData.role,
        userData.phone || '',
        userData.department || '',
        userData.currentLocation || '',
        userData.yearsOfExperience || '',
        new Date().toISOString(), // Registration date
      ];

      try {
        // Verify sheet exists and is accessible
        await this.sheets.spreadsheets.get({
          spreadsheetId: env.GOOGLE_SHEETS_ID,
        });

        // Append data to sheet
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: env.GOOGLE_SHEETS_ID,
          range: 'Sheet1!A:I', // Assumes headers are in row 1
          valueInputOption: 'RAW',
          requestBody: {
            values: [rowData],
          },
        });

        logger.info('Registration data submitted to Google Sheets', {
          email: userData.email,
          role: userData.role,
        });
      } catch (error) {
        const errorDetails = {
          email: userData.email,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          credentials: env.GOOGLE_SHEETS_CREDENTIALS ? 'present' : 'missing',
          sheetId: env.GOOGLE_SHEETS_ID,
          submittedData: rowData,
          errorType: error instanceof Error ? error.constructor.name : typeof error,
        };
        
        // Log full error object for debugging
        console.error('Google Sheets Error:', {
          error,
          details: errorDetails,
          credentials: JSON.parse(env.GOOGLE_SHEETS_CREDENTIALS || '{}'),
        });
        
        logger.error('Failed to submit registration data to Google Sheets', {
          ...errorDetails,
          fullError: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause,
          } : error,
        });
        throw error; // Re-throw to be caught by outer try-catch
      }
    } catch (error) {
      // Final catch block to prevent errors from propagating
      logger.error('Unhandled error in Google Sheets submission', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Initialize the sheet with headers if it's empty
   */
  static async initializeSheet(): Promise<void> {
    try {
      this.ensureInitialized();
      if (!env.GOOGLE_SHEETS_ID) {
        logger.warn('Google Sheets ID not configured, skipping initialization');
        return;
      }

      logger.info('Starting Google Sheets initialization', {
        sheetId: env.GOOGLE_SHEETS_ID,
        hasCredentials: !!env.GOOGLE_SHEETS_CREDENTIALS
      });

      // First verify we can access the sheet
      try {
        const sheet = await this.sheets.spreadsheets.get({
          spreadsheetId: env.GOOGLE_SHEETS_ID,
        });
        logger.info('Successfully accessed Google Sheet', {
          title: sheet.data.properties?.title,
          sheetId: env.GOOGLE_SHEETS_ID
        });
      } catch (error) {
        logger.error('Failed to access Google Sheet', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          sheetId: env.GOOGLE_SHEETS_ID,
          credentials: env.GOOGLE_SHEETS_CREDENTIALS ? 'present' : 'missing'
        });
        throw error;
      }

      // Check if sheet is empty
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: env.GOOGLE_SHEETS_ID,
        range: 'Sheet1!A1:I1',
      });

      logger.info('Checked sheet content', {
        hasValues: !!response.data.values,
        valuesLength: response.data.values?.length || 0
      });

      if (!response.data.values || response.data.values.length === 0) {
        // Sheet is empty, add headers
        const headers = [
          'Email',
          'First Name',
          'Last Name',
          'Role',
          'Phone',
          'Department',
          'Current Location',
          'Years of Experience',
          'Registration Date',
        ];

        await this.sheets.spreadsheets.values.update({
          spreadsheetId: env.GOOGLE_SHEETS_ID,
          range: 'Sheet1!A1:I1',
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers],
          },
        });

        logger.info('Google Sheets headers initialized successfully');
      } else {
        logger.info('Google Sheets headers already exist', {
          existingHeaders: response.data.values[0]
        });
      }
    } catch (error) {
      const errorDetails = {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        sheetId: env.GOOGLE_SHEETS_ID,
        credentials: env.GOOGLE_SHEETS_CREDENTIALS ? 'present' : 'missing'
      };
      
      logger.error('Failed to initialize Google Sheets headers', errorDetails);
      console.error('Google Sheets Initialization Error:', {
        error,
        details: errorDetails,
        credentials: JSON.parse(env.GOOGLE_SHEETS_CREDENTIALS || '{}')
      });
      throw error;
    }
  }
}
