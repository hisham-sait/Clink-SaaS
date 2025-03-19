const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/imports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `file-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Apply auth middleware to all routes
router.use(auth);

// Get all services for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const services = await prisma.product.findMany({
      where: { 
        companyId,
        type: 'SERVICE'
      },
      include: {
        tiers: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get a single service
router.get('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const service = await prisma.product.findFirst({
      where: { 
        id, 
        companyId,
        type: 'SERVICE'
      },
      include: {
        tiers: true,
      },
    });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Create a new service
router.post('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { tiers, ...serviceData } = req.body;

    console.log('Creating service with data:', JSON.stringify(serviceData, null, 2));
    console.log('Tiers data:', JSON.stringify(tiers, null, 2));

    // Create service with minimal required fields first
    const service = await prisma.product.create({
      data: {
        name: serviceData.name,
        description: serviceData.description,
        category: serviceData.category,
        status: serviceData.status || 'Active',
        type: 'SERVICE',
        companyId,
      },
      include: {
        tiers: true,
      },
    });

    console.log('Service created successfully:', service.id);

    // Add tiers if provided
    if (tiers && tiers.length > 0) {
      console.log('Adding tiers to service');
      
      for (const tier of tiers) {
        await prisma.productTier.create({
          data: {
            type: tier.type,
            price: tier.price,
            features: tier.features || [],
            description: tier.description || '',
            productId: service.id,
          },
        });
      }
      
      console.log('Tiers added successfully');
    }

    // Get the updated service with tiers
    const updatedService = await prisma.product.findUnique({
      where: { id: service.id },
      include: { tiers: true },
    });

    // Create activity record
    await prisma.activity.create({
      data: {
        type: 'added',
        entityType: 'product',
        entityId: service.id,
        description: `Added new service: ${service.name}`,
        user: req.user.id,
        time: new Date(),
        companyId
      }
    });

    res.status(201).json(updatedService);
  } catch (error) {
    console.error('Error creating service:', error);
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Prisma error code:', error.code);
    }
    res.status(500).json({ error: 'Failed to create service', details: error.message });
  }
});

// Update a service
router.put('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { tiers, ...serviceData } = req.body;

    const service = await prisma.product.findFirst({
      where: { 
        id, 
        companyId,
        type: 'SERVICE'
      },
    });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Delete existing tiers
    await prisma.productTier.deleteMany({
      where: { productId: id },
    });

    // Update service and create new tiers
    const updatedService = await prisma.product.update({
      where: { id },
      data: {
        ...serviceData,
        type: 'SERVICE',
        tiers: {
          create: tiers,
        },
      },
      include: {
        tiers: true,
      },
    });

    // Create activity record
    await prisma.activity.create({
      data: {
        type: 'updated',
        entityType: 'product',
        entityId: id,
        description: `Updated service: ${updatedService.name}`,
        user: req.user.id,
        time: new Date(),
        companyId
      }
    });

    res.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete a service
router.delete('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const service = await prisma.product.findFirst({
      where: { 
        id, 
        companyId,
        type: 'SERVICE'
      },
    });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Get service name for activity log
    const serviceName = service.name;

    // Product tiers will be automatically deleted due to onDelete: Cascade
    await prisma.product.delete({
      where: { id },
    });

    // Create activity record
    await prisma.activity.create({
      data: {
        type: 'removed',
        entityType: 'product',
        entityId: id,
        description: `Deleted service: ${serviceName}`,
        user: req.user.id,
        time: new Date(),
        companyId
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Get import template
router.get('/import/template', (req, res) => {
  try {
    const filename = 'services_import_template.csv';
    
    // Create CSV template
    const csvWriter = createCsvWriter({
      path: path.join(__dirname, '../../uploads', filename),
      header: [
        { id: 'name', title: 'Name' },
        { id: 'description', title: 'Description' },
        { id: 'category', title: 'Category' },
        { id: 'status', title: 'Status' },
        { id: 'basicPrice', title: 'Basic Price' },
        { id: 'standardPrice', title: 'Standard Price' },
        { id: 'premiumPrice', title: 'Premium Price' },
        { id: 'basicFeatures', title: 'Basic Features (semicolon separated)' },
        { id: 'standardFeatures', title: 'Standard Features (semicolon separated)' },
        { id: 'premiumFeatures', title: 'Premium Features (semicolon separated)' }
      ]
    });

    // Sample data
    const records = [{
      name: 'Sample Service',
      description: 'This is a sample service description',
      category: 'Consulting',
      status: 'Active',
      basicPrice: '99.99',
      standardPrice: '199.99',
      premiumPrice: '299.99',
      basicFeatures: 'Feature 1;Feature 2;Feature 3',
      standardFeatures: 'Feature 1;Feature 2;Feature 3;Feature 4;Feature 5',
      premiumFeatures: 'Feature 1;Feature 2;Feature 3;Feature 4;Feature 5;Feature 6;Feature 7'
    }];

    csvWriter.writeRecords(records)
      .then(() => {
        res.download(path.join(__dirname, '../../uploads', filename), filename, (err) => {
          if (err) {
            console.error('Error downloading template:', err);
            res.status(500).json({ error: 'Failed to download template' });
          }
          // Clean up the file after download
          fs.unlink(path.join(__dirname, '../../uploads', filename), (err) => {
            if (err) console.error('Error deleting template file:', err);
          });
        });
      });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Import services
router.post('/:companyId/import', upload.single('file'), async (req, res) => {
  try {
    const { companyId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const errors = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          // Process each row
          for (const row of results) {
            try {
              // Basic validation
              if (!row.Name || !row.Description || !row.Category) {
                errors.push(`Row with name "${row.Name || 'unknown'}" is missing required fields`);
                continue;
              }

              // Prepare tiers
              let tiers = [];
              
              // Basic tier
              if (row['Basic Price']) {
                const basicFeatures = row['Basic Features (semicolon separated)'] ? 
                  row['Basic Features (semicolon separated)'].split(';').map(f => f.trim()) : [];
                
                tiers.push({
                  type: 'BASIC',
                  price: parseFloat(row['Basic Price']),
                  features: basicFeatures,
                  description: 'Basic tier'
                });
              }

              // Standard tier
              if (row['Standard Price']) {
                const standardFeatures = row['Standard Features (semicolon separated)'] ? 
                  row['Standard Features (semicolon separated)'].split(';').map(f => f.trim()) : [];
                
                tiers.push({
                  type: 'STANDARD',
                  price: parseFloat(row['Standard Price']),
                  features: standardFeatures,
                  description: 'Standard tier'
                });
              }

              // Premium tier
              if (row['Premium Price']) {
                const premiumFeatures = row['Premium Features (semicolon separated)'] ? 
                  row['Premium Features (semicolon separated)'].split(';').map(f => f.trim()) : [];
                
                tiers.push({
                  type: 'PREMIUM',
                  price: parseFloat(row['Premium Price']),
                  features: premiumFeatures,
                  description: 'Premium tier'
                });
              }

              // Create the service
              await prisma.product.create({
                data: {
                  name: row.Name,
                  description: row.Description,
                  category: row.Category,
                  status: row.Status || 'Active',
                  type: 'SERVICE',
                  companyId,
                  tiers: {
                    create: tiers
                  }
                }
              });
            } catch (rowError) {
              console.error('Error processing row:', rowError);
              errors.push(`Error processing row with name "${row.Name || 'unknown'}": ${rowError.message}`);
            }
          }

          // Create activity record
          await prisma.activity.create({
            data: {
              type: 'added',
              entityType: 'product',
              description: `Imported ${results.length - errors.length} services`,
              user: req.user.id,
              time: new Date(),
              companyId
            }
          });

          // Clean up the uploaded file
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting uploaded file:', err);
          });

          res.json({
            success: true,
            imported: results.length - errors.length,
            errors: errors.length > 0 ? errors : undefined
          });
        } catch (error) {
          console.error('Error processing import:', error);
          res.status(500).json({ error: 'Failed to process import' });
        }
      });
  } catch (error) {
    console.error('Error importing services:', error);
    res.status(500).json({ error: 'Failed to import services' });
  }
});

// Export services as PDF
router.get('/:companyId/export/pdf', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Get services
    const services = await prisma.product.findMany({
      where: { 
        companyId,
        type: 'SERVICE'
      },
      include: {
        tiers: true
      },
      orderBy: { name: 'asc' }
    });

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=services.pdf');
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(20).text('Services List', { align: 'center' });
    doc.moveDown();
    
    // Add services
    services.forEach((service, index) => {
      doc.fontSize(14).text(service.name);
      doc.fontSize(10).text(`Category: ${service.category}`);
      doc.fontSize(10).text(`Description: ${service.description}`);
      
      // Add tiers
      if (service.tiers.length > 0) {
        doc.moveDown();
        doc.fontSize(12).text('Pricing Tiers:');
        
        service.tiers.forEach(tier => {
          doc.fontSize(10).text(`${tier.type}: €${tier.price.toFixed(2)}`);
          
          if (tier.features && tier.features.length > 0) {
            doc.fontSize(10).text('Features:');
            tier.features.forEach(feature => {
              doc.fontSize(9).text(`• ${feature}`, { indent: 10 });
            });
          }
        });
      }
      
      // Add separator between services
      if (index < services.length - 1) {
        doc.moveDown();
        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
      }
    });
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error exporting services as PDF:', error);
    res.status(500).json({ error: 'Failed to export services as PDF' });
  }
});

// Export services as Excel
router.get('/:companyId/export/excel', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Get services
    const services = await prisma.product.findMany({
      where: { 
        companyId,
        type: 'SERVICE'
      },
      include: {
        tiers: true
      },
      orderBy: { name: 'asc' }
    });

    // Prepare CSV data
    const filename = 'services.csv';
    const filepath = path.join(__dirname, '../../uploads', filename);
    
    // Define headers
    const headers = [
      { id: 'name', title: 'Name' },
      { id: 'description', title: 'Description' },
      { id: 'category', title: 'Category' },
      { id: 'status', title: 'Status' },
      { id: 'basicPrice', title: 'Basic Price' },
      { id: 'standardPrice', title: 'Standard Price' },
      { id: 'premiumPrice', title: 'Premium Price' },
      { id: 'basicFeatures', title: 'Basic Features' },
      { id: 'standardFeatures', title: 'Standard Features' },
      { id: 'premiumFeatures', title: 'Premium Features' }
    ];
    
    // Create CSV writer
    const csvWriter = createCsvWriter({
      path: filepath,
      header: headers
    });
    
    // Prepare records
    const records = services.map(service => {
      const record = {
        name: service.name,
        description: service.description,
        category: service.category
      };
      
      // Add tier data
      service.tiers.forEach(tier => {
        if (tier.type === 'BASIC') {
          record.basicPrice = tier.price.toFixed(2);
          record.basicFeatures = tier.features.join('; ');
        } else if (tier.type === 'STANDARD') {
          record.standardPrice = tier.price.toFixed(2);
          record.standardFeatures = tier.features.join('; ');
        } else if (tier.type === 'PREMIUM') {
          record.premiumPrice = tier.price.toFixed(2);
          record.premiumFeatures = tier.features.join('; ');
        }
      });
      
      return record;
    });
    
    // Write CSV
    await csvWriter.writeRecords(records);
    
    // Send file
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Error downloading CSV:', err);
        res.status(500).json({ error: 'Failed to download CSV' });
      }
      
      // Clean up the file after download
      fs.unlink(filepath, (err) => {
        if (err) console.error('Error deleting CSV file:', err);
      });
    });
  } catch (error) {
    console.error('Error exporting services as Excel:', error);
    res.status(500).json({ error: 'Failed to export services as Excel' });
  }
});

module.exports = router;
