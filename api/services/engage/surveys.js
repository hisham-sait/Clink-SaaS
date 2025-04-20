const slugify = require('slugify');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Service for handling survey operations
 */
const surveyService = {
  /**
   * Get all surveys for a company
   * @param {string} companyId - The company ID
   * @returns {Promise<Array>} - List of surveys
   */
  async getAllSurveys(companyId) {
    try {
      const surveys = await prisma.survey.findMany({
        where: {
          companyId: companyId
        },
        include: {
          category: true
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      
      return surveys;
    } catch (error) {
      console.error('Error in getAllSurveys:', error);
      return [];
    }
  },

  /**
   * Get a survey by ID
   * @param {string} id - The survey ID
   * @param {string} companyId - The company ID for access control
   * @returns {Promise<Object>} - The survey
   */
  async getSurveyById(id, companyId) {
    try {
      const survey = await prisma.survey.findUnique({
        where: {
          id: id
        },
        include: {
          category: true
        }
      });
      
      if (!survey) {
        throw new Error('Survey not found');
      }
      
      // Check if user has access to this survey
      if (survey.companyId !== companyId) {
        throw new Error('Access denied');
      }
      
      return survey;
    } catch (error) {
      console.error('Error in getSurveyById:', error);
      throw error;
    }
  },

  /**
   * Get a survey by slug (public access)
   * @param {string} slug - The survey slug
   * @returns {Promise<Object>} - The survey
   */
  async getSurveyBySlug(slug) {
    try {
      const survey = await prisma.survey.findUnique({
        where: {
          slug: slug
        },
        include: {
          category: true
        }
      });
      
      if (!survey) {
        throw new Error('Survey not found');
      }
      
      return survey;
    } catch (error) {
      console.error('Error in getSurveyBySlug:', error);
      throw error;
    }
  },

  /**
   * Create a new survey
   * @param {Object} surveyData - The survey data
   * @param {string} companyId - The company ID
   * @returns {Promise<Object>} - The created survey
   */
  async createSurvey(surveyData, companyId) {
    try {
      const { title, description, categoryId, sections, settings, status } = surveyData;
      
      // Generate random alphanumeric slug
      let slug = Math.random().toString(36).substring(2, 10);
      
      // Check if slug already exists
      let existingSurvey = await prisma.survey.findUnique({
        where: {
          slug: slug
        }
      });
      
      // If slug exists, generate a new one until we find a unique one
      while (existingSurvey) {
        slug = Math.random().toString(36).substring(2, 10);
        existingSurvey = await prisma.survey.findUnique({
          where: {
            slug: slug
          }
        });
      }
      
      // Create the new survey
      const newSurvey = await prisma.survey.create({
        data: {
          title,
          description: description || '',
          slug,
          sections: sections || [],
          settings: settings || {},
          status: status || 'Active',
          companyId,
          categoryId: categoryId || null
        }
      });
      
      return newSurvey;
    } catch (error) {
      console.error('Error in createSurvey:', error);
      throw error;
    }
  },

  /**
   * Update a survey
   * @param {string} id - The survey ID
   * @param {Object} surveyData - The survey data
   * @param {string} companyId - The company ID for access control
   * @returns {Promise<Object>} - The updated survey
   */
  async updateSurvey(id, surveyData, companyId) {
    try {
      // Check if survey exists and user has access
      const existingSurvey = await this.getSurveyById(id, companyId);
      
      const { title, description, categoryId, sections, settings, status } = surveyData;
      
      // Keep the existing slug - we don't change slugs on update
      let slug = existingSurvey.slug;
      
      // Update the survey
      const updatedSurvey = await prisma.survey.update({
        where: {
          id: id
        },
        data: {
          title: title || existingSurvey.title,
          description: description !== undefined ? description : existingSurvey.description,
          slug: slug,
          sections: sections !== undefined ? sections : existingSurvey.sections,
          settings: settings !== undefined ? settings : existingSurvey.settings,
          status: status || existingSurvey.status,
          categoryId: categoryId !== undefined ? categoryId : existingSurvey.categoryId
        }
      });
      
      return updatedSurvey;
    } catch (error) {
      console.error('Error in updateSurvey:', error);
      throw error;
    }
  },

  /**
   * Delete a survey
   * @param {string} id - The survey ID
   * @param {string} companyId - The company ID for access control
   * @returns {Promise<Object>} - The deleted survey
   */
  async deleteSurvey(id, companyId) {
    try {
      // Check if survey exists and user has access
      await this.getSurveyById(id, companyId);
      
      // Delete the survey
      const deletedSurvey = await prisma.survey.delete({
        where: {
          id: id
        }
      });
      
      return deletedSurvey;
    } catch (error) {
      console.error('Error in deleteSurvey:', error);
      throw error;
    }
  },

  /**
   * Submit a survey response
   * @param {string} slug - The survey slug
   * @param {Object} responseData - The response data
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} - The submission
   */
  async submitSurveyResponse(slug, responseData, metadata) {
    try {
      // Find the survey
      const survey = await this.getSurveyBySlug(slug);
      
      if (survey.status !== 'Active') {
        throw new Error('Survey is not active');
      }
      
      // Create response
      const response = await prisma.surveyResponse.create({
        data: {
          surveyId: survey.id,
          data: responseData,
          metadata: metadata
        }
      });
      
      // Update response count
      await prisma.survey.update({
        where: {
          id: survey.id
        },
        data: {
          responses: {
            increment: 1
          }
        }
      });
      
      return {
        responseId: response.id,
        survey
      };
    } catch (error) {
      console.error('Error in submitSurveyResponse:', error);
      throw error;
    }
  },

  /**
   * Get survey responses
   * @param {string} surveyId - The survey ID
   * @param {string} companyId - The company ID for access control
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} - List of responses
   */
  async getSurveyResponses(surveyId, companyId, options = {}) {
    try {
      // Check if survey exists and user has access
      await this.getSurveyById(surveyId, companyId);
      
      const { skip = 0, take = 100 } = options;
      
      // Get responses
      const responses = await prisma.surveyResponse.findMany({
        where: {
          surveyId: surveyId
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: parseInt(skip),
        take: parseInt(take)
      });
      
      return responses;
    } catch (error) {
      console.error('Error in getSurveyResponses:', error);
      throw error;
    }
  }
};

module.exports = surveyService;
