import { generateSessionCode } from "./utils";

export function createSecureSessionId(): string {
  return generateSessionCode(10);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function normalizeUrl(url?: string): string {
  if (!url) return '';
  let trimmed = url.trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
