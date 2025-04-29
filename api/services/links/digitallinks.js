const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Service for handling digital link operations
 */
const digitallinkService = {
  /**
   * Format GS1 Digital Link URL
   * @param {string} gs1Key - The GS1 key
   * @param {string} gs1KeyType - The GS1 key type
   * @returns {string} - Formatted GS1 URL
   */
  formatGS1Url(gs1Key, gs1KeyType) {
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
  },

  /**
   * Get all digitallinks for a company
   * @param {string} companyId - The company ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Digitallinks with pagination
   */
  async getDigitallinks(companyId, options = {}) {
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
          { gs1Key: { contains: search, mode: 'insensitive' } },
          { gs1KeyType: { contains: search, mode: 'insensitive' } },
          { gs1Url: { contains: search, mode: 'insensitive' } },
          { customUrl: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get digitallinks with pagination
      const digitallinks = await prisma.digitalLink.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: {
              activities: true
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
        clicks: link._count.activities,
        status: link.status,
        expiresAt: link.expiresAt,
        category: link.category,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt
      }));
      
      return {
        digitallinks: formattedDigitallinks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      };
    } catch (error) {
      this.handleError('getDigitallinks', error);
    }
  },

  /**
   * Get a digitallink by ID
   * @param {string} id - The digitallink ID
   * @param {string} companyId - The company ID
   * @returns {Promise<Object>} - The digitallink
   */
  async getDigitallinkById(id, companyId) {
    try {
      const digitallink = await prisma.digitalLink.findFirst({
        where: {
          id,
          companyId
        },
        include: {
          category: true,
          _count: {
            select: {
              activities: true
            }
          }
        }
      });
      
      if (!digitallink) {
        throw new Error('Digital link not found');
      }
      
      // Format the response
      return {
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
        clicks: digitallink._count.activities,
        status: digitallink.status,
        expiresAt: digitallink.expiresAt,
        category: digitallink.category,
        createdAt: digitallink.createdAt,
        updatedAt: digitallink.updatedAt
      };
    } catch (error) {
      this.handleError('getDigitallinkById', error);
    }
  },

  /**
   * Create a new digitallink
   * @param {Object} data - The digitallink data
   * @param {string} companyId - The company ID
   * @param {string} userId - The user ID for activity logging
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The created digitallink
   */
  async createDigitallink(data, companyId, userId, options = {}) {
    try {
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
      } = data;
      
      const { linkType } = options;
      
      // Check if this is a special link type (page, form, survey, shortlink)
      const isSpecialLinkType = linkType && ['page', 'form', 'survey', 'shortlink', 'custom'].includes(linkType);
      
      // Validate required fields
      if (!isSpecialLinkType && !gs1Key) {
        throw new Error('GS1 Key is required');
      }
      
      if (!isSpecialLinkType && !gs1KeyType) {
        throw new Error('GS1 Key Type is required');
      }
      
      if (!isSpecialLinkType && !redirectType) {
        throw new Error('Redirect Type is required');
      }
      
      if (redirectType === 'custom' && !customUrl) {
        throw new Error('Custom URL is required for custom redirect type');
      }
      
      if (redirectType === 'standard' && !productId) {
        throw new Error('Product ID is required for standard redirect type');
      }
      
      // Format the GS1 URL if applicable
      let gs1Url = null;
      if (gs1Key && gs1KeyType) {
        gs1Url = this.formatGS1Url(gs1Key, gs1KeyType);
        
        // Check if the GS1 URL already exists
        const existingDigitallink = await prisma.digitalLink.findFirst({
          where: { 
            gs1Url,
            companyId
          }
        });
        
        if (existingDigitallink) {
          throw new Error('GS1 URL already exists');
        }
      }
      
      // Handle categoryId to avoid foreign key constraint issues
      const processedCategoryId = categoryId === '' || categoryId === null ? null : categoryId;
      
      // Create the digitallink
      const newDigitallink = await prisma.digitalLink.create({
        data: {
          gs1Key: gs1Key || null,
          gs1KeyType: gs1KeyType || null,
          gs1Url: gs1Url || null,
          redirectType: redirectType || (isSpecialLinkType ? 'custom' : null),
          customUrl: (redirectType === 'custom' || isSpecialLinkType) ? customUrl : null,
          productId: redirectType === 'standard' ? productId : null,
          title,
          description,
          tags: tags || [],
          status,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          categoryId: processedCategoryId,
          companyId
        },
        include: {
          category: true
        }
      });
      
      // Create activity log
      try {
        await prisma.digitalLinkActivity.create({
          data: {
            action: 'created',
            user: {
              connect: { id: userId }
            },
            timestamp: new Date(),
            companyId,
            itemId: newDigitallink.id,
            itemName: newDigitallink.title || newDigitallink.gs1Key,
            link: {
              connect: { id: newDigitallink.id }
            },
            details: {
              gs1Key,
              gs1KeyType,
              gs1Url,
              redirectType
            }
          }
        });
      } catch (activityError) {
        console.error('Error creating activity log:', activityError);
        // Continue even if activity log creation fails
      }
      
      return newDigitallink;
    } catch (error) {
      this.handleError('createDigitallink', error);
    }
  },

  /**
   * Update a digitallink
   * @param {string} id - The digitallink ID
   * @param {Object} data - The digitallink data
   * @param {string} companyId - The company ID
   * @param {string} userId - The user ID for activity logging
   * @returns {Promise<Object>} - The updated digitallink
   */
  async updateDigitallink(id, data, companyId, userId) {
    try {
      // Check if the digitallink exists and belongs to the company
      const existingDigitallink = await prisma.digitalLink.findFirst({
        where: {
          id,
          companyId
        }
      });
      
      if (!existingDigitallink) {
        throw new Error('Digital link not found');
      }
      
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
      } = data;
      
      // Check if GS1 Key or Key Type is being updated
      let gs1Url = existingDigitallink.gs1Url;
      if (gs1Key && gs1KeyType && (gs1Key !== existingDigitallink.gs1Key || gs1KeyType !== existingDigitallink.gs1KeyType)) {
        gs1Url = this.formatGS1Url(gs1Key, gs1KeyType);
        
        // Check if the new GS1 URL already exists
        const existingUrl = await prisma.digitalLink.findFirst({
          where: {
            gs1Url,
            companyId,
            id: { not: id }
          }
        });
        
        if (existingUrl) {
          throw new Error('GS1 URL already exists');
        }
      }
      
      // Validate redirect type and related fields
      if (redirectType === 'custom' && !customUrl && !existingDigitallink.customUrl) {
        throw new Error('Custom URL is required for custom redirect type');
      }
      
      if (redirectType === 'standard' && !productId && !existingDigitallink.productId) {
        throw new Error('Product ID is required for standard redirect type');
      }
      
      // Prepare update data
      const updateData = {};
      
      if (gs1Key !== undefined) updateData.gs1Key = gs1Key;
      if (gs1KeyType !== undefined) updateData.gs1KeyType = gs1KeyType;
      if (gs1Key && gs1KeyType) updateData.gs1Url = gs1Url;
      if (redirectType !== undefined) updateData.redirectType = redirectType;
      if (customUrl !== undefined) updateData.customUrl = customUrl;
      if (productId !== undefined) updateData.productId = productId;
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (tags !== undefined) updateData.tags = tags;
      if (status !== undefined) updateData.status = status;
      if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
      
      // Handle categoryId separately to avoid foreign key constraint issues
      if (categoryId !== undefined) {
        // If categoryId is empty string or null, set it to null
        updateData.categoryId = categoryId === '' || categoryId === null ? null : categoryId;
      }
      
      // Update the digitallink
      const updatedDigitallink = await prisma.digitalLink.update({
        where: { id },
        data: updateData,
        include: {
          category: true
        }
      });
      
      // Create activity log
      try {
        await prisma.digitalLinkActivity.create({
          data: {
            action: 'updated',
            user: {
              connect: { id: userId }
            },
            timestamp: new Date(),
            companyId,
            itemId: id,
            itemName: updatedDigitallink.title || updatedDigitallink.gs1Key,
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
      
      return updatedDigitallink;
    } catch (error) {
      this.handleError('updateDigitallink', error);
    }
  },

  /**
   * Delete a digitallink
   * @param {string} id - The digitallink ID
   * @param {string} companyId - The company ID
   * @param {string} userId - The user ID for activity logging
   * @returns {Promise<Object>} - The deleted digitallink
   */
  async deleteDigitallink(id, companyId, userId) {
    try {
      // Check if the digitallink exists and belongs to the company
      const existingDigitallink = await prisma.digitalLink.findFirst({
        where: {
          id,
          companyId
        }
      });
      
      if (!existingDigitallink) {
        throw new Error('Digital link not found');
      }
      
      // Create activity log before deleting the link
      try {
        await prisma.digitalLinkActivity.create({
          data: {
            action: 'deleted',
            user: {
              connect: { id: userId }
            },
            timestamp: new Date(),
            companyId,
            itemId: id,
            itemName: existingDigitallink.title || existingDigitallink.gs1Key,
            link: {
              connect: { id: id }
            },
            details: {
              gs1Key: existingDigitallink.gs1Key,
              gs1KeyType: existingDigitallink.gs1KeyType,
              gs1Url: existingDigitallink.gs1Url
            }
          }
        });
      } catch (activityError) {
        console.error('Error creating activity log:', activityError);
        // Continue even if activity log creation fails
      }
      
      // First, delete all related DigitalLinkEvent records
      await prisma.digitalLinkEvent.deleteMany({
        where: { digitalLinkId: id }
      });
      
      // Also delete all related DigitalLinkActivity records
      await prisma.digitalLinkActivity.deleteMany({
        where: { linkId: id }
      });
      
      // Then delete the digitallink
      const deletedDigitallink = await prisma.digitalLink.delete({
        where: { id }
      });
      
      return deletedDigitallink;
    } catch (error) {
      this.handleError('deleteDigitallink', error);
    }
  },

  /**
   * Get analytics for a digitallink
   * @param {string} id - The digitallink ID
   * @param {string} companyId - The company ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Analytics data
   */
  async getDigitallinkAnalytics(id, companyId, options = {}) {
    try {
      const { startDate, endDate, page = 1, limit = 10 } = options;
      
      // Check if the digitallink exists and belongs to the company
      const existingDigitallink = await prisma.digitalLink.findFirst({
        where: {
          id,
          companyId
        }
      });
      
      if (!existingDigitallink) {
        throw new Error('Digital link not found');
      }
      
      // Build the where clause for activities
      const whereActivities = { linkId: id };
      
      if (startDate && endDate) {
        whereActivities.timestamp = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      } else if (startDate) {
        whereActivities.timestamp = {
          gte: new Date(startDate)
        };
      } else if (endDate) {
        whereActivities.timestamp = {
          lte: new Date(endDate)
        };
      }
      
      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get activities with pagination
      const activities = await prisma.digitalLinkActivity.findMany({
        where: whereActivities,
        orderBy: {
          timestamp: 'desc'
        },
        skip,
        take: parseInt(limit)
      });
      
      // Get total count for pagination
      const totalCount = await prisma.digitalLinkActivity.count({ where: whereActivities });
      
      // Get summary statistics
      const totalClicks = totalCount;
      
      // Get activities by date (for charts)
      const clicksByDate = await prisma.$queryRaw`
        SELECT 
          DATE(timestamp) as date, 
          COUNT(*) as count
        FROM "DigitalLinkActivity"
        WHERE "linkId" = ${id}
        GROUP BY DATE(timestamp)
        ORDER BY date
      `;
      
      // Get activities by browser (if available)
      const clicksByBrowser = await prisma.$queryRaw`
        SELECT 
          COALESCE(details->>'browser', 'Unknown') as browser, 
          COUNT(*) as count
        FROM "DigitalLinkActivity"
        WHERE "linkId" = ${id}
        GROUP BY details->>'browser'
        ORDER BY count DESC
      `;
      
      // Get activities by device (if available)
      const clicksByDevice = await prisma.$queryRaw`
        SELECT 
          COALESCE(details->>'device', 'Unknown') as device, 
          COUNT(*) as count
        FROM "DigitalLinkActivity"
        WHERE "linkId" = ${id}
        GROUP BY details->>'device'
        ORDER BY count DESC
      `;
      
      // Get activities by location (if available)
      const clicksByLocation = await prisma.$queryRaw`
        SELECT 
          COALESCE(details->>'country', 'Unknown') as country, 
          COUNT(*) as count
        FROM "DigitalLinkActivity"
        WHERE "linkId" = ${id}
        GROUP BY details->>'country'
        ORDER BY count DESC
      `;
      
      // Get activities by referrer (if available)
      const clicksByReferrer = await prisma.$queryRaw`
        SELECT 
          COALESCE(details->>'referrer', 'Unknown') as referrer, 
          COUNT(*) as count
        FROM "DigitalLinkActivity"
        WHERE "linkId" = ${id}
        GROUP BY details->>'referrer'
        ORDER BY count DESC
      `;
      
      return {
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
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      };
    } catch (error) {
      this.handleError('getDigitallinkAnalytics', error);
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

module.exports = digitallinkService;
