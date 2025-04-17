const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../../middleware/auth');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Generate a random short code
function generateShortCode(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = crypto.randomBytes(length);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % characters.length;
    result += characters.charAt(randomIndex);
  }
  
  return result;
}

// Get all shortlinks for a company
router.get('/', auth, async (req, res) => {
  try {
    const { companyId } = req.user;
    const { status, categoryId, search, page = 1, limit = 10 } = req.query;
    
    // Build the where clause
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
        { description: { contains: search, mode: 'insensitive' } },
        { originalUrl: { contains: search, mode: 'insensitive' } },
        { shortCode: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get shortlinks with pagination
    const shortlinks = await prisma.link.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: {
            linkClicks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    });
    
    // Get total count for pagination
    const totalCount = await prisma.link.count({ where });
    
    // Format the response
    const formattedShortlinks = shortlinks.map(link => ({
      id: link.id,
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      title: link.title,
      description: link.description,
      tags: link.tags,
      clicks: link._count.linkClicks,
      status: link.status,
      expiresAt: link.expiresAt,
      customDomain: link.customDomain,
      category: link.category,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt
    }));
    
    res.json({
      success: true,
      data: formattedShortlinks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching shortlinks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shortlinks',
      error: error.message
    });
  }
});

// Get a shortlink by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    
    const shortlink = await prisma.link.findFirst({
      where: {
        id,
        companyId
      },
      include: {
        category: true,
        _count: {
          select: {
            linkClicks: true
          }
        }
      }
    });
    
    if (!shortlink) {
      return res.status(404).json({
        success: false,
        message: 'Shortlink not found'
      });
    }
    
    // Format the response
    const formattedShortlink = {
      id: shortlink.id,
      originalUrl: shortlink.originalUrl,
      shortCode: shortlink.shortCode,
      title: shortlink.title,
      description: shortlink.description,
      tags: shortlink.tags,
      clicks: shortlink._count.linkClicks,
      status: shortlink.status,
      expiresAt: shortlink.expiresAt,
      customDomain: shortlink.customDomain,
      category: shortlink.category,
      createdAt: shortlink.createdAt,
      updatedAt: shortlink.updatedAt
    };
    
    res.json({
      success: true,
      data: formattedShortlink
    });
  } catch (error) {
    console.error('Error fetching shortlink:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shortlink',
      error: error.message
    });
  }
});

// Create a new shortlink
router.post('/', auth, async (req, res) => {
  try {
    const { companyId } = req.user;
    const {
      originalUrl,
      shortCode,
      title,
      description,
      tags,
      status = 'Active',
      expiresAt,
      customDomain,
      categoryId
    } = req.body;
    
    // Validate required fields
    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: 'Original URL is required'
      });
    }
    
    // Generate a short code if not provided
    let finalShortCode = shortCode;
    if (!finalShortCode) {
      finalShortCode = generateShortCode();
      
      // Check if the generated short code already exists
      const existingLink = await prisma.link.findUnique({
        where: { shortCode: finalShortCode }
      });
      
      // If it exists, generate a new one
      if (existingLink) {
        finalShortCode = generateShortCode(8); // Try with a longer code
      }
    } else {
      // Check if the provided short code already exists
      const existingLink = await prisma.link.findUnique({
        where: { shortCode: finalShortCode }
      });
      
      if (existingLink) {
        return res.status(400).json({
          success: false,
          message: 'Short code already exists'
        });
      }
    }
    
    // Create the shortlink
    const newShortlink = await prisma.link.create({
      data: {
        originalUrl,
        shortCode: finalShortCode,
        title,
        description,
        tags: tags || [],
        status,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        customDomain,
        categoryId,
        companyId
      },
      include: {
        category: true
      }
    });
    
    // Create activity log
    await prisma.linkActivity.create({
      data: {
        linkId: newShortlink.id,
        action: 'created',
        userId: req.user.id,
        timestamp: new Date(),
        details: {
          originalUrl,
          shortCode: finalShortCode
        }
      }
    });
    
    res.status(201).json({
      success: true,
      data: newShortlink,
      message: 'Shortlink created successfully'
    });
  } catch (error) {
    console.error('Error creating shortlink:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shortlink',
      error: error.message
    });
  }
});

