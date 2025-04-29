const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../../middleware/auth');
const { successResponse, errorResponse, ErrorTypes, asyncHandler } = require('../../utils/responseUtils');

const prisma = new PrismaClient();

// Import route modules
const shortlinksRoutes = require('./shortlinks');
const digitallinksRoutes = require('./digitallinks');
const categoriesRoutes = require('./categories');

// Use route modules
router.use('/shortlinks', shortlinksRoutes);
router.use('/digitallinks', digitallinksRoutes);
router.use('/categories', categoriesRoutes);

// Get all links (both shortlinks and digitallinks) for a company
router.get('/', auth, asyncHandler(async (req, res) => {
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
          activities: true
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
    clicks: link._count.activities,
    status: link.status,
    expiresAt: link.expiresAt,
    category: link.category,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt
  }));
  
  // Combine and sort by creation date
  const allLinks = [
    ...formattedShortlinks, 
    ...formattedDigitallinks
  ].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  res.json(successResponse(allLinks));
}));

// Get dashboard statistics
router.get('/dashboard', auth, asyncHandler(async (req, res) => {
  const { companyId } = req.user;
  
  // Get total shortlinks count
  const shortlinksCount = await prisma.link.count({
    where: { companyId }
  });
  
  // Get total digitallinks count
  const digitallinksCount = await prisma.digitalLink.count({
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
  const digitallinksClicks = await prisma.digitalLinkActivity.count({
    where: {
      action: 'click',
      companyId
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
  
  const recentDigitallinkClicks = await prisma.digitalLinkActivity.findMany({
    where: {
      action: 'click',
      companyId
    },
    include: {
      link: {
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
    linkId: click.linkId,
    linkTitle: click.link.title,
    linkUrl: click.link.gs1Url,
    gs1Key: click.link.gs1Key,
    customUrl: click.link.customUrl,
    ipAddress: click.details?.ipAddress,
    userAgent: click.details?.userAgent,
    referrer: click.details?.referrer,
    location: click.details?.location,
    device: click.details?.device,
    browser: click.details?.browser,
    timestamp: click.timestamp
  }));
  
  // Combine and sort by timestamp
  const recentActivity = [
    ...formattedRecentShortlinkClicks, 
    ...formattedRecentDigitallinkClicks
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
          activities: true
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
    clicks: link._count.activities,
    createdAt: link.createdAt
  }));
  
  // Combine and sort by clicks
  const topLinks = [
    ...formattedTopShortlinks, 
    ...formattedTopDigitallinks
  ].sort((a, b) => 
    b.clicks - a.clicks
  ).slice(0, 5);
  
  const dashboardData = {
    totalLinks: shortlinksCount + digitallinksCount,
    shortlinksCount,
    digitallinksCount,
    totalClicks: shortlinksClicks + digitallinksClicks,
    shortlinksClicks,
    digitallinksClicks,
    recentActivity,
    topLinks
  };
  
  res.json(successResponse(dashboardData));
}));

module.exports = router;
