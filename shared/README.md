# @bradan/shared

Shared utilities and components for Bradán Accountants applications.

## Installation

```bash
npm install @bradan/shared
```

## Features

### Date Utilities

The package provides comprehensive date handling utilities for both general use and statutory-specific requirements.

#### Base Date Utilities

```typescript
import { parseDate, formatDDMMYYYY, formatYYYYMMDD } from '@bradan/shared';

// Parse dates in various formats
const date = parseDate('25/12/2025');

// Format dates
const formatted = formatDDMMYYYY(date); // "25/12/2025"
const isoFormatted = formatYYYYMMDD(date); // "2025-12-25"
```

#### Statutory Date Utilities

```typescript
import { 
  isValidStatutoryDate,
  isValidDateOfBirth,
  isValidAppointmentDate,
  isValidResignationDate,
  formatStatutoryDate,
  formatStatutoryDocument
} from '@bradan/shared';

// Validate dates for statutory requirements
isValidDateOfBirth('01/01/1980'); // true
isValidAppointmentDate('01/01/2025', '01/01/1980'); // true

// Format dates for statutory documents
formatStatutoryDocument(new Date()); // "19th March 2025"
```

## Usage

### General Date Handling

```typescript
import { parseDate, formatDDMMYYYY } from '@bradan/shared';

// Parse dates with options
const date = parseDate('2025-12-25', {
  strict: true,
  context: 'Import date'
});

// Format dates
const formatted = formatDDMMYYYY(date);
```

### Statutory Date Validation

```typescript
import { 
  isValidStatutoryDate, 
  isValidDateOfBirth 
} from '@bradan/shared';

// Validate dates with options
const isValid = isValidStatutoryDate(date, {
  allowFuture: false,
  maxYearsInPast: 150,
  maxYearsInFuture: 1
});

// Validate specific types of dates
const isValidDOB = isValidDateOfBirth('01/01/1980');
```

### Import/Export Date Handling

```typescript
import { normalizeImportDate } from '@bradan/shared';

// Normalize dates from imports
const normalized = normalizeImportDate('2025-12-25', {
  fieldName: 'Date of Birth',
  required: true,
  format: 'DD/MM/YYYY'
});
```

## Development

### Building

```bash
npm run build
```

This will build both CommonJS (cjs) and ES Module (esm) versions of the package.

### Testing

```bash
npm test
```

Tests are written using Jest and can be found in the `__tests__` directories.

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Run tests
5. Submit a pull request

## License

Private - Bradán Accountants
