const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse, ErrorTypes, asyncHandler } = require('../../utils/responseUtils');
const prisma = new PrismaClient();

// ===== Combined Categories API =====

// Get all categories (form, survey, and page) for a company
router.get('/:companyId', asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    
    // Get form categories
    const formCategories = await prisma.formCategory.findMany({
      where: { companyId },
      orderBy: [
        { name: 'asc' }
      ]
    });
    
    // Count forms for each category
    const formCategoriesWithCounts = await Promise.all(
      formCategories.map(async (category) => {
        const formsCount = await prisma.form.count({
          where: { categoryId: category.id }
        });
        
        return {
          ...category,
          formsCount,
          type: 'form' // Add type to distinguish between categories
        };
      })
    );
    
    // Survey categories have been removed in migration 20250429191510_remove_survey_models
    // Initialize empty arrays for survey categories
    const surveyCategoriesWithCounts = [];
    
    // Get page categories (with error handling for if the model doesn't exist yet)
    let pageCategoriesWithCounts = [];
    try {
      const pageCategories = await prisma.pageCategory.findMany({
        where: { companyId },
        orderBy: [
          { name: 'asc' }
        ]
      });
      
      // Count pages for each category
      pageCategoriesWithCounts = await Promise.all(
        pageCategories.map(async (category) => {
          const pagesCount = await prisma.page.count({
            where: { categoryId: category.id }
          });
          
          return {
            ...category,
            pagesCount,
            type: 'page' // Add type to distinguish between categories
          };
        })
      );
    } catch (error) {
      console.warn('Page categories not available yet:', error.message);
      // Continue without page categories if they don't exist yet
    }
    
    // Combine all types of categories
    const allCategories = [
      ...formCategoriesWithCounts,
      ...surveyCategoriesWithCounts,
      ...pageCategoriesWithCounts
    ];
    
    res.json(successResponse({ categories: allCategories }));
}));

// Create a new category (for forms, surveys, or pages)
router.post('/:companyId', asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    const { name, type, description, color } = req.body;
    
    if (!name || name.trim() === '') {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST('Category name is required');
      return res.status(statusCode).json(body);
    }
    
    if (!type || (type !== 'form' && type !== 'survey' && type !== 'page')) {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST('Valid category type (form, survey, or page) is required');
      return res.status(statusCode).json(body);
    }
    
    let category;
    
    if (type === 'form') {
      // Check if form category with same name already exists
      const existingCategory = await prisma.formCategory.findFirst({
        where: {
          companyId,
          name: {
            equals: name,
            mode: 'insensitive'
          }
        }
      });
      
      if (existingCategory) {
        const { statusCode, body } = ErrorTypes.CONFLICT('A form category with this name already exists');
        return res.status(statusCode).json(body);
      }
      
      // Create form category
      category = await prisma.formCategory.create({
        data: {
          name,
          companyId
        }
      });
      
      // Add type for the response
      category.type = 'form';
      
    } else if (type === 'survey') {
      // Survey categories have been removed in migration 20250429191510_remove_survey_models
      const { statusCode, body } = ErrorTypes.BAD_REQUEST('Survey categories have been removed and cannot be created');
      return res.status(statusCode).json(body);
    } else if (type === 'page') {
      try {
        // Check if page category with same name already exists
        const existingCategory = await prisma.pageCategory.findFirst({
          where: {
            companyId,
            name: {
              equals: name,
              mode: 'insensitive'
            }
          }
        });
        
        if (existingCategory) {
          const { statusCode, body } = ErrorTypes.CONFLICT('A page category with this name already exists');
          return res.status(statusCode).json(body);
        }
        
        // Create page category
        category = await prisma.pageCategory.create({
          data: {
            name,
            description,
            color,
            companyId
          }
        });
        
        // Add type for the response
        category.type = 'page';
      } catch (error) {
        console.error('Error creating page category:', error);
        const { statusCode, body } = ErrorTypes.INTERNAL(
          'Failed to create page category. The Page model may not exist yet in the database.',
          { details: error.message }
        );
        return res.status(statusCode).json(body);
      }
    }
    
    res.status(201).json(successResponse(category, 'Category created successfully'));
}));

// Get a single form category
router.get('/forms/categories/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    const category = await prisma.formCategory.findFirst({
      where: { id, companyId }
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Form category not found' });
    }
    
    // Get forms count for this category
    const formsCount = await prisma.form.count({
      where: { categoryId: id }
    });
    
    res.json({
      ...category,
      formsCount
    });
  } catch (error) {
    console.error('Error fetching form category:', error);
    res.status(500).json({ error: 'Failed to fetch form category' });
  }
});

