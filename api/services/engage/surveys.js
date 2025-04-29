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
      const { title, description, categoryId, sections, questions, settings, status, appearance } = surveyData;
      
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
      
      // Process sections to ensure titles and descriptions are set
      const processedSections = sections ? sections.map(section => ({
        ...section,
        title: section.title || 'Untitled Section',
        description: section.description || '',
        questions: section.questions ? section.questions.map(q => ({
          ...q,
          question: q.question || 'Untitled Question',
          description: q.description || ''
        })) : []
      })) : [];
      
      // Store sections and questions in settings
      const updatedSettings = {
        ...settings,
        sections: processedSections,
        questions: questions || []
      };
      
      // Log the data for debugging
      console.log('Creating survey with data:', JSON.stringify({
        settings: updatedSettings
      }, null, 2));
      
      // Create the new survey
      const newSurvey = await prisma.survey.create({
        data: {
          title,
          description: description || '',
          slug,
          settings: updatedSettings || {},
          appearance: appearance || {},
          status: status || 'Active',
          companyId,
          categoryId: categoryId || null,
          sections: processedSections || []
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
      
      const { title, description, categoryId, sections, questions, settings, status, appearance } = surveyData;
      
      // Keep the existing slug - we don't change slugs on update
      let slug = existingSurvey.slug;
      
      // Process sections to ensure titles and descriptions are set
      const processedSections = sections ? sections.map(section => ({
        ...section,
        title: section.title || 'Untitled Section',
        description: section.description || '',
        questions: section.questions ? section.questions.map(q => ({
          ...q,
          question: q.question || 'Untitled Question',
          description: q.description || ''
        })) : []
      })) : (existingSurvey.settings?.sections || []);
      
      // Store sections and questions in settings
      const updatedSettings = {
        ...(settings || existingSurvey.settings || {}),
        sections: processedSections,
        questions: questions || []
      };
      
      // Log the incoming data for debugging
      console.log('Updating survey with data:', JSON.stringify({
        title,
        description,
        categoryId,
        status,
        settings: updatedSettings
      }, null, 2));
      
      // Handle categoryId properly to avoid foreign key constraint violations
      let finalCategoryId = existingSurvey.categoryId;
      
      // Only update categoryId if it's explicitly provided
      if (categoryId !== undefined) {
        // If null, empty string, or invalid ID is provided, set to null
        // This allows clearing the category
        finalCategoryId = null;
        
        // Only try to set a non-null categoryId if it's a non-empty string
        if (categoryId && typeof categoryId === 'string' && categoryId.trim() !== '') {
          try {
            // Log the category ID we're looking for
            console.log(`Looking for survey category with ID: "${categoryId}"`);
            
            // Try to find the category
            const categoryExists = await prisma.surveyCategory.findUnique({
              where: { id: categoryId }
            });
            
            if (categoryExists) {
              finalCategoryId = categoryId;
              console.log(`Survey category found: ${categoryExists.name}`);
            } else {
              console.warn(`Survey category ID ${categoryId} does not exist. Setting category to null.`);
            }
          } catch (categoryError) {
            console.warn(`Error verifying survey category ID ${categoryId}:`, categoryError);
            // Set to null on error
          }
        } else {
          console.log(`Setting survey categoryId to null (received: ${categoryId})`);
        }
      }
      
      // Ensure status is a valid enum value
      let finalStatus = existingSurvey.status;
      if (status) {
        // Map 'Draft' to 'Inactive' if needed
        if (status === 'Draft') {
          finalStatus = 'Inactive';
        } else if (['Active', 'Inactive', 'Archived'].includes(status)) {
          finalStatus = status;
        } else {
          console.warn(`Invalid status value: ${status}. Using existing status.`);
        }
      }
      
      // Update the survey
      const updatedSurvey = await prisma.survey.update({
        where: {
          id: id
        },
        data: {
          title: title || existingSurvey.title,
          description: description !== undefined ? description : existingSurvey.description,
          slug: slug,
          settings: updatedSettings,
          appearance: appearance !== undefined ? appearance : existingSurvey.appearance,
          status: finalStatus,
          categoryId: finalCategoryId
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
