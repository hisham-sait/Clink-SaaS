const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const dataService = require('../../services/engage/data');
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
router.get('/', auth, async (req, res) => {
  try {
    const datasets = await dataService.getAllDatasets(req.user.companyId);
    res.json(datasets);
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({ error: 'Failed to fetch datasets' });
  }
});

// Get a single dataset by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const dataset = await dataService.getDatasetById(req.params.id, req.user.companyId);
    res.json(dataset);
  } catch (error) {
    console.error('Error fetching dataset:', error);
    if (error.message === 'Dataset not found') {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.status(500).json({ error: 'Failed to fetch dataset' });
  }
});

// Create a new dataset
router.post('/', auth, async (req, res) => {
  try {
    const dataset = await dataService.createDataset(req.body, req.user.companyId);
    res.status(201).json(dataset);
  } catch (error) {
    console.error('Error creating dataset:', error);
    res.status(500).json({ error: 'Failed to create dataset' });
  }
});

// Update a dataset
router.put('/:id', auth, async (req, res) => {
  try {
    const dataset = await dataService.updateDataset(req.params.id, req.body, req.user.companyId);
    res.json(dataset);
  } catch (error) {
    console.error('Error updating dataset:', error);
    if (error.message === 'Dataset not found') {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.status(500).json({ error: 'Failed to update dataset' });
  }
});

// Delete a dataset
router.delete('/:id', auth, async (req, res) => {
  try {
    await dataService.deleteDataset(req.params.id, req.user.companyId);
    res.json({ message: 'Dataset deleted successfully' });
  } catch (error) {
    console.error('Error deleting dataset:', error);
    if (error.message === 'Dataset not found') {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.status(500).json({ error: 'Failed to delete dataset' });
  }
});

// Regenerate webhook secret
router.post('/:id/regenerate-webhook-secret', auth, async (req, res) => {
  try {
    const dataset = await dataService.regenerateWebhookSecret(req.params.id, req.user.companyId);
    res.json(dataset);
  } catch (error) {
    console.error('Error regenerating webhook secret:', error);
    if (error.message === 'Dataset not found') {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (error.message === 'Dataset is not a webhook type') {
      return res.status(400).json({ error: 'Dataset is not a webhook type' });
    }
    res.status(500).json({ error: 'Failed to regenerate webhook secret' });
  }
});

// Get records for a dataset
router.get('/:id/records', auth, async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const records = await dataService.getDatasetRecords(
      req.params.id, 
      req.user.companyId,
      { page, limit, sortBy, sortOrder }
    );
    res.json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    if (error.message === 'Dataset not found') {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// Add a record to a dataset
router.post('/:id/records', auth, async (req, res) => {
  try {
    // Get metadata
    const metadata = {
      addedBy: req.user.id,
      addedAt: new Date(),
      source: 'manual'
    };
    
    const record = await dataService.addRecord(req.params.id, req.body, metadata);
    res.status(201).json(record);
  } catch (error) {
    console.error('Error adding record:', error);
    if (error.message === 'Dataset not found') {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    res.status(500).json({ error: 'Failed to add record' });
  }
});

// Upload and import data
router.post('/import', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
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
      return res.status(400).json({ error: 'File contains no data' });
    }
    
    // Import data
    const { datasetId, name, description } = req.body;
    const result = await dataService.importData(
      datasetId || null, 
      req.user.companyId, 
      data,
      { name, description }
    );
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// Webhook endpoint for receiving data
router.post('/webhook/:webhookId', async (req, res) => {
  try {
    const { webhookId } = req.params;
    const webhookSecret = req.headers['x-webhook-secret'];
    
    if (!webhookSecret) {
      return res.status(401).json({ error: 'Webhook secret is required' });
    }
    
    // Get metadata
    const metadata = {
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      referrer: req.headers.referer || req.headers.referrer || 'Direct',
      receivedAt: new Date()
    };
    
    const record = await dataService.addRecordViaWebhook(webhookId, webhookSecret, req.body, metadata);
    
    res.status(201).json({ 
      message: 'Data received successfully',
      recordId: record.id
    });
  } catch (error) {
    console.error('Error processing webhook data:', error);
    if (error.message === 'Invalid webhook ID') {
      return res.status(404).json({ error: 'Invalid webhook ID' });
    }
    if (error.message === 'Invalid webhook secret') {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }
    res.status(500).json({ error: 'Failed to process data' });
  }
});

module.exports = router;
