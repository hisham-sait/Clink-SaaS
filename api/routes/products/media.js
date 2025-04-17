const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/products/media');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `product-media-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Accept images and other media types
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedDocumentTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const allowedVideoTypes = [
      'video/mp4', 
      'video/webm', 
      'video/ogg'
    ];
    
    const allowedTypes = [...allowedImageTypes, ...allowedDocumentTypes, ...allowedVideoTypes];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, documents, and videos are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Get all media for a product
router.get('/:companyId/:productId', async (req, res) => {
  try {
    const { companyId, productId } = req.params;
    
    // Verify product belongs to company
    const product = await prisma.product.findFirst({
      where: { id: productId, companyId }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const media = await prisma.productMedia.findMany({
      where: { productId },
      orderBy: { order: 'asc' }
    });
    
    res.json(media);
  } catch (error) {
    console.error('Error fetching product media:', error);
    res.status(500).json({ error: 'Failed to fetch product media' });
  }
});

// Upload media for a product
router.post('/:companyId/:productId/upload', upload.single('file'), async (req, res) => {
  try {
    const { companyId, productId } = req.params;
    const { title, description, alt, locale, type } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Verify product belongs to company
    const product = await prisma.product.findFirst({
      where: { id: productId, companyId }
    });
    
    if (!product) {
      // Delete the uploaded file
      fs.unlinkSync(file.path);
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Determine media type based on mimetype
    let mediaType = type || 'OTHER';
    if (!type) {
      if (file.mimetype.startsWith('image/')) {
        mediaType = 'IMAGE';
      } else if (file.mimetype.startsWith('video/')) {
        mediaType = 'VIDEO';
      } else if (
        file.mimetype === 'application/pdf' || 
        file.mimetype.includes('word') || 
        file.mimetype.includes('excel')
      ) {
        mediaType = 'DOCUMENT';
      }
    }
    
    // Get image dimensions if it's an image
    let width, height;
    if (mediaType === 'IMAGE') {
      try {
        const metadata = await sharp(file.path).metadata();
        width = metadata.width;
        height = metadata.height;
        
        // Generate thumbnail if it's an image
        const thumbnailDir = path.join(__dirname, '../../uploads/products/media/thumbnails');
        if (!fs.existsSync(thumbnailDir)) {
          fs.mkdirSync(thumbnailDir, { recursive: true });
        }
        
        const thumbnailPath = path.join(thumbnailDir, `thumb-${path.basename(file.path)}`);
        await sharp(file.path)
          .resize(300, 300, { fit: 'inside' })
          .toFile(thumbnailPath);
      } catch (err) {
        console.error('Error processing image:', err);
      }
    }
    
    // Get the next order value
    const maxOrderMedia = await prisma.productMedia.findFirst({
      where: { productId },
      orderBy: { order: 'desc' }
    });
    
    const nextOrder = maxOrderMedia ? maxOrderMedia.order + 1 : 1;
    
    // Create media record
    const media = await prisma.productMedia.create({
      data: {
        productId,
        type: mediaType,
        url: `/uploads/products/media/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        width,
        height,
        title: title || file.originalname,
        description,
        alt,
        locale,
        order: nextOrder
      }
    });
    
    res.status(201).json(media);
  } catch (error) {
    console.error('Error uploading media:', error);
    
    // Delete the uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to upload media', details: error.message });
  }
});

// Update media details
router.put('/:companyId/:productId/media/:id', async (req, res) => {
  try {
    const { companyId, productId, id } = req.params;
    const { title, description, alt, order, locale } = req.body;
    
    // Verify product belongs to company
    const product = await prisma.product.findFirst({
      where: { id: productId, companyId }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if media exists
    const existingMedia = await prisma.productMedia.findFirst({
      where: { id, productId }
    });
    
    if (!existingMedia) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    // Update media
    const updatedMedia = await prisma.productMedia.update({
      where: { id },
      data: {
        title,
        description,
        alt,
        order,
        locale
      }
    });
    
    res.json(updatedMedia);
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ error: 'Failed to update media' });
  }
});

// Delete media
router.delete('/:companyId/:productId/media/:id', async (req, res) => {
  try {
    const { companyId, productId, id } = req.params;
    
    // Verify product belongs to company
    const product = await prisma.product.findFirst({
      where: { id: productId, companyId }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if media exists
    const media = await prisma.productMedia.findFirst({
      where: { id, productId }
    });
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    // Delete the file
    const filePath = path.join(__dirname, '../../', media.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete thumbnail if it exists
    if (media.type === 'IMAGE') {
      const thumbnailPath = path.join(
        __dirname, 
        '../../uploads/products/media/thumbnails', 
        `thumb-${media.filename}`
      );
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }
    
    // Delete the media record
    await prisma.productMedia.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Reorder media
router.post('/:companyId/:productId/media/reorder', async (req, res) => {
  try {
    const { companyId, productId } = req.params;
    const { mediaIds } = req.body;
    
    if (!mediaIds || !Array.isArray(mediaIds)) {
      return res.status(400).json({ error: 'Media IDs array is required' });
    }
    
    // Verify product belongs to company
    const product = await prisma.product.findFirst({
      where: { id: productId, companyId }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update order for each media
    await prisma.$transaction(
      mediaIds.map((mediaId, index) => 
        prisma.productMedia.updateMany({
          where: { 
            id: mediaId,
            productId
          },
          data: { order: index + 1 }
        })
      )
    );
    
    // Get updated media list
    const updatedMedia = await prisma.productMedia.findMany({
      where: { productId },
      orderBy: { order: 'asc' }
    });
    
    res.json(updatedMedia);
  } catch (error) {
    console.error('Error reordering media:', error);
    res.status(500).json({ error: 'Failed to reorder media' });
  }
});

module.exports = router;
