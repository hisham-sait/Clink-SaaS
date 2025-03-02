const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');

// Get all forms for a company
router.get('/:companyId', auth, async (req, res) => {
  try {
    const forms = await prisma.form.findMany({
      where: {
        companyId: req.params.companyId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Create a new form
router.post('/:companyId', auth, async (req, res) => {
  try {
    // Convert fields and styling to proper JSON
    const formData = {
      ...req.body,
      companyId: req.params.companyId,
      fields: JSON.parse(JSON.stringify(req.body.fields || [])),
      styling: JSON.parse(JSON.stringify(req.body.styling || {
        theme: 'light',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        borderRadius: '4px',
        buttonStyle: {
          backgroundColor: '#007bff',
          textColor: '#ffffff',
          borderRadius: '4px',
          padding: '10px 20px'
        },
        spacing: '20px',
        containerPadding: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }))
    };

    const form = await prisma.form.create({
      data: formData
    });
    res.json(form);
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Failed to create form. Details: ' + error.message });
  }
});

// Update a form
router.put('/:companyId/:formId', auth, async (req, res) => {
  try {
    // Convert fields and styling to proper JSON
    const formData = {
      ...req.body,
      fields: JSON.parse(JSON.stringify(req.body.fields || [])),
      styling: JSON.parse(JSON.stringify(req.body.styling || {
        theme: 'light',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        borderRadius: '4px',
        buttonStyle: {
          backgroundColor: '#007bff',
          textColor: '#ffffff',
          borderRadius: '4px',
          padding: '10px 20px'
        },
        spacing: '20px',
        containerPadding: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }))
    };

    const form = await prisma.form.update({
      where: {
        id: req.params.formId,
        companyId: req.params.companyId
      },
      data: formData
    });
    res.json(form);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: 'Failed to update form. Details: ' + error.message });
  }
});

// Update form status
router.patch('/:companyId/:formId', auth, async (req, res) => {
  try {
    const form = await prisma.form.update({
      where: {
        id: req.params.formId,
        companyId: req.params.companyId
      },
      data: {
        active: req.body.active
      }
    });
    res.json(form);
  } catch (error) {
    console.error('Error updating form status:', error);
    res.status(500).json({ error: 'Failed to update form status' });
  }
});

// Delete a form
router.delete('/:companyId/:formId', auth, async (req, res) => {
  try {
    await prisma.form.delete({
      where: {
        id: req.params.formId,
        companyId: req.params.companyId
      }
    });
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

// Get form for embedding
router.get('/embed/:formId', async (req, res) => {
  try {
    const form = await prisma.form.findUnique({
      where: {
        id: req.params.formId
      },
      select: {
        id: true,
        name: true,
        fields: true,
        successMessage: true,
        redirectUrl: true,
        active: true,
        styling: true,
        createOrganisation: true
      }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (!form.active) {
      return res.status(403).json({ error: 'Form is not active' });
    }

    res.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Submit form data
router.post('/submit/:formId', async (req, res) => {
  try {
    const form = await prisma.form.findUnique({
      where: {
        id: req.params.formId
      },
      include: {
        company: true
      }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (!form.active) {
      return res.status(403).json({ error: 'Form is not active' });
    }

    // Map form fields to contact and organisation data
    const contactData = {
      type: ['Lead'],
      source: 'Form',
      status: 'Active',
      lastContact: new Date(),
      companyId: form.companyId,
      formData: req.body // Store all form data
    };

    const organisationData = form.createOrganisation ? {
      type: ['Lead'],
      status: 'Active',
      lastContact: new Date(),
      companyId: form.companyId
    } : null;

    // Map form fields based on field mappings
    form.fields.forEach(field => {
      if (field.mapping) {
        const value = req.body[field.label];
        if (value) {
          if (field.mapping.entity === 'contact') {
            contactData[field.mapping.field] = value;
          } else if (field.mapping.entity === 'organisation' && organisationData) {
            organisationData[field.mapping.field] = value;
          }
        }
      }
    });

    // Set defaults for required fields if not mapped
    if (!contactData.firstName) contactData.firstName = '';
    if (!contactData.lastName) contactData.lastName = '';
    if (!contactData.email) contactData.email = '';
    if (!contactData.phone) contactData.phone = '';
    if (!contactData.position) contactData.position = '';
    if (!contactData.title) contactData.title = '';

    // Create organisation if enabled and fields are mapped
    let organisation = null;
    if (organisationData && Object.keys(organisationData).length > 4) { // More than just the default fields
      organisation = await prisma.organisation.create({
        data: organisationData
      });
    }

    // Create contact and link to organisation if created
    const contact = await prisma.contact.create({
      data: {
        ...contactData,
        ...(organisation && { organisationId: organisation.id })
      }
    });

    res.json({ 
      message: 'Form submitted successfully',
      contact: { id: contact.id },
      ...(organisation && { organisation: { id: organisation.id } })
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

module.exports = router;
