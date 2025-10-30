import { UserRole } from '@/types';
import { User } from '@/models/User';

/**
 * Custom ID generator for users based on their role
 * Generates IDs like CAND00001, HR00001, AG00001, etc.
 */

/**
 * Role prefix mapping
 */
const ROLE_PREFIXES = {
  [UserRole.CANDIDATE]: 'CAND',
  [UserRole.HR]: 'HR',
  [UserRole.AGENT]: 'AG',
  [UserRole.ADMIN]: 'ADMIN',
  [UserRole.SUPERADMIN]: 'SUPERADMIN',
  [UserRole.PARTNER]: 'PART',
} as const;

/**
 * Generate the next custom ID for a given role
 */
export const generateCustomUserId = async (role: UserRole): Promise<string> => {
  const prefix = ROLE_PREFIXES[role];
  
  if (!prefix) {
    throw new Error(`No prefix defined for role: ${role}`);
  }
  
  // Find ALL existing IDs for this role and extract the highest number
  const regex = new RegExp(`^${prefix}\\d+$`);
  const existingUsers = await User.find({ 
    customId: { $regex: regex },
    role: role 
  }).select('customId').lean();
  
  let nextNumber = 1;
  
  if (existingUsers.length > 0) {
    // Extract all numbers and find the maximum
    const numbers: number[] = [];
    
    for (const user of existingUsers) {
      if (user.customId) {
        const match = user.customId.match(new RegExp(`^${prefix}(\\d+)$`));
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num)) {
            numbers.push(num);
          }
        }
      }
    }
    
    if (numbers.length > 0) {
      const maxNumber = Math.max(...numbers);
      nextNumber = maxNumber + 1;
    }
  }
  
  // Format with leading zeros (5 digits)
  const formattedNumber = nextNumber.toString().padStart(5, '0');
  const newCustomId = `${prefix}${formattedNumber}`;
  
  // Double-check that this ID doesn't exist (prevent race conditions)
  const existingWithNewId = await User.findOne({ customId: newCustomId });
  if (existingWithNewId) {
    // Retry with incremented number
    nextNumber++;
    const retryFormattedNumber = nextNumber.toString().padStart(5, '0');
    return `${prefix}${retryFormattedNumber}`;
  }
  
  return newCustomId;
};

/**
 * Validate custom ID format
 */
export const validateCustomUserId = (customId: string, role: UserRole): boolean => {
  const prefix = ROLE_PREFIXES[role];
  const regex = new RegExp(`^${prefix}\\d{5}$`);
  return regex.test(customId);
};

/**
 * Extract role from custom ID
 */
export const getRoleFromCustomId = (customId: string): UserRole | null => {
  for (const [role, prefix] of Object.entries(ROLE_PREFIXES)) {
    if (customId.startsWith(prefix)) {
      return role as UserRole;
    }
  }
  return null;
};
