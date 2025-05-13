const express = require('express');
const router = express.Router();
const formService = require('../../services/engage/forms');
const pageService = require('../../services/engage/pages');
const { PrismaClient } = require('@prisma/client');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const { successResponse, errorResponse, ErrorTypes, asyncHandler } = require('../../utils/responseUtils');

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
router.get('/f/:slug', asyncHandler(async (req, res) => {
  console.log('Form resolver hit with slug:', req.params.slug);
  try {
    const { slug } = req.params;
    
    // Find the form by slug
    const form = await formService.getFormBySlug(slug);
    
    // Check if form is active
    if (form.status !== 'Active') {
      return res.status(403).render('error', { 
        title: 'Form Not Available',
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
}));


// Page resolver - /p/:slug
router.get('/p/:slug', asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;
    
    console.log('Page resolver hit with slug:', slug);
    
    // Find the page by slug
    const page = await pageService.getPageBySlug(slug);
    
    console.log('Page found:', page ? 'Yes' : 'No');
    if (page) {
      console.log('Page status:', page.status);
    }
    
    if (!page) {
      return res.status(404).render('error', { 
        title: 'Page Not Found',
        message: 'Page not found',
        error: { status: 404, stack: '' }
      });
    }
    
    // Check if page is published, active, or draft
    if (page.status !== 'Published' && page.status !== 'Active' && page.status !== 'Draft') {
      return res.status(403).render('error', { 
        title: 'Page Not Available',
        message: 'This page is currently not available',
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
    
    // Record the view
    const metadata = {
      browser,
      device,
      location,
      referrer,
      viewedAt: new Date()
    };
    
    // Record page view asynchronously
    pageService.recordPageView(page.id, { metadata, ipAddress: ip, userAgent })
      .catch(err => console.error('Error recording page view:', err));
    
    // Render the page view
    res.render('page-view', { page });
    
  } catch (error) {
    console.error('Error resolving page:', error);
    res.status(500).render('error', { 
      title: 'Server Error',
      message: 'Error loading page',
      error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
    });
  }
}));

// Analytics tracking for form/survey views
router.post('/analytics', asyncHandler(async (req, res) => {
  try {
    const { type, slug, event } = req.body;
    
    if (!type || !slug || !event) {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST('Missing required parameters');
      return res.status(statusCode).json(body);
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
          const { statusCode, body } = ErrorTypes.NOT_FOUND('Form');
          return res.status(statusCode).json(body);
        }
        throw error;
      }
    } else {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST('Invalid type');
      return res.status(statusCode).json(body);
    }
    
    res.status(201).json(successResponse(null, 'Analytics tracked successfully'));
  } catch (error) {
    console.error('Error tracking analytics:', error);
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to track analytics');
    res.status(statusCode).json(body);
  }
}));

module.exports = router;
