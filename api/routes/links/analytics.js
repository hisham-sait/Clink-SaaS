const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../../middleware/auth');
const { successResponse, errorResponse, ErrorTypes, asyncHandler } = require('../../utils/responseUtils');

const prisma = new PrismaClient();

// Get overall analytics for all links
router.get('/', auth, asyncHandler(async (req, res) => {
    const { companyId } = req.user;
    const { startDate, endDate } = req.query;
    
    // Build the where clause for clicks
    const whereShortlinkClicks = {
      link: {
        companyId
      }
    };
    
    const whereDigitallinkClicks = {
      digitalLink: {
        companyId
      }
    };
    
    if (startDate && endDate) {
      whereShortlinkClicks.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
      
      whereDigitallinkClicks.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      whereShortlinkClicks.timestamp = {
        gte: new Date(startDate)
      };
      
      whereDigitallinkClicks.timestamp = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      whereShortlinkClicks.timestamp = {
        lte: new Date(endDate)
      };
      
      whereDigitallinkClicks.timestamp = {
        lte: new Date(endDate)
      };
    }
    
    // Get total counts
    const totalShortlinks = await prisma.link.count({
      where: { companyId }
    });
    
    const totalDigitallinks = await prisma.digitalLink.count({
      where: { companyId }
    });
    
    const totalShortlinkClicks = await prisma.linkClick.count({
      where: whereShortlinkClicks
    });
    
    const totalDigitallinkClicks = await prisma.digitalLinkActivity.count({
      where: {
        ...whereDigitallinkClicks,
        action: 'click'
      }
    });
    
    // Get clicks by date (for charts)
    const shortlinkClicksByDate = await prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date, 
        COUNT(*) as count
      FROM "LinkClick"
      JOIN "Link" ON "LinkClick"."linkId" = "Link"."id"
      WHERE "Link"."companyId" = ${companyId}
      ${startDate ? `AND "LinkClick"."timestamp" >= '${startDate}'` : ''}
      ${endDate ? `AND "LinkClick"."timestamp" <= '${endDate}'` : ''}
      GROUP BY DATE(timestamp)
      ORDER BY date
    `;
    
    const digitallinkClicksByDate = await prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date, 
        COUNT(*) as count
      FROM "DigitalLinkActivity"
      JOIN "DigitalLink" ON "DigitalLinkActivity"."linkId" = "DigitalLink"."id"
      WHERE "DigitalLink"."companyId" = ${companyId}
      AND "DigitalLinkActivity"."action" = 'click'
      ${startDate ? `AND "DigitalLinkActivity"."timestamp" >= '${startDate}'` : ''}
      ${endDate ? `AND "DigitalLinkActivity"."timestamp" <= '${endDate}'` : ''}
      GROUP BY DATE(timestamp)
      ORDER BY date
    `;
    
    // Combine clicks by date
    const clicksByDate = {};
    
    shortlinkClicksByDate.forEach(item => {
      const dateStr = item.date.toISOString().split('T')[0];
      if (!clicksByDate[dateStr]) {
        clicksByDate[dateStr] = { date: dateStr, shortlinkClicks: 0, digitallinkClicks: 0, totalClicks: 0 };
      }
      clicksByDate[dateStr].shortlinkClicks = parseInt(item.count);
      clicksByDate[dateStr].totalClicks += parseInt(item.count);
    });
    
    digitallinkClicksByDate.forEach(item => {
      const dateStr = item.date.toISOString().split('T')[0];
      if (!clicksByDate[dateStr]) {
        clicksByDate[dateStr] = { date: dateStr, shortlinkClicks: 0, digitallinkClicks: 0, totalClicks: 0 };
      }
      clicksByDate[dateStr].digitallinkClicks = parseInt(item.count);
      clicksByDate[dateStr].totalClicks += parseInt(item.count);
    });
    
    const combinedClicksByDate = Object.values(clicksByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Get clicks by browser
    const shortlinkClicksByBrowser = await prisma.$queryRaw`
      SELECT 
        browser, 
        COUNT(*) as count
      FROM "LinkClick"
      JOIN "Link" ON "LinkClick"."linkId" = "Link"."id"
      WHERE "Link"."companyId" = ${companyId}
      ${startDate ? `AND "LinkClick"."timestamp" >= '${startDate}'` : ''}
      ${endDate ? `AND "LinkClick"."timestamp" <= '${endDate}'` : ''}
      GROUP BY browser
      ORDER BY count DESC
    `;
    
    const digitallinkClicksByBrowser = await prisma.$queryRaw`
      SELECT 
        details->>'browser' as browser, 
        COUNT(*) as count
      FROM "DigitalLinkActivity"
      JOIN "DigitalLink" ON "DigitalLinkActivity"."linkId" = "DigitalLink"."id"
      WHERE "DigitalLink"."companyId" = ${companyId}
      AND "DigitalLinkActivity"."action" = 'click'
      ${startDate ? `AND "DigitalLinkActivity"."timestamp" >= '${startDate}'` : ''}
      ${endDate ? `AND "DigitalLinkActivity"."timestamp" <= '${endDate}'` : ''}
      GROUP BY details->>'browser'
      ORDER BY count DESC
    `;
    
    // Combine clicks by browser
    const clicksByBrowser = {};
    
    shortlinkClicksByBrowser.forEach(item => {
      const browser = item.browser || 'Unknown';
      if (!clicksByBrowser[browser]) {
        clicksByBrowser[browser] = { browser, count: 0 };
      }
      clicksByBrowser[browser].count += parseInt(item.count);
    });
    
    digitallinkClicksByBrowser.forEach(item => {
      const browser = item.browser || 'Unknown';
      if (!clicksByBrowser[browser]) {
        clicksByBrowser[browser] = { browser, count: 0 };
      }
      clicksByBrowser[browser].count += parseInt(item.count);
    });
    
    const combinedClicksByBrowser = Object.values(clicksByBrowser).sort((a, b) => 
      b.count - a.count
    );
    
    // Get clicks by device
    const shortlinkClicksByDevice = await prisma.$queryRaw`
      SELECT 
        device, 
        COUNT(*) as count
      FROM "LinkClick"
      JOIN "Link" ON "LinkClick"."linkId" = "Link"."id"
      WHERE "Link"."companyId" = ${companyId}
      ${startDate ? `AND "LinkClick"."timestamp" >= '${startDate}'` : ''}
      ${endDate ? `AND "LinkClick"."timestamp" <= '${endDate}'` : ''}
      GROUP BY device
      ORDER BY count DESC
    `;
    
    const digitallinkClicksByDevice = await prisma.$queryRaw`
      SELECT 
        details->>'device' as device, 
        COUNT(*) as count
      FROM "DigitalLinkActivity"
      JOIN "DigitalLink" ON "DigitalLinkActivity"."linkId" = "DigitalLink"."id"
      WHERE "DigitalLink"."companyId" = ${companyId}
      AND "DigitalLinkActivity"."action" = 'click'
      ${startDate ? `AND "DigitalLinkActivity"."timestamp" >= '${startDate}'` : ''}
      ${endDate ? `AND "DigitalLinkActivity"."timestamp" <= '${endDate}'` : ''}
      GROUP BY details->>'device'
      ORDER BY count DESC
    `;
    
    // Combine clicks by device
    const clicksByDevice = {};
    
    shortlinkClicksByDevice.forEach(item => {
      const device = item.device || 'Unknown';
      if (!clicksByDevice[device]) {
        clicksByDevice[device] = { device, count: 0 };
      }
      clicksByDevice[device].count += parseInt(item.count);
    });
    
    digitallinkClicksByDevice.forEach(item => {
      const device = item.device || 'Unknown';
      if (!clicksByDevice[device]) {
        clicksByDevice[device] = { device, count: 0 };
      }
      clicksByDevice[device].count += parseInt(item.count);
    });
    
    const combinedClicksByDevice = Object.values(clicksByDevice).sort((a, b) => 
      b.count - a.count
    );
    
    // Get clicks by location
    const shortlinkClicksByLocation = await prisma.$queryRaw`
      SELECT 
        location, 
        COUNT(*) as count
      FROM "LinkClick"
      JOIN "Link" ON "LinkClick"."linkId" = "Link"."id"
      WHERE "Link"."companyId" = ${companyId}
      ${startDate ? `AND "LinkClick"."timestamp" >= '${startDate}'` : ''}
      ${endDate ? `AND "LinkClick"."timestamp" <= '${endDate}'` : ''}
      GROUP BY location
      ORDER BY count DESC
    `;
    
    const digitallinkClicksByLocation = await prisma.$queryRaw`
      SELECT 
        details->>'location' as location, 
        COUNT(*) as count
      FROM "DigitalLinkActivity"
      JOIN "DigitalLink" ON "DigitalLinkActivity"."linkId" = "DigitalLink"."id"
      WHERE "DigitalLink"."companyId" = ${companyId}
      AND "DigitalLinkActivity"."action" = 'click'
      ${startDate ? `AND "DigitalLinkActivity"."timestamp" >= '${startDate}'` : ''}
      ${endDate ? `AND "DigitalLinkActivity"."timestamp" <= '${endDate}'` : ''}
      GROUP BY details->>'location'
      ORDER BY count DESC
    `;
    
    // Combine clicks by location
    const clicksByLocation = {};
    
    shortlinkClicksByLocation.forEach(item => {
      const location = item.location || 'Unknown';
      if (!clicksByLocation[location]) {
        clicksByLocation[location] = { location, count: 0 };
      }
      clicksByLocation[location].count += parseInt(item.count);
    });
    
    digitallinkClicksByLocation.forEach(item => {
      const location = item.location || 'Unknown';
      if (!clicksByLocation[location]) {
        clicksByLocation[location] = { location, count: 0 };
      }
      clicksByLocation[location].count += parseInt(item.count);
    });
    
    const combinedClicksByLocation = Object.values(clicksByLocation).sort((a, b) => 
      b.count - a.count
    );
    
    // Get top performing links
    const topShortlinks = await prisma.link.findMany({
      where: { 
        companyId,
        ...(startDate && {
          linkClicks: {
            some: {
              timestamp: { gte: new Date(startDate) }
            }
          }
        }),
        ...(endDate && {
          linkClicks: {
            some: {
              timestamp: { lte: new Date(endDate) }
            }
          }
        })
      },
      include: {
        _count: {
          select: {
            linkClicks: {
              where: {
                ...(startDate && { timestamp: { gte: new Date(startDate) } }),
                ...(endDate && { timestamp: { lte: new Date(endDate) } })
              }
            }
          }
        }
      },
      orderBy: {
        clicks: 'desc'
      },
      take: 5
    });
    
    const topDigitallinks = await prisma.digitalLink.findMany({
      where: { 
        companyId,
        ...(startDate && {
          activities: {
            some: {
              action: 'click',
              timestamp: { gte: new Date(startDate) }
            }
          }
        }),
        ...(endDate && {
          activities: {
            some: {
              action: 'click',
              timestamp: { lte: new Date(endDate) }
            }
          }
        })
      },
      include: {
        _count: {
          select: {
            activities: {
              where: {
                action: 'click',
                ...(startDate && { timestamp: { gte: new Date(startDate) } }),
                ...(endDate && { timestamp: { lte: new Date(endDate) } })
              }
            }
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
      title: link.title || link.shortCode,
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
      clicks: link._count.linkClicks,
      createdAt: link.createdAt
    }));
    
    const formattedTopDigitallinks = topDigitallinks.map(link => ({
      id: link.id,
      type: 'digitallink',
      title: link.title || link.gs1Key,
      gs1Url: link.gs1Url,
      gs1Key: link.gs1Key,
      redirectType: link.redirectType,
      customUrl: link.customUrl,
      clicks: link._count.activities,
      createdAt: link.createdAt
    }));
    
    // Combine and sort by clicks
    const topLinks = [...formattedTopShortlinks, ...formattedTopDigitallinks].sort((a, b) => 
      b.clicks - a.clicks
    ).slice(0, 10);
    
    // Get recent clicks
    const recentShortlinkClicks = await prisma.linkClick.findMany({
      where: whereShortlinkClicks,
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
      take: 10
    });
    
    const recentDigitallinkClicks = await prisma.digitalLinkActivity.findMany({
      where: {
        ...whereDigitallinkClicks,
        action: 'click'
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
      take: 10
    });
    
    // Format recent clicks
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
    const recentClicks = [...formattedRecentShortlinkClicks, ...formattedRecentDigitallinkClicks].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    ).slice(0, 10);
    
    const analyticsData = {
      summary: {
        totalLinks: totalShortlinks + totalDigitallinks,
        totalShortlinks,
        totalDigitallinks,
        totalClicks: totalShortlinkClicks + totalDigitallinkClicks,
        totalShortlinkClicks,
        totalDigitallinkClicks
      },
      charts: {
        clicksByDate: combinedClicksByDate,
        clicksByBrowser: combinedClicksByBrowser,
        clicksByDevice: combinedClicksByDevice,
        clicksByLocation: combinedClicksByLocation
      },
      topLinks,
      recentClicks
    };
    
    res.json(successResponse(analyticsData));
}));

// Get recent clicks for all links
router.get('/recent-clicks', auth, asyncHandler(async (req, res) => {
    const { companyId } = req.user;
    const { page = 1, limit = 10 } = req.query;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = parseInt(limit) / 2; // Split between shortlinks and digitallinks
    
    // Get recent shortlink clicks
    const shortlinkClicks = await prisma.linkClick.findMany({
      where: {
        link: {
          companyId
        }
      },
      include: {
        link: {
          select: {
            id: true,
            shortCode: true,
            title: true,
            originalUrl: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      skip,
      take
    });
    
    // Get recent digitallink clicks
    const digitallinkClicks = await prisma.digitalLinkActivity.findMany({
      where: {
        action: 'click',
        companyId
      },
      include: {
        link: {
          select: {
            id: true,
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
      skip,
      take
    });
    
    // Format the clicks
    const formattedShortlinkClicks = shortlinkClicks.map(click => ({
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
    
    const formattedDigitallinkClicks = digitallinkClicks.map(click => ({
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
    const allClicks = [...formattedShortlinkClicks, ...formattedDigitallinkClicks].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Get total counts for pagination
    const totalShortlinkClicks = await prisma.linkClick.count({
      where: {
        link: {
          companyId
        }
      }
    });
    
    const totalDigitallinkClicks = await prisma.digitalLinkActivity.count({
      where: {
        action: 'click',
        companyId
      }
    });
    
    const totalCount = totalShortlinkClicks + totalDigitallinkClicks;
    
    res.json(successResponse(allClicks, null, {
      page: parseInt(page),
      limit: parseInt(limit),
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }));
}));

// Get summary analytics for dashboard
router.get('/summary', auth, asyncHandler(async (req, res) => {
    const { companyId } = req.user;
    
    // Get total counts
    const totalShortlinks = await prisma.link.count({
      where: { companyId }
    });
    
    const totalDigitallinks = await prisma.digitalLink.count({
      where: { companyId }
    });
    
    const totalShortlinkClicks = await prisma.linkClick.count({
      where: {
        link: {
          companyId
        }
      }
    });
    
    const totalDigitallinkClicks = await prisma.digitalLinkActivity.count({
      where: {
        action: 'click',
        companyId
      }
    });
    
    const totalClicks = totalShortlinkClicks + totalDigitallinkClicks;
    
    const summaryData = {
      totalLinks: totalShortlinks + totalDigitallinks,
      totalShortlinks,
      totalDigitallinks,
      totalClicks,
      totalShortlinkClicks,
      totalDigitallinkClicks
    };
    
    res.json(successResponse(summaryData));
}));

// Get recent activity for dashboard
router.get('/activity', auth, asyncHandler(async (req, res) => {
    const { companyId } = req.user;
    const { limit = 5 } = req.query;
    
    // Get recent link activities
    const linkActivities = await prisma.linkActivity.findMany({
      where: {
        link: {
          companyId
        }
      },
      include: {
        link: {
          select: {
            title: true,
            shortCode: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: parseInt(limit)
    });
    
    // Get recent digital link activities
    const digitalLinkActivities = await prisma.digitalLinkActivity.findMany({
      where: {
        digitalLink: {
          companyId
        }
      },
      include: {
        digitalLink: {
          select: {
            title: true,
            gs1Key: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: parseInt(limit)
    });
    
    // Format activities
    const formattedLinkActivities = linkActivities.map(activity => ({
      id: activity.id,
      type: 'shortlink',
      action: activity.action,
      itemName: activity.link.title || activity.link.shortCode || 'Unnamed link',
      timestamp: activity.timestamp,
      user: activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'System',
      details: activity.details
    }));
    
    const formattedDigitalLinkActivities = digitalLinkActivities.map(activity => ({
      id: activity.id,
      type: 'digitallink',
      action: activity.action,
      itemName: activity.digitalLink.title || activity.digitalLink.gs1Key || 'Unnamed link',
      timestamp: activity.timestamp,
      user: activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'System',
      details: activity.details
    }));
    
    // Combine and sort by timestamp
    const allActivities = [...formattedLinkActivities, ...formattedDigitalLinkActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));
    
    res.json(successResponse(allActivities));
}));

module.exports = router;
