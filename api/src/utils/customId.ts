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
  
  // Find the highest existing ID for this role
  const regex = new RegExp(`^${prefix}\\d+$`);
  const existingUsers = await User.find({ 
    customId: { $regex: regex },
    role: role 
  }).sort({ customId: -1 }).limit(1);
  
  let nextNumber = 1;
  
  if (existingUsers.length > 0 && existingUsers[0]?.customId) {
    const lastCustomId = existingUsers[0].customId!;
    const lastNumber = parseInt(lastCustomId.replace(prefix, ''), 10);
    nextNumber = lastNumber + 1;
  }
  
  // Format with leading zeros (5 digits)
  const formattedNumber = nextNumber.toString().padStart(5, '0');
  
  return `${prefix}${formattedNumber}`;
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
