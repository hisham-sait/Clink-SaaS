/**
 * Format a date to ISO string (YYYY-MM-DD)
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDateToISOString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Format a number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumberWithCommas = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format a percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a duration in seconds to a human-readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};

/**
 * Truncate a string to a specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated string
 */
export const truncateString = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
};

/**
 * Convert a camelCase or snake_case string to Title Case
 * @param {string} str - String to convert
 * @returns {string} Converted string
 */
export const toTitleCase = (str: string): string => {
  // Handle camelCase
  const spacedStr = str.replace(/([A-Z])/g, ' $1')
    // Handle snake_case
    .replace(/_/g, ' ')
    // Capitalize first letter
    .replace(/^./, (match) => match.toUpperCase());
  
  // Capitalize each word
  return spacedStr.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
};

/**
 * Generate a random color
 * @returns {string} Random color in hex format
 */
export const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Generate an array of colors
 * @param {number} count - Number of colors to generate
 * @returns {string[]} Array of colors
 */
export const generateColors = (count: number): string[] => {
  const colors = [
    'rgba(255, 99, 132, 0.6)',   // Red
    'rgba(54, 162, 235, 0.6)',   // Blue
    'rgba(255, 206, 86, 0.6)',   // Yellow
    'rgba(75, 192, 192, 0.6)',   // Green
    'rgba(153, 102, 255, 0.6)',  // Purple
    'rgba(255, 159, 64, 0.6)',   // Orange
    'rgba(199, 199, 199, 0.6)',  // Gray
    'rgba(83, 102, 255, 0.6)',   // Indigo
    'rgba(255, 99, 255, 0.6)',   // Pink
    'rgba(0, 162, 150, 0.6)',    // Teal
  ];

  // If we need more colors than we have predefined, generate random ones
  if (count > colors.length) {
    for (let i = colors.length; i < count; i++) {
      colors.push(getRandomColor() + '99'); // Add 99 for 60% opacity
    }
  }

  return colors.slice(0, count);
};

/**
 * Get the current date and time in a formatted string
 * @returns {string} Formatted date and time
 */
export const getCurrentDateTime = (): string => {
  const now = new Date();
  return now.toLocaleString();
};

/**
 * Get a date range for the last n days
 * @param {number} days - Number of days
 * @returns {Object} Date range
 */
export const getDateRangeForLastDays = (days: number): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    startDate: formatDateToISOString(startDate),
    endDate: formatDateToISOString(endDate)
  };
};

/**
 * Check if a string is a valid URL
 * @param {string} str - String to check
 * @returns {boolean} Whether the string is a valid URL
 */
export const isValidUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Check if a string is a valid email address
 * @param {string} email - Email to check
 * @returns {boolean} Whether the string is a valid email
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};
