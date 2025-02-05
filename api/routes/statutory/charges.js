const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/imports';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // Default 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV files are allowed.'));
    }
  }
});

// Helper function to parse DD/MM/YYYY to Date object
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('/');
  return new Date(year, month - 1, day);
};

// Helper function to get file headers
async function getFileHeaders(file) {
  return new Promise((resolve, reject) => {
    const headers = [];
    fs.createReadStream(file.path)
      .pipe(parse({
        delimiter: ',',
        from_line: 1,
        to_line: 1,
        trim: true
      }))
      .on('data', (row) => headers.push(...row))
      .on('end', () => resolve(headers))
      .on('error', reject);
  });
}

// Get all charges for a company
router.get('/:companyId?', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {
      status: status || 'Active' // Default to Active if no status provided
    };

    // If not super_admin/platform_admin or if companyId is provided, filter by company
    if (req.params.companyId || (!req.user?.roles?.includes('super_admin') && !req.user?.roles?.includes('platform_admin'))) {
      where.companyId = req.params.companyId || req.user?.companyId;
    }

    const charges = await prisma.charge.findMany({
      where,
      orderBy: { dateCreated: 'desc' },
      include: {
        company: {
          select: {
            name: true,
            legalName: true
          }
        }
      }
    });
    res.json(charges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific charge
router.get('/:companyId/:id', async (req, res) => {
  try {
    const charge = await prisma.charge.findUnique({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      }
    });
    if (!charge) {
      return res.status(404).json({ error: 'Charge not found' });
    }
    res.json(charge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new charge
router.post('/:companyId', async (req, res) => {
  try {
    const charge = await prisma.charge.create({
      data: {
        ...req.body,
        companyId: req.params.companyId,
        dateCreated: new Date(req.body.dateCreated),
        registrationDate: new Date(req.body.registrationDate),
        amount: parseFloat(req.body.amount),
        status: 'Active'
      }
    });
    
    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'added',
        description: `New charge created: ${charge.chargeType} - ${charge.chargeId}`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(charge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a charge
router.put('/:companyId/:id', async (req, res) => {
  try {
    const charge = await prisma.charge.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        ...req.body,
        dateCreated: new Date(req.body.dateCreated),
        registrationDate: new Date(req.body.registrationDate),
        amount: parseFloat(req.body.amount),
        satisfactionDate: req.body.satisfactionDate ? new Date(req.body.satisfactionDate) : null
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'updated',
        description: `Charge ${charge.chargeId} details updated`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(charge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Satisfy a charge
router.post('/:companyId/:id/satisfy', async (req, res) => {
  try {
    const charge = await prisma.charge.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        status: 'Satisfied',
        satisfactionDate: new Date(req.body.satisfactionDate || new Date())
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'status_changed',
        description: `Charge ${charge.chargeId} marked as satisfied`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(charge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Release a charge
router.post('/:companyId/:id/release', async (req, res) => {
  try {
    const charge = await prisma.charge.update({
      where: { 
        id: req.params.id,
        companyId: req.params.companyId
      },
      data: {
        status: 'Released',
        satisfactionDate: new Date(req.body.satisfactionDate || new Date())
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'status_changed',
        description: `Charge ${charge.chargeId} released`,
        user: req.body.user || 'System',
        time: new Date(),
        companyId: req.params.companyId
      }
    });

    res.json(charge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read CSV headers
router.post('/:companyId/read-headers', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const headers = await getFileHeaders(req.file);
    res.json(headers);
  } catch (error) {
    console.error('Error reading headers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Preview import data
router.post('/:companyId/preview-import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const mapping = JSON.parse(req.body.mapping);
    const previewData = [];

    // Read and parse CSV file
    const parser = fs.createReadStream(req.file.path).pipe(parse({
      delimiter: ',',
      columns: true,
      trim: true
    }));

    for await (const record of parser) {
      const mappedRecord = {};
      Object.keys(mapping).forEach(key => {
        let value = record[mapping[key]];
        
        // Convert values based on field type
        switch (key) {
          case 'amount':
            value = parseFloat(value) || 0;
            break;
          case 'dateCreated':
          case 'satisfactionDate':
            // Keep dates in DD/MM/YYYY format for preview
            value = value;
            break;
          default:
            mappedRecord[key] = value;
        }
        
        mappedRecord[key] = value;
      });

      previewData.push(mappedRecord);
      if (previewData.length >= 5) break; // Only get first 5 records for preview
    }

    res.json({ data: previewData });
  } catch (error) {
    console.error('Error previewing data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm import
router.post('/:companyId/confirm-import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const mapping = JSON.parse(req.body.mapping);
    const jobId = Date.now().toString();
    
    // Process the import asynchronously
    (async () => {
      try {
        const parser = fs.createReadStream(req.file.path).pipe(parse({
          delimiter: ',',
          columns: true,
          trim: true
        }));

        let imported = 0;
        for await (const record of parser) {
          const data = {
            companyId: req.params.companyId
          };

          // Map values according to column mapping
          Object.keys(mapping).forEach(key => {
            let value = record[mapping[key]];
            
            // Convert values based on field type
            switch (key) {
              case 'amount':
                value = parseFloat(value) || 0;
                break;
              case 'dateCreated':
              case 'satisfactionDate':
                value = parseDate(value);
                break;
              default:
                data[key] = value;
            }
            
            data[key] = value;
          });

          // Create charge
          await prisma.charge.create({ data });
          imported++;
        }

        // Create activity log
        await prisma.activity.create({
          data: {
            type: 'added',
            entityType: 'charge',
            entityId: null,
            description: `Imported ${imported} charges`,
            user: req.body.user || 'System',
            time: new Date(),
            companyId: req.params.companyId
          }
        });

      } catch (error) {
        console.error('Import error:', error);
      }
    })();

    res.json({ success: true, jobId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check import status
router.get('/:companyId/import-status/:jobId', async (req, res) => {
  // For now, just return completed status
  // In a real implementation, you would track the job progress
  res.json({
    state: 'completed',
    progress: 100
  });
});

module.exports = router;
