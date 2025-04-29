const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');
const { successResponse, errorResponse } = require('../../utils/responseUtils');

/**
 * Get page analytics
 * @route GET /api/engage/analytics/pages/:id/analytics
 * @param {string} id - Page ID
 * @param {string} startDate - Start date (optional)
 * @param {string} endDate - End date (optional)
 * @returns {object} Analytics data
 */
router.get('/pages/:id/analytics', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    // Get page
    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        views: {
          where: {
            ...(startDate && endDate ? {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            } : {})
          }
        }
      }
    });
    
    if (!page) {
      return res.status(404).json(errorResponse('Page not found'));
    }
    
    // Check if user has access to page
    if (page.companyId !== req.user.companyId) {
      return res.status(403).json(errorResponse('You do not have access to this page'));
    }
    
    // Process analytics data
    const views = page.views || [];
    
    // Calculate total views
    const totalViews = views.length;
    
    // Calculate unique visitors
    const uniqueVisitors = new Set(views.map(view => view.visitorId)).size;
    
    // Calculate average time on page
    const avgTimeOnPage = views.reduce((acc, view) => acc + (view.timeOnPage || 0), 0) / (totalViews || 1);
    
    // Calculate daily views
    const dailyViews = [];
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        const count = views.filter(view => {
          const viewDate = new Date(view.createdAt);
          return viewDate.toISOString().split('T')[0] === dateString;
        }).length;
        
        dailyViews.push({ date: dateString, count });
      }
    }
    
    // Calculate device stats
    const deviceStats = {};
    views.forEach(view => {
      const device = view.device || 'Unknown';
      deviceStats[device] = (deviceStats[device] || 0) + 1;
    });
    
    // Calculate location stats
    const locationStats = {};
    views.forEach(view => {
      const location = view.location || 'Unknown';
      locationStats[location] = (locationStats[location] || 0) + 1;
    });
    
    // Calculate referrer stats
    const referrerStats = {};
    views.forEach(view => {
      const referrer = view.referrer || 'Direct';
      referrerStats[referrer] = (referrerStats[referrer] || 0) + 1;
    });
    
    // Return analytics data
    return res.json(successResponse({
      analytics: {
        totalViews,
        uniqueVisitors,
        avgTimeOnPage,
        dailyViews,
        deviceStats,
        locationStats,
        referrerStats,
        visitors: views.map(view => ({
          id: view.id,
          timestamp: view.createdAt,
          visitorId: view.visitorId,
          device: view.device,
          browser: view.browser,
          location: view.location,
          referrer: view.referrer,
          timeOnPage: view.timeOnPage
        }))
      }
    }));
  } catch (err) {
    console.error('Error getting page analytics:', err);
    return res.status(500).json(errorResponse('Failed to get page analytics'));
  }
});

/**
 * Get form analytics
 * @route GET /api/engage/analytics/forms/:id/analytics
 * @param {string} id - Form ID
 * @param {string} startDate - Start date (optional)
 * @param {string} endDate - End date (optional)
 * @returns {object} Analytics data
 */
router.get('/forms/:id/analytics', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    // Get form
    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        views: {
          where: {
            ...(startDate && endDate ? {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            } : {})
          }
        },
        submissions: {
          where: {
            ...(startDate && endDate ? {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            } : {})
          }
        }
      }
    });
    
    if (!form) {
      return res.status(404).json(errorResponse('Form not found'));
    }
    
    // Check if user has access to form
    if (form.companyId !== req.user.companyId) {
      return res.status(403).json(errorResponse('You do not have access to this form'));
    }
    
    // Process analytics data
    const views = form.views || [];
    const submissions = form.submissions || [];
    
    // Calculate total views and submissions
    const totalViews = views.length;
    const totalSubmissions = submissions.length;
    
    // Calculate completed and abandoned submissions
    const completedSubmissions = submissions.filter(sub => sub.status === 'completed').length;
    const abandonedSubmissions = submissions.filter(sub => sub.status !== 'completed').length;
    
    // Calculate average completion time
    const avgCompletionTime = submissions.reduce((acc, sub) => acc + (sub.completionTime || 0), 0) / (totalSubmissions || 1);
    
    // Calculate daily views and submissions
    const dailyViews = [];
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        const viewsCount = views.filter(view => {
          const viewDate = new Date(view.createdAt);
          return viewDate.toISOString().split('T')[0] === dateString;
        }).length;
        
        const submissionsCount = submissions.filter(sub => {
          const subDate = new Date(sub.createdAt);
          return subDate.toISOString().split('T')[0] === dateString;
        }).length;
        
        dailyViews.push({ 
          date: dateString, 
          views: viewsCount,
          submissions: submissionsCount
        });
      }
    }
    
    // Calculate device stats
    const deviceStats = {};
    views.forEach(view => {
      const device = view.device || 'Unknown';
      deviceStats[device] = (deviceStats[device] || 0) + 1;
    });
    
    // Calculate field stats (if available)
    const fieldStats = {};
    if (form.elements && submissions.length > 0) {
      // Extract form fields
      const fields = [];
      form.elements.forEach(element => {
        if (element.type === 'input' || element.type === 'textarea' || element.type === 'select' || 
            element.type === 'checkbox' || element.type === 'radio') {
          fields.push(element.name);
        }
      });
      
      // Calculate field completion rates
      fields.forEach(field => {
        const completedCount = submissions.filter(sub => 
          sub.data && sub.data[field] && sub.data[field].trim() !== ''
        ).length;
        
        const errorCount = submissions.filter(sub => 
          sub.errors && sub.errors.includes(field)
        ).length;
        
        fieldStats[field] = {
          completionRate: completedCount / totalSubmissions,
          errorRate: errorCount / totalSubmissions,
          avgTimeSpent: 0 // Would need field-level timing data
        };
      });
    }
    
    // Return analytics data
    return res.json(successResponse({
      analytics: {
        totalViews,
        totalSubmissions,
        completedSubmissions,
        abandonedSubmissions,
        avgCompletionTime,
        dailyViews,
        deviceStats,
        fieldStats
      }
    }));
  } catch (err) {
    console.error('Error getting form analytics:', err);
    return res.status(500).json(errorResponse('Failed to get form analytics'));
  }
});

