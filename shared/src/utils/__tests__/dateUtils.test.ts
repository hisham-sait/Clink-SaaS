import {
  detectDateFormat,
  isValidDDMMYYYY,
  parseDate,
  formatDDMMYYYY,
  formatYYYYMMDD,
  normalizeImportDate,
  isDateInRange,
  formatHumanReadable,
  formatForInput,
  parseFromInput
} from '../dateUtils';

describe('dateUtils', () => {
  describe('detectDateFormat', () => {
    it('should detect DD/MM/YYYY format', () => {
      expect(detectDateFormat('25/12/2025')).toBe('DD/MM/YYYY');
    });

    it('should detect YYYY-MM-DD format', () => {
      expect(detectDateFormat('2025-12-25')).toBe('YYYY-MM-DD');
    });

    it('should detect Excel numeric format', () => {
      expect(detectDateFormat('45000')).toBe('EXCEL_NUMERIC');
    });

    it('should return null for invalid format', () => {
      expect(detectDateFormat('invalid')).toBeNull();
    });
  });

  describe('isValidDDMMYYYY', () => {
    it('should validate correct DD/MM/YYYY dates', () => {
      expect(isValidDDMMYYYY('25/12/2025')).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(isValidDDMMYYYY('32/12/2025')).toBe(false);
      expect(isValidDDMMYYYY('25/13/2025')).toBe(false);
    });

    it('should handle leap years correctly', () => {
      expect(isValidDDMMYYYY('29/02/2024')).toBe(true); // Leap year
      expect(isValidDDMMYYYY('29/02/2025')).toBe(false); // Not a leap year
    });
  });

  describe('parseDate', () => {
    it('should parse DD/MM/YYYY format', () => {
      const date = parseDate('25/12/2025');
      expect(date?.getFullYear()).toBe(2025);
      expect(date?.getMonth()).toBe(11); // 0-based months
      expect(date?.getDate()).toBe(25);
    });

    it('should parse YYYY-MM-DD format', () => {
      const date = parseDate('2025-12-25');
      expect(date?.getFullYear()).toBe(2025);
      expect(date?.getMonth()).toBe(11);
      expect(date?.getDate()).toBe(25);
    });

    it('should handle invalid dates', () => {
      expect(parseDate('invalid')).toBeNull();
    });

    it('should respect strict mode', () => {
      expect(() => parseDate('invalid', { strict: true })).toThrow();
    });
  });

  describe('formatDDMMYYYY', () => {
    it('should format dates correctly', () => {
      const date = new Date(2025, 11, 25);
      expect(formatDDMMYYYY(date)).toBe('25/12/2025');
    });

    it('should handle invalid dates', () => {
      expect(formatDDMMYYYY(new Date('invalid'))).toBe('');
    });
  });

  describe('formatYYYYMMDD', () => {
    it('should format dates correctly', () => {
      const date = new Date(2025, 11, 25);
      expect(formatYYYYMMDD(date)).toBe('2025-12-25');
    });

    it('should handle invalid dates', () => {
      expect(formatYYYYMMDD(new Date('invalid'))).toBe('');
    });
  });

  describe('normalizeImportDate', () => {
    it('should normalize valid dates', () => {
      expect(normalizeImportDate('25/12/2025')).toBe('25/12/2025');
      expect(normalizeImportDate('2025-12-25')).toBe('25/12/2025');
    });

    it('should handle different output formats', () => {
      expect(normalizeImportDate('25/12/2025', { format: 'YYYY-MM-DD' })).toBe('2025-12-25');
    });

    it('should handle invalid dates', () => {
      expect(normalizeImportDate('invalid')).toBeNull();
    });

    it('should respect required flag', () => {
      expect(normalizeImportDate('', { required: false })).toBeNull();
    });
  });

  describe('isDateInRange', () => {
    it('should validate dates within range', () => {
      const date = new Date();
      expect(isDateInRange(date)).toBe(true);
    });

    it('should reject dates outside range', () => {
      const pastDate = new Date(1800, 0, 1);
      const futureDate = new Date(2200, 0, 1);
      expect(isDateInRange(pastDate)).toBe(false);
      expect(isDateInRange(futureDate)).toBe(false);
    });

    it('should respect custom ranges', () => {
      const date = new Date(2025, 0, 1);
      const minDate = new Date(2024, 0, 1);
      const maxDate = new Date(2026, 0, 1);
      expect(isDateInRange(date, { minDate, maxDate })).toBe(true);
    });
  });

  describe('formatHumanReadable', () => {
    it('should format dates in a human-readable way', () => {
      expect(formatHumanReadable('2025-12-25')).toBe('December 25th, 2025');
    });

    it('should handle invalid dates', () => {
      expect(formatHumanReadable('invalid')).toBe('');
    });
  });

  describe('formatForInput', () => {
    it('should format dates for HTML input', () => {
      const date = new Date(2025, 11, 25);
      expect(formatForInput(date)).toBe('2025-12-25');
    });

    it('should handle null dates', () => {
      expect(formatForInput(null)).toBe('');
    });
  });

  describe('parseFromInput', () => {
    it('should parse dates from HTML input', () => {
      const date = parseFromInput('2025-12-25');
      expect(date?.getFullYear()).toBe(2025);
      expect(date?.getMonth()).toBe(11);
      expect(date?.getDate()).toBe(25);
    });

    it('should handle invalid input', () => {
      expect(parseFromInput('invalid')).toBeNull();
    });
  });
});
