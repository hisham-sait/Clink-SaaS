const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse');
const xlsx = require('xlsx');
const PDFDocument = require('pdfkit');
const winston = require('winston');
const { importQueue, logger } = require('../../services/queue');
const { PrismaClient } = require('@prisma/client');

// Keep a single instance
let _prisma;
function getPrismaClient() {
  if (!_prisma) {
    _prisma = new PrismaClient({
      log: ['error', 'warn']
    });
  }
  return _prisma;
}

// Initialize Prisma
getPrismaClient().$connect().catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

const auth = require('../../middleware/auth');

// Create required directories with absolute paths
const uploadDir = path.join(__dirname, '../../uploads/imports');
const logDir = path.join(__dirname, '../../logs');

console.log('Creating directories:', {
  uploadDir,
  logDir
});

[uploadDir, logDir].forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  } catch (error) {
    console.error(`Error creating directory ${dir}:`, error);
    throw new Error(`Failed to create required directory: ${dir}`);
  }
});

// Configure Winston logger for imports
logger.add(new winston.transports.File({
  filename: path.join(logDir, 'imports.log'),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
}));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer destination:', uploadDir);
    // Ensure directory exists before saving
    if (!fs.existsSync(uploadDir)) {
      console.log('Creating upload directory');
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log('Processing file:', file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // Default 10MB
  },
  fileFilter: (req, file, cb) => {
    console.log('File upload request:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Force CSV mimetype for .csv files
    if (file.originalname.toLowerCase().endsWith('.csv')) {
      file.mimetype = 'text/csv';
    }

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      console.log('File type accepted:', file.mimetype);
      cb(null, true);
    } else {
      console.log('File type rejected:', file.mimetype);
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

// Helper function to parse DD/MM/YYYY to Date object
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('/');
  return new Date(year, month - 1, day);
};

// Get all beneficial owners for a company
router.get('/:companyId?', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    
    // Only filter by status if it's provided and not 'All'
    if (status && status !== 'All') {
      where.status = status;
    }

    // If not super_admin/platform_admin or if companyId is provided, filter by company
    if (req.params.companyId || (!req.user.roles.includes('super_admin') && !req.user.roles.includes('platform_admin'))) {
      where.companyId = req.params.companyId || req.user.companyId;
    }

    const owners = await getPrismaClient().beneficialOwner.findMany({
      where,
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ],
      include: {
        company: {
          select: {
            name: true,
            legalName: true
          }
        }
      }
    });
    res.json(owners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific beneficial owner
router.get('/:companyId/:id', auth, async (req, res) => {
  try {
    const owner = await getPrismaClient().beneficialOwner.findFirst({
      where: {
        AND: [
          { id: req.params.id },
          { companyId: req.params.companyId }
        ]
      }
    });
    if (!owner) {
      return res.status(404).json({ error: 'Beneficial owner not found' });
    }
    res.json(owner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new beneficial owner
router.post('/:companyId', auth, async (req, res) => {
  try {
    // Parse dates from DD/MM/YYYY format
    const dateOfBirth = parseDate(req.body.dateOfBirth);
    const registrationDate = parseDate(req.body.registrationDate);

    if (!dateOfBirth || !registrationDate) {
      return res.status(400).json({ error: 'Invalid date format. Please use DD/MM/YYYY' });
    }

    const owner = await getPrismaClient().beneficialOwner.create({
      data: {
        ...req.body,
        dateOfBirth,
        registrationDate,
        companyId: req.params.companyId,
        ownershipPercentage: parseFloat(req.body.ownershipPercentage),
        natureOfControl: Array.isArray(req.body.natureOfControl) ? req.body.natureOfControl : [req.body.natureOfControl]
      }
    });
    
    // Create activity log
    await getPrismaClient().activity.create({
      data: {
        type: 'added',
        entityType: 'beneficial-owner',
        entityId: owner.id,
        description: `New beneficial owner '${owner.firstName} ${owner.lastName}' added`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(owner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a beneficial owner
router.put('/:companyId/:id', auth, async (req, res) => {
  try {
    // First find the owner and verify ownership
    const existingOwner = await getPrismaClient().beneficialOwner.findFirst({
      where: {
        AND: [
          { id: req.params.id },
          { companyId: req.params.companyId }
        ]
      }
    });

    if (!existingOwner) {
      return res.status(404).json({ error: 'Beneficial owner not found' });
    }

    // Parse dates from DD/MM/YYYY format
    const dateOfBirth = parseDate(req.body.dateOfBirth);
    const registrationDate = parseDate(req.body.registrationDate);

    if (!dateOfBirth || !registrationDate) {
      return res.status(400).json({ error: 'Invalid date format. Please use DD/MM/YYYY' });
    }

    // Extract only the fields that can be updated
    const {
      title,
      firstName,
      lastName,
      nationality,
      address,
      email,
      phone,
      natureOfControl,
      ownershipPercentage,
      status,
      description,
      user
    } = req.body;

    // Then perform the update
    const owner = await getPrismaClient().beneficialOwner.update({
      where: { id: req.params.id },
      data: {
        title,
        firstName,
        lastName,
        dateOfBirth,
        registrationDate,
        nationality,
        address,
        email,
        phone,
        natureOfControl: Array.isArray(natureOfControl) ? natureOfControl : [natureOfControl],
        ownershipPercentage: parseFloat(ownershipPercentage),
        status,
        description
      }
    });

    // Create activity log
    await getPrismaClient().activity.create({
      data: {
        type: 'updated',
        entityType: 'beneficial-owner',
        entityId: owner.id,
        description: `Beneficial owner '${owner.firstName} ${owner.lastName}' details updated`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(owner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a beneficial owner
router.delete('/:companyId/:id', auth, async (req, res) => {
  try {
    // First find the owner and verify ownership
    const existingOwner = await getPrismaClient().beneficialOwner.findFirst({
      where: {
        AND: [
          { id: req.params.id },
          { companyId: req.params.companyId }
        ]
      }
    });

    if (!existingOwner) {
      return res.status(404).json({ error: 'Beneficial owner not found' });
    }

    // Then perform the delete
    const owner = await getPrismaClient().beneficialOwner.delete({
      where: { id: req.params.id }
    });

    // Create activity log
    await getPrismaClient().activity.create({
      data: {
        type: 'removed',
        entityType: 'beneficial-owner',
        entityId: owner.id,
        description: `Beneficial owner '${owner.firstName} ${owner.lastName}' deleted`,
        user: req.user?.firstName || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export as Excel
router.get('/:companyId/export/excel', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {
      companyId: req.params.companyId
    };
    
    if (status && status !== 'All') {
      where.status = status;
    }

    const owners = await getPrismaClient().beneficialOwner.findMany({
      where,
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });

    // Create workbook and worksheet
    const wb = xlsx.utils.book_new();
    
    // Format data for Excel
    const data = owners.map(owner => ({
      'Title': owner.title,
      'First Name': owner.firstName,
      'Last Name': owner.lastName,
      'Date of Birth': new Date(owner.dateOfBirth).toLocaleDateString('en-IE'),
      'Nationality': owner.nationality,
      'Address': owner.address,
      'Email': owner.email,
      'Phone': owner.phone,
      'Nature of Control': owner.natureOfControl.join('; '),
      'Ownership Percentage': owner.ownershipPercentage,
      'Registration Date': new Date(owner.registrationDate).toLocaleDateString('en-IE'),
      'Status': owner.status
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, 'Beneficial Owners');

    // Generate buffer
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=beneficial-owners.xlsx');
    
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export as PDF
router.get('/:companyId/export/pdf', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {
      companyId: req.params.companyId
    };
    
    if (status && status !== 'All') {
      where.status = status;
    }

    const owners = await getPrismaClient().beneficialOwner.findMany({
      where,
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ],
      include: {
        company: {
          select: {
            name: true,
            legalName: true
          }
        }
      }
    });

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=beneficial-owners.pdf');

    // Pipe PDF to response
    doc.pipe(res);

    // Add company name if available
    if (owners[0]?.company) {
      doc.fontSize(16).text(owners[0].company.name || owners[0].company.legalName, { align: 'center' });
      doc.moveDown();
    }

    // Add title
    doc.fontSize(14).text('Beneficial Owners Register', { align: 'center' });
    doc.moveDown();

    // Add date
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString('en-IE')}`, { align: 'right' });
    doc.moveDown();

    // Add owners
    owners.forEach((owner, index) => {
      doc.fontSize(12).text(`${index + 1}. ${owner.title} ${owner.firstName} ${owner.lastName}`);
      doc.fontSize(10)
        .text(`Email: ${owner.email}`)
        .text(`Phone: ${owner.phone}`)
        .text(`Status: ${owner.status}`)
        .text(`Nature of Control: ${owner.natureOfControl.join('; ')}`)
        .text(`Ownership Percentage: ${owner.ownershipPercentage}%`)
        .text(`Registration Date: ${new Date(owner.registrationDate).toLocaleDateString('en-IE')}`)
        .text(`Address: ${owner.address}`);
      
      doc.moveDown();
    });

    // Finalize PDF
    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import routes
// Read file headers
router.post('/:companyId/read-headers', auth, upload.single('file'), async (req, res) => {
  try {
    console.log('Read headers request received');
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File details:', {
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Check if file exists
    if (!fs.existsSync(req.file.path)) {
      console.log('File does not exist at path:', req.file.path);
      return res.status(400).json({ error: 'File not found' });
    }

    // Read file content with proper encoding
    const fileContent = fs.readFileSync(req.file.path, { encoding: 'utf-8' });
    
    // Basic validation of file content
    if (!fileContent.trim()) {
      return res.status(400).json({ error: 'File is empty' });
    }

    console.log('First 200 chars of file:', fileContent.substring(0, 200));

    try {
      const headers = await getFileHeaders(req.file);
      console.log('Headers extracted:', headers);

      if (!headers || headers.length === 0) {
        return res.status(400).json({ error: 'No headers found in file' });
      }

      res.json({ headers });
    } catch (parseError) {
      console.error('Error parsing file:', parseError);
      return res.status(400).json({ error: 'Invalid file format. Please ensure the file is a properly formatted CSV.' });
    }
  } catch (error) {
    console.error('Error in read-headers:', error);
    logger.error('Error reading headers:', error);
    res.status(500).json({ error: 'An unexpected error occurred while reading the file. Please try again.' });
  }
});

// Preview import data
router.post('/:companyId/preview-import', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const mapping = JSON.parse(req.body.mapping);
    const records = await previewRecords(req.file, mapping);
    res.json({ data: records.slice(0, 5), total: records.length });
  } catch (error) {
    logger.error('Error previewing import:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm and process import
router.post('/:companyId/confirm-import', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const mapping = JSON.parse(req.body.mapping);

    // Add job to queue with user info
    const job = await importQueue.add({
      filePath: req.file.path,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      mapping,
      companyId: req.params.companyId,
      userId: req.user?.id || 'System',
      entityType: 'beneficial-owner' // Explicitly set entityType
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: false, // Keep completed jobs for status checks
      removeOnFail: false // Keep failed jobs for debugging
    });

    // Return job ID for tracking
    res.json({
      success: true,
      message: 'Import job started',
      jobId: job.id
    });

  } catch (error) {
    logger.error('Error queueing import:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      companyId: req.params.companyId
    });
    
    // Cleanup
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to start import. Please try again.' 
    });
  }
});

// Get import job status
router.get('/:companyId/import-status/:jobId', auth, async (req, res) => {
  try {
    const job = await importQueue.getJob(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Import job not found' });
    }

    // Check if job belongs to this company
    if (job.data.companyId !== req.params.companyId) {
      return res.status(403).json({ error: 'Not authorized to access this import job' });
    }

    const [state, progressData] = await Promise.all([
      job.getState(),
      job.progress()
    ]);

    logger.debug('Import status check:', {
      jobId: job.id,
      state,
      progress: progressData?.progress || 0,
      currentOwner: progressData?.currentOwner
    });

    const response = {
      jobId: job.id,
      state,
      progress: progressData?.progress || 0,
      currentOwner: progressData?.currentOwner,
      lastChecked: new Date().toISOString()
    };

    // Add additional info based on state
    if (state === 'completed') {
      logger.info('Import job completed successfully:', {
        jobId: job.id,
        result: job.returnvalue
      });
      response.result = job.returnvalue;
    } else if (state === 'failed') {
      logger.error('Import job failed:', {
        jobId: job.id,
        error: job.failedReason
      });
      response.error = job.failedReason;
    } else {
      logger.debug('Import job in progress:', {
        jobId: job.id,
        state,
        progress: progressData?.progress || 0,
        currentOwner: progressData?.currentOwner
      });
    }

    res.json(response);
  } catch (error) {
    logger.error('Error getting import status:', {
      error: error.message,
      stack: error.stack,
      jobId: req.params.jobId,
      userId: req.user?.id,
      companyId: req.params.companyId
    });
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get file headers
async function getFileHeaders(file) {
  try {
    console.log('Getting headers for file:', file.originalname);
    
    if (file.mimetype === 'text/csv') {
      return new Promise((resolve, reject) => {
        const headers = [];
        let hasData = false;

        const parser = parse({
          delimiter: ',',
          from_line: 1,
          to_line: 1,
          trim: true,
          skip_empty_lines: true,
          relax_column_count: true
        });

        parser.on('error', (error) => {
          console.error('CSV parsing error:', error);
          reject(new Error('Failed to parse CSV file. Please check the file format.'));
        });

        parser.on('data', (row) => {
          console.log('CSV row:', row);
          if (row && row.length > 0 && row.some(cell => cell)) {
            hasData = true;
            headers.push(...row.map(header => header ? header.trim() : ''));
          }
        });

        parser.on('end', () => {
          console.log('Parsed CSV headers:', headers);
          if (!hasData) {
            reject(new Error('No data found in CSV file'));
          } else {
            resolve(headers.filter(header => header)); // Remove empty headers
          }
        });

        // Handle stream errors
        const stream = fs.createReadStream(file.path, { encoding: 'utf-8' })
          .on('error', (error) => {
            console.error('Stream error:', error);
            reject(new Error('Failed to read file: ' + error.message));
          });

        stream.pipe(parser);
      });
    } else {
      const workbook = xlsx.readFile(file.path);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      console.log('Excel headers:', data[0]);
      if (!data || !data[0] || data[0].length === 0) {
        throw new Error('No headers found in Excel file');
      }
      return data[0].filter(header => header); // Remove empty headers
    }
  } catch (error) {
    console.error('Error reading file headers:', error);
    throw new Error('Failed to read file headers: ' + error.message);
  }
}

// Helper function to preview records
async function previewRecords(file, mapping) {
  const { parseCSV, parseExcel } = require('../../services/queue');
  if (file.mimetype === 'text/csv') {
    return parseCSV(file.path, mapping);
  } else {
    return parseExcel(file.path, mapping);
  }
}

module.exports = router;
