const express = require('express');
const router = express.Router();
const prisma = require('../../services/prisma');
const auth = require('../../middleware/auth');
const supersetRoutes = require('./superset');

// Use Superset routes
router.use('/superset', supersetRoutes);

// Get all reports
router.get('/reports', auth, async (req, res) => {
  try {
    // Check if the InsightReport table exists
    let reports = [];
    try {
      reports = await prisma.insightReport.findMany({
        where: {
          companyId: req.user.companyId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (dbError) {
      // If there's a database error (like table doesn't exist), return an empty array
      console.warn('Database error when fetching reports:', dbError);
      reports = [];
    }
    
    // Always return a 200 response with the reports (empty array if none found)
    res.json(reports);
  } catch (error) {
    console.error('Error in reports route:', error);
    // Return an empty array instead of an error
    res.json([]);
  }
});

// Get a single report by ID
router.get('/reports/:id', auth, async (req, res) => {
  try {
    let report = null;
    try {
      report = await prisma.insightReport.findUnique({
        where: {
          id: req.params.id
        }
      });
    } catch (dbError) {
      console.warn('Database error when fetching report:', dbError);
      return res.status(404).json({ message: 'Report not found' });
    }
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Check if user has access to this report
    if (report.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(404).json({ message: 'Report not found' });
  }
});

// Create a new report
router.post('/reports', auth, async (req, res) => {
  const { title, description, dashboardId, status } = req.body;
  
  if (!title || !dashboardId) {
    return res.status(400).json({ message: 'Title and dashboardId are required' });
  }
  
  try {
    let newReport;
    try {
      newReport = await prisma.insightReport.create({
        data: {
          title,
          description,
          dashboardId,
          status: status || 'Active',
          companyId: req.user.companyId,
          createdById: req.user.id
        }
      });
    } catch (dbError) {
      console.warn('Database error when creating report:', dbError);
      // Check if it's a table doesn't exist error
      if (dbError.message && dbError.message.includes('does not exist')) {
        return res.status(503).json({ 
          message: 'The reports feature is currently being set up. Please try again later.',
          setupRequired: true
        });
      }
      throw dbError; // Re-throw for the outer catch block
    }
    
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ 
      message: 'Unable to create report at this time. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update a report
router.put('/reports/:id', auth, async (req, res) => {
  const { title, description, dashboardId, status } = req.body;
  
  try {
    // First check if the report exists and belongs to the user's company
    let existingReport;
    try {
      existingReport = await prisma.insightReport.findUnique({
        where: {
          id: req.params.id
        }
      });
    } catch (dbError) {
      console.warn('Database error when finding report to update:', dbError);
      return res.status(404).json({ message: 'Report not found' });
    }
    
    if (!existingReport) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    if (existingReport.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update the report
    let updatedReport;
    try {
      updatedReport = await prisma.insightReport.update({
        where: {
          id: req.params.id
        },
        data: {
          title: title || undefined,
          description: description !== undefined ? description : undefined,
          dashboardId: dashboardId || undefined,
          status: status || undefined
        }
      });
    } catch (dbError) {
      console.warn('Database error when updating report:', dbError);
      return res.status(500).json({ message: 'Unable to update report at this time. Please try again later.' });
    }
    
    res.json(updatedReport);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Unable to update report at this time. Please try again later.' });
  }
});

// Delete a report
router.delete('/reports/:id', auth, async (req, res) => {
  try {
    // First check if the report exists and belongs to the user's company
    let existingReport;
    try {
      existingReport = await prisma.insightReport.findUnique({
        where: {
          id: req.params.id
        }
      });
    } catch (dbError) {
      console.warn('Database error when finding report to delete:', dbError);
      // If the table doesn't exist, we can consider the report "deleted"
      if (dbError.message && dbError.message.includes('does not exist')) {
        return res.json({ message: 'Report deleted successfully' });
      }
      return res.status(404).json({ message: 'Report not found' });
    }
    
    if (!existingReport) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    if (existingReport.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // First delete all associated views
    try {
      await prisma.insightReportView.deleteMany({
        where: {
          reportId: req.params.id
        }
      });
    } catch (viewsError) {
      console.warn('Error deleting report views:', viewsError);
      // Continue with deleting the report even if views deletion fails
    }
    
    // Then delete the report
    try {
      await prisma.insightReport.delete({
        where: {
          id: req.params.id
        }
      });
    } catch (dbError) {
      console.warn('Database error when deleting report:', dbError);
      // If the table doesn't exist, we can consider the report "deleted"
      if (dbError.message && dbError.message.includes('does not exist')) {
        return res.json({ message: 'Report deleted successfully' });
      }
      throw dbError; // Re-throw for the outer catch block
    }
    
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Unable to delete report at this time. Please try again later.' });
  }
});

// Record a view for a report
router.post('/reports/:id/view', auth, async (req, res) => {
  try {
    const { visitorId, device, browser, location, referrer, timeOnPage, ipAddress, userAgent } = req.body;
    
    // Check if report exists and belongs to user's company
    let report;
    try {
      report = await prisma.insightReport.findUnique({
        where: {
          id: req.params.id
        }
      });
    } catch (dbError) {
      console.warn('Database error when finding report for view:', dbError);
      // Silently fail - don't show an error to the user for analytics
      return res.status(200).json({ recorded: false });
    }
    
    if (!report) {
      // Silently fail - don't show an error to the user for analytics
      return res.status(200).json({ recorded: false });
    }
    
    if (report.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Record the view
    let view;
    try {
      view = await prisma.insightReportView.create({
        data: {
          reportId: req.params.id,
          visitorId,
          device,
          browser,
          location,
          referrer,
          timeOnPage,
          ipAddress,
          userAgent
        }
      });
    } catch (dbError) {
      console.warn('Database error when recording view:', dbError);
      // Silently fail - don't show an error to the user for analytics
      return res.status(200).json({ recorded: false });
    }
    
    res.status(201).json(view);
  } catch (error) {
    console.error('Error recording view:', error);
    // Silently fail - don't show an error to the user for analytics
    res.status(200).json({ recorded: false });
  }
});

// Get views for a report
router.get('/reports/:id/views', auth, async (req, res) => {
  try {
    // Check if report exists and belongs to user's company
    let report;
    try {
      report = await prisma.insightReport.findUnique({
        where: {
          id: req.params.id
        }
      });
    } catch (dbError) {
      console.warn('Database error when finding report for views:', dbError);
      return res.json([]);
    }
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    if (report.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get views for the report
    let views = [];
    try {
      views = await prisma.insightReportView.findMany({
        where: {
          reportId: req.params.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (dbError) {
      console.warn('Database error when fetching views:', dbError);
      // If the table doesn't exist, return an empty array
      if (dbError.message && dbError.message.includes('does not exist')) {
        return res.json([]);
      }
      // For other errors, return an empty array as well
      return res.json([]);
    }
    
    res.json(views);
  } catch (error) {
    console.error('Error fetching views:', error);
    // Return an empty array instead of an error
    res.json([]);
  }
});

module.exports = router;
