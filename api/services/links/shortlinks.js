const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

/**
 * Service for handling shortlink operations
 */
const shortlinkService = {
  /**
   * Generate a random short code
   * @param {number} length - Length of the code
   * @returns {string} - Generated code
   */
  generateShortCode(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomBytes = crypto.randomBytes(length);
    let result = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = randomBytes[i] % characters.length;
      result += characters.charAt(randomIndex);
    }
    
    return result;
  },

  /**
   * Get all shortlinks for a company
   * @param {string} companyId - The company ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Shortlinks with pagination
   */
  async getShortlinks(companyId, options = {}) {
    try {
      const { status, categoryId, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      
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
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get shortlinks with pagination
      const shortlinks = await prisma.link.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: {
              analytics: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
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
        clicks: link._count.analytics,
        status: link.status,
        expiresAt: link.expiresAt,
        customDomain: link.customDomain,
        category: link.category,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt
      }));
      
      return {
        shortlinks: formattedShortlinks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      };
    } catch (error) {
      this.handleError('getShortlinks', error);
    }
  },

  /**
   * Get a shortlink by ID
   * @param {string} id - The shortlink ID
   * @param {string} companyId - The company ID
   * @returns {Promise<Object>} - The shortlink
   */
  async getShortlinkById(id, companyId) {
    try {
      const shortlink = await prisma.link.findFirst({
        where: {
          id,
          companyId
        },
        include: {
          category: true,
          _count: {
            select: {
              analytics: true
            }
          }
        }
      });
      
      if (!shortlink) {
        throw new Error('Shortlink not found');
      }
      
      // Format the response
      return {
        id: shortlink.id,
        originalUrl: shortlink.originalUrl,
        shortCode: shortlink.shortCode,
        title: shortlink.title,
        description: shortlink.description,
        tags: shortlink.tags,
        clicks: shortlink._count.analytics,
        status: shortlink.status,
        expiresAt: shortlink.expiresAt,
        customDomain: shortlink.customDomain,
        category: shortlink.category,
        createdAt: shortlink.createdAt,
        updatedAt: shortlink.updatedAt
      };
    } catch (error) {
      this.handleError('getShortlinkById', error);
    }
  },

  /**
   * Create a new shortlink
   * @param {Object} data - The shortlink data
   * @param {string} companyId - The company ID
   * @param {string} userId - The user ID for activity logging
   * @returns {Promise<Object>} - The created shortlink
   */
  async createShortlink(data, companyId, userId) {
    try {
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
      } = data;
      
      // Validate required fields
      if (!originalUrl) {
        throw new Error('Original URL is required');
      }
      
      // Generate a short code if not provided
      let finalShortCode = shortCode;
      if (!finalShortCode) {
        finalShortCode = this.generateShortCode();
        
        // Check if the generated short code already exists
        const existingLink = await prisma.link.findUnique({
          where: { shortCode: finalShortCode }
        });
        
        // If it exists, generate a new one
        if (existingLink) {
          finalShortCode = this.generateShortCode(8); // Try with a longer code
        }
      } else {
        // Check if the provided short code already exists
        const existingLink = await prisma.link.findUnique({
          where: { shortCode: finalShortCode }
        });
        
        if (existingLink) {
          throw new Error('Short code already exists');
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
      try {
        await prisma.linkActivity.create({
          data: {
            action: 'created',
            user: {
              connect: { id: userId }
            },
            timestamp: new Date(),
            companyId,
            itemId: newShortlink.id,
            itemName: newShortlink.title || newShortlink.shortCode,
            itemType: 'shortlink',
            link: {
              connect: { id: newShortlink.id }
            },
            details: {
              originalUrl,
              shortCode: finalShortCode
            }
          }
        });
      } catch (activityError) {
        console.error('Error creating activity log:', activityError);
        // Continue even if activity log creation fails
      }
      
      return newShortlink;
    } catch (error) {
      this.handleError('createShortlink', error);
    }
  },

  /**
   * Update a shortlink
   * @param {string} id - The shortlink ID
   * @param {Object} data - The shortlink data
   * @param {string} companyId - The company ID
   * @param {string} userId - The user ID for activity logging
   * @returns {Promise<Object>} - The updated shortlink
   */
  async updateShortlink(id, data, companyId, userId) {
    try {
      // Check if the shortlink exists and belongs to the company
      const existingShortlink = await prisma.link.findFirst({
        where: {
          id,
          companyId
        }
      });
      
      if (!existingShortlink) {
        throw new Error('Shortlink not found');
      }
      
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
      } = data;
      
      // Check if the new short code already exists (if provided and different from current)
      if (shortCode && shortCode !== existingShortlink.shortCode) {
        const existingLink = await prisma.link.findUnique({
          where: { shortCode }
        });
        
        if (existingLink) {
          throw new Error('Short code already exists');
        }
      }
      
      // Prepare update data
      const updateData = {};
      
      if (originalUrl !== undefined) updateData.originalUrl = originalUrl;
      if (shortCode !== undefined) updateData.shortCode = shortCode;
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (tags !== undefined) updateData.tags = tags;
      if (status !== undefined) updateData.status = status;
      if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
      if (customDomain !== undefined) updateData.customDomain = customDomain;
      
      // Handle categoryId separately to avoid foreign key constraint issues
      if (categoryId !== undefined) {
        // If categoryId is empty string or null, set it to null
        updateData.categoryId = categoryId === '' || categoryId === null ? null : categoryId;
      }
      
      // Update the shortlink
      const updatedShortlink = await prisma.link.update({
        where: { id },
        data: updateData,
        include: {
          category: true
        }
      });
      
      // Create activity log
      try {
        await prisma.linkActivity.create({
          data: {
            action: 'updated',
            user: {
              connect: { id: userId }
            },
            timestamp: new Date(),
            companyId,
            itemId: id,
            itemName: updatedShortlink.title || updatedShortlink.shortCode,
            itemType: 'shortlink',
            link: {
              connect: { id: id }
            },
            details: data
          }
        });
      } catch (activityError) {
        console.error('Error creating activity log:', activityError);
        // Continue even if activity log creation fails
      }
      
      return updatedShortlink;
    } catch (error) {
      this.handleError('updateShortlink', error);
    }
  },

  /**
   * Delete a shortlink
   * @param {string} id - The shortlink ID
   * @param {string} companyId - The company ID
   * @param {string} userId - The user ID for activity logging
   * @returns {Promise<Object>} - The deleted shortlink
   */
  async deleteShortlink(id, companyId, userId) {
    try {
      // Check if the shortlink exists and belongs to the company
      const existingShortlink = await prisma.link.findFirst({
        where: {
          id,
          companyId
        }
      });
      
      if (!existingShortlink) {
        throw new Error('Shortlink not found');
      }
      
      // Create activity log before deleting the link
      try {
        await prisma.linkActivity.create({
          data: {
            action: 'deleted',
            user: {
              connect: { id: userId }
            },
            timestamp: new Date(),
            companyId,
            itemId: id,
            itemName: existingShortlink.title || existingShortlink.shortCode,
            itemType: 'shortlink',
            link: {
              connect: { id: id }
            },
            details: {
              originalUrl: existingShortlink.originalUrl,
              shortCode: existingShortlink.shortCode
            }
          }
        });
      } catch (activityError) {
        console.error('Error creating activity log:', activityError);
        // Continue even if activity log creation fails
      }
      
      // First, delete all related LinkAnalytics records
      await prisma.linkAnalytics.deleteMany({
        where: { linkId: id }
      });
      
      // Then delete the shortlink
      const deletedShortlink = await prisma.link.delete({
        where: { id }
      });
      
      return deletedShortlink;
    } catch (error) {
      this.handleError('deleteShortlink', error);
    }
  },

  /**
   * Get analytics for a shortlink
   * @param {string} id - The shortlink ID
   * @param {string} companyId - The company ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Analytics data
   */
  async getShortlinkAnalytics(id, companyId, options = {}) {
    try {
      const { startDate, endDate, page = 1, limit = 10 } = options;
      
      // Check if the shortlink exists and belongs to the company
      const existingShortlink = await prisma.link.findFirst({
        where: {
          id,
          companyId
        }
      });
      
      if (!existingShortlink) {
        throw new Error('Shortlink not found');
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
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get clicks with pagination
      const clicks = await prisma.linkAnalytics.findMany({
        where: whereClicks,
        orderBy: {
          timestamp: 'desc'
        },
        skip,
        take: parseInt(limit)
      });
      
      // Get total count for pagination
      const totalCount = await prisma.linkAnalytics.count({ where: whereClicks });
      
      // Get summary statistics
      const totalClicks = totalCount;
      
      // Get clicks by date (for charts)
      const clicksByDate = await prisma.$queryRaw`
        SELECT 
          DATE(timestamp) as date, 
          COUNT(*) as count
        FROM "LinkAnalytics"
        WHERE "linkId" = ${id}
        GROUP BY DATE(timestamp)
        ORDER BY date
      `;
      
      // Get clicks by browser
      const clicksByBrowser = await prisma.$queryRaw`
        SELECT 
          browser, 
          COUNT(*) as count
        FROM "LinkAnalytics"
        WHERE "linkId" = ${id}
        GROUP BY browser
        ORDER BY count DESC
      `;
      
      // Get clicks by device
      const clicksByDevice = await prisma.$queryRaw`
        SELECT 
          device, 
          COUNT(*) as count
        FROM "LinkAnalytics"
        WHERE "linkId" = ${id}
        GROUP BY device
        ORDER BY count DESC
      `;
      
      // Get clicks by location
      const clicksByLocation = await prisma.$queryRaw`
        SELECT 
          country, 
          COUNT(*) as count
        FROM "LinkAnalytics"
        WHERE "linkId" = ${id}
        GROUP BY country
        ORDER BY count DESC
      `;
      
      // Get clicks by referrer
      const clicksByReferrer = await prisma.$queryRaw`
        SELECT 
          referer as referrer, 
          COUNT(*) as count
        FROM "LinkAnalytics"
        WHERE "linkId" = ${id}
        GROUP BY referer
        ORDER BY count DESC
      `;
      
      return {
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
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      };
    } catch (error) {
      this.handleError('getShortlinkAnalytics', error);
    }
  },

  /**
   * Handle errors in a consistent way
   * @param {string} operation - The operation that failed
   * @param {Error} error - The error object
   * @throws {Error} - Rethrows with context
   */
  handleError(operation, error) {
    console.error(`Error in ${operation}:`, error);
    
    // Map known error types to specific error messages
    if (error.code === 'P2002') {
      throw new Error('A record with this identifier already exists');
    }
    
    if (error.code === 'P2025') {
      throw new Error('Record not found');
    }
    
    // Rethrow with context
    throw new Error(`Failed to ${operation}: ${error.message}`);
  }
};

module.exports = shortlinkService;