// Create a new form category
router.post('/forms/categories/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    // Check if category with same name already exists
    const existingCategory = await prisma.formCategory.findFirst({
      where: {
        companyId,
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });
    
    if (existingCategory) {
      return res.status(400).json({ error: 'A category with this name already exists' });
    }
    
    const category = await prisma.formCategory.create({
      data: {
        name,
        companyId
      }
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating form category:', error);
    res.status(500).json({ error: 'Failed to create form category', details: error.message });
  }
});

// Update a form category
router.put('/forms/categories/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    // Check if category exists
    const existingCategory = await prisma.formCategory.findFirst({
      where: { id, companyId }
    });
    
    if (!existingCategory) {
      return res.status(404).json({ error: 'Form category not found' });
    }
    
    // Check if another category with the same name exists
    const duplicateName = await prisma.formCategory.findFirst({
      where: {
        companyId,
        name: {
          equals: name,
          mode: 'insensitive'
        },
        id: { not: id }
      }
    });
    
    if (duplicateName) {
      return res.status(400).json({ error: 'A category with this name already exists' });
    }
    
    // Update the category
    const updatedCategory = await prisma.formCategory.update({
      where: { id },
      data: { name }
    });
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating form category:', error);
    res.status(500).json({ error: 'Failed to update form category', details: error.message });
  }
});

// Delete a form category
router.delete('/forms/categories/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    // Check if category exists
    const category = await prisma.formCategory.findFirst({
      where: { id, companyId }
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Form category not found' });
    }
    
    // Check if category has forms
    const formsCount = await prisma.form.count({
      where: { categoryId: id }
    });
    
    if (formsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with associated forms',
        formsCount
      });
    }
    
    // Delete the category
    await prisma.formCategory.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting form category:', error);
    res.status(500).json({ error: 'Failed to delete form category' });
  }
});

// Get forms in a category
router.get('/forms/categories/:companyId/:id/forms', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    // Check if category exists
    const category = await prisma.formCategory.findFirst({
      where: { id, companyId }
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Form category not found' });
    }
    
    // Get forms in this category
    const forms = await prisma.form.findMany({
      where: { 
        categoryId: id,
        companyId
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms for category:', error);
    res.status(500).json({ error: 'Failed to fetch forms for category' });
  }
});

// ===== Survey Categories =====

// Get all survey categories for a company
router.get('/surveys/categories/:companyId', async (req, res) => {
  try {
    // Survey categories have been removed in migration 20250429191510_remove_survey_models
    // Return empty categories
    res.json({
      categories: []
    });
  } catch (error) {
    console.error('Error fetching survey categories:', error);
    res.status(500).json({ error: 'Failed to fetch survey categories' });
  }
});

// Get a single survey category
router.get('/surveys/categories/:companyId/:id', async (req, res) => {
  try {
    // Survey categories have been removed in migration 20250429191510_remove_survey_models
    return res.status(404).json({ error: 'Survey categories have been removed' });
  } catch (error) {
    console.error('Error fetching survey category:', error);
    res.status(500).json({ error: 'Failed to fetch survey category' });
  }
});

// Create a new survey category
router.post('/surveys/categories/:companyId', async (req, res) => {
  try {
    // Survey categories have been removed in migration 20250429191510_remove_survey_models
    return res.status(400).json({ error: 'Survey categories have been removed and cannot be created' });
  } catch (error) {
    console.error('Error creating survey category:', error);
    res.status(500).json({ error: 'Failed to create survey category', details: error.message });
  }
});

// Update a survey category
router.put('/surveys/categories/:companyId/:id', async (req, res) => {
  try {
    // Survey categories have been removed in migration 20250429191510_remove_survey_models
    return res.status(404).json({ error: 'Survey categories have been removed and cannot be updated' });
  } catch (error) {
    console.error('Error updating survey category:', error);
    res.status(500).json({ error: 'Failed to update survey category', details: error.message });
  }
});

// Delete a survey category
router.delete('/surveys/categories/:companyId/:id', async (req, res) => {
  try {
    // Survey categories have been removed in migration 20250429191510_remove_survey_models
    return res.status(404).json({ error: 'Survey categories have been removed and cannot be deleted' });
  } catch (error) {
    console.error('Error deleting survey category:', error);
    res.status(500).json({ error: 'Failed to delete survey category' });
  }
});

// Get surveys in a category
router.get('/surveys/categories/:companyId/:id/surveys', async (req, res) => {
  try {
    // Survey categories have been removed in migration 20250429191510_remove_survey_models
    return res.status(404).json({ error: 'Survey categories have been removed' });
  } catch (error) {
    console.error('Error fetching surveys for category:', error);
    res.status(500).json({ error: 'Failed to fetch surveys for category' });
  }
});

// ===== Page Categories =====

// Get all page categories for a company
router.get('/pages/categories/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    try {
      const categories = await prisma.pageCategory.findMany({
        where: { companyId },
        orderBy: [
          { name: 'asc' }
        ]
      });
      
      // Count pages for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const pagesCount = await prisma.page.count({
            where: { categoryId: category.id }
          });
          
          return {
            ...category,
            pagesCount
          };
        })
      );
      
      res.json({
        categories: categoriesWithCounts
      });
    } catch (error) {
      console.warn('Page categories not available yet:', error.message);
      // Return empty categories if the model doesn't exist yet
      res.json({
        categories: []
      });
    }
  } catch (error) {
    console.error('Error fetching page categories:', error);
    res.status(500).json({ error: 'Failed to fetch page categories' });
  }
});

