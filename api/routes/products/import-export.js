const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/products/imports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `import-${uniqueSuffix}${ext}`);
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

// Export products to CSV
router.get('/:companyId/export', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { format = 'csv', categoryId, familyId } = req.query;
    
    // Build filter conditions
    const where = { companyId };
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (familyId) {
      where.familyId = familyId;
    }
    
    // Get products with related data
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        family: true,
        attributeValues: {
          include: {
            attribute: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    if (format === 'pdf') {
      // Generate PDF
      const doc = new PDFDocument({ margin: 50 });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=products-export-${Date.now()}.pdf`);
      
      // Pipe the PDF to the response
      doc.pipe(res);
      
      // Add content to the PDF
      doc.fontSize(20).text('Products Export', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Total Products: ${products.length}`, { align: 'center' });
      doc.moveDown();
      
      // Add products to the PDF
      products.forEach((product, index) => {
        doc.fontSize(16).text(`${index + 1}. ${product.name}`);
        doc.fontSize(12).text(`SKU: ${product.sku || 'N/A'}`);
        doc.fontSize(12).text(`Type: ${product.type}`);
        doc.fontSize(12).text(`Category: ${product.category ? product.category.name : 'N/A'}`);
        doc.fontSize(12).text(`Family: ${product.family ? product.family.name : 'N/A'}`);
        doc.fontSize(12).text(`Status: ${product.status}`);
        
        // Add attributes
        if (product.attributeValues.length > 0) {
          doc.moveDown();
          doc.fontSize(14).text('Attributes:');
          
          product.attributeValues.forEach(av => {
            let valueText = '';
            
            try {
              if (typeof av.value === 'object') {
                valueText = JSON.stringify(av.value);
              } else {
                valueText = String(av.value);
              }
            } catch (e) {
              valueText = 'Complex Value';
            }
            
            doc.fontSize(12).text(`${av.attribute.name}: ${valueText}`);
          });
        }
        
        doc.moveDown();
        
        // Add a separator between products (except for the last one)
        if (index < products.length - 1) {
          doc.moveTo(50, doc.y)
             .lineTo(doc.page.width - 50, doc.y)
             .stroke();
          doc.moveDown();
        }
        
        // Add a new page if needed
        if (doc.y > doc.page.height - 150 && index < products.length - 1) {
          doc.addPage();
        }
      });
      
      // Finalize the PDF
      doc.end();
    } else {
      // Default to CSV export
      const exportDir = path.join(__dirname, '../../uploads/products/exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }
      
      const timestamp = Date.now();
      const filePath = path.join(exportDir, `products-export-${timestamp}.csv`);
      
      // Prepare data for CSV
      const records = products.map(product => {
        // Create a base record with standard fields
        const record = {
          id: product.id,
          name: product.name,
          sku: product.sku || '',
          type: product.type,
          status: product.status,
          category: product.category ? product.category.name : '',
          family: product.family ? product.family.name : '',
          description: product.description || ''
        };
        
        // Add attribute values
        product.attributeValues.forEach(av => {
          let valueText = '';
          
          try {
            if (typeof av.value === 'object') {
              valueText = JSON.stringify(av.value);
            } else {
              valueText = String(av.value);
            }
          } catch (e) {
            valueText = 'Complex Value';
          }
          
          // Use attribute code as column name
          record[`attr_${av.attribute.code}`] = valueText;
        });
        
        return record;
      });
      
      // Get all unique attribute codes for headers
      const attributeCodes = new Set();
      products.forEach(product => {
        product.attributeValues.forEach(av => {
          attributeCodes.add(`attr_${av.attribute.code}`);
        });
      });
      
      // Create CSV writer with dynamic headers
      const csvWriter = createCsvWriter({
        path: filePath,
        header: [
          { id: 'id', title: 'ID' },
          { id: 'name', title: 'Name' },
          { id: 'sku', title: 'SKU' },
          { id: 'type', title: 'Type' },
          { id: 'status', title: 'Status' },
          { id: 'category', title: 'Category' },
          { id: 'family', title: 'Family' },
          { id: 'description', title: 'Description' },
          // Add attribute columns
          ...Array.from(attributeCodes).map(code => ({
            id: code,
            title: code.replace('attr_', '')
          }))
        ]
      });
      
      // Write CSV file
      await csvWriter.writeRecords(records);
      
      // Send file to client
      res.download(filePath, `products-export-${timestamp}.csv`, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        
        // Delete the file after sending
        fs.unlinkSync(filePath);
      });
    }
  } catch (error) {
    console.error('Error exporting products:', error);
    res.status(500).json({ error: 'Failed to export products', details: error.message });
  }
});

