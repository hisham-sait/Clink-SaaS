const logger = require('winston');
const { 
  detectDateFormat,
  isValidDDMMYYYY,
  parseDate: sharedParseDate,
  formatDDMMYYYY,
  formatYYYYMMDD,
  normalizeImportDate: sharedNormalizeImportDate,
  isDateInRange
} = require('@bradan/shared');

/**
 * Wraps parseDate with logging
 * @param {string} dateStr - The date string to parse
 * @param {Object} options - Optional configuration
 * @returns {Date|null} - The parsed Date object or null if invalid
 */
function parseDate(dateStr, options = {}) {
  try {
    const result = sharedParseDate(dateStr, options);
    if (!result && options.strict) {
      logger.error('Failed to parse date:', {
        dateStr,
        error: 'Invalid date format',
        context: options.context
      });
    }
    return result;
  } catch (error) {
    logger.error('Error parsing date:', {
      dateStr,
      error: error.message,
      context: options.context
    });
    if (options.strict) {
      throw error;
    }
    return null;
  }
}

/**
 * Wraps normalizeImportDate with logging
 * @param {string} dateStr - The date string from import
 * @param {Object} options - Optional configuration
 * @returns {string|null} - The normalized date string or null if invalid
 */
function normalizeImportDate(dateStr, options = {}) {
  const { fieldName = 'date', required = true } = options;

  if (!dateStr) {
    if (required) {
      logger.warn(`Missing required date for ${fieldName}`);
    }
    return null;
  }

  try {
    const result = sharedNormalizeImportDate(dateStr, options);
    if (!result) {
      logger.warn(`Failed to normalize date for ${fieldName}:`, {
        dateStr,
        error: 'Invalid date format'
      });
    }
    return result;
  } catch (error) {
    logger.error(`Error normalizing import date for ${fieldName}:`, {
      dateStr,
      error: error.message
    });
    return null;
  }
}

// Re-export shared utilities along with wrapped versions
module.exports = {
  detectDateFormat,
  isValidDDMMYYYY,
  parseDate,
  formatDDMMYYYY,
  formatYYYYMMDD,
  normalizeImportDate,
  isDateInRange
};