/**
 * Get survey analytics
 * @route GET /api/engage/analytics/surveys/:id/analytics
 * @param {string} id - Survey ID
 * @param {string} startDate - Start date (optional)
 * @param {string} endDate - End date (optional)
 * @returns {object} Analytics data
 */
router.get('/surveys/:id/analytics', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    // Get survey
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        views: {
          where: {
            ...(startDate && endDate ? {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            } : {})
          }
        },
        responses: {
          where: {
            ...(startDate && endDate ? {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            } : {})
          }
        }
      }
    });
    
    if (!survey) {
      return res.status(404).json(errorResponse('Survey not found'));
    }
    
    // Check if user has access to survey
    if (survey.companyId !== req.user.companyId) {
      return res.status(403).json(errorResponse('You do not have access to this survey'));
    }
    
    // Process analytics data
    const views = survey.views || [];
    const responses = survey.responses || [];
    
    // Calculate total views and responses
    const totalViews = views.length;
    const totalResponses = responses.length;
    
    // Calculate completed and abandoned responses
    const completedResponses = responses.filter(resp => resp.status === 'completed').length;
    const abandonedResponses = responses.filter(resp => resp.status !== 'completed').length;
    
    // Calculate average completion time
    const avgCompletionTime = responses.reduce((acc, resp) => acc + (resp.completionTime || 0), 0) / (totalResponses || 1);
    
    // Calculate daily views and responses
    const dailyViews = [];
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        const viewsCount = views.filter(view => {
          const viewDate = new Date(view.createdAt);
          return viewDate.toISOString().split('T')[0] === dateString;
        }).length;
        
        const responsesCount = responses.filter(resp => {
          const respDate = new Date(resp.createdAt);
          return respDate.toISOString().split('T')[0] === dateString;
        }).length;
        
        dailyViews.push({ 
          date: dateString, 
          views: viewsCount,
          responses: responsesCount
        });
      }
    }
    
    // Calculate device stats
    const deviceStats = {};
    views.forEach(view => {
      const device = view.device || 'Unknown';
      deviceStats[device] = (deviceStats[device] || 0) + 1;
    });
    
    // Calculate question stats (if available)
    const questionStats = {};
    if (survey.sections && responses.length > 0) {
      // Extract survey questions
      const questions = [];
      survey.sections.forEach(section => {
        if (section.questions) {
          section.questions.forEach(question => {
            questions.push(question.question);
          });
        }
      });
      
      // Calculate question response rates
      questions.forEach(question => {
        const responseCount = responses.filter(resp => 
          resp.answers && resp.answers[question] && resp.answers[question].trim() !== ''
        ).length;
        
        const skipCount = responses.filter(resp => 
          !resp.answers || !resp.answers[question] || resp.answers[question].trim() === ''
        ).length;
        
        questionStats[question] = {
          responseRate: responseCount / totalResponses,
          skipRate: skipCount / totalResponses,
          avgTimeSpent: 0 // Would need question-level timing data
        };
      });
    }
    
    // Return analytics data
    return res.json(successResponse({
      analytics: {
        totalViews,
        totalResponses,
        completedResponses,
        abandonedResponses,
        avgCompletionTime,
        dailyViews,
        deviceStats,
        questionStats
      }
    }));
  } catch (err) {
    console.error('Error getting survey analytics:', err);
    return res.status(500).json(errorResponse('Failed to get survey analytics'));
  }
});

module.exports = router;
