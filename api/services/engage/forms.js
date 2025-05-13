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
      const { title, description, categoryId, elements, sections, settings, status, appearance } = formData;
      
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
      
      // Process sections to ensure titles and descriptions are set
      const processedSections = sections ? sections.map(section => ({
        ...section,
        title: section.title || 'Untitled Section',
        description: section.description || '',
        elements: section.elements ? section.elements.map(el => ({
          ...el,
          label: el.label || 'Untitled Element',
          description: el.description || ''
        })) : []
      })) : [];
      
      // Store sections in settings
      const updatedSettings = {
        ...settings,
        sections: processedSections
      };
      
      // Log the data for debugging
      console.log('Creating form with data:', JSON.stringify({
        settings: updatedSettings,
        elements
      }, null, 2));
      
      // Create the new form
      const newForm = await prisma.form.create({
        data: {
          title,
          description: description || '',
          slug,
          elements: elements || [],
          settings: updatedSettings || {},
          appearance: appearance || {},
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
      
      const { title, description, categoryId, elements, sections, settings, status, type, appearance } = formData;
      
      // Keep the existing slug - we don't change slugs on update
      let slug = existingForm.slug;
      
      // Process sections to ensure titles and descriptions are set
      const processedSections = sections ? sections.map(section => ({
        ...section,
        title: section.title || 'Untitled Section',
        description: section.description || '',
        elements: section.elements ? section.elements.map(el => ({
          ...el,
          label: el.label || 'Untitled Element',
          description: el.description || ''
        })) : []
      })) : [];
      
      // Store sections in settings
      const updatedSettings = {
        ...settings,
        sections: processedSections
      };
      
      // Log the incoming data for debugging
      console.log('Updating form with data:', JSON.stringify({
        title,
        description,
        categoryId,
        type,
        status,
        settings: updatedSettings
      }, null, 2));
      
      // Handle categoryId properly to avoid foreign key constraint violations
      let finalCategoryId = existingForm.categoryId;
      
      // Only update categoryId if it's explicitly provided
      if (categoryId !== undefined) {
        // If null, empty string, or invalid ID is provided, set to null
        // This allows clearing the category
        finalCategoryId = null;
        
        // Only try to set a non-null categoryId if it's a non-empty string
        if (categoryId && typeof categoryId === 'string' && categoryId.trim() !== '') {
          try {
            // Log the category ID we're looking for
            console.log(`Looking for category with ID: "${categoryId}"`);
            
            // Try to find the category
            const categoryExists = await prisma.formCategory.findUnique({
              where: { id: categoryId }
            });
            
            if (categoryExists) {
              finalCategoryId = categoryId;
              console.log(`Category found: ${categoryExists.name}`);
            } else {
              console.warn(`Category ID ${categoryId} does not exist. Setting category to null.`);
            }
          } catch (categoryError) {
            console.warn(`Error verifying category ID ${categoryId}:`, categoryError);
            // Set to null on error
          }
        } else {
          console.log(`Setting categoryId to null (received: ${categoryId})`);
        }
      }
      
      // Ensure status is a valid enum value
      let finalStatus = existingForm.status;
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
          settings: updatedSettings,
          appearance: appearance !== undefined ? appearance : existingForm.appearance,
          status: finalStatus,
          categoryId: finalCategoryId,
          type: type || existingForm.type
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
      const form = await this.getFormById(id, companyId);
      
      // Find all submissions for this form
      const submissions = await prisma.formSubmission.findMany({
        where: {
          formId: id
        }
      });
      
      console.log(`Found ${submissions.length} submissions for form ${id}`);
      
      // STEP 1: First clone the submissions to a new dataset
      // This ensures data is preserved even if the process is interrupted
      
      // Find or create a dataset for orphaned form submissions
      let dataset = await prisma.dataset.findFirst({
        where: {
          type: 'orphaned_form_submissions',
          companyId: companyId
        }
      });
      
      if (!dataset) {
        console.log('Creating new dataset for orphaned form submissions');
        dataset = await prisma.dataset.create({
          data: {
            name: 'Orphaned Form Submissions',
            description: 'Submissions from deleted forms',
            type: 'orphaned_form_submissions',
            companyId: companyId
          }
        });
      }
      
      // Copy all submissions to DataRecord
      const dataRecords = [];
      for (const submission of submissions) {
        const dataRecord = await prisma.dataRecord.create({
          data: {
            datasetId: dataset.id,
            data: submission.data,
            metadata: {
              ...(submission.metadata || {}),
              originalFormId: id,
              originalFormTitle: form.title,
              originalSubmissionId: submission.id,
              submittedAt: submission.createdAt.toISOString(),
              source: 'deleted_form_submission'
            }
          }
        });
        dataRecords.push(dataRecord);
      }
      
      console.log(`Successfully cloned ${dataRecords.length} submissions to DataRecord`);
      
      // STEP 2: Now that we've safely cloned the data, delete the original submissions
      const deletedSubmissions = await prisma.formSubmission.deleteMany({
        where: {
          formId: id
        }
      });
      
      console.log(`Deleted ${deletedSubmissions.count} form submissions`);
      
      // STEP 3: Finally delete the form
      const deletedForm = await prisma.form.delete({
        where: {
          id: id
        }
      });
      
      console.log(`Successfully deleted form ${id}`);
      
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
