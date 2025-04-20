const express = require('express');
const router = express.Router();
const formService = require('../../services/engage/forms');
const surveyService = require('../../services/engage/surveys');

// Public endpoint to get form by slug
router.get('/forms/:slug', async (req, res) => {
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

// Public endpoint to get survey by slug
router.get('/surveys/:slug', async (req, res) => {
  try {
    const survey = await surveyService.getSurveyBySlug(req.params.slug);
    res.json(survey);
  } catch (error) {
    console.error('Error fetching survey by slug:', error);
    if (error.message === 'Survey not found') {
      return res.status(404).json({ error: 'Survey not found' });
    }
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
});

// Submit a form (public endpoint)
router.post('/forms/submit/:slug', async (req, res) => {
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
});

// Submit a survey response (public endpoint)
router.post('/surveys/submit/:slug', async (req, res) => {
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
});

module.exports = router;