// Get a single page category
router.get('/pages/categories/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    try {
      const category = await prisma.pageCategory.findFirst({
        where: { id, companyId }
      });
      
      if (!category) {
        return res.status(404).json({ error: 'Page category not found' });
      }
      
      // Get pages count for this category
      const pagesCount = await prisma.page.count({
        where: { categoryId: id }
      });
      
      res.json({
        ...category,
        pagesCount
      });
    } catch (error) {
      console.warn('Page categories not available yet:', error.message);
      return res.status(404).json({ error: 'Page categories not available yet' });
    }
  } catch (error) {
    console.error('Error fetching page category:', error);
    res.status(500).json({ error: 'Failed to fetch page category' });
  }
});

// Create a new page category
router.post('/pages/categories/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { name, description, color } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    try {
      // Check if category with same name already exists
      const existingCategory = await prisma.pageCategory.findFirst({
        where: {
          companyId,
          name: {
            equals: name,
            mode: 'insensitive'
          }
        }
      });
      
      if (existingCategory) {
        return res.status(400).json({ error: 'A category with this name already exists' });
      }
      
      const category = await prisma.pageCategory.create({
        data: {
          name,
          description,
          color,
          companyId
        }
      });
      
      res.status(201).json(category);
    } catch (error) {
      console.warn('Page categories not available yet:', error.message);
      return res.status(500).json({ 
        error: 'Failed to create page category. The Page model may not exist yet in the database.',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Error creating page category:', error);
    res.status(500).json({ error: 'Failed to create page category', details: error.message });
  }
});

// Update a page category
router.put('/pages/categories/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { name, description, color } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    try {
      // Check if category exists
      const existingCategory = await prisma.pageCategory.findFirst({
        where: { id, companyId }
      });
      
      if (!existingCategory) {
        return res.status(404).json({ error: 'Page category not found' });
      }
      
      // Check if another category with the same name exists
      const duplicateName = await prisma.pageCategory.findFirst({
        where: {
          companyId,
          name: {
            equals: name,
            mode: 'insensitive'
          },
          id: { not: id }
        }
      });
      
      if (duplicateName) {
        return res.status(400).json({ error: 'A category with this name already exists' });
      }
      
      // Update the category
      const updatedCategory = await prisma.pageCategory.update({
        where: { id },
        data: { 
          name,
          description,
          color
        }
      });
      
      res.json(updatedCategory);
    } catch (error) {
      console.warn('Page categories not available yet:', error.message);
      return res.status(500).json({ 
        error: 'Failed to update page category. The Page model may not exist yet in the database.',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Error updating page category:', error);
    res.status(500).json({ error: 'Failed to update page category', details: error.message });
  }
});

// Delete a page category
router.delete('/pages/categories/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    try {
      // Check if category exists
      const category = await prisma.pageCategory.findFirst({
        where: { id, companyId }
      });
      
      if (!category) {
        return res.status(404).json({ error: 'Page category not found' });
      }
      
      // Check if category has pages
      const pagesCount = await prisma.page.count({
        where: { categoryId: id }
      });
      
      if (pagesCount > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete category with associated pages',
          pagesCount
        });
      }
      
      // Delete the category
      await prisma.pageCategory.delete({
        where: { id }
      });
      
      res.status(204).send();
    } catch (error) {
      console.warn('Page categories not available yet:', error.message);
      return res.status(500).json({ 
        error: 'Failed to delete page category. The Page model may not exist yet in the database.',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Error deleting page category:', error);
    res.status(500).json({ error: 'Failed to delete page category' });
  }
});

// Get pages in a category
router.get('/pages/categories/:companyId/:id/pages', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    try {
      // Check if category exists
      const category = await prisma.pageCategory.findFirst({
        where: { id, companyId }
      });
      
      if (!category) {
        return res.status(404).json({ error: 'Page category not found' });
      }
      
      // Get pages in this category
      const pages = await prisma.page.findMany({
        where: { 
          categoryId: id,
          companyId
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      
      res.json(pages);
    } catch (error) {
      console.warn('Page categories not available yet:', error.message);
      return res.status(500).json({ 
        error: 'Failed to fetch pages for category. The Page model may not exist yet in the database.',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Error fetching pages for category:', error);
    res.status(500).json({ error: 'Failed to fetch pages for category' });
  }
});

// ===== Form Types =====

// Get all form types
router.get('/forms/types/:companyId', async (req, res) => {
  try {
    // Return predefined form types
    const formTypes = [
      'Feedback',
      'Registration',
      'Contact',
      'Survey',
      'Satisfaction',
      'Other'
    ];
    
    res.json(formTypes);
  } catch (error) {
    console.error('Error fetching form types:', error);
    res.status(500).json({ error: 'Failed to fetch form types' });
  }
});

// Get forms by type
router.get('/forms/types/:companyId/:type', async (req, res) => {
  try {
    const { companyId, type } = req.params;
    
    // Get forms of this type
    const forms = await prisma.form.findMany({
      where: { 
        type,
        companyId
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms by type:', error);
    res.status(500).json({ error: 'Failed to fetch forms by type' });
  }
});

module.exports = router;
