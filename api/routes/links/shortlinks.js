const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const shortlinkService = require('../../services/links/shortlinks');
const { successResponse, errorResponse, ErrorTypes, asyncHandler } = require('../../utils/responseUtils');

// Get all shortlinks for a company
router.get('/', auth, asyncHandler(async (req, res) => {
  const { companyId } = req.user;
  const { status, categoryId, search, page = 1, limit = 10 } = req.query;
  
  const options = {
    status,
    categoryId,
    search,
    page: parseInt(page),
    limit: parseInt(limit)
  };
  
  const result = await shortlinkService.getShortlinks(companyId, options);
  
  res.json(successResponse(result.shortlinks, null, result.pagination));
}));

// Get a shortlink by ID
router.get('/:id', auth, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    
    const shortlink = await shortlinkService.getShortlinkById(id, companyId);
    
    res.json(successResponse(shortlink));
  } catch (error) {
    console.error('Error fetching shortlink:', error);
    
    if (error.message === 'Shortlink not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Shortlink');
      return res.status(statusCode).json(body);
    }
    
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to fetch shortlink');
    res.status(statusCode).json(body);
  }
}));

// Create a new shortlink
router.post('/', auth, asyncHandler(async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;
    
    // Validate required fields
    if (!req.body.originalUrl) {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST('Original URL is required');
      return res.status(statusCode).json(body);
    }
    
    const newShortlink = await shortlinkService.createShortlink(req.body, companyId, userId);
    
    res.status(201).json(successResponse(newShortlink, 'Shortlink created successfully'));
  } catch (error) {
    console.error('Error creating shortlink:', error);
    
    if (error.message === 'Short code already exists') {
      const { statusCode, body } = ErrorTypes.CONFLICT('Short code already exists');
      return res.status(statusCode).json(body);
    }
    
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to create shortlink');
    res.status(statusCode).json(body);
  }
}));

// Update a shortlink
router.put('/:id', auth, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;
    
    const updatedShortlink = await shortlinkService.updateShortlink(id, req.body, companyId, userId);
    
    res.json(successResponse(updatedShortlink, 'Shortlink updated successfully'));
  } catch (error) {
    console.error('Error updating shortlink:', error);
    
    if (error.message === 'Shortlink not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Shortlink');
      return res.status(statusCode).json(body);
    }
    
    if (error.message === 'Short code already exists') {
      const { statusCode, body } = ErrorTypes.CONFLICT('Short code already exists');
      return res.status(statusCode).json(body);
    }
    
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to update shortlink');
    res.status(statusCode).json(body);
  }
}));

// Delete a shortlink
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;
    
    await shortlinkService.deleteShortlink(id, companyId, userId);
    
    res.json(successResponse(null, 'Shortlink deleted successfully'));
  } catch (error) {
    console.error('Error deleting shortlink:', error);
    
    if (error.message === 'Shortlink not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Shortlink');
      return res.status(statusCode).json(body);
    }
    
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to delete shortlink');
    res.status(statusCode).json(body);
  }
}));

// Get analytics for a shortlink
router.get('/:id/analytics', auth, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    
    const options = {
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit)
    };
    
    const analytics = await shortlinkService.getShortlinkAnalytics(id, companyId, options);
    
    res.json(successResponse(analytics));
  } catch (error) {
    console.error('Error fetching shortlink analytics:', error);
    
    if (error.message === 'Shortlink not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Shortlink');
      return res.status(statusCode).json(body);
    }
    
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to fetch shortlink analytics');
    res.status(statusCode).json(body);
  }
}));

module.exports = router;
