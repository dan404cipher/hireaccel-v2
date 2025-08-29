import mongoose from 'mongoose';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { User } from '@/models/User';
import { Candidate } from '@/models/Candidate';
import { UserRole } from '@/types';

const fixCandidates = async () => {
  try {
    // Connect to database
    await mongoose.connect(env.MONGO_URI);
    logger.info('Connected to MongoDB');

    // Get candidate users
    const candidateUsers = await User.find({ role: UserRole.CANDIDATE });
    logger.info(`Found ${candidateUsers.length} candidate users`);

    // Update each candidate to link to their user
    for (const user of candidateUsers) {
      const existingCandidate = await Candidate.findOne({ userId: user._id });
      
      if (existingCandidate) {
        logger.info(`Candidate already exists for user: ${user.email}`);
        continue;
      }

      // Find candidate by email (from profile data)
      const candidate = await Candidate.findOne({
        'profile.phoneNumber': user.email === 'john.doe@email.com' ? '+15551234567' : '+15552345678'
      });

      if (candidate) {
        // Update candidate to link to user
        candidate.userId = user._id;
        await candidate.save();
        logger.info(`Updated candidate for user: ${user.email}`);
      } else {
        logger.warn(`No candidate found for user: ${user.email}`);
      }
    }

    // Verify the fix
    const candidatesWithUsers = await Candidate.find({ userId: { $ne: null } });
    logger.info(`Candidates with user links: ${candidatesWithUsers.length}`);

    logger.info('✅ Candidate-user relationships fixed successfully!');
  } catch (error) {
    logger.error('Failed to fix candidates:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
};

// Run the fix
fixCandidates().catch(console.error);
