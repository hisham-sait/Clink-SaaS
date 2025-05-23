const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/imports');
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
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Apply auth middleware to all routes
router.use(auth);

// Get all products for a company
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const products = await prisma.product.findMany({
      where: { companyId },
      include: {
        tiers: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a single product
router.get('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const product = await prisma.product.findFirst({
      where: { id, companyId },
      include: {
        tiers: true,
      },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
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
    const { tiers, ...productData } = req.body;

    const product = await prisma.product.create({
      data: {
        ...productData,
        companyId,
        tiers: {
          create: tiers,
        },
      },
      include: {
        tiers: true,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update a product
router.put('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { tiers, ...productData } = req.body;

    const product = await prisma.product.findFirst({
      where: { id, companyId },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete existing tiers
    await prisma.productTier.deleteMany({
      where: { productId: id },
    });

    // Update product and create new tiers
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        tiers: {
          create: tiers,
        },
      },
      include: {
        tiers: true,
      },
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product
router.delete('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const product = await prisma.product.findFirst({
      where: { id, companyId },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Product tiers will be automatically deleted due to onDelete: Cascade
    await prisma.product.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
