const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const digitallinkService = require('../../services/links/digitallinks');
const { successResponse, errorResponse, ErrorTypes, asyncHandler } = require('../../utils/responseUtils');

// Get all digitallinks for a company
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
  
  const result = await digitallinkService.getDigitallinks(companyId, options);
  
  res.json(successResponse(result.digitallinks, null, result.pagination));
}));

// Get a digitallink by ID
router.get('/:id', auth, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    
    const digitallink = await digitallinkService.getDigitallinkById(id, companyId);
    
    res.json(successResponse(digitallink));
  } catch (error) {
    console.error('Error fetching digitallink:', error);
    
    if (error.message === 'Digital link not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Digital link');
      return res.status(statusCode).json(body);
    }
    
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to fetch digitallink');
    res.status(statusCode).json(body);
  }
}));

// Create a new digitallink
router.post('/', auth, asyncHandler(async (req, res) => {
  try {
    const { companyId, id: userId } = req.user;
    const options = { linkType: req.query.linkType };
    
    // Validate required fields based on link type
    const isSpecialLinkType = req.query.linkType && ['page', 'form', 'survey', 'shortlink', 'custom'].includes(req.query.linkType);
    
    if (!isSpecialLinkType) {
      if (!req.body.gs1Key) {
        const { statusCode, body } = ErrorTypes.BAD_REQUEST('GS1 Key is required');
        return res.status(statusCode).json(body);
      }
      
      if (!req.body.gs1KeyType) {
        const { statusCode, body } = ErrorTypes.BAD_REQUEST('GS1 Key Type is required');
        return res.status(statusCode).json(body);
      }
      
      if (!req.body.redirectType) {
        const { statusCode, body } = ErrorTypes.BAD_REQUEST('Redirect Type is required');
        return res.status(statusCode).json(body);
      }
    }
    
    if (req.body.redirectType === 'custom' && !req.body.customUrl) {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST('Custom URL is required for custom redirect type');
      return res.status(statusCode).json(body);
    }
    
    if (req.body.redirectType === 'standard' && !req.body.productId) {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST('Product ID is required for standard redirect type');
      return res.status(statusCode).json(body);
    }
    
    const newDigitallink = await digitallinkService.createDigitallink(req.body, companyId, userId, options);
    
    res.status(201).json(successResponse(newDigitallink, 'Digital link created successfully'));
  } catch (error) {
    console.error('Error creating digitallink:', error);
    
    if (error.message === 'GS1 URL already exists') {
      const { statusCode, body } = ErrorTypes.CONFLICT('GS1 URL already exists');
      return res.status(statusCode).json(body);
    }
    
    if (error.message.includes('GS1 Key is required') ||
        error.message.includes('GS1 Key Type is required') ||
        error.message.includes('Redirect Type is required') ||
        error.message.includes('Custom URL is required') ||
        error.message.includes('Product ID is required')) {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST(error.message);
      return res.status(statusCode).json(body);
    }
    
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to create digitallink');
    res.status(statusCode).json(body);
  }
}));

// Update a digitallink
router.put('/:id', auth, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;
    
    const updatedDigitallink = await digitallinkService.updateDigitallink(id, req.body, companyId, userId);
    
    res.json(successResponse(updatedDigitallink, 'Digital link updated successfully'));
  } catch (error) {
    console.error('Error updating digitallink:', error);
    
    if (error.message === 'Digital link not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Digital link');
      return res.status(statusCode).json(body);
    }
    
    if (error.message === 'GS1 URL already exists') {
      const { statusCode, body } = ErrorTypes.CONFLICT('GS1 URL already exists');
      return res.status(statusCode).json(body);
    }
    
    if (error.message.includes('Custom URL is required') ||
        error.message.includes('Product ID is required')) {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST(error.message);
      return res.status(statusCode).json(body);
    }
    
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to update digitallink');
    res.status(statusCode).json(body);
  }
}));

// Delete a digitallink
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;
    
    await digitallinkService.deleteDigitallink(id, companyId, userId);
    
    res.json(successResponse(null, 'Digital link deleted successfully'));
  } catch (error) {
    console.error('Error deleting digitallink:', error);
    
    if (error.message === 'Digital link not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Digital link');
      return res.status(statusCode).json(body);
    }
    
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to delete digitallink');
    res.status(statusCode).json(body);
  }
}));

// Get analytics for a digitallink
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
    
    const analytics = await digitallinkService.getDigitallinkAnalytics(id, companyId, options);
    
    res.json(successResponse(analytics));
  } catch (error) {
    console.error('Error fetching digitallink analytics:', error);
    
    if (error.message === 'Digital link not found') {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Digital link');
      return res.status(statusCode).json(body);
    }
    
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to fetch digitallink analytics');
    res.status(statusCode).json(body);
  }
}));

module.exports = router;
