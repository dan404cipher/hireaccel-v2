/**
 * Helper utility functions
 */

import { format, formatDistance, parseISO } from 'date-fns';

export const formatDate = (date: string | Date, formatStr: string = 'PP'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatCurrency = (
  amount: number,
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    active: '#10b981',
    open: '#10b981',
    scheduled: '#06b6d4',
    pending: '#f59e0b',
    completed: '#6366f1',
    closed: '#6b7280',
    cancelled: '#ef4444',
    rejected: '#ef4444',
    suspended: '#ef4444',
  };
  return statusColors[status.toLowerCase()] || '#6b7280';
};

export const getUrgencyColor = (urgency: string): string => {
  const urgencyColors: Record<string, string> = {
    low: '#6b7280',
    medium: '#f59e0b',
    high: '#f97316',
    urgent: '#ef4444',
  };
  return urgencyColors[urgency.toLowerCase()] || '#6b7280';
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

