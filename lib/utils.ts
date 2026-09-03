import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSessionCode(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Node.js server side fallback
    const crypto = require('crypto');
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
  }
  return result;
}

export function formatTimeRemaining(expiresAt: string): string {
  const total = Date.parse(expiresAt) - Date.now();
  if (total <= 0) return 'Expired';
  
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m ${seconds}s left`;
}
