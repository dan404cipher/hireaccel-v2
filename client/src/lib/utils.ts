import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiUrl(path: string): string {
  const isDevelopment = window.location.hostname === 'localhost';
  return isDevelopment ? `http://localhost:3002${path}` : `/api${path}`;
}
