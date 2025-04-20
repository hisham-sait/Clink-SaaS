const slugify = require('slugify');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dataService = require('./data');

/**
 * Service for handling form operations
 */
const formService = {
  /**
   * Get all forms for a company
   * @param {string} companyId - The company ID
   * @returns {Promise<Array>} - List of forms
   */
  async getAllForms(companyId) {
    try {
      const forms = await prisma.form.findMany({
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
      
      return forms;
    } catch (error) {
      console.error('Error in getAllForms:', error);
      return [];
    }
  },

  /**
   * Get a form by ID
   * @param {string} id - The form ID
   * @param {string} companyId - The company ID for access control
   * @returns {Promise<Object>} - The form
   */
  async getFormById(id, companyId) {
    try {
      const form = await prisma.form.findUnique({
        where: {
          id: id
        },
        include: {
          category: true
        }
      });
      
      if (!form) {
        throw new Error('Form not found');
      }
      
      // Check if user has access to this form
      if (form.companyId !== companyId) {
        throw new Error('Access denied');
      }
      
      return form;
    } catch (error) {
      console.error('Error in getFormById:', error);
      throw error;
    }
  },

  /**
   * Get a form by slug (public access)
   * @param {string} slug - The form slug
   * @returns {Promise<Object>} - The form
   */
  async getFormBySlug(slug) {
    try {
      const form = await prisma.form.findUnique({
        where: {
          slug: slug
        },
        include: {
          category: true
        }
      });
      
      if (!form) {
        throw new Error('Form not found');
      }
      
      return form;
    } catch (error) {
      console.error('Error in getFormBySlug:', error);
      throw error;
    }
  },

  /**
   * Create a new form
   * @param {Object} formData - The form data
   * @param {string} companyId - The company ID
   * @returns {Promise<Object>} - The created form
   */
  async createForm(formData, companyId) {
    try {
      const { title, description, categoryId, elements, settings, status } = formData;
      
      // Generate random alphanumeric slug
      let slug = Math.random().toString(36).substring(2, 10);
      
      // Check if slug already exists
      let existingForm = await prisma.form.findUnique({
        where: {
          slug: slug
        }
      });
      
      // If slug exists, generate a new one until we find a unique one
      while (existingForm) {
        slug = Math.random().toString(36).substring(2, 10);
        existingForm = await prisma.form.findUnique({
          where: {
            slug: slug
          }
        });
      }
      
      // Create the new form
      const newForm = await prisma.form.create({
        data: {
          title,
          description: description || '',
          slug,
          elements: elements || [],
          settings: settings || {},
          status: status || 'Active',
          companyId,
          categoryId: categoryId || null
        }
      });
      
      return newForm;
    } catch (error) {
      console.error('Error in createForm:', error);
      throw error;
    }
  },

  /**
   * Update a form
   * @param {string} id - The form ID
   * @param {Object} formData - The form data
   * @param {string} companyId - The company ID for access control
   * @returns {Promise<Object>} - The updated form
   */
  async updateForm(id, formData, companyId) {
    try {
      // Check if form exists and user has access
      const existingForm = await this.getFormById(id, companyId);
      
      const { title, description, categoryId, elements, settings, status } = formData;
      
      // Keep the existing slug - we don't change slugs on update
      let slug = existingForm.slug;
      
      // Update the form
      const updatedForm = await prisma.form.update({
        where: {
          id: id
        },
        data: {
          title: title || existingForm.title,
          description: description !== undefined ? description : existingForm.description,
          slug: slug,
          elements: elements !== undefined ? elements : existingForm.elements,
          settings: settings !== undefined ? settings : existingForm.settings,
          status: status || existingForm.status,
          categoryId: categoryId !== undefined ? categoryId : existingForm.categoryId
        }
      });
      
      return updatedForm;
    } catch (error) {
      console.error('Error in updateForm:', error);
      throw error;
    }
  },

  /**
   * Delete a form
   * @param {string} id - The form ID
   * @param {string} companyId - The company ID for access control
   * @returns {Promise<Object>} - The deleted form
   */
  async deleteForm(id, companyId) {
    try {
      // Check if form exists and user has access
      await this.getFormById(id, companyId);
      
      // Delete the form
      const deletedForm = await prisma.form.delete({
        where: {
          id: id
        }
      });
      
      return deletedForm;
    } catch (error) {
      console.error('Error in deleteForm:', error);
      throw error;
    }
  },

  /**
   * Submit a form
   * @param {string} slug - The form slug
   * @param {Object} formData - The form data
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} - The submission
   */
  async submitForm(slug, formData, metadata) {
    try {
      // Find the form
      const form = await this.getFormBySlug(slug);
      
      if (form.status !== 'Active') {
        throw new Error('Form is not active');
      }
      
      // Create submission
      const submission = await prisma.formSubmission.create({
        data: {
          formId: form.id,
          data: formData,
          metadata: metadata
        }
      });
      
      // Update submission count
      await prisma.form.update({
        where: {
          id: form.id
        },
        data: {
          submissions: {
            increment: 1
          }
        }
      });
      
      // Add submission to dataset for Data section
      try {
        // Check if a dataset already exists for this form
        const existingDataset = await prisma.dataset.findFirst({
          where: {
            sourceId: form.id,
            type: 'form'
          }
        });
        
        let datasetId;
        
        if (!existingDataset) {
          // Create a new dataset for this form
          const newDataset = await prisma.dataset.create({
            data: {
              name: `${form.title} Submissions`,
              description: `Submissions from the ${form.title} form`,
              type: 'form',
              sourceId: form.id,
              sourceName: form.title,
              companyId: form.companyId
            }
          });
          
          datasetId = newDataset.id;
        } else {
          datasetId = existingDataset.id;
        }
        
        // Add the submission data to the dataset
        await prisma.dataRecord.create({
          data: {
            datasetId: datasetId,
            data: formData,
            metadata: {
              ...metadata,
              formSubmissionId: submission.id,
              source: 'form_submission'
            }
          }
        });
      } catch (dataError) {
        // Log the error but don't fail the submission
        console.error('Error adding form submission to dataset:', dataError);
      }
      
      return {
        submissionId: submission.id,
        form
      };
    } catch (error) {
      console.error('Error in submitForm:', error);
      throw error;
    }
  },

  /**
   * Get form submissions
   * @param {string} formId - The form ID
   * @param {string} companyId - The company ID for access control
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} - List of submissions
   */
  async getFormSubmissions(formId, companyId, options = {}) {
    try {
      // Check if form exists and user has access
      await this.getFormById(formId, companyId);
      
      const { skip = 0, take = 100 } = options;
      
      // Get submissions
      const submissions = await prisma.formSubmission.findMany({
        where: {
          formId: formId
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: parseInt(skip),
        take: parseInt(take)
      });
      
      return submissions;
    } catch (error) {
      console.error('Error in getFormSubmissions:', error);
      throw error;
    }
  }
};

module.exports = formService;
