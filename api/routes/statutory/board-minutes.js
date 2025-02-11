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

// Get all board minutes for a company
router.get('/:companyId?', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    
    // Only filter by status if it's provided and not 'All'
    if (status && status !== 'All') {
      where.status = status;
    } else {
      where.status = {
        in: ['Final', 'Signed'] // Default to Final and Signed if no status provided
      };
    }

    // If not super_admin/platform_admin or if companyId is provided, filter by company
    if (req.params.companyId || (!req.user.roles.includes('super_admin') && !req.user.roles.includes('platform_admin'))) {
      where.companyId = req.params.companyId || req.user.companyId;
    }

    const boardMinutes = await getPrismaClient().boardMinute.findMany({
      where,
      orderBy: { meetingDate: 'desc' },
      include: {
        discussions: {
          include: {
            actionItems: true
          }
        },
        resolutions: true,
        company: {
          select: {
            name: true,
            legalName: true
          }
        }
      }
    });
    res.json(boardMinutes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific board minute
router.get('/:companyId/:id', auth, async (req, res) => {
  try {
    const boardMinute = await getPrismaClient().boardMinute.findUnique({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      include: {
        discussions: {
          include: {
            actionItems: true
          }
        },
        resolutions: true
      }
    });
    if (!boardMinute) {
      return res.status(404).json({ error: 'Board minute not found' });
    }
    res.json(boardMinute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new board minute
router.post('/:companyId', auth, async (req, res) => {
  try {
    const { discussions, resolutions, ...minuteData } = req.body;
    
    const boardMinute = await getPrismaClient().boardMinute.create({
      data: {
        ...minuteData,
        companyId: req.params.companyId,
        meetingDate: parseDate(req.body.meetingDate),
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        discussions: {
          create: discussions.map(discussion => ({
            topic: discussion.topic,
            details: discussion.details,
            decisions: discussion.decisions,
            actionItems: {
              create: discussion.actionItems?.map(item => ({
                task: item.task,
                assignee: item.assignee,
                dueDate: parseDate(item.dueDate),
                status: item.status
              })) || []
            }
          }))
        },
        resolutions: {
          create: resolutions.map(resolution => ({
            title: resolution.title,
            type: resolution.type,
            description: resolution.description,
            outcome: resolution.outcome,
            proposedBy: resolution.proposedBy,
            secondedBy: resolution.secondedBy
          }))
        }
      },
      include: {
        discussions: {
          include: {
            actionItems: true
          }
        },
        resolutions: true
      }
    });
    
    // Create activity log
    await getPrismaClient().activity.create({
      data: {
        type: 'added',
        entityType: 'minute',
        entityId: boardMinute.id,
        description: `New board minute created for ${new Date(boardMinute.meetingDate).toLocaleDateString()}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(boardMinute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a board minute
router.put('/:companyId/:id', auth, async (req, res) => {
  try {
    const { discussions, resolutions, ...minuteData } = req.body;

    // First update the board minute
    const boardMinute = await getPrismaClient().boardMinute.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        ...minuteData,
        meetingDate: parseDate(req.body.meetingDate),
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime)
      }
    });

    // Handle discussions and action items
    if (discussions) {
      // Delete existing discussions and their action items
      await getPrismaClient().discussion.deleteMany({
        where: { boardMinuteId: boardMinute.id }
      });

      // Create new discussions with action items
      for (const discussion of discussions) {
        await getPrismaClient().discussion.create({
          data: {
            boardMinuteId: boardMinute.id,
            topic: discussion.topic,
            details: discussion.details,
            decisions: discussion.decisions,
            actionItems: {
              create: discussion.actionItems?.map(item => ({
                task: item.task,
                assignee: item.assignee,
                dueDate: parseDate(item.dueDate),
                status: item.status
              })) || []
            }
          }
        });
      }
    }

    // Handle resolutions
    if (resolutions) {
      // Delete existing resolutions
      await getPrismaClient().resolution.deleteMany({
        where: { boardMinuteId: boardMinute.id }
      });

      // Create new resolutions
      await getPrismaClient().resolution.createMany({
        data: resolutions.map(resolution => ({
          boardMinuteId: boardMinute.id,
          title: resolution.title,
          type: resolution.type,
          description: resolution.description,
          outcome: resolution.outcome,
          proposedBy: resolution.proposedBy,
          secondedBy: resolution.secondedBy
        }))
      });
    }

    // Create activity log
    await getPrismaClient().activity.create({
      data: {
        type: 'updated',
        entityType: 'minute',
        entityId: boardMinute.id,
        description: `Board minute updated for ${new Date(boardMinute.meetingDate).toLocaleDateString()}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    // Fetch and return updated board minute with all relations
    const updatedBoardMinute = await getPrismaClient().boardMinute.findUnique({
      where: { id: boardMinute.id },
      include: {
        discussions: {
          include: {
            actionItems: true
          }
        },
        resolutions: true
      }
    });

    res.json(updatedBoardMinute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update board minute status
router.post('/:companyId/:id/status', auth, async (req, res) => {
  try {
    const boardMinute = await getPrismaClient().boardMinute.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        status: req.body.status
      },
      include: {
        discussions: {
          include: {
            actionItems: true
          }
        },
        resolutions: true
      }
    });

    // Create activity log
    await getPrismaClient().activity.create({
      data: {
        type: 'status_changed',
        entityType: 'minute',
        entityId: boardMinute.id,
        description: `Board minute status changed to ${req.body.status}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(boardMinute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update action item status
router.post('/:companyId/:id/action-item/:actionItemId', auth, async (req, res) => {
  try {
    const actionItem = await getPrismaClient().actionItem.update({
      where: { 
        id: req.params.actionItemId
      },
      data: {
        status: req.body.status
      }
    });

    // Create activity log
    await getPrismaClient().activity.create({
      data: {
        type: 'updated',
        entityType: 'action-item',
        entityId: actionItem.id,
        description: `Action item "${actionItem.task}" status updated to ${req.body.status}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(actionItem);
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
    } else {
      where.status = {
        in: ['Final', 'Signed']
      };
    }

    const boardMinutes = await getPrismaClient().boardMinute.findMany({
      where,
      orderBy: { meetingDate: 'desc' },
      include: {
        discussions: {
          include: {
            actionItems: true
          }
        },
        resolutions: true
      }
    });

    // Create workbook and worksheet
    const wb = xlsx.utils.book_new();
    
    // Format data for Excel
    const data = boardMinutes.map(minute => ({
      'Meeting Date': new Date(minute.meetingDate).toLocaleDateString('en-IE'),
      'Start Time': new Date(minute.startTime).toLocaleTimeString('en-IE'),
      'End Time': new Date(minute.endTime).toLocaleTimeString('en-IE'),
      'Meeting Type': minute.meetingType,
      'Chairperson': minute.chairperson,
      'Attendees': minute.attendees?.join(', ') || '',
      'Status': minute.status,
      'Discussions': minute.discussions.map(d => d.topic).join('; '),
      'Action Items': minute.discussions.flatMap(d => d.actionItems.map(a => a.task)).join('; '),
      'Resolutions': minute.resolutions.map(r => r.title).join('; ')
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, 'Board Minutes');

    // Generate buffer
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=board-minutes.xlsx');
    
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
    } else {
      where.status = {
        in: ['Final', 'Signed']
      };
    }

    const boardMinutes = await getPrismaClient().boardMinute.findMany({
      where,
      orderBy: { meetingDate: 'desc' },
      include: {
        discussions: {
          include: {
            actionItems: true
          }
        },
        resolutions: true,
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
    res.setHeader('Content-Disposition', 'attachment; filename=board-minutes.pdf');

    // Pipe PDF to response
    doc.pipe(res);

    // Add company name if available
    if (boardMinutes[0]?.company) {
      doc.fontSize(16).text(boardMinutes[0].company.name || boardMinutes[0].company.legalName, { align: 'center' });
      doc.moveDown();
    }

    // Add title
    doc.fontSize(14).text('Board Minutes Register', { align: 'center' });
    doc.moveDown();

    // Add date
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString('en-IE')}`, { align: 'right' });
    doc.moveDown();

    // Add minutes
    boardMinutes.forEach((minute, index) => {
      doc.fontSize(12).text(`${index + 1}. Board Meeting - ${new Date(minute.meetingDate).toLocaleDateString('en-IE')}`);
      doc.fontSize(10)
        .text(`Time: ${new Date(minute.startTime).toLocaleTimeString('en-IE')} - ${new Date(minute.endTime).toLocaleTimeString('en-IE')}`)
        .text(`Chairperson: ${minute.chairperson}`)
        .text(`Status: ${minute.status}`);
      
      if (minute.attendees?.length > 0) {
        doc.text(`Attendees: ${minute.attendees.join(', ')}`);
      }
      
      if (minute.discussions?.length > 0) {
        doc.moveDown()
          .text('Discussions:');
        minute.discussions.forEach((discussion, i) => {
          doc.text(`  ${i + 1}. ${discussion.topic}`);
          if (discussion.actionItems?.length > 0) {
            doc.text('    Action Items:');
            discussion.actionItems.forEach((item, j) => {
              doc.text(`      ${j + 1}. ${item.task} (${item.status})`);
            });
          }
        });
      }
      
      if (minute.resolutions?.length > 0) {
        doc.moveDown()
          .text('Resolutions:');
        minute.resolutions.forEach((resolution, i) => {
          doc.text(`  ${i + 1}. ${resolution.title} (${resolution.outcome})`);
        });
      }
      
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
      entityType: 'minute' // Explicitly set entityType
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
      currentMinute: progressData?.currentMinute
    });

    const response = {
      jobId: job.id,
      state,
      progress: progressData?.progress || 0,
      currentMinute: progressData?.currentMinute,
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
        currentMinute: progressData?.currentMinute
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