// Import products from CSV
router.post('/:companyId/import', upload.single('file'), async (req, res) => {
  try {
    const { companyId } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Parse CSV file
    const results = [];
    const errors = [];
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    
    // Create a readable stream from the CSV file
    const stream = fs.createReadStream(file.path)
      .pipe(csv())
      .on('data', async (data) => {
        results.push(data);
      })
      .on('end', async () => {
        // Process each row
        for (const row of results) {
          processedCount++;
          
          try {
            // Extract standard fields
            const {
              name,
              sku,
              type,
              status,
              description,
              category,
              family,
              ...attributeFields
            } = row;
            
            // Validate required fields
            if (!name) {
              throw new Error('Name is required');
            }
            
            // Find or create category if provided
            let categoryId = null;
            if (category) {
              const existingCategory = await prisma.productCategory.findFirst({
                where: {
                  companyId,
                  name: category
                }
              });
              
              if (existingCategory) {
                categoryId = existingCategory.id;
              } else {
                // Create a new category
                const newCategory = await prisma.productCategory.create({
                  data: {
                    name: category,
                    code: category.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                    level: 1,
                    companyId
                  }
                });
                
                categoryId = newCategory.id;
              }
            }
            
            // Find family if provided
            let familyId = null;
            if (family) {
              const existingFamily = await prisma.productFamily.findFirst({
                where: {
                  companyId,
                  name: family
                }
              });
              
              if (existingFamily) {
                familyId = existingFamily.id;
              }
            }
            
            // Prepare attribute values
            const attributeValues = [];
            
            // Process attribute fields (columns starting with 'attr_')
            for (const [key, value] of Object.entries(attributeFields)) {
              if (key.startsWith('attr_')) {
                const attributeCode = key.replace('attr_', '');
                
                // Find attribute by code
                const attribute = await prisma.productAttribute.findFirst({
                  where: {
                    companyId,
                    code: attributeCode
                  }
                });
                
                if (attribute && value) {
                  // Parse value based on attribute type
                  let parsedValue;
                  
                  switch (attribute.type) {
                    case 'NUMBER':
                      parsedValue = parseFloat(value);
                      break;
                    case 'BOOLEAN':
                      parsedValue = value.toLowerCase() === 'true' || value === '1';
                      break;
                    case 'SELECT':
                    case 'MULTISELECT':
                      try {
                        parsedValue = JSON.parse(value);
                      } catch (e) {
                        parsedValue = value;
                      }
                      break;
                    default:
                      parsedValue = value;
                  }
                  
                  attributeValues.push({
                    attributeId: attribute.id,
                    value: parsedValue
                  });
                }
              }
            }
            
            // Check if product with this SKU already exists
            let product;
            
            if (sku) {
              product = await prisma.product.findFirst({
                where: {
                  companyId,
                  sku
                }
              });
            }
            
            if (product) {
              // Update existing product
              await prisma.$transaction(async (prisma) => {
                // Update basic product data
                await prisma.product.update({
                  where: { id: product.id },
                  data: {
                    name,
                    description,
                    type: type || product.type,
                    status: status || product.status,
                    categoryId,
                    familyId
                  }
                });
                
                // Delete existing attribute values
                await prisma.productAttributeValue.deleteMany({
                  where: { productId: product.id }
                });
                
                // Create new attribute values
                for (const av of attributeValues) {
                  await prisma.productAttributeValue.create({
                    data: {
                      ...av,
                      productId: product.id
                    }
                  });
                }
              });
            } else {
              // Create new product
              await prisma.product.create({
                data: {
                  name,
                  sku,
                  description,
                  type: type || 'PHYSICAL',
                  status: status || 'Active',
                  categoryId,
                  familyId,
                  companyId,
                  attributeValues: {
                    create: attributeValues
                  }
                }
              });
            }
            
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({
              row: processedCount,
              error: error.message
            });
          }
        }
        
        // Return import results
        res.json({
          success: true,
          processed: processedCount,
          succeeded: successCount,
          failed: errorCount,
          errors
        });
        
        // Delete the uploaded file
        fs.unlinkSync(file.path);
      });
  } catch (error) {
    console.error('Error importing products:', error);
    
    // Delete the uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to import products', details: error.message });
  }
});

// Get import template
router.get('/:companyId/import-template', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Get all attributes for the company
    const attributes = await prisma.productAttribute.findMany({
      where: { companyId },
      orderBy: { name: 'asc' }
    });
    
    // Create export directory if it doesn't exist
    const exportDir = path.join(__dirname, '../../uploads/products/exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    const timestamp = Date.now();
    const filePath = path.join(exportDir, `import-template-${timestamp}.csv`);
    
    // Create CSV writer with headers
    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'sku', title: 'SKU' },
        { id: 'type', title: 'Type' },
        { id: 'status', title: 'Status' },
        { id: 'category', title: 'Category' },
        { id: 'family', title: 'Family' },
        { id: 'description', title: 'Description' },
        // Add attribute columns
        ...attributes.map(attr => ({
          id: `attr_${attr.code}`,
          title: `attr_${attr.code}`
        }))
      ]
    });
    
    // Create a sample record
    const sampleRecord = {
      name: 'Sample Product',
      sku: 'SAMPLE-001',
      type: 'PHYSICAL',
      status: 'Active',
      category: 'Sample Category',
      family: 'Sample Family',
      description: 'This is a sample product description.'
    };
    
    // Add sample attribute values
    attributes.forEach(attr => {
      let sampleValue = '';
      
      switch (attr.type) {
        case 'TEXT':
          sampleValue = 'Sample text';
          break;
        case 'NUMBER':
          sampleValue = '123.45';
          break;
        case 'BOOLEAN':
          sampleValue = 'true';
          break;
        case 'SELECT':
          sampleValue = 'Option 1';
          break;
        case 'MULTISELECT':
          sampleValue = '["Option 1", "Option 2"]';
          break;
        case 'DATE':
          sampleValue = '2025-01-01';
          break;
        default:
          sampleValue = 'Sample value';
      }
      
      sampleRecord[`attr_${attr.code}`] = sampleValue;
    });
    
    // Write CSV file with sample record
    await csvWriter.writeRecords([sampleRecord]);
    
    // Send file to client
    res.download(filePath, `import-template-${timestamp}.csv`, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      
      // Delete the file after sending
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error('Error generating import template:', error);
    res.status(500).json({ error: 'Failed to generate import template', details: error.message });
  }
});

module.exports = router;
