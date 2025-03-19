import {
  isValidStatutoryDate,
  isValidDateOfBirth,
  isValidAppointmentDate,
  isValidResignationDate,
  formatStatutoryDate,
  formatStatutoryDocument
} from '../dateUtils';

describe('statutory/dateUtils', () => {
  describe('isValidStatutoryDate', () => {
    it('should validate dates within default range', () => {
      const date = new Date();
      expect(isValidStatutoryDate(date)).toBe(true);
    });

    it('should reject future dates by default', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);
      expect(isValidStatutoryDate(futureDate)).toBe(false);
    });

    it('should allow future dates when specified', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(isValidStatutoryDate(futureDate, { allowFuture: true })).toBe(true);
    });

    it('should respect maxYearsInPast option', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 10);
      expect(isValidStatutoryDate(pastDate, { maxYearsInPast: 5 })).toBe(false);
      expect(isValidStatutoryDate(pastDate, { maxYearsInPast: 20 })).toBe(true);
    });

    it('should handle null dates', () => {
      expect(isValidStatutoryDate(null)).toBe(false);
    });
  });

  describe('isValidDateOfBirth', () => {
    it('should validate reasonable birth dates', () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 30);
      expect(isValidDateOfBirth(date.toISOString())).toBe(true);
    });

    it('should reject future birth dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(isValidDateOfBirth(futureDate.toISOString())).toBe(false);
    });

    it('should reject very old birth dates', () => {
      const veryOldDate = new Date();
      veryOldDate.setFullYear(veryOldDate.getFullYear() - 150);
      expect(isValidDateOfBirth(veryOldDate.toISOString())).toBe(false);
    });

    it('should handle invalid dates', () => {
      expect(isValidDateOfBirth('invalid')).toBe(false);
    });
  });

  describe('isValidAppointmentDate', () => {
    it('should validate reasonable appointment dates', () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 1);
      expect(isValidAppointmentDate(date.toISOString())).toBe(true);
    });

    it('should reject future appointment dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(isValidAppointmentDate(futureDate.toISOString())).toBe(false);
    });

    it('should validate appointment date against date of birth', () => {
      const dob = new Date(1990, 0, 1).toISOString();
      const validAppointment = new Date(2010, 0, 1).toISOString(); // Age 20
      const invalidAppointment = new Date(2000, 0, 1).toISOString(); // Age 10

      expect(isValidAppointmentDate(validAppointment, dob)).toBe(true);
      expect(isValidAppointmentDate(invalidAppointment, dob)).toBe(false);
    });

    it('should handle invalid dates', () => {
      expect(isValidAppointmentDate('invalid')).toBe(false);
    });
  });

  describe('isValidResignationDate', () => {
    it('should validate resignation after appointment', () => {
      const appointmentDate = new Date(2020, 0, 1).toISOString();
      const resignationDate = new Date(2021, 0, 1).toISOString();
      expect(isValidResignationDate(resignationDate, appointmentDate)).toBe(true);
    });

    it('should reject resignation before appointment', () => {
      const appointmentDate = new Date(2021, 0, 1).toISOString();
      const resignationDate = new Date(2020, 0, 1).toISOString();
      expect(isValidResignationDate(resignationDate, appointmentDate)).toBe(false);
    });

    it('should reject resignation on same day as appointment', () => {
      const date = new Date(2021, 0, 1).toISOString();
      expect(isValidResignationDate(date, date)).toBe(false);
    });

    it('should reject future resignation dates', () => {
      const appointmentDate = new Date(2020, 0, 1).toISOString();
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(isValidResignationDate(futureDate.toISOString(), appointmentDate)).toBe(false);
    });

    it('should handle invalid dates', () => {
      expect(isValidResignationDate('invalid', '2021-01-01')).toBe(false);
      expect(isValidResignationDate('2021-01-01', 'invalid')).toBe(false);
    });
  });

  describe('formatStatutoryDate', () => {
    it('should format dates in DD/MM/YYYY format by default', () => {
      const date = new Date(2025, 11, 25);
      expect(formatStatutoryDate(date)).toBe('25/12/2025');
    });

    it('should format dates in YYYY-MM-DD format when specified', () => {
      const date = new Date(2025, 11, 25);
      expect(formatStatutoryDate(date, 'YYYY-MM-DD')).toBe('2025-12-25');
    });

    it('should handle string input', () => {
      expect(formatStatutoryDate('2025-12-25')).toBe('25/12/2025');
      expect(formatStatutoryDate('25/12/2025')).toBe('25/12/2025');
    });

    it('should handle null/invalid input', () => {
      expect(formatStatutoryDate(null)).toBe('');
      expect(formatStatutoryDate('invalid')).toBe('');
    });
  });

  describe('formatStatutoryDocument', () => {
    it('should format dates in document style', () => {
      const date = new Date(2025, 11, 25);
      expect(formatStatutoryDocument(date)).toBe('25th December 2025');
    });

    it('should handle string input', () => {
      expect(formatStatutoryDocument('2025-12-25')).toBe('25th December 2025');
      expect(formatStatutoryDocument('25/12/2025')).toBe('25th December 2025');
    });

    it('should handle ordinal numbers correctly', () => {
      expect(formatStatutoryDocument('2025-12-01')).toBe('1st December 2025');
      expect(formatStatutoryDocument('2025-12-02')).toBe('2nd December 2025');
      expect(formatStatutoryDocument('2025-12-03')).toBe('3rd December 2025');
      expect(formatStatutoryDocument('2025-12-04')).toBe('4th December 2025');
    });

    it('should handle null/invalid input', () => {
      expect(formatStatutoryDocument(null)).toBe('');
      expect(formatStatutoryDocument('invalid')).toBe('');
    });
  });
});
