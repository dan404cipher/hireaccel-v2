import { GoogleSheetsService } from '@/services/GoogleSheetsService';
import { logger } from '@/config/logger';

async function main() {
  try {
    logger.info('Starting Google Sheets integration test...');
    await GoogleSheetsService.runFullTest();
    logger.info('Test completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Test failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

main();
