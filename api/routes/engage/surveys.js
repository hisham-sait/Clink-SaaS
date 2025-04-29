const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const surveyService = require('../../services/engage/surveys');
const { successResponse, errorResponse, ErrorTypes, asyncHandler } = require('../../utils/responseUtils');

// Public endpoint to get survey by slug
router.get('/public/:slug', asyncHandler(async (req, res) => {
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

// Get all surveys for a company
router.get('/', auth, asyncHandler(async (req, res) => {
  const surveys = await surveyService.getAllSurveys(req.user.companyId);
  res.json(successResponse(surveys));
}));

// Get a single survey by ID
router.get('/:id', auth, asyncHandler(async (req, res) => {
  try {
    const survey = await surveyService.getSurveyById(req.params.id, req.user.companyId);
    res.json(successResponse(survey));
  } catch (error) {
    console.error('Error fetching survey:', error);
    if (error.message === 'Survey not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Survey');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to fetch survey');
    res.status(statusCode).json(body);
  }
}));

// Get survey responses
router.get('/:id/responses', auth, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if survey exists and user has access
    const survey = await surveyService.getSurveyById(id, req.user.companyId);
    
    // Get responses
    const responses = await surveyService.getSurveyResponses(id, req.user.companyId);
    
    res.json(successResponse({
      responses
    }));
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    if (error.message === 'Survey not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Survey');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to fetch survey responses');
    res.status(statusCode).json(body);
  }
}));

// Create a new survey
router.post('/', auth, asyncHandler(async (req, res) => {
  const survey = await surveyService.createSurvey(req.body, req.user.companyId);
  res.status(201).json(successResponse(survey, 'Survey created successfully'));
}));

// Update survey settings
router.patch('/:id/settings', auth, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { settings } = req.body;
    
    // Check if survey exists and user has access
    const survey = await surveyService.getSurveyById(id, req.user.companyId);
    
    // Update settings
    const updatedSurvey = await surveyService.updateSurvey(id, {
      settings: {
        ...survey.settings,
        ...settings
      }
    }, req.user.companyId);
    
    res.json(successResponse(updatedSurvey, 'Survey settings updated successfully'));
  } catch (error) {
    console.error('Error updating survey settings:', error);
    if (error.message === 'Survey not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Survey');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to update survey settings');
    res.status(statusCode).json(body);
  }
}));

// Update a survey
router.put('/:id', auth, asyncHandler(async (req, res) => {
  try {
    const survey = await surveyService.updateSurvey(req.params.id, req.body, req.user.companyId);
    res.json(successResponse(survey, 'Survey updated successfully'));
  } catch (error) {
    console.error('Error updating survey:', error);
    if (error.message === 'Survey not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Survey');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to update survey');
    res.status(statusCode).json(body);
  }
}));

// Delete a survey
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  try {
    await surveyService.deleteSurvey(req.params.id, req.user.companyId);
    res.json(successResponse(null, 'Survey deleted successfully'));
  } catch (error) {
    console.error('Error deleting survey:', error);
    if (error.message === 'Survey not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Survey');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Access denied') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN();
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to delete survey');
    res.status(statusCode).json(body);
  }
}));

// Submit a survey response (public endpoint)
router.post('/submit/:slug', asyncHandler(async (req, res) => {
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
    
    res.status(201).json(successResponse({ 
      responseId: result.responseId
    }, 'Survey submitted successfully'));
  } catch (error) {
    console.error('Error submitting survey response:', error);
    if (error.message === 'Survey not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Survey');
      return res.status(statusCode).json(body);
    }
    if (error.message === 'Survey is not active') {
      const { statusCode, body } = ErrorTypes.FORBIDDEN('Survey is not active');
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to submit survey response');
    res.status(statusCode).json(body);
  }
}));

module.exports = router;
