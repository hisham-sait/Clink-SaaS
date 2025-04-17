const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../../middleware/auth');

const prisma = new PrismaClient();

// Format GS1 Digital Link URL
function formatGS1Url(gs1Key, gs1KeyType) {
  // Map GS1 key types to their corresponding application identifiers
  const gs1KeyTypeToAI = {
    'GTIN': '01',
    'GLN': '414',
    'SSCC': '00',
    'GRAI': '8003',
    'GIAI': '8004',
    'GSRN': '8018',
    'GDTI': '253',
    'GINC': '401',
    'GSIN': '402'
  };
  
  // Get the application identifier for the given key type
  const ai = gs1KeyTypeToAI[gs1KeyType];
  
  if (!ai) {
    throw new Error(`Invalid GS1 key type: ${gs1KeyType}`);
  }
  
  // Format according to GS1 Digital Link standard
  // Example: https://id.gs1.org/01/12345678901234
  return `${ai}/${gs1Key}`;
}

// Get all digitallinks for a company
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
        { gs1Key: { contains: search, mode: 'insensitive' } },
        { gs1KeyType: { contains: search, mode: 'insensitive' } },
        { gs1Url: { contains: search, mode: 'insensitive' } },
        { customUrl: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get digitallinks with pagination
    const digitallinks = await prisma.digitalLink.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: {
            digitalLinkClicks: true
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
    const totalCount = await prisma.digitalLink.count({ where });
    
    // Format the response
    const formattedDigitallinks = digitallinks.map(link => ({
      id: link.id,
      gs1Key: link.gs1Key,
      gs1KeyType: link.gs1KeyType,
      gs1Url: link.gs1Url,
      redirectType: link.redirectType,
      customUrl: link.customUrl,
      productId: link.productId,
      title: link.title,
      description: link.description,
      tags: link.tags,
      clicks: link._count.digitalLinkClicks,
      status: link.status,
      expiresAt: link.expiresAt,
      category: link.category,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt
    }));
    
    res.json({
      success: true,
      data: formattedDigitallinks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching digitallinks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch digitallinks',
      error: error.message
    });
  }
});

// Get a digitallink by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    
    const digitallink = await prisma.digitalLink.findFirst({
      where: {
        id,
        companyId
      },
      include: {
        category: true,
        _count: {
          select: {
            digitalLinkClicks: true
          }
        }
      }
    });
    
    if (!digitallink) {
      return res.status(404).json({
        success: false,
        message: 'Digital link not found'
      });
    }
    
    // Format the response
    const formattedDigitallink = {
      id: digitallink.id,
      gs1Key: digitallink.gs1Key,
      gs1KeyType: digitallink.gs1KeyType,
      gs1Url: digitallink.gs1Url,
      redirectType: digitallink.redirectType,
      customUrl: digitallink.customUrl,
      productId: digitallink.productId,
      title: digitallink.title,
      description: digitallink.description,
      tags: digitallink.tags,
      clicks: digitallink._count.digitalLinkClicks,
      status: digitallink.status,
      expiresAt: digitallink.expiresAt,
      category: digitallink.category,
      createdAt: digitallink.createdAt,
      updatedAt: digitallink.updatedAt
    };
    
    res.json({
      success: true,
      data: formattedDigitallink
    });
  } catch (error) {
    console.error('Error fetching digitallink:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch digitallink',
      error: error.message
    });
  }
});

