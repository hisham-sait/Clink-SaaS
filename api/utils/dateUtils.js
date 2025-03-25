const { format, parse, isValid, addYears, subYears, isAfter, isBefore, isEqual } = require('date-fns');
const logger = require('winston');

/**
 * Interface for date parsing options
 */
// @typedef {Object} DateParseOptions
// @property {string} [context] - Context information for logging
// @property {boolean} [strict] - Whether to throw errors on invalid dates

/**
 * Detects the format of a date string
 * @param {string} dateStr - The date string to analyze
 * @returns {string|null} The detected format ('DD/MM/YYYY', 'YYYY-MM-DD', etc.) or null if unknown
 */
function detectDateFormat(dateStr) {
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
 * @param {string} dateStr - The date string to validate
 * @returns {boolean} Whether the date is valid
 */
function isValidDDMMYYYY(dateStr) {
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
 * @param {string} dateStr - The date string to parse
 * @param {Object} options - Optional configuration
 * @returns {Date|null} The parsed Date object or null if invalid
 */
function parseDate(dateStr, options = {}) {
  if (!dateStr) return null;

  const { strict = false, context = '' } = options;
  let date = null;

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
    logger.error('Error parsing date:', {
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
 * @param {Date} date - The date to format
 * @returns {string} The formatted date string
 */
function formatDDMMYYYY(date) {
  if (!date || isNaN(date.getTime())) return '';
  return format(date, 'dd/MM/yyyy');
}

/**
 * Formats a Date object to YYYY-MM-DD string
 * @param {Date} date - The date to format
 * @returns {string} The formatted date string
 */
function formatYYYYMMDD(date) {
  if (!date || isNaN(date.getTime())) return '';
  return format(date, 'yyyy-MM-dd');
}

/**
 * Validates and normalizes a date string from CSV/Excel import
 * @param {string} dateStr - The date string from import
 * @param {Object} options - Optional configuration
 * @returns {string|null} The normalized date string or null if invalid
 */
function normalizeImportDate(dateStr, options = {}) {
  const { 
    fieldName = 'date',
    required = true,
    format = 'DD/MM/YYYY'
  } = options;

  if (!dateStr) {
    if (required) {
      logger.warn(`Missing required date for ${fieldName}`);
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
    logger.error(`Error normalizing import date for ${fieldName}:`, {
      dateStr,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Validates a date is within a reasonable range
 * @param {Date} date - The date to validate
 * @param {Object} options - Optional configuration
 * @returns {boolean} Whether the date is valid
 */
function isDateInRange(date, options = {}) {
  if (!date || isNaN(date.getTime())) return false;

  const { 
    minDate = new Date(1900, 0, 1),
    maxDate = new Date(2100, 11, 31)
  } = options;

  return date >= minDate && date <= maxDate;
}

/**
 * Formats a date string to a human-readable format
 * @param {string} dateStr - The date string to format
 * @returns {string} The formatted date string
 */
function formatHumanReadable(dateStr) {
  const date = parseDate(dateStr);
  if (!date) return '';
  return format(date, 'MMMM do, yyyy');
}

/**
 * Formats a date for display in a form input
 * @param {Date|null} date - The date to format
 * @returns {string} The formatted date string
 */
function formatForInput(date) {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parses a date from a form input
 * @param {string} dateStr - The date string from the input
 * @returns {Date|null} The parsed Date object or null if invalid
 */
function parseFromInput(dateStr) {
  if (!dateStr) return null;
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  return isValid(date) ? date : null;
}

/**
 * Validates a date for statutory requirements
 * @param {Date|null} date - The date to validate
 * @param {Object} options - Optional configuration
 * @returns {boolean} Whether the date is valid for statutory purposes
 */
function isValidStatutoryDate(date, options = {}) {
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
 * @param {string} dateStr - The date string to validate
 * @returns {boolean} Whether the date is valid for a date of birth
 */
function isValidDateOfBirth(dateStr) {
  const date = parseDate(dateStr);
  return isValidStatutoryDate(date, {
    allowFuture: false,
    maxYearsInPast: 120
  });
}

/**
 * Validates an appointment date for statutory requirements
 * @param {string} appointmentDate - The appointment date string
 * @param {string} [dateOfBirth] - The date of birth string for comparison
 * @returns {boolean} Whether the appointment date is valid
 */
function isValidAppointmentDate(appointmentDate, dateOfBirth) {
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
 * @param {string} resignationDate - The resignation date string
 * @param {string} appointmentDate - The appointment date string for comparison
 * @returns {boolean} Whether the resignation date is valid
 */
function isValidResignationDate(resignationDate, appointmentDate) {
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
 * @param {Date|string|null} date - The date to format
 * @param {string} [outputFormat='DD/MM/YYYY'] - The desired format
 * @returns {string} The formatted date string
 */
function formatStatutoryDate(date, outputFormat = 'DD/MM/YYYY') {
  if (!date) return '';

  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  if (!parsedDate) return '';

  return outputFormat === 'DD/MM/YYYY' ? formatDDMMYYYY(parsedDate) : formatYYYYMMDD(parsedDate);
}

/**
 * Formats a date for statutory documents
 * @param {Date|string|null} date - The date to format
 * @returns {string} The formatted date string (e.g., "1st January 2025")
 */
function formatStatutoryDocument(date) {
  if (!date) return '';

  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  if (!parsedDate) return '';

  return format(parsedDate, 'do MMMM yyyy');
}

module.exports = {
  // Base date utilities
  detectDateFormat,
  isValidDDMMYYYY,
  parseDate,
  formatDDMMYYYY,
  formatYYYYMMDD,
  normalizeImportDate,
  isDateInRange,
  formatHumanReadable,
  formatForInput,
  parseFromInput,
  
  // Statutory date utilities
  isValidStatutoryDate,
  isValidDateOfBirth,
  isValidAppointmentDate,
  isValidResignationDate,
  formatStatutoryDate,
  formatStatutoryDocument
};
