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
      
      // Transform datasets to include record count from data field
      const transformedDatasets = datasets.map(dataset => {
        // Count records in the data field (if it's an array)
        let recordCount = 0;
        if (dataset.data && Array.isArray(dataset.data)) {
          recordCount = dataset.data.length;
        } else if (dataset.data && typeof dataset.data === 'object') {
          // If data is an object with records property
          if (dataset.data.records && Array.isArray(dataset.data.records)) {
            recordCount = dataset.data.records.length;
          }
        }
        
        return {
          ...dataset,
          recordCount
        };
      });
      
      return transformedDatasets;
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
      
      // Count records in the data field
      let recordCount = 0;
      if (dataset.data && Array.isArray(dataset.data)) {
        recordCount = dataset.data.length;
      } else if (dataset.data && typeof dataset.data === 'object') {
        // If data is an object with records property
        if (dataset.data.records && Array.isArray(dataset.data.records)) {
          recordCount = dataset.data.records.length;
        }
      }
      
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
      
      // Create the new dataset
      const newDataset = await prisma.dataset.create({
        data: {
          name,
          description: description || '',
          type,
          companyId,
          data: {} // Initialize with empty data
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
      
      // Count records in the data field
      let recordCount = 0;
      if (updatedDataset.data && Array.isArray(updatedDataset.data)) {
        recordCount = updatedDataset.data.length;
      } else if (updatedDataset.data && typeof updatedDataset.data === 'object') {
        // If data is an object with records property
        if (updatedDataset.data.records && Array.isArray(updatedDataset.data.records)) {
          recordCount = updatedDataset.data.records.length;
        }
      }
      
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
      
      // Delete the dataset
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
   * Get records for a dataset
   * @param {string} datasetId - The dataset ID
   * @param {string} companyId - The company ID for access control
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Object>} - Paginated list of records
   */
  async getDatasetRecords(datasetId, companyId, options = {}) {
    try {
      // Check if dataset exists and user has access
      const dataset = await this.getDatasetById(datasetId, companyId);
      
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;
      
      // Get records from the data field
      let records = [];
      if (dataset.data && Array.isArray(dataset.data)) {
        records = dataset.data;
      } else if (dataset.data && typeof dataset.data === 'object') {
        // If data is an object with records property
        if (dataset.data.records && Array.isArray(dataset.data.records)) {
          records = dataset.data.records;
        }
      }
      
      // Sort records
      if (sortBy && records.length > 0) {
        records.sort((a, b) => {
          if (!a[sortBy] || !b[sortBy]) return 0;
          
          if (sortOrder === 'asc') {
            return a[sortBy] < b[sortBy] ? -1 : 1;
          } else {
            return a[sortBy] > b[sortBy] ? -1 : 1;
          }
        });
      }
      
      // Apply pagination
      const total = records.length;
      const paginatedRecords = records.slice(skip, skip + parseInt(limit));
      
      // Add metadata to records
      const recordsWithMetadata = paginatedRecords.map(record => {
        return {
          id: record.id || crypto.randomUUID(),
          datasetId: datasetId,
          data: record,
          createdAt: record.createdAt || new Date().toISOString(),
          updatedAt: record.updatedAt || new Date().toISOString(),
          metadata: record.metadata || {}
        };
      });
      
      return {
        data: recordsWithMetadata,
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
      
      // Create a new record object
      const newRecord = {
        id: crypto.randomUUID(),
        ...recordData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata
      };
      
      // Add the record to the dataset's data field
      let updatedData;
      if (Array.isArray(dataset.data)) {
        updatedData = [...dataset.data, newRecord];
      } else if (typeof dataset.data === 'object') {
        if (Array.isArray(dataset.data.records)) {
          updatedData = {
            ...dataset.data,
            records: [...dataset.data.records, newRecord]
          };
        } else {
          updatedData = {
            records: [newRecord]
          };
        }
      } else {
        updatedData = [newRecord];
      }
      
      // Update the dataset
      await prisma.dataset.update({
        where: {
          id: datasetId
        },
        data: {
          data: updatedData
        }
      });
      
      return {
        id: newRecord.id,
        datasetId,
        data: recordData,
        createdAt: newRecord.createdAt,
        updatedAt: newRecord.updatedAt,
        metadata
      };
    } catch (error) {
      console.error('Error in addRecord:', error);
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
      
      // Add records to the dataset
      const records = [];
      const errors = [];
      
      // Get current data
      let currentData = dataset.data;
      if (!Array.isArray(currentData)) {
        if (currentData && typeof currentData === 'object' && Array.isArray(currentData.records)) {
          currentData = currentData.records;
        } else {
          currentData = [];
        }
      }
      
      // Process and add records
      for (const item of fileData) {
        try {
          const newRecord = {
            id: crypto.randomUUID(),
            ...item,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: { source: 'file_import' }
          };
          
          currentData.push(newRecord);
          
          records.push({
            id: newRecord.id,
            datasetId,
            data: item,
            createdAt: newRecord.createdAt,
            updatedAt: newRecord.updatedAt,
            metadata: { source: 'file_import' }
          });
        } catch (error) {
          errors.push({
            data: item,
            error: error.message
          });
        }
      }
      
      // Update the dataset with the new data
      await prisma.dataset.update({
        where: {
          id: datasetId
        },
        data: {
          data: currentData
        }
      });
      
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
