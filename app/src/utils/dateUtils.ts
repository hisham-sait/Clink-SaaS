import { format, parse, isValid, addYears, subYears, isAfter, isBefore, isEqual } from 'date-fns';

/**
 * Interface for date parsing options
 */
export interface DateParseOptions {
  context?: string;
  strict?: boolean;
}

/**
 * Interface for statutory date validation options
 */
export interface StatutoryDateOptions {
  allowFuture?: boolean;
  maxYearsInPast?: number;
  maxYearsInFuture?: number;
}

/**
 * Detects the format of a date string
 * @param dateStr - The date string to analyze
 * @returns The detected format ('DD/MM/YYYY', 'YYYY-MM-DD', etc.) or null if unknown
 */
export function detectDateFormat(dateStr: string): string | null {
  if (!dateStr) return null;

  // DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return 'DD/MM/YYYY';
  }

  // YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return 'YYYY-MM-DD';
  }

  // Excel/CSV numeric date (number of days since 1900-01-01)
  if (/^\d+(\.\d+)?$/.test(dateStr)) {
    return 'EXCEL_NUMERIC';
  }

  return null;
}

/**
 * Validates a date string in DD/MM/YYYY format
 * @param dateStr - The date string to validate
 * @returns Whether the date is valid
 */
export function isValidDDMMYYYY(dateStr: string): boolean {
  if (!dateStr) return false;
  
  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return !isNaN(date.getTime()) && 
         date.getDate() === day && 
         date.getMonth() === month - 1 && 
         date.getFullYear() === year;
}

/**
 * Parses a date string in any supported format to a Date object
 * @param dateStr - The date string to parse
 * @param options - Optional configuration
 * @returns The parsed Date object or null if invalid
 */
export function parseDate(dateStr: string, options: DateParseOptions = {}): Date | null {
  if (!dateStr) return null;

  const { strict = false, context = '' } = options;
  let date: Date | null = null;

  try {
    const format = detectDateFormat(dateStr);
    
    switch (format) {
      case 'DD/MM/YYYY': {
        const [day, month, year] = dateStr.split('/').map(Number);
        date = new Date(year, month - 1, day);
        break;
      }
      
      case 'YYYY-MM-DD': {
        date = new Date(dateStr);
        break;
      }
      
      case 'EXCEL_NUMERIC': {
        // Convert Excel date number to JS Date
        // Excel dates are number of days since 1900-01-01
        // Need to adjust for Excel's leap year bug
        const excelDate = parseFloat(dateStr);
        const msPerDay = 24 * 60 * 60 * 1000;
        const excelEpoch = new Date(1899, 11, 30); // Excel thinks 1900 was a leap year
        date = new Date(excelEpoch.getTime() + (excelDate * msPerDay));
        break;
      }
      
      default: {
        // Try to parse as ISO date
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          throw new Error(`Unsupported date format: ${dateStr}`);
        }
      }
    }

    // Validate the parsed date
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateStr}`);
    }

    return date;
  } catch (error) {
    console.error('Error parsing date:', {
      dateStr,
      error: error instanceof Error ? error.message : 'Unknown error',
      context
    });

    if (strict) {
      throw error;
    }

    return null;
  }
}

/**
 * Formats a Date object to DD/MM/YYYY string
 * @param date - The date to format
 * @returns The formatted date string
 */
export function formatDDMMYYYY(date: Date): string {
  if (!date || isNaN(date.getTime())) return '';
  return format(date, 'dd/MM/yyyy');
}

/**
 * Formats a Date object to YYYY-MM-DD string
 * @param date - The date to format
 * @returns The formatted date string
 */
export function formatYYYYMMDD(date: Date): string {
  if (!date || isNaN(date.getTime())) return '';
  return format(date, 'yyyy-MM-dd');
}

/**
 * Validates and normalizes a date string from CSV/Excel import
 * @param dateStr - The date string from import
 * @param options - Optional configuration
 * @returns The normalized date string or null if invalid
 */
export function normalizeImportDate(dateStr: string, options: {
  fieldName?: string;
  required?: boolean;
  format?: 'DD/MM/YYYY' | 'YYYY-MM-DD';
} = {}): string | null {
  const { 
    fieldName = 'date',
    required = true,
    format = 'DD/MM/YYYY'
  } = options;

  if (!dateStr) {
    if (required) {
      console.warn(`Missing required date for ${fieldName}`);
      return null;
    }
    return null;
  }

  try {
    const date = parseDate(dateStr.trim(), {
      context: `Import ${fieldName}`,
      strict: required
    });

    if (!date) {
      return null;
    }

    return format === 'DD/MM/YYYY' ? formatDDMMYYYY(date) : formatYYYYMMDD(date);
  } catch (error) {
    console.error(`Error normalizing import date for ${fieldName}:`, {
      dateStr,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Validates a date is within a reasonable range
 * @param date - The date to validate
 * @param options - Optional configuration
 * @returns Whether the date is valid
 */
export function isDateInRange(date: Date, options: {
  minDate?: Date;
  maxDate?: Date;
} = {}): boolean {
  if (!date || isNaN(date.getTime())) return false;

  const { 
    minDate = new Date(1900, 0, 1),
    maxDate = new Date(2100, 11, 31)
  } = options;

  return date >= minDate && date <= maxDate;
}

/**
 * Formats a date string to a human-readable format
 * @param dateStr - The date string to format
 * @returns The formatted date string
 */
export function formatHumanReadable(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) return '';
  return format(date, 'MMMM do, yyyy');
}

/**
 * Formats a date for display in a form input
 * @param date - The date to format
 * @returns The formatted date string
 */
export function formatForInput(date: Date | null): string {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parses a date from a form input
 * @param dateStr - The date string from the input
 * @returns The parsed Date object or null if invalid
 */
export function parseFromInput(dateStr: string): Date | null {
  if (!dateStr) return null;
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  return isValid(date) ? date : null;
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
