const express = require('express');
const router = express.Router();
const formService = require('../../services/engage/forms');
const surveyService = require('../../services/engage/surveys');
const pageService = require('../../services/engage/pages');
const { successResponse, errorResponse, ErrorTypes, asyncHandler } = require('../../utils/responseUtils');

// Public endpoint to view a page by slug
router.get('/pages/:slug', asyncHandler(async (req, res) => {
  try {
    const page = await pageService.getPageBySlug(req.params.slug);
    
    // Check if page is active
    if (page.status !== 'Published') {
      return res.status(403).render('error', { 
        message: 'This page is currently not available',
        error: { status: 403, stack: '' }
      });
    }
    
    // Record the page view
    const metadata = {
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      referrer: req.headers.referer || req.headers.referrer || 'Direct',
      viewedAt: new Date()
    };
    
    await pageService.recordPageView(page.id, metadata);
    
    // Render the page
    res.render('page-view', { page });
  } catch (error) {
    console.error('Error viewing page:', error);
    if (error.message === 'Page not found') {
      return res.status(404).render('error', { 
        message: 'Page not found',
        error: { status: 404, stack: '' }
      });
    }
    res.status(500).render('error', { 
      message: 'Error loading page',
      error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
    });
  }
}));

// Public endpoint to get form by slug
router.get('/forms/:slug', asyncHandler(async (req, res) => {
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

// Public endpoint to get survey by slug
router.get('/surveys/:slug', asyncHandler(async (req, res) => {
  try {
    const survey = await surveyService.getSurveyBySlug(req.params.slug);
    res.json(successResponse(survey));
  } catch (error) {
    console.error('Error fetching survey by slug:', error);
    if (error.message === 'Survey not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Survey');
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to fetch survey');
    res.status(statusCode).json(body);
  }
}));

// Submit a form (public endpoint)
router.post('/forms/submit/:slug', asyncHandler(async (req, res) => {
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
    
    // Get the form to check if it has a redirect URL
    const form = await formService.getFormBySlug(slug);
    
    // If the form has a redirect URL, redirect to it
    if (form.settings && form.settings.redirectAfterSubmit && form.settings.redirectUrl) {
      return res.redirect(form.settings.redirectUrl);
    }
    
    // Otherwise, render a thank you page
    return res.render('form-success', { 
      message: 'Form submitted successfully',
      submissionId: result.submissionId,
      form
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    if (error.message === 'Form not found') {
      return res.status(404).render('error', { 
        message: 'Form not found',
        error: { status: 404, stack: '' }
      });
    }
    if (error.message === 'Form is not active') {
      return res.status(403).render('error', { 
        message: 'This form is currently not active',
        error: { status: 403, stack: '' }
      });
    }
    return res.status(500).render('error', { 
      message: 'Error submitting form',
      error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
    });
  }
}));

// Submit a survey response (public endpoint)
router.post('/surveys/submit/:slug', asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;
    const responseData = req.body;
    
    // Get metadata
    const metadata = {
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      referrer: req.headers.referer || req.headers.referrer || 'Direct',
      submittedAt: new Date()
    };
    
    const result = await surveyService.submitSurveyResponse(slug, responseData, metadata);
    
    // Get the survey to check if it has a redirect URL
    const survey = await surveyService.getSurveyBySlug(slug);
    
    // If the survey has a redirect URL, redirect to it
    if (survey.settings && survey.settings.redirectAfterSubmit && survey.settings.redirectUrl) {
      return res.redirect(survey.settings.redirectUrl);
    }
    
    // Otherwise, render a thank you page
    return res.render('survey-success', { 
      message: 'Survey submitted successfully',
      responseId: result.responseId,
      survey
    });
  } catch (error) {
    console.error('Error submitting survey response:', error);
    if (error.message === 'Survey not found') {
      return res.status(404).render('error', { 
        message: 'Survey not found',
        error: { status: 404, stack: '' }
      });
    }
    if (error.message === 'Survey is not active') {
      return res.status(403).render('error', { 
        message: 'This survey is currently not active',
        error: { status: 403, stack: '' }
      });
    }
    return res.status(500).render('error', { 
      message: 'Error submitting survey',
      error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
    });
  }
}));

module.exports = router;
