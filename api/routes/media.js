const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mediaService = require('../services/media');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/media');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log('Saving file to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const filename = `media-${uniqueSuffix}${ext}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept images and other media types
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
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



/**
 * @route POST /api/media/:companyId/upload
 * @desc Upload a new media file
 * @access Private
 */
router.post('/:companyId/upload', upload.single('file'), async (req, res) => {
  try {
    const { companyId } = req.params;
    const { title, description, alt, section, folderId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const media = await mediaService.saveMedia(file, {
      companyId,
      section,
      title,
      description,
      alt,
      folderId: folderId === 'null' ? null : folderId
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

/**
 * @route PUT /api/media/:companyId/:id
 * @desc Update media details
 * @access Private
 */
router.put('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { title, description, alt, section, folderId } = req.body;

    const updatedMedia = await mediaService.updateMedia(id, companyId, {
      title,
      description,
      alt,
      section,
      folderId: folderId === 'null' ? null : folderId
    });

    res.json(updatedMedia);
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ error: 'Failed to update media', details: error.message });
  }
});

/**
 * @route DELETE /api/media/:companyId/:id
 * @desc Delete a media file
 * @access Private
 */
router.delete('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;

    await mediaService.deleteMedia(id, companyId);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media', details: error.message });
  }
});

/**
 * @route GET /api/media/:companyId/folders
 * @desc Get all folders with optional filtering
 * @access Private
 */
router.get('/:companyId/folders', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { parentId, search } = req.query;

    const folders = await mediaService.getFolders({
      companyId,
      parentId: parentId === 'null' ? null : parentId,
      search
    });

    res.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders', details: error.message });
  }
});

/**
 * @route GET /api/media/:companyId/folders/:id
 * @desc Get a single folder by ID
 * @access Private
 */
router.get('/:companyId/folders/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;

    const folder = await mediaService.getFolderById(id, companyId);

    res.json(folder);
  } catch (error) {
    console.error('Error fetching folder:', error);
    if (error.message === 'Folder not found') {
      return res.status(404).json({ error: 'Folder not found' });
    }
    res.status(500).json({ error: 'Failed to fetch folder', details: error.message });
  }
});

/**
 * @route POST /api/media/:companyId/folders
 * @desc Create a new folder
 * @access Private
 */
router.post('/:companyId/folders', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { name, parentId } = req.body;

    const folder = await mediaService.createFolder({
      name,
      companyId,
      parentId: parentId === 'null' ? null : parentId
    });

    res.status(201).json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder', details: error.message });
  }
});

/**
 * @route PUT /api/media/:companyId/folders/:id
 * @desc Update folder details
 * @access Private
 */
router.put('/:companyId/folders/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { name } = req.body;

    const updatedFolder = await mediaService.updateFolder(id, companyId, {
      name
    });

    res.json(updatedFolder);
  } catch (error) {
    console.error('Error updating folder:', error);
    if (error.message === 'Folder not found') {
      return res.status(404).json({ error: 'Folder not found' });
    }
    res.status(500).json({ error: 'Failed to update folder', details: error.message });
  }
});

/**
 * @route DELETE /api/media/:companyId/folders/:id
 * @desc Delete a folder
 * @access Private
 */
router.delete('/:companyId/folders/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;
    const { recursive } = req.query;

    await mediaService.deleteFolder(id, companyId, recursive === 'true');

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting folder:', error);
    if (error.message === 'Folder not found') {
      return res.status(404).json({ error: 'Folder not found' });
    }
    if (error.message.includes('Folder is not empty')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete folder', details: error.message });
  }
});

/**
 * @route GET /api/media/:companyId/tree
 * @desc Get a hierarchical tree structure of folders and files
 * @access Private
 */
router.get('/:companyId/tree', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { includeFiles, rootFolderId } = req.query;

    const tree = await mediaService.getMediaTree(companyId, {
      includeFiles: includeFiles !== 'false',
      rootFolderId: rootFolderId === 'null' ? null : rootFolderId
    });

    res.json(tree);
  } catch (error) {
    console.error('Error fetching media tree:', error);
    res.status(500).json({ error: 'Failed to fetch media tree', details: error.message });
  }
});

/**
 * @route GET /api/media/:companyId
 * @desc Get all media files with optional filtering
 * @access Private
 */
router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { type, section, page, limit, search, folderId } = req.query;

    const result = await mediaService.getMedia({
      companyId,
      type,
      section,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search,
      folderId: folderId === 'null' ? null : folderId
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media', details: error.message });
  }
});

/**
 * @route GET /api/media/:companyId/:id
 * @desc Get a single media file by ID
 * @access Private
 */
router.get('/:companyId/:id', async (req, res) => {
  try {
    const { companyId, id } = req.params;

    const media = await mediaService.getMediaById(id, companyId);

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media', details: error.message });
  }
});

module.exports = router;
