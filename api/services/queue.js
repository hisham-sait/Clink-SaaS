const Queue = require('bull');
const winston = require('winston');
const { parse } = require('csv-parse');
const xlsx = require('xlsx');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const dateUtils = require('../utils/dateUtils');

// Create a single Prisma instance
let prisma;

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['error', 'warn']
    });
  }
  return prisma;
}

// Initialize Prisma
getPrismaClient().$connect().catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

// Configure Winston logger
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'api/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'api/logs/imports.log', level: 'info' }),
    new winston.transports.File({ filename: 'api/logs/import-debug.log', level: 'debug' })
  ]
});

// Create import queue
const importQueue = new Queue('statutory-imports', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  },
  settings: {
    stalledInterval: 30000, // Check for stalled jobs every 30 seconds
    maxStalledCount: 1, // Consider job stalled after 1 check
    lockDuration: 30000, // Lock duration of 30 seconds
    lockRenewTime: 15000 // Renew lock every 15 seconds
  }
});

// Clean old jobs periodically
setInterval(async () => {
  try {
    // Clean jobs older than 1 hour
    await importQueue.clean(3600000, 'completed');
    await importQueue.clean(3600000, 'failed');
    logger.debug('Cleaned old import jobs');
  } catch (error) {
    logger.error('Error cleaning old jobs:', error);
  }
}, 3600000); // Run every hour

// Process files in chunks
const BATCH_SIZE = parseInt(process.env.IMPORT_BATCH_SIZE || '1000');

// Process queue jobs
importQueue.process(async (job) => {
  const { filePath, fileName, mimeType, mapping, companyId } = job.data;
  let records = [];
  let processed = 0;

  try {
    const prisma = getPrismaClient();
    logger.info('Starting import job:', {
      jobId: job.id,
      fileName,
      companyId
    });

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('Import file not found');
    }

    // Read and parse file
    if (mimeType === 'text/csv') {
      records = await parseCSV(filePath, mapping);
    } else {
      records = await parseExcel(filePath, mapping);
    }

    logger.info('File parsed successfully:', {
      jobId: job.id,
      recordCount: records.length
    });

    // Process in batches
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      logger.debug('Processing batch:', {
        jobId: job.id,
        batchNumber: Math.floor(i / BATCH_SIZE) + 1,
        totalBatches: Math.ceil(records.length / BATCH_SIZE),
        batchSize: batch.length,
        processedSoFar: processed,
        totalRecords: records.length
      });

      await processBatch(batch, companyId, job, records.length, processed);
      processed += batch.length;
      
      logger.info('Batch processed:', {
        jobId: job.id,
        batchSize: batch.length,
        progress: `${Math.floor((processed / records.length) * 100)}%`,
        remainingRecords: records.length - processed
      });
    }

    // Log success
    logger.info('Import completed successfully:', {
      jobId: job.id,
      processedCount: processed,
      companyId
    });
    
    // Cleanup file
    fs.unlinkSync(filePath);
    
    return { success: true, count: processed };
  } catch (error) {
    // Log error with full details
    logger.error('Import failed:', {
      jobId: job.id,
      error: error.message,
      stack: error.stack,
      companyId,
      fileName
    });
    
    // Cleanup on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    throw error;
  }
});

// Handle failed jobs
importQueue.on('failed', (job, error) => {
  logger.error('Import job failed:', {
    jobId: job.id,
    error: error.message,
    stack: error.stack,
    data: job.data
  });
});

// Handle completed jobs
importQueue.on('completed', (job, result) => {
  logger.info('Import job completed:', {
    jobId: job.id,
    result,
    timestamp: new Date().toISOString()
  });

  // Log detailed completion info
  logger.debug('Import job completion details:', {
    jobId: job.id,
    result,
    data: job.data,
    timestamp: new Date().toISOString(),
    returnvalue: job.returnvalue,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn
  });
});

// Parse CSV file
async function parseCSV(filePath, mapping) {
  return new Promise((resolve, reject) => {
    const records = [];
    fs.createReadStream(filePath)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (row) => {
        const mappedRow = {};
        for (const [key, value] of Object.entries(mapping)) {
          let cellValue = row[value]?.trim();
          
          // Handle date fields using dateUtils
          const dateFields = [
            'dateOfBirth', 'appointmentDate', 'resignationDate',
            'dateCreated', 'registrationDate', 'satisfactionDate',
            'allotmentDate', 'paymentDate'
          ];

          if (dateFields.includes(key)) {
            mappedRow[key] = dateUtils.normalizeImportDate(cellValue, {
              fieldName: key,
              required: false, // Don't fail import for missing dates
              format: 'DD/MM/YYYY'
            });
          } else {
            mappedRow[key] = cellValue || '';
          }
        }
        records.push(mappedRow);
      })
      .on('end', () => resolve(records))
      .on('error', (error) => {
        console.error('Error parsing CSV:', error);
        reject(error);
      });
  });
}

