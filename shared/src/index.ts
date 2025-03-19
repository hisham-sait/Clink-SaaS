// Export base utilities
export * as utils from './utils';

// Export statutory utilities
export * as statutory from './statutory';

// Export specific date utilities for convenience
export { parseDate, formatDDMMYYYY, formatYYYYMMDD } from './utils/dateUtils';
export { 
  isValidStatutoryDate,
  isValidDateOfBirth,
  isValidAppointmentDate,
  isValidResignationDate,
  formatStatutoryDate,
  formatStatutoryDocument
} from './statutory/dateUtils';
