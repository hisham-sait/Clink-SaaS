const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../../middleware/auth');
const { successResponse, errorResponse, ErrorTypes, asyncHandler } = require('../../utils/responseUtils');

const prisma = new PrismaClient();

// Get all link categories for a company
router.get('/', auth, asyncHandler(async (req, res) => {
  const { companyId } = req.user;
  const { search } = req.query;
  
  // Build the where clause
  const where = { companyId };
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  // Get categories
  const categories = await prisma.linkCategory.findMany({
    where,
    include: {
      _count: {
        select: {
          links: true,
          digitalLinks: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
  
  // Format the response
  const formattedCategories = categories.map(category => ({
    id: category.id,
    name: category.name,
    description: category.description,
    color: category.color,
    linkCount: category._count.links + category._count.digitalLinks,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  }));
  
  res.json(successResponse(formattedCategories));
}));

// Get a link category by ID
router.get('/:id', auth, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    
    const category = await prisma.linkCategory.findFirst({
      where: {
        id,
        companyId
      },
      include: {
        _count: {
          select: {
            links: true,
            digitalLinks: true
          }
        }
      }
    });
    
    if (!category) {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Link category');
      return res.status(statusCode).json(body);
    }
    
    // Format the response
    const formattedCategory = {
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      linkCount: category._count.links + category._count.digitalLinks,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
    
    res.json(successResponse(formattedCategory));
  } catch (error) {
    console.error('Error fetching link category:', error);
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to fetch link category');
    res.status(statusCode).json(body);
  }
}));

// Create a new link category
router.post('/', auth, asyncHandler(async (req, res) => {
  try {
    const { companyId } = req.user;
    const { name, description, color } = req.body;
    
    // Validate required fields
    if (!name) {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST('Name is required');
      return res.status(statusCode).json(body);
    }
    
    // Check if a category with the same name already exists for this company
    const existingCategory = await prisma.linkCategory.findFirst({
      where: {
        name,
        companyId
      }
    });
    
    if (existingCategory) {
      const { statusCode, body } = ErrorTypes.CONFLICT('A category with this name already exists');
      return res.status(statusCode).json(body);
    }
    
    // Create the category
    const newCategory = await prisma.linkCategory.create({
      data: {
        name,
        description,
        color,
        companyId
      }
    });
    
    res.status(201).json(successResponse(newCategory, 'Link category created successfully'));
  } catch (error) {
    console.error('Error creating link category:', error);
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to create link category');
    res.status(statusCode).json(body);
  }
}));

// Update a link category
router.put('/:id', auth, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const { name, description, color } = req.body;
    
    // Check if the category exists and belongs to the company
    const existingCategory = await prisma.linkCategory.findFirst({
      where: {
        id,
        companyId
      }
    });
    
    if (!existingCategory) {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Link category');
      return res.status(statusCode).json(body);
    }
    
    // Check if a category with the same name already exists for this company (excluding this one)
    if (name && name !== existingCategory.name) {
      const duplicateCategory = await prisma.linkCategory.findFirst({
        where: {
          name,
          companyId,
          id: { not: id }
        }
      });
      
      if (duplicateCategory) {
        const { statusCode, body } = ErrorTypes.CONFLICT('A category with this name already exists');
        return res.status(statusCode).json(body);
      }
    }
    
    // Update the category
    const updatedCategory = await prisma.linkCategory.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        color: color !== undefined ? color : undefined
      }
    });
    
    res.json(successResponse(updatedCategory, 'Link category updated successfully'));
  } catch (error) {
    console.error('Error updating link category:', error);
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to update link category');
    res.status(statusCode).json(body);
  }
}));

// Delete a link category
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    
    // Check if the category exists and belongs to the company
    const existingCategory = await prisma.linkCategory.findFirst({
      where: {
        id,
        companyId
      },
      include: {
        _count: {
          select: {
            links: true,
            digitalLinks: true
          }
        }
      }
    });
    
    if (!existingCategory) {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Link category');
      return res.status(statusCode).json(body);
    }
    
    // Check if the category has any links
    const totalLinks = existingCategory._count.links + existingCategory._count.digitalLinks;
    if (totalLinks > 0) {
      const { statusCode, body } = ErrorTypes.BAD_REQUEST(`Cannot delete category with ${totalLinks} links. Please reassign or delete the links first.`);
      return res.status(statusCode).json(body);
    }
    
    // Delete the category
    await prisma.linkCategory.delete({
      where: { id }
    });
    
    res.json(successResponse(null, 'Link category deleted successfully'));
  } catch (error) {
    console.error('Error deleting link category:', error);
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to delete link category');
    res.status(statusCode).json(body);
  }
}));

// Get links in a category
router.get('/:id/links', auth, asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const { page = 1, limit = 10 } = req.query;
    
    // Check if the category exists and belongs to the company
    const existingCategory = await prisma.linkCategory.findFirst({
      where: {
        id,
        companyId
      }
    });
    
    if (!existingCategory) {
      const { statusCode, body } = ErrorTypes.NOT_FOUND('Link category');
      return res.status(statusCode).json(body);
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get shortlinks in this category
    const shortlinks = await prisma.link.findMany({
      where: {
        categoryId: id,
        companyId
      },
      include: {
        _count: {
          select: {
            analytics: true
          }
        }
      },
      skip,
      take: parseInt(limit) / 2 // Split the limit between shortlinks and digitallinks
    });
    
    // Get digitallinks in this category
    const digitallinks = await prisma.digitalLink.findMany({
      where: {
        categoryId: id,
        companyId
      },
      include: {
        _count: {
          select: {
            activities: true
          }
        }
      },
      skip,
      take: parseInt(limit) / 2 // Split the limit between shortlinks and digitallinks
    });
    
    // Format the response
    const formattedShortlinks = shortlinks.map(link => ({
      id: link.id,
      type: 'shortlink',
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      title: link.title,
      description: link.description,
      tags: link.tags,
      clicks: link._count.analytics,
      status: link.status,
      expiresAt: link.expiresAt,
      customDomain: link.customDomain,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt
    }));
    
    const formattedDigitallinks = digitallinks.map(link => ({
      id: link.id,
      type: 'digitallink',
      gs1Key: link.gs1Key,
      gs1KeyType: link.gs1KeyType,
      gs1Url: link.gs1Url,
      redirectType: link.redirectType,
      customUrl: link.customUrl,
      productId: link.productId,
      title: link.title,
      description: link.description,
      tags: link.tags,
      clicks: link._count.activities,
      status: link.status,
      expiresAt: link.expiresAt,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt
    }));
    
    // Combine and sort by creation date
    const allLinks = [...formattedShortlinks, ...formattedDigitallinks].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    // Get total counts for pagination
    const totalShortlinks = await prisma.link.count({
      where: {
        categoryId: id,
        companyId
      }
    });
    
    const totalDigitallinks = await prisma.digitalLink.count({
      where: {
        categoryId: id,
        companyId
      }
    });
    
    const totalCount = totalShortlinks + totalDigitallinks;
    
    const responseData = {
      category: {
        id: existingCategory.id,
        name: existingCategory.name,
        description: existingCategory.description,
        color: existingCategory.color
      },
      links: allLinks
    };
    
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    };
    
    res.json(successResponse(responseData, null, pagination));
  } catch (error) {
    console.error('Error fetching links in category:', error);
    const { statusCode, body } = ErrorTypes.INTERNAL('Failed to fetch links in category');
    res.status(statusCode).json(body);
  }
}));

module.exports = router;
