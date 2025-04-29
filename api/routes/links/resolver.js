const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const { successResponse, errorResponse, ErrorTypes, asyncHandler } = require('../../utils/responseUtils');

const prisma = new PrismaClient();

// Helper function to parse user agent
function parseUserAgent(userAgent) {
  if (!userAgent) return { browser: 'Unknown', device: 'Unknown' };
  
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    browser: result.browser.name || 'Unknown',
    device: result.device.type || (result.os.name === 'iOS' || result.os.name === 'Android' ? 'Mobile' : 'Desktop')
  };
}

// Helper function to get location from IP
function getLocationFromIp(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return 'Local';
  
  const geo = geoip.lookup(ip);
  if (!geo) return 'Unknown';
  
  return `${geo.city || ''}, ${geo.country || 'Unknown'}`.trim();
}

// Resolve shortlink (for /r/s/:shortCode)
router.get('/s/:shortCode', asyncHandler(resolveShortlink));

// Shortlink resolver function
async function resolveShortlink(req, res) {
  try {
    const { shortCode } = req.params;
    
    // Find the shortlink
    const shortlink = await prisma.link.findUnique({
      where: { shortCode }
    });
    
    // If shortlink doesn't exist, render error page
    if (!shortlink) {
      return res.status(404).render('error', {
        title: 'Link Not Found',
        message: 'The link you are trying to access does not exist.'
      });
    }
    
    // If shortlink is inactive, render error page
    if (shortlink.status !== 'Active') {
      return res.status(404).render('error', {
        title: 'Link Inactive',
        message: 'This link is currently inactive.'
      });
    }
    
    // If shortlink has expired, render error page
    if (shortlink.expiresAt && new Date(shortlink.expiresAt) < new Date()) {
      return res.status(404).render('error', {
        title: 'Link Expired',
        message: 'This link has expired and is no longer available.'
      });
    }
    
    // If shortlink has a password, check if it's provided
    if (shortlink.password) {
      const { password } = req.query;
      
      if (!password) {
        // If no password provided, show password form
        return res.status(401).render('password-form', {
          formAction: `/r/s/${shortCode}`,
          error: null
        });
      } else if (password !== shortlink.password) {
        // If incorrect password, show password form with error
        return res.status(401).render('password-form', {
          formAction: `/r/s/${shortCode}`,
          error: 'Incorrect password. Please try again.'
        });
      }
    }
    
    // Get user agent and IP
    const userAgent = req.headers['user-agent'];
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const referrer = req.headers.referer || req.headers.referrer || 'Direct';
    
    // Parse user agent
    const { browser, device } = parseUserAgent(userAgent);
    
    // Get location from IP
    const location = getLocationFromIp(ip);
    
    // Record the click asynchronously
    prisma.linkAnalytics.create({
      data: {
        linkId: shortlink.id,
        ip: ip,
        userAgent: userAgent,
        referer: referrer,
        country: location.split(', ')[1] || location,
        city: location.split(', ')[0] || null,
        device: device,
        browser: browser,
        timestamp: new Date()
      }
    }).catch(err => console.error('Error recording click:', err));
    
    // Update the click count
    prisma.link.update({
      where: { id: shortlink.id },
      data: { clicks: { increment: 1 } }
    }).catch(err => console.error('Error updating click count:', err));
    
    // Check if the originalUrl is for a page or form
    if (shortlink.originalUrl.startsWith('/p/')) {
      // Redirect to the page URL
      return res.redirect(shortlink.originalUrl);
    } else if (shortlink.originalUrl.startsWith('/f/')) {
      // Redirect to the form URL
      return res.redirect(shortlink.originalUrl);
    } else {
      // Redirect to the original URL
      res.redirect(shortlink.originalUrl);
    }
  } catch (error) {
    console.error('Error resolving shortlink:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An unexpected error occurred while processing your request.'
    });
  }
}

// Resolve digitallink with GS1 application identifier and key or just numeric value
router.get('/d/:digitalLinkPath(*)', asyncHandler(async (req, res) => {
  try {
    const { digitalLinkPath } = req.params;
    let digitallink = null;
    
    // First, try to find the digital link by exact gs1Url match
    digitallink = await prisma.digitalLink.findUnique({
      where: { gs1Url: digitalLinkPath }
    });
    
    // If not found, check if it's a numeric value (legacy format)
    if (!digitallink && /^\d+$/.test(digitalLinkPath)) {
      // Try to find by gs1Key
      digitallink = await prisma.digitalLink.findFirst({
        where: { gs1Key: digitalLinkPath }
      });
    }
    
    // If digitallink doesn't exist, render error page
    if (!digitallink) {
      return res.status(404).render('error', {
        title: 'Digital Link Not Found',
        message: 'The digital link you are trying to access does not exist.'
      });
    }
    
    // If digitallink is inactive, render error page
    if (digitallink.status !== 'Active') {
      return res.status(404).render('error', {
        title: 'Digital Link Inactive',
        message: 'This digital link is currently inactive.'
      });
    }
    
    // If digitallink has expired, render error page
    if (digitallink.expiresAt && new Date(digitallink.expiresAt) < new Date()) {
      return res.status(404).render('error', {
        title: 'Digital Link Expired',
        message: 'This digital link has expired and is no longer available.'
      });
    }
    
    // Get user agent and IP
    const userAgent = req.headers['user-agent'];
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const referrer = req.headers.referer || req.headers.referrer || 'Direct';
    
    // Parse user agent
    const { browser, device } = parseUserAgent(userAgent);
    
    // Get location from IP
    const location = getLocationFromIp(ip);
    
    // Record the click asynchronously
    prisma.digitalLinkActivity.create({
      data: {
        action: 'click',
        linkId: digitallink.id,
        details: {
          ipAddress: ip,
          userAgent,
          referrer,
          location,
          device,
          browser
        },
        timestamp: new Date(),
        companyId: digitallink.companyId,
        itemId: digitallink.id,
        itemName: digitallink.title || digitallink.gs1Key || 'Digital Link',
        itemType: 'digitallink'
      }
    }).catch(err => console.error('Error recording click:', err));
    
    // Update the click count
    prisma.digitalLink.update({
      where: { id: digitallink.id },
      data: { clicks: { increment: 1 } }
    }).catch(err => console.error('Error updating click count:', err));
    
    // Determine where to redirect based on redirectType
    if (digitallink.redirectType === 'custom' && digitallink.customUrl) {
      // Check if the customUrl is for a page or form
      if (digitallink.customUrl.startsWith('/p/') || digitallink.customUrl.startsWith('/f/')) {
        // Redirect to the page or form URL
        return res.redirect(digitallink.customUrl);
      } else {
        // Redirect to the custom URL
        res.redirect(digitallink.customUrl);
      }
    } else if (digitallink.redirectType === 'standard' && digitallink.productId) {
      // Get the product
      const product = await prisma.product.findUnique({
        where: { id: digitallink.productId },
        include: {
          category: true,
          family: true,
          attributeValues: {
            include: {
              attribute: true
            }
          }
        }
      });
      
      if (!product) {
        return res.status(404).render('error', {
          title: 'Product Not Found',
          message: 'The product associated with this digital link could not be found.'
        });
      }
      
      // Render a product information page
      res.render('product-info', { product, digitallink });
    } else {
      return res.status(500).render('error', {
        title: 'Configuration Error',
        message: 'This digital link has an invalid configuration. Please contact the administrator.'
      });
    }
  } catch (error) {
    console.error('Error resolving digitallink:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An unexpected error occurred while processing your request.'
    });
  }
}));

module.exports = router;