// Create a new digitallink
router.post('/', auth, async (req, res) => {
  try {
    const { companyId } = req.user;
    const {
      gs1Key,
      gs1KeyType,
      redirectType,
      customUrl,
      productId,
      title,
      description,
      tags,
      status = 'Active',
      expiresAt,
      categoryId
    } = req.body;
    
    // Validate required fields
    if (!gs1Key) {
      return res.status(400).json({
        success: false,
        message: 'GS1 Key is required'
      });
    }
    
    if (!gs1KeyType) {
      return res.status(400).json({
        success: false,
        message: 'GS1 Key Type is required'
      });
    }
    
    if (!redirectType) {
      return res.status(400).json({
        success: false,
        message: 'Redirect Type is required'
      });
    }
    
    if (redirectType === 'custom' && !customUrl) {
      return res.status(400).json({
        success: false,
        message: 'Custom URL is required for custom redirect type'
      });
    }
    
    if (redirectType === 'standard' && !productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required for standard redirect type'
      });
    }
    
    // Format the GS1 URL
    const gs1Url = formatGS1Url(gs1Key, gs1KeyType);
    
    // Check if the GS1 URL already exists
    const existingDigitallink = await prisma.digitalLink.findUnique({
      where: { gs1Url }
    });
    
    if (existingDigitallink) {
      return res.status(400).json({
        success: false,
        message: 'GS1 URL already exists'
      });
    }
    
    // Create the digitallink
    const newDigitallink = await prisma.digitalLink.create({
      data: {
        gs1Key,
        gs1KeyType,
        gs1Url,
        redirectType,
        customUrl: redirectType === 'custom' ? customUrl : null,
        productId: redirectType === 'standard' ? productId : null,
        title,
        description,
        tags: tags || [],
        status,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        categoryId,
        companyId
      },
      include: {
        category: true
      }
    });
    
    // Create activity log
    await prisma.digitalLinkActivity.create({
      data: {
        digitalLinkId: newDigitallink.id,
        action: 'created',
        userId: req.user.id,
        timestamp: new Date(),
        details: {
          gs1Key,
          gs1KeyType,
          gs1Url,
          redirectType
        }
      }
    });
    
    res.status(201).json({
      success: true,
      data: newDigitallink,
      message: 'Digital link created successfully'
    });
  } catch (error) {
    console.error('Error creating digitallink:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create digitallink',
      error: error.message
    });
  }
});

// Update a digitallink
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const {
      gs1Key,
      gs1KeyType,
      redirectType,
      customUrl,
      productId,
      title,
      description,
      tags,
      status,
      expiresAt,
      categoryId
    } = req.body;
    
    // Check if the digitallink exists and belongs to the company
    const existingDigitallink = await prisma.digitalLink.findFirst({
      where: {
        id,
        companyId
      }
    });
    
    if (!existingDigitallink) {
      return res.status(404).json({
        success: false,
        message: 'Digital link not found'
      });
    }
    
    // Check if GS1 Key or Key Type is being updated
    let gs1Url = existingDigitallink.gs1Url;
    if (gs1Key && gs1KeyType && (gs1Key !== existingDigitallink.gs1Key || gs1KeyType !== existingDigitallink.gs1KeyType)) {
      gs1Url = formatGS1Url(gs1Key, gs1KeyType);
      
      // Check if the new GS1 URL already exists
      const existingUrl = await prisma.digitalLink.findFirst({
        where: {
          gs1Url,
          id: { not: id }
        }
      });
      
      if (existingUrl) {
        return res.status(400).json({
          success: false,
          message: 'GS1 URL already exists'
        });
      }
    }
    
    // Validate redirect type and related fields
    if (redirectType === 'custom' && !customUrl && !existingDigitallink.customUrl) {
      return res.status(400).json({
        success: false,
        message: 'Custom URL is required for custom redirect type'
      });
    }
    
    if (redirectType === 'standard' && !productId && !existingDigitallink.productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required for standard redirect type'
      });
    }
    
    // Update the digitallink
    const updatedDigitallink = await prisma.digitalLink.update({
      where: { id },
      data: {
        gs1Key: gs1Key !== undefined ? gs1Key : undefined,
        gs1KeyType: gs1KeyType !== undefined ? gs1KeyType : undefined,
        gs1Url: gs1Key && gs1KeyType ? gs1Url : undefined,
        redirectType: redirectType !== undefined ? redirectType : undefined,
        customUrl: customUrl !== undefined ? customUrl : undefined,
        productId: productId !== undefined ? productId : undefined,
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        tags: tags !== undefined ? tags : undefined,
        status: status !== undefined ? status : undefined,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined
      },
      include: {
        category: true
      }
    });
    
    // Create activity log
    await prisma.digitalLinkActivity.create({
      data: {
        digitalLinkId: id,
        action: 'updated',
        userId: req.user.id,
        timestamp: new Date(),
        details: req.body
      }
    });
    
    res.json({
      success: true,
      data: updatedDigitallink,
      message: 'Digital link updated successfully'
    });
  } catch (error) {
    console.error('Error updating digitallink:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update digitallink',
      error: error.message
    });
  }
});

