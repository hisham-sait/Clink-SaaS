const express = require('express');
const router = express.Router();
const pagesService = require('../../services/engage/pages');
const auth = require('../../middleware/auth');
const { successResponse, errorResponse, ErrorTypes, asyncHandler } = require('../../utils/responseUtils');

/**
 * @route GET /api/engage/pages
 * @desc Get all pages for a company
 * @access Private
 */
router.get('/', auth, asyncHandler(async (req, res) => {
    const { companyId } = req.user;
    const { status, categoryId, search, limit, offset, sort, order } = req.query;
    
    const options = {
      status,
      categoryId,
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      sort,
      order
    };
    
    try {
      const pages = await pagesService.getPages(companyId, options);
      res.json(successResponse(pages));
    } catch (error) {
      // If the error is related to the model not existing yet, return an empty array
      if (error.message && error.message.includes('does not exist in the current database')) {
        console.warn('Pages model not available yet:', error.message);
        return res.json(successResponse([]));
      }
      throw error;
    }
}));

/**
 * @route GET /api/engage/pages/:id
 * @desc Get a page by ID
 * @access Private
 */
router.get('/:id', auth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const page = await pagesService.getPageById(id);
    
    if (!page) {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Page');
      return res.status(statusCode).json(body);
    }
    
    // Check if user has access to this page's company
    if (page.companyId !== req.user.companyId) {
      const { statusCode, body } = ErrorTypes.FORBIDDEN('Not authorized to access this page');
      return res.status(statusCode).json(body);
    }
    
    res.json(successResponse(page));
}));

/**
 * @route POST /api/engage/pages
 * @desc Create a new page
 * @access Private
 */
router.post('/', auth, asyncHandler(async (req, res) => {
    const { companyId } = req.user;
    const { title, description, slug, status, sections, settings, appearance, categoryId } = req.body;
    
    // Validate required fields
    if (!title) {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST('Title is required');
      return res.status(statusCode).json(body);
    }
    
    // Create page data object
    const pageData = {
      title,
      description,
      slug,
      status: status || 'Draft',
      sections: sections || [],
      settings: settings || {},
      appearance: appearance || {},
      companyId,
      categoryId
    };
    
    try {
      const page = await pagesService.createPage(pageData);
      res.status(201).json(successResponse(page, 'Page created successfully'));
    } catch (error) {
      if (error.message === 'Slug is already taken') {
        const { statusCode, body } = ErrorTypes.CONFLICT(error.message);
        return res.status(statusCode).json(body);
      }
      throw error;
    }
}));

/**
 * @route PUT /api/engage/pages/:id
 * @desc Update a page
 * @access Private
 */
router.put('/:id', auth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, slug, status, sections, settings, appearance, categoryId } = req.body;
    
    // Get the page to check ownership
    const existingPage = await pagesService.getPageById(id);
    
    if (!existingPage) {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Page');
      return res.status(statusCode).json(body);
    }
    
    // Check if user has access to this page's company
    if (existingPage.companyId !== req.user.companyId) {
      const { statusCode, body } = ErrorTypes.FORBIDDEN('Not authorized to update this page');
      return res.status(statusCode).json(body);
    }
    
    // Create update data object
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (slug !== undefined) updateData.slug = slug;
    if (status !== undefined) updateData.status = status;
    if (sections !== undefined) updateData.sections = sections;
    if (settings !== undefined) updateData.settings = settings;
    if (appearance !== undefined) updateData.appearance = appearance;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    
    try {
      const page = await pagesService.updatePage(id, updateData);
      res.json(successResponse(page, 'Page updated successfully'));
    } catch (error) {
      if (error.message === 'Slug is already taken') {
        const { statusCode, body } = ErrorTypes.CONFLICT(error.message);
        return res.status(statusCode).json(body);
      }
      throw error;
    }
}));

/**
 * @route PATCH /api/engage/pages/:id/settings
 * @desc Update page settings
 * @access Private
 */
