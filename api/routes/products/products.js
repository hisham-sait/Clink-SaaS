const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `file-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Accept images, documents, and other common file types
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get all products for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      categoryId = '', 
      familyId = '',
      status = '',
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter conditions
    const where = { companyId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (familyId) {
      where.familyId = familyId;
    }
    
    if (status) {
      where.status = status;
    }
    
    // Get total count for pagination
    const total = await prisma.product.count({ where });
    
    // Get products with pagination, sorting and filtering
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        family: true,
        media: {
          where: { type: 'IMAGE' },
          orderBy: { order: 'asc' },
          take: 1
        },
        attributeValues: {
          include: {
            attribute: true
          }
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
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a single product with all details
router.get('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    const product = await prisma.product.findFirst({
      where: { id, companyId },
      include: {
        category: true,
        family: {
          include: {
            attributeGroups: {
              include: {
                attributes: {
                  include: {
                    attribute: true
                  }
                }
              }
            },
            requiredAttributes: {
              include: {
                attribute: true,
                group: true
              }
            }
          }
        },
        attributeValues: {
          include: {
            attribute: true
          }
        },
        variants: true,
        media: {
          orderBy: { order: 'asc' }
        },
        tiers: true
      }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Calculate completeness if product has a family
    if (product.family) {
      const requiredAttributes = product.family.requiredAttributes.map(ra => ra.attributeId);
      const filledAttributes = product.attributeValues
        .filter(av => requiredAttributes.includes(av.attributeId))
        .map(av => av.attributeId);
      
      const completeness = requiredAttributes.length > 0
        ? Math.round((filledAttributes.length / requiredAttributes.length) * 100)
        : 100;
      
      product.completeness = completeness;
      
      // Update completeness in database if it changed
      if (product.completeness !== completeness) {
        await prisma.product.update({
          where: { id },
          data: { completeness }
        });
      }
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create a new product
router.post('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { 
      attributeValues, 
      variants, 
      media,
      tiers,
      ...productData 
    } = req.body;
    
    // Create the product
    const product = await prisma.product.create({
      data: {
        ...productData,
        companyId,
        attributeValues: {
          create: attributeValues || []
        },
        variants: {
          create: variants || []
        },
        tiers: {
          create: tiers || []
        }
      }
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

// Update a product
router.put('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { 
      attributeValues, 
      variants, 
      media,
      tiers,
      ...productData 
    } = req.body;
    
    // Check if product exists
    const existingProduct = await prisma.product.findFirst({
      where: { id, companyId }
    });
    
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update the product
    const updatedProduct = await prisma.$transaction(async (prisma) => {
      // Update basic product data
      const product = await prisma.product.update({
        where: { id },
        data: productData
      });
      
      // Update attribute values if provided
      if (attributeValues) {
        // Delete existing attribute values
        await prisma.productAttributeValue.deleteMany({
          where: { productId: id }
        });
        
        // Create new attribute values
        for (const av of attributeValues) {
          await prisma.productAttributeValue.create({
            data: {
              ...av,
              productId: id
            }
          });
        }
      }
      
      // Update variants if provided
      if (variants) {
        // Delete existing variants
        await prisma.productVariant.deleteMany({
          where: { productId: id }
        });
        
        // Create new variants
        for (const variant of variants) {
          await prisma.productVariant.create({
            data: {
              ...variant,
              productId: id
            }
          });
        }
      }
      
      // Update tiers if provided
      if (tiers) {
        // Delete existing tiers
        await prisma.productTier.deleteMany({
          where: { productId: id }
        });
        
        // Create new tiers
        for (const tier of tiers) {
          await prisma.productTier.create({
            data: {
              ...tier,
              productId: id
            }
          });
        }
      }
      
      return product;
    });
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product', details: error.message });
  }
});

// Delete a product
router.delete('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    
    // Check if product exists
    const product = await prisma.product.findFirst({
      where: { id, companyId }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete the product (cascade will handle related records)
    await prisma.product.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Bulk edit products
router.post('/:companyId/bulk-edit', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { ids, data } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No product IDs provided' });
    }
    
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No update data provided' });
    }
    
    // Update products that match both the IDs and company ID
    const result = await prisma.product.updateMany({
      where: {
        id: { in: ids },
        companyId
      },
      data
    });
    
    res.json({ updated: result.count });
  } catch (error) {
    console.error('Error bulk editing products:', error);
    res.status(500).json({ error: 'Failed to update products' });
  }
});

// Bulk delete products
router.post('/:companyId/bulk-delete', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No product IDs provided' });
    }
    
    // Delete products that match both the IDs and company ID
    const result = await prisma.product.deleteMany({
      where: {
        id: { in: ids },
        companyId
      }
    });
    
    res.json({ deleted: result.count });
  } catch (error) {
    console.error('Error bulk deleting products:', error);
    res.status(500).json({ error: 'Failed to delete products' });
  }
});

module.exports = router;
