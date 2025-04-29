const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const formService = require('../../services/engage/forms');
const { successResponse, errorResponse, ErrorTypes, asyncHandler } = require('../../utils/responseUtils');

// Public endpoint to get form by slug
router.get('/public/:slug', asyncHandler(async (req, res) => {
  try {
    const form = await formService.getFormBySlug(req.params.slug);
    res.json(successResponse(form));
  } catch (error) {
    console.error('Error fetching form by slug:', error);
    if (error.message === 'Form not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Form');
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to fetch form');
    res.status(statusCode).json(body);
  }
}));

// Get all forms for a company
router.get('/', auth, asyncHandler(async (req, res) => {
  const forms = await formService.getAllForms(req.user.companyId);
  res.json(successResponse(forms));
}));

// Get a single form by ID
router.get('/:id', auth, asyncHandler(async (req, res) => {
  try {
    const form = await formService.getFormById(req.params.id, req.user.companyId);
    res.json(successResponse(form));
  } catch (error) {
    console.error('Error fetching form:', error);
    if (error.message === 'Form not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Form');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to fetch form');
    res.status(statusCode).json(body);
  }
}));

// Get form submissions
router.get('/:id/submissions', auth, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if form exists and user has access
    const form = await formService.getFormById(id, req.user.companyId);
    
    // Get submissions
    const submissions = await formService.getFormSubmissions(id, req.user.companyId);
    
    res.json(successResponse({
      submissions
    }));
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    if (error.message === 'Form not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Form');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to fetch form submissions');
    res.status(statusCode).json(body);
  }
}));

// Create a new form
router.post('/', auth, asyncHandler(async (req, res) => {
  const form = await formService.createForm(req.body, req.user.companyId);
  res.status(201).json(successResponse(form, 'Form created successfully'));
}));

// Update form settings
router.patch('/:id/settings', auth, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { settings } = req.body;
    
    // Check if form exists and user has access
    const form = await formService.getFormById(id, req.user.companyId);
    
    // Update settings
    const updatedForm = await formService.updateForm(id, {
      settings: {
        ...form.settings,
        ...settings
      }
    }, req.user.companyId);
    
    res.json(successResponse(updatedForm, 'Form settings updated successfully'));
  } catch (error) {
    console.error('Error updating form settings:', error);
    if (error.message === 'Form not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Form');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to update form settings');
    res.status(statusCode).json(body);
  }
}));

// Update a form
router.put('/:id', auth, asyncHandler(async (req, res) => {
  try {
    const form = await formService.updateForm(req.params.id, req.body, req.user.companyId);
    res.json(successResponse(form, 'Form updated successfully'));
  } catch (error) {
    console.error('Error updating form:', error);
    if (error.message === 'Form not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Form');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to update form');
    res.status(statusCode).json(body);
  }
}));

// Delete a form
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  try {
    await formService.deleteForm(req.params.id, req.user.companyId);
    res.json(successResponse(null, 'Form deleted successfully'));
  } catch (error) {
    console.error('Error deleting form:', error);
    if (error.message === 'Form not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Form');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to delete form');
    res.status(statusCode).json(body);
  }
}));

// Submit a form (public endpoint)
router.post('/submit/:slug', asyncHandler(async (req, res) => {
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
    
    res.status(201).json(successResponse({ 
      submissionId: result.submissionId
    }, 'Form submitted successfully'));
  } catch (error) {
    console.error('Error submitting form:', error);
    if (error.message === 'Form not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Form');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Form is not active') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN('Form is not active');
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to submit form');
    res.status(statusCode).json(body);
  }
}));

module.exports = router;
