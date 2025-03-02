const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');

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
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `file-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // Default 10MB
  },
  fileFilter: (req, file, cb) => {
    // Force CSV mimetype for .csv files
    if (file.originalname.toLowerCase().endsWith('.csv')) {
      file.mimetype = 'text/csv';
    }
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV files are allowed.'));
    }
  }
});

// Get all contacts for a company
router.get('/:companyId', auth, async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status } = req.query;

    const where = {
      companyId,
      ...(status && status !== 'All' ? { status } : {})
    };

    const contacts = await prisma.contact.findMany({ where });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Create a new contact
router.post('/:companyId', auth, async (req, res) => {
  try {
    const { companyId } = req.params;
    const { notes, ...contactData } = req.body;
    const data = {
      ...contactData,
      companyId
    };
    
    // Only include notes if it's not empty
    if (notes) {
      data.notes = notes;
    }
    
    const contact = await prisma.contact.create({ data });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'added',
        entityType: 'contact',
        entityId: contact.id,
        description: `Added new contact: ${contact.firstName} ${contact.lastName}`,
        user: req.user.email,
        companyId,
        time: new Date()
      }
    });

    res.json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    console.error('Request body:', req.body);
    res.status(500).json({ 
      error: 'Failed to create contact',
      details: error.message,
      body: req.body 
    });
  }
});

// Update a contact
router.put('/:companyId/:id', auth, async (req, res) => {
  try {
    const { companyId, id } = req.params;
    // First verify the contact belongs to the company
    const existingContact = await prisma.contact.findFirst({
      where: {
        id,
        companyId
      }
    });

    if (!existingContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const { notes, ...contactData } = req.body;
    const data = {
      ...contactData
    };
    
    // Only include notes if it's not empty
    if (notes) {
      data.notes = notes;
    }
    
    const contact = await prisma.contact.update({
      where: { id },
      data
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'updated',
        entityType: 'contact',
        entityId: contact.id,
        description: `Updated contact: ${contact.firstName} ${contact.lastName}`,
        user: req.user.email,
        companyId,
        time: new Date()
      }
    });

    res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete a contact
router.delete('/:companyId/:id', auth, async (req, res) => {
  try {
    const { companyId, id } = req.params;
    // First verify the contact belongs to the company
    const existingContact = await prisma.contact.findFirst({
      where: {
        id,
        companyId
      }
    });

    if (!existingContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Log activity first
    await prisma.activity.create({
      data: {
        type: 'removed',
        entityType: 'contact',
        entityId: id,
        description: `Deleted contact: ${existingContact.firstName} ${existingContact.lastName}`,
        user: req.user.email,
        companyId,
        time: new Date()
      }
    });

    // Then delete the contact
    await prisma.contact.delete({
      where: { id }
    });

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Export contacts
router.get('/:companyId/export/:type', auth, async (req, res) => {
  try {
    const { companyId } = req.params;
    const { type } = req.params;
    const contacts = await prisma.contact.findMany({
      where: { companyId }
    });

    // TODO: Implement export logic based on type (pdf/excel)
    res.json(contacts);
  } catch (error) {
    console.error('Error exporting contacts:', error);
    res.status(500).json({ error: 'Failed to export contacts' });
  }
});

// Import contacts template
router.get('/import/template', (req, res) => {
  const headers = [
    'Title',
    'First Name*',
    'Last Name*',
    'Email*',
    'Phone*',
    'Mobile',
    'Department',
    'Position*',
    'Type',
    'Source',
    'Status',
    'Last Contact*',
    'Next Follow Up',
    'Mailing Address',
    'Other Address',
    'Timezone',
    'Preferred Time',
    'Tags',
    'Notes'
  ];

  // Create CSV content with headers
  const csvContent = headers.join(',') + '\n';

  // Set response headers for CSV download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=contacts-import-template.csv');
  
  res.send(csvContent);
});

// Import contacts
router.post('/:companyId/import', auth, upload.single('file'), async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const csvContent = fs.readFileSync(req.file.path, 'utf8');
    const rows = csvContent.split('\n');
    const headers = rows[0].split(',').map(h => h.trim());

    const contacts = [];
    const errors = [];

    // Process each row starting from index 1 (skip headers)
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue; // Skip empty rows
      
      const values = rows[i].split(',').map(v => v.trim());
      const contact = {};
      
      // Map CSV columns to contact fields
      headers.forEach((header, index) => {
        const value = values[index];
        switch(header) {
          case 'Title':
            contact.title = value;
            break;
          case 'First Name*':
            contact.firstName = value;
            break;
          case 'Last Name*':
            contact.lastName = value;
            break;
          case 'Email*':
            contact.email = value;
            break;
          case 'Phone*':
            contact.phone = value;
            break;
          case 'Mobile':
            contact.mobile = value;
            break;
          case 'Department':
            contact.department = value;
            break;
          case 'Position*':
            contact.position = value;
            break;
          case 'Type':
            contact.type = value ? value.split(';').map(t => t.trim()) : [];
            break;
          case 'Source':
            contact.source = value;
            break;
          case 'Status':
            contact.status = value || 'Active';
            break;
          case 'Last Contact*':
            contact.lastContact = value;
            break;
          case 'Next Follow Up':
            contact.nextFollowUp = value;
            break;
          case 'Mailing Address':
            contact.mailingAddress = value;
            break;
          case 'Other Address':
            contact.otherAddress = value;
            break;
          case 'Timezone':
            contact.timezone = value || 'UTC';
            break;
          case 'Preferred Time':
            contact.preferredTime = value;
            break;
          case 'Tags':
            contact.tags = value ? value.split(';').map(t => t.trim()) : [];
            break;
          case 'Notes':
            contact.notes = value;
            break;
        }
      });

      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'position', 'lastContact'];
      const missingFields = requiredFields.filter(field => !contact[field]);
      
      if (missingFields.length > 0) {
        errors.push(`Row ${i + 1}: Missing required fields: ${missingFields.join(', ')}`);
        continue;
      }

      const contactData = {
        ...contact,
        companyId
      };
      
      // Only include notes if it's not empty
      if (contact.notes) {
        contactData.notes = contact.notes;
      }
      
      contacts.push(contactData);
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation errors in CSV file', 
        details: errors 
      });
    }

    // Create all contacts in a transaction
    await prisma.$transaction(async (tx) => {
      for (const contact of contacts) {
        const createdContact = await tx.contact.create({
          data: contact
        });

        // Log activity for each created contact
        await tx.activity.create({
          data: {
            type: 'added',
            entityType: 'contact',
            entityId: createdContact.id,
            description: `Imported contact: ${createdContact.firstName} ${createdContact.lastName}`,
            user: req.user.email,
            companyId,
            time: new Date()
          }
        });
      }
    });

    res.json({ 
      message: 'Import successful',
      count: contacts.length
    });
  } catch (error) {
    console.error('Error importing contacts:', error);
    res.status(500).json({ error: 'Failed to import contacts' });
  }
});

module.exports = router;
