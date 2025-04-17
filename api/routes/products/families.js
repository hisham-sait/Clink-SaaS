const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all families for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const families = await prisma.productFamily.findMany({
      where: { companyId },
      include: {
        _count: {
          select: {
            products: true,
            requiredAttributes: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(families);
  } catch (error) {
    console.error('Error fetching families:', error);
    res.status(500).json({ error: 'Failed to fetch families' });
  }
});

// Get a single family with all details
router.get('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    const family = await prisma.productFamily.findFirst({
      where: { id, companyId },
      include: {
        attributeGroups: {
          include: {
            attributes: {
              include: {
                attribute: true
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        requiredAttributes: {
          include: {
            attribute: true,
            group: true
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }
    
    res.json(family);
  } catch (error) {
    console.error('Error fetching family:', error);
    res.status(500).json({ error: 'Failed to fetch family' });
  }
});

// Create a new family
router.post('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { 
      attributeGroups, 
      requiredAttributes,
      ...familyData 
    } = req.body;
    
    // Check if code is unique for this company
    const existingFamily = await prisma.productFamily.findFirst({
      where: {
        companyId,
        code: familyData.code
      }
    });
    
    if (existingFamily) {
      return res.status(400).json({ error: 'Family code must be unique within the company' });
    }
    
    // Create the family with a transaction to ensure all related data is created
    const family = await prisma.$transaction(async (prisma) => {
      // Create the family
      const newFamily = await prisma.productFamily.create({
        data: {
          ...familyData,
          companyId
        }
      });
      
      // Create attribute groups if provided
      if (attributeGroups && attributeGroups.length > 0) {
        for (const [index, group] of attributeGroups.entries()) {
          await prisma.productAttributeGroup.create({
            data: {
              ...group,
              order: group.order || index + 1,
              familyId: newFamily.id
            }
          });
        }
      }
      
      // Create required attributes if provided
      if (requiredAttributes && requiredAttributes.length > 0) {
        for (const [index, attr] of requiredAttributes.entries()) {
          await prisma.productFamilyAttribute.create({
            data: {
              attributeId: attr.attributeId,
              groupId: attr.groupId,
              isRequired: attr.isRequired !== undefined ? attr.isRequired : true,
              order: attr.order || index + 1,
              familyId: newFamily.id
            }
          });
        }
      }
      
      return newFamily;
    });
    
    res.status(201).json(family);
  } catch (error) {
    console.error('Error creating family:', error);
    res.status(500).json({ error: 'Failed to create family', details: error.message });
  }
});

// Update a family
router.put('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { 
      attributeGroups, 
      requiredAttributes,
      ...familyData 
    } = req.body;
    
    // Check if family exists
    const existingFamily = await prisma.productFamily.findFirst({
      where: { id, companyId }
    });
    
    if (!existingFamily) {
      return res.status(404).json({ error: 'Family not found' });
    }
    
    // Check if code is unique for this company (if changed)
    if (familyData.code && familyData.code !== existingFamily.code) {
      const duplicateCode = await prisma.productFamily.findFirst({
        where: {
          companyId,
          code: familyData.code,
          id: { not: id }
        }
      });
      
      if (duplicateCode) {
        return res.status(400).json({ error: 'Family code must be unique within the company' });
      }
    }
    
    // Update the family with a transaction
    const updatedFamily = await prisma.$transaction(async (prisma) => {
      // Update basic family data
      const family = await prisma.productFamily.update({
        where: { id },
        data: familyData
      });
      
      // Update attribute groups if provided
      if (attributeGroups !== undefined) {
        // Delete existing groups
        await prisma.productAttributeGroup.deleteMany({
          where: { familyId: id }
        });
        
        // Create new groups
        if (attributeGroups && attributeGroups.length > 0) {
          for (const [index, group] of attributeGroups.entries()) {
            await prisma.productAttributeGroup.create({
              data: {
                ...group,
                order: group.order || index + 1,
                familyId: id
              }
            });
          }
        }
      }
      
      // Update required attributes if provided
      if (requiredAttributes !== undefined) {
        // Delete existing required attributes
        await prisma.productFamilyAttribute.deleteMany({
          where: { familyId: id }
        });
        
        // Create new required attributes
        if (requiredAttributes && requiredAttributes.length > 0) {
          for (const [index, attr] of requiredAttributes.entries()) {
            await prisma.productFamilyAttribute.create({
              data: {
                attributeId: attr.attributeId,
                groupId: attr.groupId,
                isRequired: attr.isRequired !== undefined ? attr.isRequired : true,
                order: attr.order || index + 1,
                familyId: id
              }
            });
          }
        }
      }
      
      return family;
    });
    
    res.json(updatedFamily);
  } catch (error) {
    console.error('Error updating family:', error);
    res.status(500).json({ error: 'Failed to update family', details: error.message });
  }
});

// Delete a family
router.delete('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    // Check if family exists
    const family = await prisma.productFamily.findFirst({
      where: { id, companyId }
    });
    
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }
    
    // Check if family is in use by products
    const productsCount = await prisma.product.count({
      where: { familyId: id }
    });
    
    if (productsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete a family that is in use by products',
        productsCount
      });
    }
    
    // Delete the family (cascade will handle related records)
    await prisma.$transaction(async (prisma) => {
      // Delete attribute groups
      await prisma.productAttributeGroup.deleteMany({
        where: { familyId: id }
      });
      
      // Delete family attributes
      await prisma.productFamilyAttribute.deleteMany({
        where: { familyId: id }
      });
      
      // Delete the family
      await prisma.productFamily.delete({
        where: { id }
      });
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting family:', error);
    res.status(500).json({ error: 'Failed to delete family' });
  }
});

// Get products for a family
router.get('/:companyId/:id/products', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { 
      page = 1, 
      limit = 20,
      search = '',
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter conditions
    const where = { 
      companyId,
      familyId: id
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get total count for pagination
    const total = await prisma.product.count({ where });
    
    // Get products with pagination, sorting and filtering
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        media: {
          where: { type: 'IMAGE' },
          orderBy: { order: 'asc' },
          take: 1
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: parseInt(limit)
    });
    
    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching family products:', error);
    res.status(500).json({ error: 'Failed to fetch family products' });
  }
});

module.exports = router;
