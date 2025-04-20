const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const formService = require('../../services/engage/forms');

// Public endpoint to get form by slug
router.get('/public/:slug', async (req, res) => {
  try {
    const form = await formService.getFormBySlug(req.params.slug);
    res.json(form);
  } catch (error) {
    console.error('Error fetching form by slug:', error);
    if (error.message === 'Form not found') {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Get all forms for a company
router.get('/', auth, async (req, res) => {
  try {
    const forms = await formService.getAllForms(req.user.companyId);
    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Get a single form by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const form = await formService.getFormById(req.params.id, req.user.companyId);
    res.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    if (error.message === 'Form not found') {
      return res.status(404).json({ error: 'Form not found' });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Create a new form
router.post('/', auth, async (req, res) => {
  try {
    const form = await formService.createForm(req.body, req.user.companyId);
    res.status(201).json(form);
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// Update a form
router.put('/:id', auth, async (req, res) => {
  try {
    const form = await formService.updateForm(req.params.id, req.body, req.user.companyId);
    res.json(form);
  } catch (error) {
    console.error('Error updating form:', error);
    if (error.message === 'Form not found') {
      return res.status(404).json({ error: 'Form not found' });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.status(500).json({ error: 'Failed to update form' });
  }
});

// Delete a form
router.delete('/:id', auth, async (req, res) => {
  try {
    await formService.deleteForm(req.params.id, req.user.companyId);
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    if (error.message === 'Form not found') {
      return res.status(404).json({ error: 'Form not found' });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

// Submit a form (public endpoint)
router.post('/submit/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const formData = req.body;
    
    // Get metadata
    const metadata = {
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      referrer: req.headers.referer || req.headers.referrer || 'Direct',
      submittedAt: new Date()
    };
    
    const result = await formService.submitForm(slug, formData, metadata);
    
    res.status(201).json({ 
      message: 'Form submitted successfully',
      submissionId: result.submissionId
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    if (error.message === 'Form not found') {
      return res.status(404).json({ error: 'Form not found' });
    }
    if (error.message === 'Form is not active') {
      return res.status(403).json({ error: 'Form is not active' });
    }
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

module.exports = router;
