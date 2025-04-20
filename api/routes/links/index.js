const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../../middleware/auth');

const prisma = new PrismaClient();

// Import route modules
const shortlinksRoutes = require('./shortlinks');
const digitallinksRoutes = require('./digitallinks');
const categoriesRoutes = require('./categories');
const qrcodesRoutes = require('./qrcodes');

// Use route modules
router.use('/shortlinks', shortlinksRoutes);
router.use('/digitallinks', digitallinksRoutes);
router.use('/categories', categoriesRoutes);
router.use('/qrcodes', qrcodesRoutes);

// Get all links (both shortlinks and digitallinks) for a company
router.get('/', auth, async (req, res) => {
  try {
    const { companyId } = req.user;
    
    // Get shortlinks
    const shortlinks = await prisma.link.findMany({
      where: { companyId },
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
      }
    });
    
    // Get digitallinks
    const digitallinks = await prisma.digitalLink.findMany({
      where: { companyId },
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
      }
    });
    
    // Get QR codes
    const qrCodes = await prisma.qRCode.findMany({
      where: { companyId },
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
      }
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
      clicks: link._count.linkClicks,
      status: link.status,
      expiresAt: link.expiresAt,
      customDomain: link.customDomain,
      category: link.category,
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
      clicks: link._count.digitalLinkClicks,
      status: link.status,
      expiresAt: link.expiresAt,
      category: link.category,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt
    }));
    
    const formattedQRCodes = qrCodes.map(qrCode => ({
      id: qrCode.id,
      type: 'qrcode',
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
    
    // Combine and sort by creation date
    const allLinks = [
      ...formattedShortlinks, 
      ...formattedDigitallinks,
      ...formattedQRCodes
    ].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    res.json({
      success: true,
      data: allLinks
    });
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch links',
      error: error.message
    });
  }
});