router.patch('/:id/settings', auth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { settings } = req.body;
    
    // Get the page to check ownership
    const existingPage = await pagesService.getPageById(id);
    
    if (!existingPage) {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Page');
      return res.status(statusCode).json(body);
    }
    
    // Check if user has access to this page's company
    if (existingPage.companyId !== req.user.companyId) {
      const { statusCode, body } = ErrorTypes.FORBIDDEN('Not authorized to update this page');
      return res.status(statusCode).json(body);
    }
    
    // Create update data object with merged settings
    const updateData = {
      settings: {
        ...existingPage.settings,
        ...settings
      }
    };
    
    const page = await pagesService.updatePage(id, updateData);
    res.json(successResponse(page, 'Page settings updated successfully'));
}));

/**
 * @route DELETE /api/engage/pages/:id
 * @desc Delete a page
 * @access Private
 */
router.delete('/:id', auth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Get the page to check ownership
    const existingPage = await pagesService.getPageById(id);
    
    if (!existingPage) {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Page');
      return res.status(statusCode).json(body);
    }
    
    // Check if user has access to this page's company
    if (existingPage.companyId !== req.user.companyId) {
      const { statusCode, body } = ErrorTypes.FORBIDDEN('Not authorized to delete this page');
      return res.status(statusCode).json(body);
    }
    
    await pagesService.deletePage(id);
    
    res.json(successResponse(null, 'Page deleted successfully'));
}));

/**
 * @route POST /api/engage/pages/:id/view
 * @desc Record a page view
 * @access Public
 */
router.post('/:id/view', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { metadata } = req.body;
    
    // Get IP and user agent
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Check if page exists
    const page = await pagesService.getPageById(id);
    
    if (!page) {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Page');
      return res.status(statusCode).json(body);
    }
    
    // Record the view
    await pagesService.recordPageView(id, { metadata, ipAddress, userAgent });
    
    res.status(204).end();
}));

/**
 * @route GET /api/engage/pages/categories
 * @desc Get all page categories for a company
 * @access Private
 */
router.get('/categories', auth, asyncHandler(async (req, res) => {
    const { companyId } = req.user;
    
    try {
      const categories = await pagesService.getPageCategories(companyId);
      res.json(successResponse(categories));
    } catch (error) {
      // If the error is related to the model not existing yet, return an empty array
      if (error.message && error.message.includes('does not exist in the current database')) {
        console.warn('PageCategory model not available yet:', error.message);
        return res.json(successResponse([]));
      }
      throw error;
    }
}));

/**
 * @route POST /api/engage/pages/categories
 * @desc Create a new page category
 * @access Private
 */
router.post('/categories', auth, asyncHandler(async (req, res) => {
    const { companyId } = req.user;
    const { name, description, color } = req.body;
    
    // Validate required fields
    if (!name) {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST('Name is required');
      return res.status(statusCode).json(body);
    }
    
    const categoryData = {
      name,
      description,
      color,
      companyId
    };
    
    const category = await pagesService.createPageCategory(categoryData);
    
    res.status(201).json(successResponse(category, 'Category created successfully'));
}));

/**
 * @route PUT /api/engage/pages/categories/:id
 * @desc Update a page category
 * @access Private
 */
router.put('/categories/:id', auth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, color } = req.body;
    
    // Get the category to check ownership
    const categories = await pagesService.getPageCategories(req.user.companyId);
    const existingCategory = categories.find(cat => cat.id === id);
    
    if (!existingCategory) {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Category');
      return res.status(statusCode).json(body);
    }
    
    // Create update data object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    
    const category = await pagesService.updatePageCategory(id, updateData);
    
    res.json(successResponse(category, 'Category updated successfully'));
}));

/**
 * @route DELETE /api/engage/pages/categories/:id
 * @desc Delete a page category
 * @access Private
 */
router.delete('/categories/:id', auth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Get the category to check ownership
    const categories = await pagesService.getPageCategories(req.user.companyId);
    const existingCategory = categories.find(cat => cat.id === id);
    
    if (!existingCategory) {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Category');
      return res.status(statusCode).json(body);
    }
    
    await pagesService.deletePageCategory(id);
    
    res.json(successResponse(null, 'Category deleted successfully'));
}));

module.exports = router;