// Parse Excel file
function parseExcel(filePath, mapping) {
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(worksheet);
  
  return rows.map(row => {
    const mappedRow = {};
    for (const [key, value] of Object.entries(mapping)) {
      let cellValue = row[value]?.toString().trim();
      
      // Handle date fields using dateUtils
      const dateFields = [
        'dateOfBirth', 'appointmentDate', 'resignationDate',
        'dateCreated', 'registrationDate', 'satisfactionDate',
        'allotmentDate', 'paymentDate'
      ];

      if (dateFields.includes(key)) {
        mappedRow[key] = dateUtils.normalizeImportDate(cellValue, {
          fieldName: key,
          required: false,
          format: 'DD/MM/YYYY'
        });
      } else {
        mappedRow[key] = cellValue || '';
      }
    }
    return mappedRow;
  });
}

// Process batch of records
async function processBatch(records, companyId, job, totalRecords, processedSoFar) {
  const { entityType = 'director' } = job.data;
  try {
    // Validate records
    const validRecords = records.filter(record => validateRecord(record, entityType));

    // Insert records
    for (const record of validRecords) {
      try {
        // Update job progress
        const currentProgress = Math.floor(((processedSoFar + validRecords.indexOf(record) + 1) / totalRecords) * 100);
        const progressData = {
          progress: currentProgress
        };

        // Add entity-specific progress info
        switch (entityType) {
          case 'director':
            progressData.currentDirector = `${record.firstName} ${record.lastName}`;
            break;
          case 'shareholder':
            progressData.currentShareholder = `${record.firstName} ${record.lastName}`;
            break;
          case 'beneficial-owner':
            progressData.currentOwner = `${record.firstName} ${record.lastName}`;
            break;
          case 'share':
            progressData.currentShare = record.class;
            break;
          case 'charge':
            progressData.currentCharge = record.chargeId;
            break;
          case 'allotment':
            progressData.currentAllotment = `${record.numberOfShares} ${record.shareClass} shares to ${record.allottee}`;
            break;
        }
        
        logger.debug(`Processing ${entityType}:`, {
          jobId: job.id,
          name: getEntityName(entityType, record),
          progress: currentProgress,
          recordNumber: processedSoFar + validRecords.indexOf(record) + 1,
          totalRecords
        });
        
        await job.progress(progressData);

        // Parse dates using dateUtils
        const parseDate = (dateStr) => dateUtils.parseDate(dateStr, {
          context: `Processing ${entityType}`,
          strict: false
        });

        switch (entityType) {
          case 'director': {
            const directorData = {
              title: record.title || 'Mr',
              firstName: record.firstName,
              lastName: record.lastName,
              dateOfBirth: parseDate(record.dateOfBirth),
              nationality: record.nationality,
              address: record.address || 'No address provided',
              appointmentDate: parseDate(record.appointmentDate),
              directorType: record.directorType || 'Director',
              occupation: record.occupation,
              otherDirectorships: record.otherDirectorships || 'None',
              shareholding: record.shareholding || '0',
              status: 'Active',
              companyId,
              resignationDate: record.resignationDate ? parseDate(record.resignationDate) : null
            };

            const director = await prisma.director.create({
              data: directorData
            });

            await prisma.activity.create({
              data: {
                type: 'appointment',
                entityType: 'director',
                entityId: director.id,
                description: `${director.firstName} ${director.lastName} appointed as ${director.directorType}`,
                user: 'System',
                time: new Date(),
                companyId
              }
            });

            logger.info('Director created successfully:', {
              directorId: director.id,
              name: `${director.firstName} ${director.lastName}`,
              companyId
            });
            break;
          }
          case 'shareholder': {
            // Process shareholder record
            const shareholderData = {
              title: record.title || 'Mr',
              firstName: record.firstName,
              lastName: record.lastName,
              dateOfBirth: parseDate(record.dateOfBirth),
              nationality: record.nationality,
              address: record.address || 'No address provided',
              email: record.email,
              phone: record.phone,
              ordinaryShares: parseInt(record.ordinaryShares) || 0,
              preferentialShares: parseInt(record.preferentialShares) || 0,
              dateAcquired: parseDate(record.dateAcquired),
              status: 'Active',
              companyId
            };

            const shareholder = await prisma.shareholder.create({
              data: shareholderData
            });

            await prisma.activity.create({
              data: {
                type: 'added',
                entityType: 'shareholder',
                entityId: shareholder.id,
                description: `${shareholder.firstName} ${shareholder.lastName} added as shareholder with ${shareholder.ordinaryShares + shareholder.preferentialShares} shares`,
                user: 'System',
                time: new Date(),
                companyId
              }
            });

            logger.info('Shareholder created successfully:', {
              shareholderId: shareholder.id,
              name: `${shareholder.firstName} ${shareholder.lastName}`,
              companyId
            });
            break;
          }
          case 'beneficial-owner': {
            // Process beneficial owner record
            const ownerData = {
              title: record.title || 'Mr',
              firstName: record.firstName,
              lastName: record.lastName,
              dateOfBirth: parseDate(record.dateOfBirth),
              nationality: record.nationality,
              address: record.address || 'No address provided',
              email: record.email,
              phone: record.phone,
              registrationDate: parseDate(record.registrationDate),
              ownershipPercentage: parseFloat(record.ownershipPercentage) || 0,
              natureOfControl: Array.isArray(record.natureOfControl) ? record.natureOfControl : [record.natureOfControl],
              status: 'Active',
              companyId
            };

            const owner = await prisma.beneficialOwner.create({
              data: ownerData
            });

            await prisma.activity.create({
              data: {
                type: 'added',
                entityType: 'beneficial-owner',
                entityId: owner.id,
                description: `${owner.firstName} ${owner.lastName} added as beneficial owner with ${owner.ownershipPercentage}% ownership`,
                user: 'System',
                time: new Date(),
                companyId
              }
            });

            logger.info('Beneficial owner created successfully:', {
              ownerId: owner.id,
              name: `${owner.firstName} ${owner.lastName}`,
              companyId
            });
            break;
          }
          case 'share': {
            // Process share record
            const shareData = {
              class: record.class,
              type: record.type,
              nominalValue: parseFloat(record.nominalValue) || 0,
              currency: record.currency,
              votingRights: record.votingRights === 'Yes' || record.votingRights === 'true' || record.votingRights === true,
              dividendRights: record.dividendRights === 'Yes' || record.dividendRights === 'true' || record.dividendRights === true,
              transferable: record.transferable === 'Yes' || record.transferable === 'true' || record.transferable === true,
              totalIssued: parseInt(record.totalIssued) || 0,
              status: record.status || 'Active',
              description: record.description,
              companyId
            };

            const share = await prisma.share.create({
              data: shareData
            });

            await prisma.activity.create({
              data: {
                type: 'added',
                entityType: 'share',
                entityId: share.id,
                description: `Share class '${share.class}' created with ${share.totalIssued} shares issued`,
                user: 'System',
                time: new Date(),
                companyId
              }
            });

            logger.info('Share class created successfully:', {
              shareId: share.id,
              class: share.class,
              companyId
            });
            break;
          }
          case 'charge': {
            // Process charge record
            const chargeData = {
              chargeId: record.chargeId,
              chargeType: record.chargeType,
              amount: parseFloat(record.amount) || 0,
              currency: record.currency || 'EUR',
              chargor: record.chargor,
              chargee: record.chargee,
              propertyCharged: record.propertyCharged,
              dateCreated: parseDate(record.dateCreated),
              registrationDate: parseDate(record.registrationDate),
              description: record.description,
              status: record.status || 'Active',
              companyId
            };

            const charge = await prisma.charge.create({
              data: chargeData
            });

            await prisma.activity.create({
              data: {
                type: 'added',
                entityType: 'charge',
                entityId: charge.id,
                description: `New charge created: ${charge.chargeType} - ${charge.chargeId}`,
                user: 'System',
                time: new Date(),
                companyId
              }
            });

            logger.info('Charge created successfully:', {
              chargeId: charge.id,
              type: charge.chargeType,
              companyId
            });
            break;
          }
          case 'allotment': {
            // Process allotment record
            const allotmentData = {
              allotmentId: record.allotmentId,
              shareClass: record.shareClass,
              numberOfShares: parseInt(record.numberOfShares) || 0,
              pricePerShare: parseFloat(record.pricePerShare) || 0,
              currency: record.currency || 'EUR',
              allotmentDate: parseDate(record.allotmentDate),
              allottee: record.allottee,
              paymentStatus: record.paymentStatus || 'Pending',
              amountPaid: record.amountPaid ? parseFloat(record.amountPaid) : null,
              paymentDate: record.paymentDate ? parseDate(record.paymentDate) : null,
              certificateNumber: record.certificateNumber,
              status: record.status || 'Active',
              companyId
            };

            const allotment = await prisma.allotment.create({
              data: allotmentData
            });

            await prisma.activity.create({
              data: {
                type: 'added',
                entityType: 'allotment',
                entityId: allotment.id,
                description: `New allotment created: ${allotment.numberOfShares} ${allotment.shareClass} shares to ${allotment.allottee}`,
                user: 'System',
                time: new Date(),
                companyId
              }
            });

            logger.info('Allotment created successfully:', {
              allotmentId: allotment.id,
              shares: `${allotment.numberOfShares} ${allotment.shareClass}`,
              allottedTo: allotment.allottee,
              companyId
            });
            break;
          }
        }
      } catch (error) {
        logger.error(`Error creating ${entityType}:`, {
          error: error.message,
          stack: error.stack,
          record,
          companyId
        });
        throw error;
      }
    }
  } catch (error) {
    logger.error('Error processing batch:', {
      error: error.message,
      stack: error.stack,
      companyId
    });
    throw error;
  }
}

