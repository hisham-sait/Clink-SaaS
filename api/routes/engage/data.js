const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const dataService = require('../../services/engage/data');
const { successResponse, errorResponse, ErrorTypes, asyncHandler } = require('../../utils/responseUtils');
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/data');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only CSV and Excel files
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  }
});

// Get all datasets for a company
router.get('/', auth, asyncHandler(async (req, res) => {
  const datasets = await dataService.getAllDatasets(req.user.companyId);
  res.json(successResponse(datasets));
}));

// Get all datasets for a company (with company ID in URL)
router.get('/:companyId', auth, asyncHandler(async (req, res) => {
  // Verify that the user has access to this company
  if (req.params.companyId !== req.user.companyId) {
    const { statusCode, body } = ErrorTypes.FORBIDDEN();
    return res.status(statusCode).json(body);
  }
  
  const datasets = await dataService.getAllDatasets(req.params.companyId);
  res.json(successResponse(datasets));
}));

// Get a single dataset by ID
router.get('/:companyId/:id', auth, asyncHandler(async (req, res) => {
  try {
    const dataset = await dataService.getDatasetById(req.params.id, req.user.companyId);
    res.json(successResponse(dataset));
  } catch (error) {
    console.error('Error fetching dataset:', error);
    if (error.message === 'Dataset not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Dataset');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to fetch dataset');
    res.status(statusCode).json(body);
  }
}));

// Create a new dataset
router.post('/', auth, asyncHandler(async (req, res) => {
  const dataset = await dataService.createDataset(req.body, req.user.companyId);
  res.status(201).json(successResponse(dataset, 'Dataset created successfully'));
}));

// Create a new dataset (with company ID in URL)
router.post('/:companyId', auth, asyncHandler(async (req, res) => {
  // Verify that the user has access to this company
  if (req.params.companyId !== req.user.companyId) {
    const { statusCode, body } = ErrorTypes.FORBIDDEN();
    return res.status(statusCode).json(body);
  }
  
  const dataset = await dataService.createDataset(req.body, req.params.companyId);
  res.status(201).json(successResponse(dataset, 'Dataset created successfully'));
}));

// Update a dataset
router.put('/:id', auth, asyncHandler(async (req, res) => {
  try {
    const dataset = await dataService.updateDataset(req.params.id, req.body, req.user.companyId);
    res.json(successResponse(dataset, 'Dataset updated successfully'));
  } catch (error) {
    console.error('Error updating dataset:', error);
    if (error.message === 'Dataset not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Dataset');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to update dataset');
    res.status(statusCode).json(body);
  }
}));

// Update a dataset (with company ID in URL)
router.put('/:companyId/:id', auth, asyncHandler(async (req, res) => {
  // Verify that the user has access to this company
  if (req.params.companyId !== req.user.companyId) {
    const { statusCode, body } = ErrorTypes.FORBIDDEN();
    return res.status(statusCode).json(body);
  }
  
  try {
    const dataset = await dataService.updateDataset(req.params.id, req.body, req.params.companyId);
    res.json(successResponse(dataset, 'Dataset updated successfully'));
  } catch (error) {
    console.error('Error updating dataset:', error);
    if (error.message === 'Dataset not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Dataset');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to update dataset');
    res.status(statusCode).json(body);
  }
}));

// Delete a dataset
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  try {
    await dataService.deleteDataset(req.params.id, req.user.companyId);
    res.json(successResponse(null, 'Dataset deleted successfully'));
  } catch (error) {
    console.error('Error deleting dataset:', error);
    if (error.message === 'Dataset not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Dataset');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to delete dataset');
    res.status(statusCode).json(body);
  }
}));

// Delete a dataset (with company ID in URL)
router.delete('/:companyId/:id', auth, asyncHandler(async (req, res) => {
  // Verify that the user has access to this company
  if (req.params.companyId !== req.user.companyId) {
    const { statusCode, body } = ErrorTypes.FORBIDDEN();
    return res.status(statusCode).json(body);
  }
  
  try {
    await dataService.deleteDataset(req.params.id, req.params.companyId);
    res.json(successResponse(null, 'Dataset deleted successfully'));
  } catch (error) {
    console.error('Error deleting dataset:', error);
    if (error.message === 'Dataset not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Dataset');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to delete dataset');
    res.status(statusCode).json(body);
  }
}));

// Regenerate webhook secret
router.post('/:id/regenerate-webhook-secret', auth, asyncHandler(async (req, res) => {
  try {
    const dataset = await dataService.regenerateWebhookSecret(req.params.id, req.user.companyId);
    res.json(successResponse(dataset, 'Webhook secret regenerated successfully'));
  } catch (error) {
    console.error('Error regenerating webhook secret:', error);
    if (error.message === 'Dataset not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Dataset');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Dataset is not a webhook type') {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST('Dataset is not a webhook type');
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to regenerate webhook secret');
    res.status(statusCode).json(body);
  }
}));

// Get records for a dataset
router.get('/:id/records', auth, asyncHandler(async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const records = await dataService.getDatasetRecords(
      req.params.id, 
      req.user.companyId,
      { page, limit, sortBy, sortOrder }
    );
    res.json(successResponse(records));
  } catch (error) {
    console.error('Error fetching records:', error);
    if (error.message === 'Dataset not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Dataset');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to fetch records');
    res.status(statusCode).json(body);
  }
}));

