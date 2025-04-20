const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../../middleware/auth');

const prisma = new PrismaClient();

// Get all QR codes for a company
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
        { content: { contains: search, mode: 'insensitive' } },
        { contentType: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get QR codes with pagination
    const qrCodes = await prisma.QRCode.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: {
            qrCodeClicks: true
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
    const totalCount = await prisma.QRCode.count({ where });
    
    // Format the response
    const formattedQRCodes = qrCodes.map(qrCode => ({
      id: qrCode.id,
      title: qrCode.title,
      content: qrCode.content,
      contentType: qrCode.contentType,
      config: qrCode.config,
      clicks: qrCode._count.qrCodeClicks,
      status: qrCode.status,
      expiresAt: qrCode.expiresAt,
      category: qrCode.category,
      createdAt: qrCode.createdAt,
      updatedAt: qrCode.updatedAt
    }));
    
    res.json({
      success: true,
      data: formattedQRCodes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR codes',
      error: error.message
    });
  }
});

// Get a QR code by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    
    const qrCode = await prisma.QRCode.findFirst({
      where: {
        id,
        companyId
      },
      include: {
        category: true,
        _count: {
          select: {
            qrCodeClicks: true
          }
        }
      }
    });
    
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }
    
    // Format the response
    const formattedQRCode = {
      id: qrCode.id,
      title: qrCode.title,
      content: qrCode.content,
      contentType: qrCode.contentType,
      config: qrCode.config,
      clicks: qrCode._count.qrCodeClicks,
      status: qrCode.status,
      expiresAt: qrCode.expiresAt,
      category: qrCode.category,
      createdAt: qrCode.createdAt,
      updatedAt: qrCode.updatedAt
    };
    
    res.json({
      success: true,
      data: formattedQRCode
    });
  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR code',
      error: error.message
    });
  }
});

// Create a new QR code
router.post('/', auth, async (req, res) => {
  try {
    const { companyId } = req.user;
    const {
      title,
      content,
      contentType,
      config,
      status = 'Active',
      expiresAt,
      categoryId
    } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }
    
    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: 'Content type is required'
      });
    }
    
    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'Configuration is required'
      });
    }
    
    // Create the QR code
    const newQRCode = await prisma.QRCode.create({
      data: {
        title,
        content,
        contentType,
        config,
        status,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        categoryId: categoryId || null,
        companyId
      },
      include: {
        category: true
      }
    });
    
    // Create activity log
    await prisma.QRCodeActivity.create({
      data: {
        qrCodeId: newQRCode.id,
        action: 'created',
        userId: req.user.id,
        timestamp: new Date(),
        details: {
          title,
          contentType
        }
      }
    });
    
    res.status(201).json({
      success: true,
      data: newQRCode,
      message: 'QR code created successfully'
    });
  } catch (error) {
    console.error('Error creating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create QR code',
      error: error.message
    });
  }
});

// Update a QR code
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const {
      title,
      content,
      contentType,
      config,
      status,
      expiresAt,
      categoryId
    } = req.body;
    
    // Check if the QR code exists and belongs to the company
    const existingQRCode = await prisma.QRCode.findFirst({
      where: {
        id,
        companyId
      }
    });
    
    if (!existingQRCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }
    
    // Update the QR code
    const updatedQRCode = await prisma.QRCode.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        content: content !== undefined ? content : undefined,
        contentType: contentType !== undefined ? contentType : undefined,
        config: config !== undefined ? config : undefined,
        status: status !== undefined ? status : undefined,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
        categoryId: categoryId !== undefined ? (categoryId || null) : undefined
      },
      include: {
        category: true
      }
    });
    
    // Create activity log
    await prisma.QRCodeActivity.create({
      data: {
        qrCodeId: id,
        action: 'updated',
        userId: req.user.id,
        timestamp: new Date(),
        details: req.body
      }
    });
    
    res.json({
      success: true,
      data: updatedQRCode,
      message: 'QR code updated successfully'
    });
  } catch (error) {
    console.error('Error updating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update QR code',
      error: error.message
    });
  }
});

// Delete a QR code
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    
    // Check if the QR code exists and belongs to the company
    const existingQRCode = await prisma.QRCode.findFirst({
      where: {
        id,
        companyId
      }
    });
    
    if (!existingQRCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }
    
    // Create activity log before deleting the QR code
    await prisma.QRCodeActivity.create({
      data: {
        qrCodeId: id,
        action: 'deleted',
        userId: req.user.id,
        timestamp: new Date(),
        details: {
          title: existingQRCode.title,
          contentType: existingQRCode.contentType
        }
      }
    });
    
    // Delete the QR code
    await prisma.QRCode.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'QR code deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete QR code',
      error: error.message
    });
  }
});

// Get analytics for a QR code
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    
    // Check if the QR code exists and belongs to the company
    const existingQRCode = await prisma.QRCode.findFirst({
      where: {
        id,
        companyId
      }
    });
    
    if (!existingQRCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }
    
    // Build the where clause for clicks
    const whereClicks = { qrCodeId: id };
    
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
    const clicks = await prisma.QRCodeClick.findMany({
      where: whereClicks,
      orderBy: {
        timestamp: 'desc'
      },
      skip,
      take: parseInt(limit)
    });
    
    // Get total count for pagination
    const totalCount = await prisma.QRCodeClick.count({ where: whereClicks });
    
    // Get summary statistics
    const totalClicks = totalCount;
    
    // Get clicks by date (for charts)
    const clicksByDate = await prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date, 
        COUNT(*) as count
      FROM "QRCodeClick"
      WHERE "qrCodeId" = ${id}
      GROUP BY DATE(timestamp)
      ORDER BY date
    `;
    
    // Get clicks by browser
    const clicksByBrowser = await prisma.$queryRaw`
      SELECT 
        browser, 
        COUNT(*) as count
      FROM "QRCodeClick"
      WHERE "qrCodeId" = ${id}
      GROUP BY browser
      ORDER BY count DESC
    `;
    
    // Get clicks by device
    const clicksByDevice = await prisma.$queryRaw`
      SELECT 
        device, 
        COUNT(*) as count
      FROM "QRCodeClick"
      WHERE "qrCodeId" = ${id}
      GROUP BY device
      ORDER BY count DESC
    `;
    
    // Get clicks by location
    const clicksByLocation = await prisma.$queryRaw`
      SELECT 
        location, 
        COUNT(*) as count
      FROM "QRCodeClick"
      WHERE "qrCodeId" = ${id}
      GROUP BY location
      ORDER BY count DESC
    `;
    
    // Get clicks by referrer
    const clicksByReferrer = await prisma.$queryRaw`
      SELECT 
        referrer, 
        COUNT(*) as count
      FROM "QRCodeClick"
      WHERE "qrCodeId" = ${id}
      GROUP BY referrer
      ORDER BY count DESC
    `;
    
    res.json({
      success: true,
      data: {
        qrCode: {
          id: existingQRCode.id,
          title: existingQRCode.title,
          contentType: existingQRCode.contentType,
          createdAt: existingQRCode.createdAt
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
    console.error('Error fetching QR code analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR code analytics',
      error: error.message
    });
  }
});

module.exports = router;
