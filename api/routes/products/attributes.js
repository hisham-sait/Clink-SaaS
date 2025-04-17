const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all attributes for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { type, sectionId } = req.query;
    
    const where = { companyId };
    
    // Filter by type if provided
    if (type) {
      where.type = type;
    }
    
    // Filter by section if provided
    if (sectionId) {
      where.sectionId = sectionId;
    }
    
    const attributes = await prisma.productAttribute.findMany({
      where,
      include: {
        section: true
      },
      orderBy: { name: 'asc' }
    });
    
    // Get usage statistics for each attribute
    const attributesWithUsage = await Promise.all(
      attributes.map(async (attribute) => {
        const productCount = await prisma.productAttributeValue.count({
          where: { attributeId: attribute.id }
        });
        
        const familyCount = await prisma.productFamilyAttribute.count({
          where: { attributeId: attribute.id }
        });
        
        return {
          ...attribute,
          usage: {
            productCount,
            familyCount
          }
        };
      })
    );
    
    res.json(attributesWithUsage);
  } catch (error) {
    console.error('Error fetching attributes:', error);
    res.status(500).json({ error: 'Failed to fetch attributes' });
  }
});

// Get a single attribute
router.get('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    const attribute = await prisma.productAttribute.findFirst({
      where: { id, companyId },
      include: {
        section: true
      }
    });
    
    if (!attribute) {
      return res.status(404).json({ error: 'Attribute not found' });
    }
    
    // Get usage statistics
    const productCount = await prisma.productAttributeValue.count({
      where: { attributeId: id }
    });
    
    const familyCount = await prisma.productFamilyAttribute.count({
      where: { attributeId: id }
    });
    
    res.json({
      ...attribute,
      usage: {
        productCount,
        familyCount
      }
    });
  } catch (error) {
    console.error('Error fetching attribute:', error);
    res.status(500).json({ error: 'Failed to fetch attribute' });
  }
});

// Create a new attribute
router.post('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const attributeData = req.body;
    
    // Check if code is unique for this company
    const existingAttribute = await prisma.productAttribute.findFirst({
      where: {
        companyId,
        code: attributeData.code
      }
    });
    
    if (existingAttribute) {
      return res.status(400).json({ error: 'Attribute code must be unique within the company' });
    }
    
    // Validate attribute data based on type
    validateAttributeData(attributeData);
    
    const attribute = await prisma.productAttribute.create({
      data: {
        ...attributeData,
        companyId
      }
    });
    
    res.status(201).json(attribute);
  } catch (error) {
    console.error('Error creating attribute:', error);
    res.status(500).json({ error: 'Failed to create attribute', details: error.message });
  }
});

// Update an attribute
router.put('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const attributeData = req.body;
    
    // Check if attribute exists
    const existingAttribute = await prisma.productAttribute.findFirst({
      where: { id, companyId }
    });
    
    if (!existingAttribute) {
      return res.status(404).json({ error: 'Attribute not found' });
    }
    
    // Check if code is unique for this company (if changed)
    if (attributeData.code && attributeData.code !== existingAttribute.code) {
      const duplicateCode = await prisma.productAttribute.findFirst({
        where: {
          companyId,
          code: attributeData.code,
          id: { not: id }
        }
      });
      
      if (duplicateCode) {
        return res.status(400).json({ error: 'Attribute code must be unique within the company' });
      }
    }
    
    // Validate attribute data based on type
    validateAttributeData(attributeData);
    
    // Check if type is being changed
    if (attributeData.type && attributeData.type !== existingAttribute.type) {
      // Check if attribute is in use
      const attributeValueCount = await prisma.productAttributeValue.count({
        where: { attributeId: id }
      });
      
      if (attributeValueCount > 0) {
        return res.status(400).json({ 
          error: 'Cannot change the type of an attribute that is already in use',
          attributeValueCount
        });
      }
    }
    
    const updatedAttribute = await prisma.productAttribute.update({
      where: { id },
      data: attributeData
    });
    
    res.json(updatedAttribute);
  } catch (error) {
    console.error('Error updating attribute:', error);
    res.status(500).json({ error: 'Failed to update attribute', details: error.message });
  }
});

// Delete an attribute
router.delete('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    // Check if attribute exists
    const attribute = await prisma.productAttribute.findFirst({
      where: { id, companyId }
    });
    
    if (!attribute) {
      return res.status(404).json({ error: 'Attribute not found' });
    }
    
    // Check if attribute is in use in products
    const attributeValueCount = await prisma.productAttributeValue.count({
      where: { attributeId: id }
    });
    
    if (attributeValueCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete an attribute that is in use by products',
        attributeValueCount
      });
    }
    
    // Check if attribute is in use in families
    const familyAttributeCount = await prisma.productFamilyAttribute.count({
      where: { attributeId: id }
    });
    
    if (familyAttributeCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete an attribute that is in use by product families',
        familyAttributeCount
      });
    }
    
    // Delete the attribute
    await prisma.productAttribute.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting attribute:', error);
    res.status(500).json({ error: 'Failed to delete attribute' });
  }
});

// Helper function to validate attribute data based on type
function validateAttributeData(attributeData) {
  const { type, options, validationRules, tableConfig } = attributeData;
  
  if (!type) return; // Skip validation if type is not provided
  
  // Validate options for select/multiselect types
  if ((type === 'SELECT' || type === 'MULTISELECT') && (!options || !Array.isArray(options))) {
    throw new Error(`Options must be provided for ${type} attribute type`);
  }
  
  // Validate table configuration for TABLE type
  if (type === 'TABLE') {
    if (!tableConfig) {
      // If tableConfig is not provided, we'll use a default in the route handler
      console.log('No tableConfig provided for TABLE attribute, will use default');
    } else if (!tableConfig.columns || !Array.isArray(tableConfig.columns) || tableConfig.columns.length === 0) {
      throw new Error('TABLE attribute must have at least one column defined in tableConfig');
    }
  }
  
  // Validate validation rules
  if (validationRules) {
    switch (type) {
      case 'TEXT':
      case 'TEXTAREA':
        // Text validation can include min/max length, regex pattern
        if (validationRules.minLength !== undefined && !Number.isInteger(validationRules.minLength)) {
          throw new Error('minLength must be an integer');
        }
        if (validationRules.maxLength !== undefined && !Number.isInteger(validationRules.maxLength)) {
          throw new Error('maxLength must be an integer');
        }
        break;
        
      case 'NUMBER':
      case 'PRICE':
      case 'METRIC':
        // Numeric validation can include min/max values
        if (validationRules.min !== undefined && typeof validationRules.min !== 'number') {
          throw new Error('min must be a number');
        }
        if (validationRules.max !== undefined && typeof validationRules.max !== 'number') {
          throw new Error('max must be a number');
        }
        break;
        
      case 'DATE':
      case 'DATETIME':
        // Date validation can include min/max dates
        if (validationRules.minDate !== undefined && isNaN(Date.parse(validationRules.minDate))) {
          throw new Error('minDate must be a valid date');
        }
        if (validationRules.maxDate !== undefined && isNaN(Date.parse(validationRules.maxDate))) {
          throw new Error('maxDate must be a valid date');
        }
        break;
    }
  }
}

module.exports = router;
