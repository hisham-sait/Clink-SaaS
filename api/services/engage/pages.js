const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all pages for a company
 * @param {string} companyId - The company ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - List of pages
 */
async function getPages(companyId, options = {}) {
  try {
    const { status, categoryId, search, limit = 100, offset = 0, sort = 'createdAt', order = 'desc' } = options;
    
    const where = { companyId };
    
    if (status) {
      where.status = status;
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const pages = await prisma.page.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: { views: true }
        }
      },
      orderBy: { [sort]: order },
      skip: offset,
      take: limit
    });
    
    return pages;
  } catch (error) {
    console.warn('Pages not available yet:', error.message);
    return []; // Return empty array if the model doesn't exist yet
  }
}

/**
 * Get a page by ID
 * @param {string} id - The page ID
 * @returns {Promise<Object>} - The page
 */
async function getPageById(id) {
  try {
    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        category: true,
        _count: {
          select: { views: true }
        }
      }
    });
    
    return page;
  } catch (error) {
    console.warn('Page not available yet:', error.message);
    return null; // Return null if the model doesn't exist yet
  }
}

/**
 * Get a page by slug
 * @param {string} slug - The page slug
 * @returns {Promise<Object>} - The page
 */
async function getPageBySlug(slug) {
  try {
    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        category: true
      }
    });
    
    return page;
  } catch (error) {
    console.warn('Page not available yet:', error.message);
    return null; // Return null if the model doesn't exist yet
  }
}

/**
 * Create a new page
 * @param {Object} data - The page data
 * @returns {Promise<Object>} - The created page
 */
async function createPage(data) {
  try {
    const { title, description, slug: providedSlug, status, sections, settings, appearance, companyId, categoryId } = data;
    
    // Generate random alphanumeric slug if not provided
    let slug = providedSlug;
    if (!slug) {
      slug = Math.random().toString(36).substring(2, 10);
      
      // Check if slug already exists
      let existingPage = await prisma.page.findUnique({
        where: { slug }
      });
      
      // If slug exists, generate a new one until we find a unique one
      while (existingPage) {
        slug = Math.random().toString(36).substring(2, 10);
        existingPage = await prisma.page.findUnique({
          where: { slug }
        });
      }
    } else {
      // Check if provided slug is already taken
      try {
        const existingPage = await prisma.page.findUnique({
          where: { slug }
        });
        
        if (existingPage) {
          throw new Error('Slug is already taken');
        }
      } catch (error) {
        // If the model doesn't exist yet, we can assume the slug is not taken
        if (!error.message.includes('does not exist in the current database')) {
          throw error;
        }
      }
    }
    
    // Validate categoryId to avoid foreign key constraint violations
    let finalCategoryId = null;
    if (categoryId && typeof categoryId === 'string' && categoryId.trim() !== '') {
      try {
        // Try to find the category
        const categoryExists = await prisma.pageCategory.findUnique({
          where: { id: categoryId }
        });
        
        if (categoryExists) {
          finalCategoryId = categoryId;
        } else {
          console.warn(`Category ID ${categoryId} does not exist. Setting category to null.`);
        }
      } catch (categoryError) {
        console.warn(`Error verifying category ID ${categoryId}:`, categoryError);
        // Set to null on error
      }
    }
    
    const page = await prisma.page.create({
      data: {
        title,
        description: description || '',
        slug,
        status: status || 'Draft',
        sections: sections || [],
        settings: settings || {},
        appearance: appearance || {},
        companyId,
        categoryId: finalCategoryId
      },
      include: {
        category: true
      }
    });
    
    return page;
  } catch (error) {
    console.warn('Failed to create page:', error.message);
    throw new Error(`Failed to create page: ${error.message}`);
  }
}

/**
 * Update a page
 * @param {string} id - The page ID
 * @param {Object} data - The page data
 * @returns {Promise<Object>} - The updated page
 */
async function updatePage(id, data) {
  try {
    const { title, description, slug, status, sections, settings, appearance, categoryId } = data;
    
    // Check if slug is already taken by another page
    if (slug) {
      try {
        const existingPage = await prisma.page.findFirst({
          where: {
            slug,
            NOT: { id }
          }
        });
        
        if (existingPage) {
          throw new Error('Slug is already taken');
        }
      } catch (error) {
        // If the model doesn't exist yet, we can assume the slug is not taken
        if (!error.message.includes('does not exist in the current database')) {
          throw error;
        }
      }
    }
    
    // Validate categoryId to avoid foreign key constraint violations
    let finalCategoryId = null;
    if (categoryId !== undefined) {
      if (categoryId && typeof categoryId === 'string' && categoryId.trim() !== '') {
        try {
          // Try to find the category
          const categoryExists = await prisma.pageCategory.findUnique({
            where: { id: categoryId }
          });
          
          if (categoryExists) {
            finalCategoryId = categoryId;
          } else {
            console.warn(`Category ID ${categoryId} does not exist. Setting category to null.`);
          }
        } catch (categoryError) {
          console.warn(`Error verifying category ID ${categoryId}:`, categoryError);
          // Set to null on error
        }
      }
    } else {
      // If categoryId is not provided, don't update it
      const existingPage = await prisma.page.findUnique({
        where: { id }
      });
      finalCategoryId = existingPage?.categoryId || null;
    }
    
    const page = await prisma.page.update({
      where: { id },
      data: {
        title,
        description: description !== undefined ? description : undefined,
        slug,
        status,
        sections: sections !== undefined ? sections : undefined,
        settings: settings !== undefined ? settings : undefined,
        appearance: appearance !== undefined ? appearance : undefined,
        categoryId: finalCategoryId
      },
      include: {
        category: true
      }
    });
    
    return page;
  } catch (error) {
    console.warn('Failed to update page:', error.message);
    throw new Error(`Failed to update page: ${error.message}`);
  }
}