// Update a shortlink
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const {
      originalUrl,
      shortCode,
      title,
      description,
      tags,
      status,
      expiresAt,
      customDomain,
      categoryId
    } = req.body;
    
    // Check if the shortlink exists and belongs to the company
    const existingShortlink = await prisma.link.findFirst({
      where: {
        id,
        companyId
      }
    });
    
    if (!existingShortlink) {
      return res.status(404).json({
        success: false,
        message: 'Shortlink not found'
      });
    }
    
    // Check if the new short code already exists (if provided and different from current)
    if (shortCode && shortCode !== existingShortlink.shortCode) {
      const existingLink = await prisma.link.findUnique({
        where: { shortCode }
      });
      
      if (existingLink) {
        return res.status(400).json({
          success: false,
          message: 'Short code already exists'
        });
      }
    }
    
    // Update the shortlink
    const updatedShortlink = await prisma.link.update({
      where: { id },
      data: {
        originalUrl: originalUrl !== undefined ? originalUrl : undefined,
        shortCode: shortCode !== undefined ? shortCode : undefined,
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        tags: tags !== undefined ? tags : undefined,
        status: status !== undefined ? status : undefined,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
        customDomain: customDomain !== undefined ? customDomain : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined
      },
      include: {
        category: true
      }
    });
    
    // Create activity log
    await prisma.linkActivity.create({
      data: {
        linkId: id,
        action: 'updated',
        userId: req.user.id,
        timestamp: new Date(),
        details: req.body
      }
    });
    
    res.json({
      success: true,
      data: updatedShortlink,
      message: 'Shortlink updated successfully'
    });
  } catch (error) {
    console.error('Error updating shortlink:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shortlink',
      error: error.message
    });
  }
});

// Delete a shortlink
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    
    // Check if the shortlink exists and belongs to the company
    const existingShortlink = await prisma.link.findFirst({
      where: {
        id,
        companyId
      }
    });
    
    if (!existingShortlink) {
      return res.status(404).json({
        success: false,
        message: 'Shortlink not found'
      });
    }
    
    // Create activity log before deleting the link
    await prisma.linkActivity.create({
      data: {
        linkId: id,
        action: 'deleted',
        userId: req.user.id,
        timestamp: new Date(),
        details: {
          originalUrl: existingShortlink.originalUrl,
          shortCode: existingShortlink.shortCode
        }
      }
    });
    
    // Delete the shortlink
    await prisma.link.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Shortlink deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shortlink:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete shortlink',
      error: error.message
    });
  }
});

// Get analytics for a shortlink
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    
    // Check if the shortlink exists and belongs to the company
    const existingShortlink = await prisma.link.findFirst({
      where: {
        id,
        companyId
      }
    });
    
    if (!existingShortlink) {
      return res.status(404).json({
        success: false,
        message: 'Shortlink not found'
      });
    }
    
    // Build the where clause for clicks
    const whereClicks = { linkId: id };
    
    if (startDate && endDate) {
      whereClicks.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      whereClicks.timestamp = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      whereClicks.timestamp = {
        lte: new Date(endDate)
      };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get clicks with pagination
    const clicks = await prisma.linkClick.findMany({
      where: whereClicks,
      orderBy: {
        timestamp: 'desc'
      },
      skip,
      take: parseInt(limit)
    });
    
    // Get total count for pagination
    const totalCount = await prisma.linkClick.count({ where: whereClicks });
    
    // Get summary statistics
    const totalClicks = totalCount;
    
    // Get clicks by date (for charts)
    const clicksByDate = await prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date, 
        COUNT(*) as count
      FROM "LinkClick"
      WHERE "linkId" = ${id}
      GROUP BY DATE(timestamp)
      ORDER BY date
    `;
    
    // Get clicks by browser
    const clicksByBrowser = await prisma.$queryRaw`
      SELECT 
        browser, 
        COUNT(*) as count
      FROM "LinkClick"
      WHERE "linkId" = ${id}
      GROUP BY browser
      ORDER BY count DESC
    `;
    
    // Get clicks by device
    const clicksByDevice = await prisma.$queryRaw`
      SELECT 
        device, 
        COUNT(*) as count
      FROM "LinkClick"
      WHERE "linkId" = ${id}
      GROUP BY device
      ORDER BY count DESC
    `;
    
    // Get clicks by location
    const clicksByLocation = await prisma.$queryRaw`
      SELECT 
        location, 
        COUNT(*) as count
      FROM "LinkClick"
      WHERE "linkId" = ${id}
      GROUP BY location
      ORDER BY count DESC
    `;
    
    // Get clicks by referrer
    const clicksByReferrer = await prisma.$queryRaw`
      SELECT 
        referrer, 
        COUNT(*) as count
      FROM "LinkClick"
      WHERE "linkId" = ${id}
      GROUP BY referrer
      ORDER BY count DESC
    `;
    
    res.json({
      success: true,
      data: {
        shortlink: {
          id: existingShortlink.id,
          originalUrl: existingShortlink.originalUrl,
          shortCode: existingShortlink.shortCode,
          title: existingShortlink.title,
          createdAt: existingShortlink.createdAt
        },
        summary: {
          totalClicks
        },
        charts: {
          clicksByDate,
          clicksByBrowser,
          clicksByDevice,
          clicksByLocation,
          clicksByReferrer
        },
        clicks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching shortlink analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shortlink analytics',
      error: error.message
    });
  }
});

module.exports = router;
