const express = require('express');
const router = express.Router();
const formService = require('../../services/engage/forms');
const surveyService = require('../../services/engage/surveys');
const { PrismaClient } = require('@prisma/client');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

const prisma = new PrismaClient();

// Root route
router.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Helper function to parse user agent
function parseUserAgent(userAgent) {
  if (!userAgent) return { browser: 'Unknown', device: 'Unknown' };
  
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    browser: result.browser.name || 'Unknown',
    device: result.device.type || (result.os.name === 'iOS' || result.os.name === 'Android' ? 'Mobile' : 'Desktop')
  };
}

// Helper function to get location from IP
function getLocationFromIp(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return 'Local';
  
  const geo = geoip.lookup(ip);
  if (!geo) return 'Unknown';
  
  return `${geo.city || ''}, ${geo.country || 'Unknown'}`.trim();
}

// Form resolver - /f/:slug
router.get('/f/:slug', async (req, res) => {
  console.log('Form resolver hit with slug:', req.params.slug);
  try {
    const { slug } = req.params;
    
    // Find the form by slug
    const form = await formService.getFormBySlug(slug);
    
    // Check if form is active
    if (form.status !== 'Active') {
      return res.status(403).render('error', { 
        message: 'This form is currently not active',
        error: { status: 403, stack: '' }
      });
    }
    
    // Get user agent and IP
    const userAgent = req.headers['user-agent'];
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const referrer = req.headers.referer || req.headers.referrer || 'Direct';
    
    // Parse user agent
    const { browser, device } = parseUserAgent(userAgent);
    
    // Get location from IP
    const location = getLocationFromIp(ip);
    
    // Record the view asynchronously (commented out for now)
    // We'll implement this later when the formView model is available
    
    // Update the view count (commented out for now)
    // We'll implement this later when the form model has a views field
    
    // Render the form view
    res.render('form-view', { form });
    
  } catch (error) {
    console.error('Error resolving form:', error);
    if (error.message === 'Form not found') {
      return res.status(404).render('error', { 
        title: 'Form Not Found',
        message: 'Form not found',
        error: { status: 404, stack: '' }
      });
    }
    res.status(500).render('error', { 
      title: 'Server Error',
      message: 'Error loading form',
      error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
    });
  }
});

// Survey resolver - /y/:slug
router.get('/y/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Find the survey by slug
    const survey = await surveyService.getSurveyBySlug(slug);
    
    // Check if survey is active
    if (survey.status !== 'Active') {
      return res.status(403).render('error', { 
        message: 'This survey is currently not active',
        error: { status: 403, stack: '' }
      });
    }
    
    // Get user agent and IP
    const userAgent = req.headers['user-agent'];
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const referrer = req.headers.referer || req.headers.referrer || 'Direct';
    
    // Parse user agent
    const { browser, device } = parseUserAgent(userAgent);
    
    // Get location from IP
    const location = getLocationFromIp(ip);
    
    // Record the view asynchronously (commented out for now)
    // We'll implement this later when the surveyView model is available
    
    // Update the view count (commented out for now)
    // We'll implement this later when the survey model has a views field
    
    // Render the survey view
    res.render('survey-view', { survey });
    
  } catch (error) {
    console.error('Error resolving survey:', error);
    if (error.message === 'Survey not found') {
      return res.status(404).render('error', { 
        title: 'Survey Not Found',
        message: 'Survey not found',
        error: { status: 404, stack: '' }
      });
    }
    res.status(500).render('error', { 
      title: 'Server Error',
      message: 'Error loading survey',
      error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
    });
  }
});

// Analytics tracking for form/survey views
router.post('/analytics', async (req, res) => {
  try {
    const { type, slug, event } = req.body;
    
    if (!type || !slug || !event) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get metadata
    const metadata = {
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      referrer: req.headers.referer || req.headers.referrer || 'Direct',
      timestamp: new Date()
    };
    
    // Create analytics entry based on type
    if (type === 'form') {
      try {
        // Find the form
        const form = await formService.getFormBySlug(slug);
        
        // Create analytics entry
        // Note: We need to add a trackFormAnalytics method to the formService
        // For now, we'll use the PrismaClient directly
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        await prisma.formAnalytics.create({
          data: {
            formId: form.id,
            event,
            metadata
          }
        });
      } catch (error) {
        if (error.message === 'Form not found') {
          return res.status(404).json({ error: 'Form not found' });
        }
        throw error;
      }
    } else if (type === 'survey') {
      try {
        // Find the survey
        const survey = await surveyService.getSurveyBySlug(slug);
        
        // Create analytics entry
        // Note: We need to add a trackSurveyAnalytics method to the surveyService
        // For now, we'll use the PrismaClient directly
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        await prisma.surveyAnalytics.create({
          data: {
            surveyId: survey.id,
            event,
            metadata
          }
        });
      } catch (error) {
        if (error.message === 'Survey not found') {
          return res.status(404).json({ error: 'Survey not found' });
        }
        throw error;
      }
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }
    
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    res.status(500).json({ error: 'Failed to track analytics' });
  }
});

module.exports = router;
