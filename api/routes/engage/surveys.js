const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const surveyService = require('../../services/engage/surveys');

// Public endpoint to get survey by slug
router.get('/public/:slug', async (req, res) => {
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

// Get all surveys for a company
router.get('/', auth, async (req, res) => {
  try {
    const surveys = await surveyService.getAllSurveys(req.user.companyId);
    res.json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
});

// Get a single survey by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const survey = await surveyService.getSurveyById(req.params.id, req.user.companyId);
    res.json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    if (error.message === 'Survey not found') {
      return res.status(404).json({ error: 'Survey not found' });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
});

// Create a new survey
router.post('/', auth, async (req, res) => {
  try {
    const survey = await surveyService.createSurvey(req.body, req.user.companyId);
    res.status(201).json(survey);
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ error: 'Failed to create survey' });
  }
});

// Update a survey
router.put('/:id', auth, async (req, res) => {
  try {
    const survey = await surveyService.updateSurvey(req.params.id, req.body, req.user.companyId);
    res.json(survey);
  } catch (error) {
    console.error('Error updating survey:', error);
    if (error.message === 'Survey not found') {
      return res.status(404).json({ error: 'Survey not found' });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.status(500).json({ error: 'Failed to update survey' });
  }
});

// Delete a survey
router.delete('/:id', auth, async (req, res) => {
  try {
    await surveyService.deleteSurvey(req.params.id, req.user.companyId);
    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    console.error('Error deleting survey:', error);
    if (error.message === 'Survey not found') {
      return res.status(404).json({ error: 'Survey not found' });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.status(500).json({ error: 'Failed to delete survey' });
  }
});

// Submit a survey response (public endpoint)
router.post('/submit/:slug', async (req, res) => {
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
    
    res.status(201).json({ 
      message: 'Survey submitted successfully',
      responseId: result.responseId
    });
  } catch (error) {
    console.error('Error submitting survey response:', error);
    if (error.message === 'Survey not found') {
      return res.status(404).json({ error: 'Survey not found' });
    }
    if (error.message === 'Survey is not active') {
      return res.status(403).json({ error: 'Survey is not active' });
    }
    res.status(500).json({ error: 'Failed to submit survey response' });
  }
});

module.exports = router;