// Helper function to get entity name for logging
function getEntityName(entityType, record) {
  switch (entityType) {
    case 'director':
    case 'shareholder':
    case 'beneficial-owner':
      return `${record.firstName} ${record.lastName}`;
    case 'share':
      return record.class;
    case 'charge':
      return `${record.chargeType} - ${record.chargeId}`;
    case 'allotment':
      return `${record.numberOfShares} ${record.shareClass} shares to ${record.allottee}`;
    default:
      return 'Unknown';
  }
}

// Validate record
function validateRecord(record, entityType = 'director') {
  try {
    // Basic validation
    let requiredFields;
    switch (entityType) {
      case 'director':
        requiredFields = [
          'firstName',
          'lastName',
          'dateOfBirth',
          'nationality',
          'appointmentDate',
          'occupation'
        ];
        break;
      case 'shareholder':
        requiredFields = [
          'firstName',
          'lastName',
          'dateOfBirth',
          'nationality',
          'email',
          'phone',
          'dateAcquired'
        ];
        break;
      case 'beneficial-owner':
        requiredFields = [
          'firstName',
          'lastName',
          'dateOfBirth',
          'nationality',
          'registrationDate',
          'ownershipPercentage',
          'natureOfControl'
        ];
        break;
      case 'share':
        requiredFields = [
          'class',
          'type',
          'nominalValue',
          'currency',
          'totalIssued'
        ];
        break;
      case 'charge':
        requiredFields = [
          'chargeId',
          'chargeType',
          'amount',
          'currency',
          'chargor',
          'chargee',
          'propertyCharged',
          'dateCreated',
          'registrationDate',
          'description'
        ];
        break;
      case 'allotment':
        requiredFields = [
          'allotmentId',
          'allotmentDate',
          'shareClass',
          'numberOfShares',
          'pricePerShare',
          'currency',
          'allottee',
          'paymentStatus',
          'status'
        ];
        break;
      case 'meeting':
        requiredFields = [
          'meetingDate',
          'meetingType',
          'venue',
          'chairperson',
          'agenda'
        ];
        break;
      case 'minute':
        requiredFields = [
          'meetingDate',
          'meetingType',
          'chairperson',
          'attendees',
          'content'
        ];
        break;
      default:
        requiredFields = [];
    }

    // Skip empty rows
    const isEmpty = Object.values(record).every(value => !value);
    if (isEmpty) {
      logger.warn('Empty record found:', record);
      return false;
    }

    // Set defaults first
    switch (entityType) {
      case 'director':
        record.title = record.title || 'Mr';
        record.nationality = record.nationality || 'Irish';
        record.address = record.address || 'No address provided';
        record.directorType = record.directorType || 'Director';
        record.occupation = record.occupation || 'Director';
        record.otherDirectorships = record.otherDirectorships || 'None';
        record.shareholding = record.shareholding || '0';
        record.status = record.status || 'Active';
        break;
      case 'shareholder':
        record.title = record.title || 'Mr';
        record.nationality = record.nationality || 'Irish';
        record.address = record.address || 'No address provided';
        record.ordinaryShares = record.ordinaryShares || '0';
        record.preferentialShares = record.preferentialShares || '0';
        break;
      case 'beneficial-owner':
        record.title = record.title || 'Mr';
        record.nationality = record.nationality || 'Irish';
        record.address = record.address || 'No address provided';
        record.ownershipPercentage = record.ownershipPercentage || '0';
        record.natureOfControl = record.natureOfControl ? 
          (Array.isArray(record.natureOfControl) ? record.natureOfControl : [record.natureOfControl]) 
          : ['Shares'];
        record.status = record.status || 'Active';
        break;
      case 'share':
        record.votingRights = record.votingRights === 'Yes' || record.votingRights === 'true' || record.votingRights === true;
        record.dividendRights = record.dividendRights === 'Yes' || record.dividendRights === 'true' || record.dividendRights === true;
        record.transferable = record.transferable === 'Yes' || record.transferable === 'true' || record.transferable === true;
        record.status = record.status || 'Active';
        break;
      case 'charge':
        record.status = record.status || 'Active';
        record.amount = parseFloat(record.amount) || 0;
        break;
      case 'allotment':
        record.numberOfShares = parseInt(record.numberOfShares) || 0;
        record.pricePerShare = parseFloat(record.pricePerShare) || 0;
        record.paymentStatus = record.paymentStatus || 'Pending';
        record.status = record.status || 'Active';
        break;
      case 'meeting':
        record.status = record.status || 'Scheduled';
        record.attendees = record.attendees ? 
          (Array.isArray(record.attendees) ? record.attendees : [record.attendees]) 
          : [];
        break;
      case 'minute':
        record.status = record.status || 'Draft';
        record.attendees = record.attendees ? 
          (Array.isArray(record.attendees) ? record.attendees : [record.attendees]) 
          : [];
        break;
    }

    // Check required fields after setting defaults
    const missingFields = requiredFields.filter(field => !record[field]);
    if (missingFields.length > 0) {
      logger.warn('Missing required fields:', {
        record,
        missingFields
      });
      return false;
    }

    // Validate dates using dateUtils
    const validateDate = (dateStr, fieldName) => {
      if (!dateStr) return true; // Allow empty dates unless required
      return dateUtils.isValidDDMMYYYY(dateStr);
    };

    // Validate required dates
    if (entityType !== 'share' && entityType !== 'charge' && entityType !== 'allotment') {
      if (!validateDate(record.dateOfBirth, 'dateOfBirth')) {
        logger.warn('Invalid date of birth:', record.dateOfBirth);
        return false;
      }
    }

    // Validate entity-specific dates
    switch (entityType) {
      case 'director':
        if (!validateDate(record.appointmentDate, 'appointmentDate')) {
          logger.warn('Invalid appointment date:', record.appointmentDate);
          return false;
        }
        if (record.resignationDate && !validateDate(record.resignationDate, 'resignationDate')) {
          logger.warn('Invalid resignation date:', record.resignationDate);
          return false;
        }
        break;
      case 'shareholder':
        if (!validateDate(record.dateAcquired, 'dateAcquired')) {
          logger.warn('Invalid date acquired:', record.dateAcquired);
          return false;
        }
        break;
      case 'beneficial-owner':
        if (!validateDate(record.registrationDate, 'registrationDate')) {
          logger.warn('Invalid registration date:', record.registrationDate);
          return false;
        }
        break;
      case 'charge':
        if (!validateDate(record.dateCreated, 'dateCreated')) {
          logger.warn('Invalid date created:', record.dateCreated);
          return false;
        }
        if (!validateDate(record.registrationDate, 'registrationDate')) {
          logger.warn('Invalid registration date:', record.registrationDate);
          return false;
        }
        break;
      case 'allotment':
        if (!validateDate(record.allotmentDate, 'allotmentDate')) {
          logger.warn('Invalid allotment date:', record.allotmentDate);
          return false;
        }
        if (record.paymentDate && !validateDate(record.paymentDate, 'paymentDate')) {
          logger.warn('Invalid payment date:', record.paymentDate);
          return false;
        }
        break;
    }

    // Validate status for directors
    if (entityType === 'director' && record.status && !['Active', 'Resigned'].includes(record.status)) {
      logger.warn('Invalid director status:', record.status);
      return false;
    }

    // Validate payment status for allotments
    if (entityType === 'allotment' && !['Pending', 'Paid', 'Partially Paid'].includes(record.paymentStatus)) {
      logger.warn('Invalid payment status:', record.paymentStatus);
      return false;
    }

    // Validate status for allotments
    if (entityType === 'allotment' && !['Active', 'Cancelled'].includes(record.status)) {
      logger.warn('Invalid allotment status:', record.status);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error validating record:', {
      error: error.message,
      stack: error.stack,
      record
    });
    return false;
  }
}

// Export functions for use in routes
module.exports = {
  importQueue,
  logger,
  parseCSV,
  parseExcel
};
