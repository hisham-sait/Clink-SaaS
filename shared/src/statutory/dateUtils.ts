import { parseDate, formatDDMMYYYY, formatYYYYMMDD, isDateInRange } from '../utils/dateUtils';
import { format, addYears, subYears, isAfter, isBefore, isEqual } from 'date-fns';

/**
 * Interface for statutory date validation options
 */
export interface StatutoryDateOptions {
  allowFuture?: boolean;
  maxYearsInPast?: number;
  maxYearsInFuture?: number;
}

/**
 * Validates a date for statutory requirements
 * @param date - The date to validate
 * @param options - Optional configuration
 * @returns Whether the date is valid for statutory purposes
 */
export function isValidStatutoryDate(date: Date | null, options: StatutoryDateOptions = {}): boolean {
  if (!date || !isDateInRange(date)) return false;

  const {
    allowFuture = false,
    maxYearsInPast = 150,
    maxYearsInFuture = 1
  } = options;

  const now = new Date();
  const minDate = subYears(now, maxYearsInPast);
  const maxDate = addYears(now, maxYearsInFuture);

  // Check if date is within allowed range
  if (isBefore(date, minDate)) return false;
  if (!allowFuture && isAfter(date, now)) return false;
  if (allowFuture && isAfter(date, maxDate)) return false;

  return true;
}

/**
 * Validates a date of birth for statutory requirements
 * @param dateStr - The date string to validate
 * @returns Whether the date is valid for a date of birth
 */
export function isValidDateOfBirth(dateStr: string): boolean {
  const date = parseDate(dateStr);
  return isValidStatutoryDate(date, {
    allowFuture: false,
    maxYearsInPast: 120
  });
}

/**
 * Validates an appointment date for statutory requirements
 * @param appointmentDate - The appointment date string
 * @param dateOfBirth - The date of birth string for comparison
 * @returns Whether the appointment date is valid
 */
export function isValidAppointmentDate(appointmentDate: string, dateOfBirth?: string): boolean {
  const appDate = parseDate(appointmentDate);
  if (!appDate) return false;

  // Basic statutory date validation
  if (!isValidStatutoryDate(appDate, { allowFuture: false })) return false;

  // If DOB provided, ensure appointment date is after person turned 18
  if (dateOfBirth) {
    const dob = parseDate(dateOfBirth);
    if (!dob) return false;

    const minAppointmentDate = addYears(dob, 18);
    if (isBefore(appDate, minAppointmentDate)) return false;
  }

  return true;
}

/**
 * Validates a resignation date for statutory requirements
 * @param resignationDate - The resignation date string
 * @param appointmentDate - The appointment date string for comparison
 * @returns Whether the resignation date is valid
 */
export function isValidResignationDate(resignationDate: string, appointmentDate: string): boolean {
  const resDate = parseDate(resignationDate);
  const appDate = parseDate(appointmentDate);

  if (!resDate || !appDate) return false;

  // Basic statutory date validation
  if (!isValidStatutoryDate(resDate, { allowFuture: false })) return false;

  // Ensure resignation date is after appointment date
  if (isBefore(resDate, appDate) || isEqual(resDate, appDate)) return false;

  return true;
}

/**
 * Formats a date for statutory display
 * @param date - The date to format
 * @param format - The desired format (default: DD/MM/YYYY)
 * @returns The formatted date string
 */
export function formatStatutoryDate(date: Date | string | null, outputFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' = 'DD/MM/YYYY'): string {
  if (!date) return '';

  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  if (!parsedDate) return '';

  return outputFormat === 'DD/MM/YYYY' ? formatDDMMYYYY(parsedDate) : formatYYYYMMDD(parsedDate);
}

/**
 * Formats a date for statutory documents
 * @param date - The date to format
 * @returns The formatted date string (e.g., "1st January 2025")
 */
export function formatStatutoryDocument(date: Date | string | null): string {
  if (!date) return '';

  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  if (!parsedDate) return '';

  return format(parsedDate, 'do MMMM yyyy');
}

// Re-export base date utilities
export * from '../utils/dateUtils';