// Get records for a dataset (with company ID in URL)
router.get('/:companyId/:id/records', auth, asyncHandler(async (req, res) => {
  // Verify that the user has access to this company
  if (req.params.companyId !== req.user.companyId) {
    const { statusCode, body } = ErrorTypes.FORBIDDEN();
    return res.status(statusCode).json(body);
  }
  
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const records = await dataService.getDatasetRecords(
      req.params.id, 
      req.params.companyId,
      { page, limit, sortBy, sortOrder }
    );
    res.json(successResponse(records));
  } catch (error) {
    console.error('Error fetching records:', error);
    if (error.message === 'Dataset not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Dataset');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to fetch records');
    res.status(statusCode).json(body);
  }
}));

// Add a record to a dataset
router.post('/:id/records', auth, asyncHandler(async (req, res) => {
  try {
    // Get metadata
    const metadata = {
      addedBy: req.user.id,
      addedAt: new Date(),
      source: 'manual'
    };
    
    const record = await dataService.addRecord(req.params.id, req.body, metadata);
    res.status(201).json(successResponse(record, 'Record added successfully'));
  } catch (error) {
    console.error('Error adding record:', error);
    if (error.message === 'Dataset not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Dataset');
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to add record');
    res.status(statusCode).json(body);
  }
}));

// Add a record to a dataset (with company ID in URL)
router.post('/:companyId/:id/records', auth, asyncHandler(async (req, res) => {
  // Verify that the user has access to this company
  if (req.params.companyId !== req.user.companyId) {
    const { statusCode, body } = ErrorTypes.FORBIDDEN();
    return res.status(statusCode).json(body);
  }
  
  try {
    // Get metadata
    const metadata = {
      addedBy: req.user.id,
      addedAt: new Date(),
      source: 'manual'
    };
    
    const record = await dataService.addRecord(req.params.id, req.body, metadata);
    res.status(201).json(successResponse(record, 'Record added successfully'));
  } catch (error) {
    console.error('Error adding record:', error);
    if (error.message === 'Dataset not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Dataset');
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to add record');
    res.status(statusCode).json(body);
  }
}));

// Upload and import data
router.post('/import', auth, upload.single('file'), asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST('No file uploaded');
      return res.status(statusCode).json(body);
    }
    
    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let data = [];
    
    // Parse file based on extension
    if (fileExt === '.csv') {
      // Parse CSV
      data = await new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => results.push(row))
          .on('end', () => resolve(results))
          .on('error', (error) => reject(error));
      });
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      // Parse Excel
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = xlsx.utils.sheet_to_json(worksheet);
    }
    
    // Clean up the file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
    
    if (data.length === 0) {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST('File contains no data');
      return res.status(statusCode).json(body);
    }
    
    // Import data
    const { datasetId, name, description } = req.body;
    const result = await dataService.importData(
      datasetId || null, 
      req.user.companyId, 
      data,
      { name, description }
    );
    
    res.status(201).json(successResponse(result, 'Data imported successfully'));
  } catch (error) {
    console.error('Error importing data:', error);
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to import data');
    res.status(statusCode).json(body);
  }
}));

// Upload and import data (with company ID in URL)
router.post('/:companyId/import', auth, upload.single('file'), asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST('No file uploaded');
      return res.status(statusCode).json(body);
    }
    
    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let data = [];
    
    // Parse file based on extension
    if (fileExt === '.csv') {
      // Parse CSV
      data = await new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => results.push(row))
          .on('end', () => resolve(results))
          .on('error', (error) => reject(error));
      });
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      // Parse Excel
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = xlsx.utils.sheet_to_json(worksheet);
    }
    
    // Clean up the file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
    
    if (data.length === 0) {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST('File contains no data');
      return res.status(statusCode).json(body);
    }
    
    // Import data
    const { datasetId, name, description } = req.body;
    const result = await dataService.importData(
      datasetId || null, 
      req.user.companyId, 
      data,
      { name, description }
    );
    
    res.status(201).json(successResponse(result, 'Data imported successfully'));
  } catch (error) {
    console.error('Error importing data:', error);
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to import data');
    res.status(statusCode).json(body);
  }
}));

// Webhook endpoint for receiving data
router.post('/webhook/:webhookId', asyncHandler(async (req, res) => {
  try {
    const { webhookId } = req.params;
    const webhookSecret = req.headers['x-webhook-secret'];
    
    if (!webhookSecret) {
      const { statusCode, body } = ErrorTypes.UNAUTHORIZED('Webhook secret is required');
      return res.status(statusCode).json(body);
    }
    
    // Get metadata
    const metadata = {
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      referrer: req.headers.referer || req.headers.referrer || 'Direct',
      receivedAt: new Date()
    };
    
    const record = await dataService.addRecordViaWebhook(webhookId, webhookSecret, req.body, metadata);
    
    res.status(201).json(successResponse({ recordId: record.id }, 'Data received successfully'));
  } catch (error) {
    console.error('Error processing webhook data:', error);
    if (error.message === 'Invalid webhook ID') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Invalid webhook ID');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Invalid webhook secret') {
      const { statusCode, body } = ErrorTypes.UNAUTHORIZED('Invalid webhook secret');
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to process data');
    res.status(statusCode).json(body);
  }
}));

module.exports = router;
