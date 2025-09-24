import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { Company } from '../models/Company';
import { User } from '../models/User';
import { CompanyStatus } from '../types';

const fixCompanies = async () => {
  try {
    // Connect to database
    await mongoose.connect(env.MONGO_URI);
    logger.info('Connected to MongoDB');

    // Get all companies
    const companies = await Company.find({});
    logger.info(`Found ${companies.length} companies`);

    // Get a default admin user to use as createdBy
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      logger.error('No admin user found. Cannot fix createdBy field.');
      return;
    }

    let fixedCount = 0;

    for (const company of companies) {
      let needsUpdate = false;
      const updates: any = {};

      // Fix companyId field - generate custom ID if missing
      if (!company.companyId) {
        const CompanyModel = company.constructor as any;
        updates.companyId = await CompanyModel.generateCompanyId();
        needsUpdate = true;
        logger.info(`Generating companyId for company: ${company.name}`);
      }

      // Fix createdBy field
      if (!company.createdBy) {
        updates.createdBy = adminUser._id;
        needsUpdate = true;
        logger.info(`Fixing createdBy for company: ${company.name}`);
      }

      // Fix size field - ensure it's one of the valid enum values
      const validSizes = ['1-10', '11-25', '26-50', '51-100', '101-250', '251-500', '501-1000', '1000+'];
      if (!company.size || !validSizes.includes(company.size)) {
        updates.size = '1-10'; // Default to smallest size
        needsUpdate = true;
        logger.info(`Fixing size for company: ${company.name} (was: ${company.size})`);
      }

      // Fix contacts phone numbers
      if (company.contacts && company.contacts.length > 0) {
        const updatedContacts = company.contacts.map((contact: any) => {
          // Fix phone number format - remove spaces, dashes, parentheses
          let phone = contact.phone?.replace(/[\s\-\(\)]/g, '') || '';
          
          // Ensure it starts with + or a digit
          if (phone && !phone.match(/^[\+]?[1-9][\d]{0,15}$/)) {
            // If it doesn't match the regex, try to fix it
            if (phone.length === 10 && phone.match(/^\d{10}$/)) {
              phone = '+1' + phone; // Add US country code
            } else if (phone.length === 11 && phone.startsWith('1')) {
              phone = '+' + phone; // Add + prefix
            } else {
              // If we can't fix it, use a default valid phone number
              phone = '+15551234567';
            }
            logger.info(`Fixing phone for company: ${company.name}, contact: ${contact.name} (was: ${contact.phone})`);
          }
          
          return {
            ...contact,
            phone
          };
        });
        
        updates.contacts = updatedContacts;
        needsUpdate = true;
      }

      // Ensure required fields have default values

      if (!company.status) {
        updates.status = CompanyStatus.ACTIVE;
        needsUpdate = true;
      }

      // Apply updates if needed
      if (needsUpdate) {
        Object.assign(company, updates);
        await company.save();
        fixedCount++;
        logger.info(`✅ Fixed company: ${company.name}`);
      }
    }

    logger.info(`✅ Fixed ${fixedCount} companies out of ${companies.length} total`);

    // Verify the fix by trying to validate all companies
    const allCompanies = await Company.find({});
    let validationErrors = 0;

    for (const company of allCompanies) {
      try {
        await company.validate();
      } catch (error: any) {
        validationErrors++;
        logger.error(`Validation error for company ${company.name}:`, error.message);
      }
    }

    if (validationErrors === 0) {
      logger.info('✅ All companies now pass validation!');
    } else {
      logger.warn(`⚠️  ${validationErrors} companies still have validation errors`);
    }

  } catch (error) {
    logger.error('Failed to fix companies:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
};

// Run the fix
fixCompanies().catch(console.error);