// Delete a digitallink
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    
    // Check if the digitallink exists and belongs to the company
    const existingDigitallink = await prisma.digitalLink.findFirst({
      where: {
        id,
        companyId
      }
    });
    
    if (!existingDigitallink) {
      return res.status(404).json({
        success: false,
        message: 'Digital link not found'
      });
    }
    
    // Create activity log before deleting the link
    await prisma.digitalLinkActivity.create({
      data: {
        digitalLinkId: id,
        action: 'deleted',
        userId: req.user.id,
        timestamp: new Date(),
        details: {
          gs1Key: existingDigitallink.gs1Key,
          gs1KeyType: existingDigitallink.gs1KeyType,
          gs1Url: existingDigitallink.gs1Url
        }
      }
    });
    
    // Delete the digitallink
    await prisma.digitalLink.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Digital link deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting digitallink:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete digitallink',
      error: error.message
    });
  }
});

// Get analytics for a digitallink
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    
    // Check if the digitallink exists and belongs to the company
    const existingDigitallink = await prisma.digitalLink.findFirst({
      where: {
        id,
        companyId
      }
    });
    
    if (!existingDigitallink) {
      return res.status(404).json({
        success: false,
        message: 'Digital link not found'
      });
    }
    
    // Build the where clause for clicks
    const whereClicks = { digitalLinkId: id };
    
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
    const clicks = await prisma.digitalLinkClick.findMany({
      where: whereClicks,
      orderBy: {
        timestamp: 'desc'
      },
      skip,
      take: parseInt(limit)
    });
    
    // Get total count for pagination
    const totalCount = await prisma.digitalLinkClick.count({ where: whereClicks });
    
    // Get summary statistics
    const totalClicks = totalCount;
    
    // Get clicks by date (for charts)
    const clicksByDate = await prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date, 
        COUNT(*) as count
      FROM "DigitalLinkClick"
      WHERE "digitalLinkId" = ${id}
      GROUP BY DATE(timestamp)
      ORDER BY date
    `;
    
    // Get clicks by browser
    const clicksByBrowser = await prisma.$queryRaw`
      SELECT 
        browser, 
        COUNT(*) as count
      FROM "DigitalLinkClick"
      WHERE "digitalLinkId" = ${id}
      GROUP BY browser
      ORDER BY count DESC
    `;
    
    // Get clicks by device
    const clicksByDevice = await prisma.$queryRaw`
      SELECT 
        device, 
        COUNT(*) as count
      FROM "DigitalLinkClick"
      WHERE "digitalLinkId" = ${id}
      GROUP BY device
      ORDER BY count DESC
    `;
    
    // Get clicks by location
    const clicksByLocation = await prisma.$queryRaw`
      SELECT 
        location, 
        COUNT(*) as count
      FROM "DigitalLinkClick"
      WHERE "digitalLinkId" = ${id}
      GROUP BY location
      ORDER BY count DESC
    `;
    
    // Get clicks by referrer
    const clicksByReferrer = await prisma.$queryRaw`
      SELECT 
        referrer, 
        COUNT(*) as count
      FROM "DigitalLinkClick"
      WHERE "digitalLinkId" = ${id}
      GROUP BY referrer
      ORDER BY count DESC
    `;
    
    res.json({
      success: true,
      data: {
        digitallink: {
          id: existingDigitallink.id,
          gs1Key: existingDigitallink.gs1Key,
          gs1KeyType: existingDigitallink.gs1KeyType,
          gs1Url: existingDigitallink.gs1Url,
          redirectType: existingDigitallink.redirectType,
          customUrl: existingDigitallink.customUrl,
          productId: existingDigitallink.productId,
          title: existingDigitallink.title,
          createdAt: existingDigitallink.createdAt
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
    console.error('Error fetching digitallink analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch digitallink analytics',
      error: error.message
    });
  }
});

module.exports = router;