// Get dashboard statistics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { companyId } = req.user;
    
    // Get total shortlinks count
    const shortlinksCount = await prisma.link.count({
      where: { companyId }
    });
    
    // Get total digitallinks count
    const digitallinksCount = await prisma.digitalLink.count({
      where: { companyId }
    });
    
    // Get total QR codes count
    const qrCodesCount = await prisma.qRCode.count({
      where: { companyId }
    });
    
    // Get total clicks for shortlinks
    const shortlinksClicks = await prisma.linkClick.count({
      where: {
        link: {
          companyId
        }
      }
    });
    
    // Get total clicks for digitallinks
    const digitallinksClicks = await prisma.digitalLinkClick.count({
      where: {
        digitalLink: {
          companyId
        }
      }
    });
    
    // Get total clicks for QR codes
    const qrCodesClicks = await prisma.qRCodeClick.count({
      where: {
        qrCode: {
          companyId
        }
      }
    });
    
    // Get recent activity (last 10 clicks)
    const recentShortlinkClicks = await prisma.linkClick.findMany({
      where: {
        link: {
          companyId
        }
      },
      include: {
        link: {
          select: {
            shortCode: true,
            title: true,
            originalUrl: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 5
    });
    
    const recentDigitallinkClicks = await prisma.digitalLinkClick.findMany({
      where: {
        digitalLink: {
          companyId
        }
      },
      include: {
        digitalLink: {
          select: {
            gs1Url: true,
            title: true,
            gs1Key: true,
            customUrl: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 5
    });
    
    const recentQRCodeClicks = await prisma.qRCodeClick.findMany({
      where: {
        qrCode: {
          companyId
        }
      },
      include: {
        qrCode: {
          select: {
            title: true,
            content: true,
            contentType: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 5
    });
    
    // Format recent activity
    const formattedRecentShortlinkClicks = recentShortlinkClicks.map(click => ({
      id: click.id,
      type: 'shortlink',
      linkId: click.linkId,
      linkTitle: click.link.title,
      linkUrl: click.link.shortCode,
      originalUrl: click.link.originalUrl,
      ipAddress: click.ipAddress,
      userAgent: click.userAgent,
      referrer: click.referrer,
      location: click.location,
      device: click.device,
      browser: click.browser,
      timestamp: click.timestamp
    }));
    
    const formattedRecentDigitallinkClicks = recentDigitallinkClicks.map(click => ({
      id: click.id,
      type: 'digitallink',
      linkId: click.digitalLinkId,
      linkTitle: click.digitalLink.title,
      linkUrl: click.digitalLink.gs1Url,
      gs1Key: click.digitalLink.gs1Key,
      customUrl: click.digitalLink.customUrl,
      ipAddress: click.ipAddress,
      userAgent: click.userAgent,
      referrer: click.referrer,
      location: click.location,
      device: click.device,
      browser: click.browser,
      timestamp: click.timestamp
    }));
    
    const formattedRecentQRCodeClicks = recentQRCodeClicks.map(click => ({
      id: click.id,
      type: 'qrcode',
      linkId: click.qrCodeId,
      linkTitle: click.qrCode.title,
      contentType: click.qrCode.contentType,
      content: click.qrCode.content,
      ipAddress: click.ipAddress,
      userAgent: click.userAgent,
      referrer: click.referrer,
      location: click.location,
      device: click.device,
      browser: click.browser,
      timestamp: click.timestamp
    }));
    
    // Combine and sort by timestamp
    const recentActivity = [
      ...formattedRecentShortlinkClicks, 
      ...formattedRecentDigitallinkClicks,
      ...formattedRecentQRCodeClicks
    ].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    ).slice(0, 10);
    
    // Get top performing links (most clicks)
    const topShortlinks = await prisma.link.findMany({
      where: { companyId },
      include: {
        _count: {
          select: {
            linkClicks: true
          }
        }
      },
      orderBy: {
        clicks: 'desc'
      },
      take: 5
    });
    
    const topDigitallinks = await prisma.digitalLink.findMany({
      where: { companyId },
      include: {
        _count: {
          select: {
            digitalLinkClicks: true
          }
        }
      },
      orderBy: {
        clicks: 'desc'
      },
      take: 5
    });
    
    const topQRCodes = await prisma.qRCode.findMany({
      where: { companyId },
      include: {
        _count: {
          select: {
            qrCodeClicks: true
          }
        }
      },
      orderBy: {
        clicks: 'desc'
      },
      take: 5
    });
    
    // Format top performing links
    const formattedTopShortlinks = topShortlinks.map(link => ({
      id: link.id,
      type: 'shortlink',
      title: link.title,
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
      clicks: link._count.linkClicks,
      createdAt: link.createdAt
    }));
    
    const formattedTopDigitallinks = topDigitallinks.map(link => ({
      id: link.id,
      type: 'digitallink',
      title: link.title,
      gs1Url: link.gs1Url,
      gs1Key: link.gs1Key,
      redirectType: link.redirectType,
      customUrl: link.customUrl,
      clicks: link._count.digitalLinkClicks,
      createdAt: link.createdAt
    }));
    
    const formattedTopQRCodes = topQRCodes.map(qrCode => ({
      id: qrCode.id,
      type: 'qrcode',
      title: qrCode.title,
      contentType: qrCode.contentType,
      content: qrCode.content,
      clicks: qrCode._count.qrCodeClicks,
      createdAt: qrCode.createdAt
    }));
    
    // Combine and sort by clicks
    const topLinks = [
      ...formattedTopShortlinks, 
      ...formattedTopDigitallinks,
      ...formattedTopQRCodes
    ].sort((a, b) => 
      b.clicks - a.clicks
    ).slice(0, 5);
    
    res.json({
      success: true,
      data: {
        totalLinks: shortlinksCount + digitallinksCount + qrCodesCount,
        shortlinksCount,
        digitallinksCount,
        qrCodesCount,
        totalClicks: shortlinksClicks + digitallinksClicks + qrCodesClicks,
        shortlinksClicks,
        digitallinksClicks,
        qrCodesClicks,
        recentActivity,
        topLinks
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

module.exports = router;