/**
 * Delete a page
 * @param {string} id - The page ID
 * @returns {Promise<Object>} - The deleted page
 */
async function deletePage(id) {
  try {
    // Use a transaction to ensure all operations succeed or fail together
    return await prisma.$transaction(async (tx) => {
      // First, delete all PageView records associated with this page
      await tx.pageView.deleteMany({
        where: { pageId: id }
      });
      
      // Then delete the page itself
      const page = await tx.page.delete({
        where: { id }
      });
      
      return page;
    });
  } catch (error) {
    console.warn('Failed to delete page:', error.message);
    throw new Error(`Failed to delete page: ${error.message}`);
  }
}

/**
 * Record a page view
 * @param {string} pageId - The page ID
 * @param {Object} data - View data
 * @returns {Promise<Object>} - The created view
 */
async function recordPageView(pageId, data = {}) {
  try {
    const { metadata, ipAddress, userAgent } = data;
    
    const view = await prisma.pageView.create({
      data: {
        pageId,
        metadata,
        ipAddress,
        userAgent
      }
    });
    
    return view;
  } catch (error) {
    console.warn('Failed to record page view:', error.message);
    // Don't throw an error for page views, just log it
    return null;
  }
}

/**
 * Get page categories for a company
 * @param {string} companyId - The company ID
 * @returns {Promise<Array>} - List of categories
 */
async function getPageCategories(companyId) {
  try {
    const categories = await prisma.pageCategory.findMany({
      where: { companyId },
      orderBy: { name: 'asc' }
    });
    
    return categories;
  } catch (error) {
    console.warn('Page categories not available yet:', error.message);
    return []; // Return empty array if the model doesn't exist yet
  }
}

/**
 * Create a page category
 * @param {Object} data - The category data
 * @returns {Promise<Object>} - The created category
 */
async function createPageCategory(data) {
  try {
    const { name, description, color, companyId } = data;
    
    const category = await prisma.pageCategory.create({
      data: {
        name,
        description,
        color,
        companyId
      }
    });
    
    return category;
  } catch (error) {
    console.warn('Failed to create page category:', error.message);
    throw new Error(`Failed to create page category: ${error.message}`);
  }
}

/**
 * Update a page category
 * @param {string} id - The category ID
 * @param {Object} data - The category data
 * @returns {Promise<Object>} - The updated category
 */
async function updatePageCategory(id, data) {
  try {
    const { name, description, color } = data;
    
    const category = await prisma.pageCategory.update({
      where: { id },
      data: {
        name,
        description,
        color
      }
    });
    
    return category;
  } catch (error) {
    console.warn('Failed to update page category:', error.message);
    throw new Error(`Failed to update page category: ${error.message}`);
  }
}

/**
 * Delete a page category
 * @param {string} id - The category ID
 * @returns {Promise<Object>} - The deleted category
 */
async function deletePageCategory(id) {
  try {
    // Try to update pages in this category to have no category
    try {
      await prisma.page.updateMany({
        where: { categoryId: id },
        data: { categoryId: null }
      });
    } catch (error) {
      // If the Page model doesn't exist yet, we can ignore this error
      console.warn('Failed to update pages for category:', error.message);
    }
    
    const category = await prisma.pageCategory.delete({
      where: { id }
    });
    
    return category;
  } catch (error) {
    console.warn('Failed to delete page category:', error.message);
    throw new Error(`Failed to delete page category: ${error.message}`);
  }
}

/**
 * Get page views
 * @param {string} pageId - The page ID
 * @param {Object} options - Query options (startDate, endDate)
 * @returns {Promise<Array>} - List of page views
 */
async function getPageViews(pageId, options = {}) {
  try {
    const { startDate, endDate } = options;
    
    const where = { pageId };
    
    if (startDate || endDate) {
      where.createdAt = {};
      
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }
    
    const views = await prisma.pageView.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return views;
  } catch (error) {
    console.warn('Failed to get page views:', error.message);
    return []; // Return empty array if there's an error
  }
}

module.exports = {
  getPages,
  getPageById,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  recordPageView,
  getPageViews,
  getPageCategories,
  createPageCategory,
  updatePageCategory,
  deletePageCategory
};
