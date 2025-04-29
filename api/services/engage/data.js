const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

/**
 * Service for handling dataset operations
 */
const dataService = {
  /**
   * Get all datasets for a company
   * @param {string} companyId - The company ID
   * @returns {Promise<Array>} - List of datasets
   */
  async getAllDatasets(companyId) {
    try {
      const datasets = await prisma.dataset.findMany({
        where: {
          companyId: companyId
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      
      // Get record counts for each dataset
      const datasetsWithCounts = await Promise.all(datasets.map(async (dataset) => {
        const count = await prisma.dataRecord.count({
          where: {
            datasetId: dataset.id
          }
        });
        
        return {
          ...dataset,
          recordCount: count
        };
      }));
      
      return datasetsWithCounts;
    } catch (error) {
      console.error('Error in getAllDatasets:', error);
      return [];
    }
  },

  /**
   * Get a dataset by ID
   * @param {string} id - The dataset ID
   * @param {string} companyId - The company ID for access control
   * @returns {Promise<Object>} - The dataset
   */
  async getDatasetById(id, companyId) {
    try {
      const dataset = await prisma.dataset.findUnique({
        where: {
          id: id
        }
      });
      
      if (!dataset) {
        throw new Error('Dataset not found');
      }
      
      // Check if user has access to this dataset
      if (dataset.companyId !== companyId) {
        throw new Error('Access denied');
      }
      
      // Get record count
      const recordCount = await prisma.dataRecord.count({
        where: {
          datasetId: dataset.id
        }
      });
      
      return {
        ...dataset,
        recordCount
      };
    } catch (error) {
      console.error('Error in getDatasetById:', error);
      throw error;
    }
  },

  /**
   * Create a new dataset
   * @param {Object} datasetData - The dataset data
   * @param {string} companyId - The company ID
   * @returns {Promise<Object>} - The created dataset
   */
  async createDataset(datasetData, companyId) {
    try {
      const { name, description, type } = datasetData;
      
      let webhookId = null;
      let webhookSecret = null;
      
      // Generate webhook ID and secret for webhook type datasets
      if (type === 'webhook') {
        webhookId = crypto.randomBytes(16).toString('hex');
        webhookSecret = crypto.randomBytes(32).toString('hex');
      }
      
      // Create the new dataset
      const newDataset = await prisma.dataset.create({
        data: {
          name,
          description: description || '',
          type,
          webhookId,
          webhookSecret,
          data: {}, // Initialize with empty data
          company: {
            connect: {
              id: companyId
            }
          }
        }
      });
      
      return {
        ...newDataset,
        recordCount: 0
      };
    } catch (error) {
      console.error('Error in createDataset:', error);
      throw error;
    }
  },

  /**
   * Update a dataset
   * @param {string} id - The dataset ID
   * @param {Object} datasetData - The dataset data
   * @param {string} companyId - The company ID for access control
   * @returns {Promise<Object>} - The updated dataset
   */
  async updateDataset(id, datasetData, companyId) {
    try {
      // Check if dataset exists and user has access
      const existingDataset = await this.getDatasetById(id, companyId);
      
      const { name, description } = datasetData;
      
      // Update the dataset
      const updatedDataset = await prisma.dataset.update({
        where: {
          id: id
        },
        data: {
          name: name || existingDataset.name,
          description: description !== undefined ? description : existingDataset.description
        }
      });
      
      // Get record count
      const recordCount = await prisma.dataRecord.count({
        where: {
          datasetId: updatedDataset.id
        }
      });
      
      return {
        ...updatedDataset,
        recordCount
      };
    } catch (error) {
      console.error('Error in updateDataset:', error);
      throw error;
    }
  },

  /**
   * Delete a dataset
   * @param {string} id - The dataset ID
   * @param {string} companyId - The company ID for access control
   * @returns {Promise<Object>} - The deleted dataset
   */
  async deleteDataset(id, companyId) {
    try {
      // Check if dataset exists and user has access
      await this.getDatasetById(id, companyId);
      
      // Delete the dataset (cascade will delete records)
      const deletedDataset = await prisma.dataset.delete({
        where: {
          id: id
        }
      });
      
      return deletedDataset;
    } catch (error) {
      console.error('Error in deleteDataset:', error);
      throw error;
    }
  },

  /**
   * Regenerate webhook secret
   * @param {string} id - The dataset ID
   * @param {string} companyId - The company ID for access control
   * @returns {Promise<Object>} - The updated dataset with new webhook secret
   */
  async regenerateWebhookSecret(id, companyId) {
    try {
      // Check if dataset exists and user has access
      const dataset = await this.getDatasetById(id, companyId);
      
      if (dataset.type !== 'webhook') {
        throw new Error('Dataset is not a webhook type');
      }
      
      // Generate new webhook secret
      const webhookSecret = crypto.randomBytes(32).toString('hex');
      
      // Update the dataset
      const updatedDataset = await prisma.dataset.update({
        where: {
          id: id
        },
        data: {
          webhookSecret
        }
      });
      
      // Get record count
      const recordCount = await prisma.dataRecord.count({
        where: {
          datasetId: updatedDataset.id
        }
      });
      
      return {
        ...updatedDataset,
        recordCount
      };
    } catch (error) {
      console.error('Error in regenerateWebhookSecret:', error);
      throw error;
    }
  },

  /**
   * Get records for a dataset
   * @param {string} datasetId - The dataset ID
   * @param {string} companyId - The company ID for access control
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Object>} - Paginated list of records
   */
  async getDatasetRecords(datasetId, companyId, options = {}) {
    try {
      // Check if dataset exists and user has access
      await this.getDatasetById(datasetId, companyId);
      
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;
      
      // Get records
      const records = await prisma.dataRecord.findMany({
        where: {
          datasetId: datasetId
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: parseInt(skip),
        take: parseInt(limit)
      });
      
      // Get total count
      const total = await prisma.dataRecord.count({
        where: {
          datasetId: datasetId
        }
      });
      
      return {
        data: records,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      };
    } catch (error) {
      console.error('Error in getDatasetRecords:', error);
      throw error;
    }
  },

  /**
   * Add a record to a dataset
   * @param {string} datasetId - The dataset ID
   * @param {Object} recordData - The record data
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} - The created record
   */
  async addRecord(datasetId, recordData, metadata = {}) {
    try {
      // Check if dataset exists
      const dataset = await prisma.dataset.findUnique({
        where: {
          id: datasetId
        }
      });
      
      if (!dataset) {
        throw new Error('Dataset not found');
      }
      
      // Create record
      const record = await prisma.dataRecord.create({
        data: {
          datasetId,
          data: recordData,
          metadata,
          updatedAt: new Date()
        }
      });
      
      return record;
    } catch (error) {
      console.error('Error in addRecord:', error);
      throw error;
    }
  },

  /**
   * Add a record via webhook
   * @param {string} webhookId - The webhook ID
   * @param {string} webhookSecret - The webhook secret
   * @param {Object} recordData - The record data
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} - The created record
   */
  async addRecordViaWebhook(webhookId, webhookSecret, recordData, metadata = {}) {
    try {
      // Find dataset by webhook ID
      const dataset = await prisma.dataset.findUnique({
        where: {
          webhookId: webhookId
        }
      });
      
      if (!dataset) {
        throw new Error('Invalid webhook ID');
      }
      
      // Verify webhook secret
      if (dataset.webhookSecret !== webhookSecret) {
        throw new Error('Invalid webhook secret');
      }
      
      // Create record
      const record = await prisma.dataRecord.create({
        data: {
          datasetId: dataset.id,
          data: recordData,
          metadata,
          updatedAt: new Date()
        }
      });
      
      return record;
    } catch (error) {
      console.error('Error in addRecordViaWebhook:', error);
      throw error;
    }
  },

  /**
   * Process and import data from a file
   * @param {string} datasetId - The dataset ID or null to create a new dataset
   * @param {string} companyId - The company ID
   * @param {Object} fileData - The parsed file data
   * @param {Object} options - Import options
   * @returns {Promise<Object>} - Import results
   */
  async importData(datasetId, companyId, fileData, options = {}) {
    try {
      let dataset;
      
      // Create new dataset if datasetId is not provided
      if (!datasetId) {
        const { name, description } = options;
        dataset = await this.createDataset({
          name: name || 'Imported Data',
          description: description || 'Data imported from file',
          type: 'upload'
        }, companyId);
        datasetId = dataset.id;
      } else {
        // Check if dataset exists and user has access
        dataset = await this.getDatasetById(datasetId, companyId);
      }
      
      // Process and add records
      const records = [];
      const errors = [];
      
      for (const item of fileData) {
        try {
          const record = await this.addRecord(datasetId, item, { source: 'file_import' });
          records.push(record);
        } catch (error) {
          errors.push({
            data: item,
            error: error.message
          });
        }
      }
      
      return {
        dataset,
        imported: records.length,
        errors: errors.length,
        errorDetails: errors
      };
    } catch (error) {
      console.error('Error in importData:', error);
      throw error;
    }
  }
};

module.exports = dataService;
