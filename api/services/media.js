const prisma = require('./prisma');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

/**
 * Media service for handling media files across the application
 */
class MediaService {
  /**
   * Get all media files with optional filtering
   * @param {Object} options - Query options
   * @param {string} options.companyId - Company ID
   * @param {string} options.type - Media type filter (IMAGE, VIDEO, DOCUMENT, etc.)
   * @param {string} options.section - Section the media belongs to (engage, products, etc.)
   * @param {number} options.page - Page number for pagination
   * @param {number} options.limit - Number of items per page
   * @param {string} options.search - Search term for media name/title
   * @param {string} options.folderId - Folder ID to filter by
   * @returns {Promise<Object>} - Media files and pagination info
   */
  async getMedia(options = {}) {
    const {
      companyId,
      type,
      section,
      page = 1,
      limit = 20,
      search = '',
      folderId
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = { companyId };
    
    if (type) {
      where.type = type;
    }
    
    if (section) {
      where.section = section;
    }
    
    if (folderId) {
      where.folderId = folderId;
    } else if (folderId === null) {
      // Explicitly looking for files not in any folder (root level)
      where.folderId = null;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count for pagination
    const total = await prisma.media.count({ where });
    
    // Get media files
    const media = await prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            path: true
          }
        }
      }
    });

    return {
      media,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a single media file by ID
   * @param {string} id - Media ID
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} - Media file
   */
  async getMediaById(id, companyId) {
    return prisma.media.findFirst({
      where: { id, companyId },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            path: true
          }
        }
      }
    });
  }

  /**
   * Save a media file
   * @param {Object} file - Uploaded file object from multer
   * @param {Object} data - Additional media data
   * @param {string} data.companyId - Company ID
   * @param {string} data.section - Section the media belongs to
   * @param {string} data.title - Media title
   * @param {string} data.description - Media description
   * @param {string} data.alt - Alt text for images
   * @param {string} data.folderId - Folder ID (optional)
   * @returns {Promise<Object>} - Created media record
   */
  async saveMedia(file, data) {
    const {
      companyId,
      section = 'general',
      title,
      description,
      alt,
      folderId
    } = data;

    if (!file) {
      throw new Error('No file provided');
    }

    // If folderId is provided, check if folder exists and belongs to the company
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, companyId }
      });

      if (!folder) {
        throw new Error('Folder not found or does not belong to this company');
      }
    }

    // Determine media type based on mimetype
    let mediaType = 'OTHER';
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

    // Get image dimensions if it's an image
    let width, height;
    let thumbnailUrl = null;
    
    if (mediaType === 'IMAGE') {
      try {
        console.log('Processing image file:', file.path);
        const metadata = await sharp(file.path).metadata();
        width = metadata.width;
        height = metadata.height;

        // Generate thumbnail if it's an image
        const thumbnailDir = path.join(__dirname, '../uploads/media/thumbnails');
        if (!fs.existsSync(thumbnailDir)) {
          fs.mkdirSync(thumbnailDir, { recursive: true });
        }

        const thumbnailFilename = `thumb-${path.basename(file.path)}`;
        const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
        
        console.log('Creating thumbnail at:', thumbnailPath);
        await sharp(file.path)
          .resize(300, 300, { fit: 'inside' })
          .toFile(thumbnailPath);
          
        thumbnailUrl = `/uploads/media/thumbnails/${thumbnailFilename}`;
        console.log('Thumbnail URL:', thumbnailUrl);
      } catch (err) {
        console.error('Error processing image:', err);
      }
    }

    // Get folder path if folderId is provided
    let filePath = null;
    if (folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId }
      });
      if (folder) {
        filePath = folder.path;
      }
    }

    // Create media record
    const media = await prisma.media.create({
      data: {
        companyId,
        section,
        type: mediaType,
        url: `/uploads/media/${file.filename}`,
        thumbnailUrl,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        width,
        height,
        title: title || file.originalname,
        description,
        alt,
        folderId,
        path: filePath
      }
    });

    return media;
  }

  /**
   * Update media details
   * @param {string} id - Media ID
   * @param {string} companyId - Company ID
   * @param {Object} data - Updated media data
   * @returns {Promise<Object>} - Updated media record
   */
  async updateMedia(id, companyId, data) {
    const { title, description, alt, section, folderId } = data;

    // Check if media exists
    const existingMedia = await prisma.media.findFirst({
      where: { id, companyId }
    });

    if (!existingMedia) {
      throw new Error('Media not found');
    }

    // If folderId is provided, check if folder exists and belongs to the company
    let filePath = existingMedia.path;
    if (folderId && folderId !== existingMedia.folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, companyId }
      });

      if (!folder) {
        throw new Error('Folder not found or does not belong to this company');
      }
      
      filePath = folder.path;
    }

    // Update media
    return prisma.media.update({
      where: { id },
      data: {
        title,
        description,
        alt,
        section,
        folderId,
        path: filePath
      }
    });
  }

  /**
   * Delete a media file
   * @param {string} id - Media ID
   * @param {string} companyId - Company ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteMedia(id, companyId) {
    // Check if media exists
    const media = await prisma.media.findFirst({
      where: { id, companyId }
    });

    if (!media) {
      throw new Error('Media not found');
    }

    // Delete the file
    const filePath = path.join(__dirname, '..', media.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete thumbnail if it exists
    if (media.thumbnailUrl) {
      const thumbnailPath = path.join(__dirname, '..', media.thumbnailUrl);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    // Delete the media record
    await prisma.media.delete({
      where: { id }
    });

    return true;
  }

  /**
   * Create a new folder
   * @param {Object} data - Folder data
   * @param {string} data.name - Folder name
   * @param {string} data.companyId - Company ID
   * @param {string} data.parentId - Parent folder ID (optional)
   * @returns {Promise<Object>} - Created folder
   */
  async createFolder(data) {
    const { name, companyId, parentId } = data;

    if (!name) {
      throw new Error('Folder name is required');
    }

    // Validate parent folder if provided
    let parentPath = '';
    if (parentId) {
      const parentFolder = await prisma.folder.findFirst({
        where: { id: parentId, companyId }
      });

      if (!parentFolder) {
        throw new Error('Parent folder not found or does not belong to this company');
      }

      parentPath = parentFolder.path;
    }

    // Create folder path
    const folderPath = parentPath ? `${parentPath}/${name}` : `/${name}`;

    // Check if folder with same path already exists
    const existingFolder = await prisma.folder.findFirst({
      where: {
        companyId,
        path: folderPath
      }
    });

    if (existingFolder) {
      throw new Error(`Folder with name "${name}" already exists in this location`);
    }

    // Create folder
    const folder = await prisma.folder.create({
      data: {
        name,
        path: folderPath,
        parentId,
        companyId
      }
    });

    return folder;
  }

  /**
   * Get all folders with optional filtering
   * @param {Object} options - Query options
   * @param {string} options.companyId - Company ID
   * @param {string} options.parentId - Parent folder ID (optional, null for root folders)
   * @param {string} options.search - Search term for folder name
   * @returns {Promise<Array>} - Folders
   */
  async getFolders(options = {}) {
    const { companyId, parentId, search } = options;

    const where = { companyId };

    // Filter by parent folder
    if (parentId === null) {
      // Explicitly looking for root folders
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }

    // Search by name
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const folders = await prisma.folder.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            path: true
          }
        },
        _count: {
          select: {
            children: true,
            media: true
          }
        }
      }
    });

    return folders;
  }

  /**
   * Get a single folder by ID
   * @param {string} id - Folder ID
   * @param {string} companyId - Company ID
   * @returns {Promise<Object>} - Folder
   */
  async getFolderById(id, companyId) {
    const folder = await prisma.folder.findFirst({
      where: { id, companyId },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            path: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            path: true,
            _count: {
              select: {
                children: true,
                media: true
              }
            }
          },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            children: true,
            media: true
          }
        }
      }
    });

    if (!folder) {
      throw new Error('Folder not found');
    }

    return folder;
  }

  /**
   * Update folder details
   * @param {string} id - Folder ID
   * @param {string} companyId - Company ID
   * @param {Object} data - Updated folder data
   * @returns {Promise<Object>} - Updated folder
   */
  async updateFolder(id, companyId, data) {
    const { name } = data;

    // Check if folder exists
    const existingFolder = await prisma.folder.findFirst({
      where: { id, companyId },
      include: {
        parent: true
      }
    });

    if (!existingFolder) {
      throw new Error('Folder not found');
    }

    // If name is changing, update path for this folder and all children
    if (name && name !== existingFolder.name) {
      // Calculate new path
      const parentPath = existingFolder.parent ? existingFolder.parent.path : '';
      const newPath = parentPath ? `${parentPath}/${name}` : `/${name}`;
      
      // Check if folder with same path already exists
      const conflictingFolder = await prisma.folder.findFirst({
        where: {
          companyId,
          path: newPath,
          id: { not: id }
        }
      });

      if (conflictingFolder) {
        throw new Error(`Folder with name "${name}" already exists in this location`);
      }

      // Get all descendant folders to update their paths
      const descendants = await this.getAllDescendantFolders(id);
      
      // Update this folder
      const updatedFolder = await prisma.folder.update({
        where: { id },
        data: { name, path: newPath }
      });

      // Update paths of all descendant folders
      for (const descendant of descendants) {
        const descendantNewPath = descendant.path.replace(existingFolder.path, newPath);
        await prisma.folder.update({
          where: { id: descendant.id },
          data: { path: descendantNewPath }
        });
      }

      // Update paths of all media files in this folder and descendant folders
      await prisma.media.updateMany({
        where: { folderId: id },
        data: { path: newPath }
      });

      for (const descendant of descendants) {
        const descendantNewPath = descendant.path.replace(existingFolder.path, newPath);
        await prisma.media.updateMany({
          where: { folderId: descendant.id },
          data: { path: descendantNewPath }
        });
      }

      return updatedFolder;
    }

    // If name is not changing, just update the folder
    return prisma.folder.update({
      where: { id },
      data: { name }
    });
  }

  /**
   * Delete a folder
   * @param {string} id - Folder ID
   * @param {string} companyId - Company ID
   * @param {boolean} recursive - Whether to delete all contents recursively
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFolder(id, companyId, recursive = false) {
    // Check if folder exists
    const folder = await prisma.folder.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: {
            children: true,
            media: true
          }
        }
      }
    });

    if (!folder) {
      throw new Error('Folder not found');
    }

    // Check if folder is empty or recursive delete is enabled
    if ((folder._count.children > 0 || folder._count.media > 0) && !recursive) {
      throw new Error('Folder is not empty. Set recursive=true to delete all contents');
    }

    if (recursive) {
      // Get all descendant folders
      const descendants = await this.getAllDescendantFolders(id);
      const descendantIds = descendants.map(d => d.id);
      
      // Delete all media files in this folder and descendant folders
      const mediaToDelete = await prisma.media.findMany({
        where: {
          OR: [
            { folderId: id },
            { folderId: { in: descendantIds } }
          ]
        }
      });

      // Delete physical files
      for (const media of mediaToDelete) {
        const filePath = path.join(__dirname, '..', media.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        if (media.thumbnailUrl) {
          const thumbnailPath = path.join(__dirname, '..', media.thumbnailUrl);
          if (fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
          }
        }
      }

      // Delete media records
      await prisma.media.deleteMany({
        where: {
          OR: [
            { folderId: id },
            { folderId: { in: descendantIds } }
          ]
        }
      });

      // Delete descendant folders (from leaf to root)
      for (let i = descendants.length - 1; i >= 0; i--) {
        await prisma.folder.delete({
          where: { id: descendants[i].id }
        });
      }
    }

    // Delete the folder
    await prisma.folder.delete({
      where: { id }
    });

    return true;
  }

  /**
   * Get all descendant folders of a folder
   * @param {string} folderId - Folder ID
   * @returns {Promise<Array>} - Descendant folders
   * @private
   */
  async getAllDescendantFolders(folderId) {
    const descendants = [];
    
    // Get immediate children
    const children = await prisma.folder.findMany({
      where: { parentId: folderId }
    });
    
    // Add children to descendants
    descendants.push(...children);
    
    // Recursively get descendants of each child
    for (const child of children) {
      const childDescendants = await this.getAllDescendantFolders(child.id);
      descendants.push(...childDescendants);
    }
    
    return descendants;
  }

  /**
   * Get a hierarchical tree structure of folders and files
   * @param {string} companyId - Company ID
   * @param {Object} options - Query options
   * @param {boolean} options.includeFiles - Whether to include files in the tree
   * @param {string} options.rootFolderId - Root folder ID to start from (optional)
   * @returns {Promise<Array>} - Tree structure
   */
  async getMediaTree(companyId, options = {}) {
    const { includeFiles = true, rootFolderId = null } = options;

    // Get all folders for the company
    const allFolders = await prisma.folder.findMany({
      where: { companyId },
      orderBy: { name: 'asc' }
    });

    // Build a map of folders by ID for quick lookup
    const folderMap = new Map();
    allFolders.forEach(folder => {
      folderMap.set(folder.id, {
        ...folder,
        type: 'folder',
        children: []
      });
    });

    // Build the tree structure
    const tree = [];

    // Add folders to the tree
    allFolders.forEach(folder => {
      const folderWithChildren = folderMap.get(folder.id);
      
      if (folder.parentId === rootFolderId) {
        // This is a root folder or a direct child of the specified root
        tree.push(folderWithChildren);
      } else if (folder.parentId && folderMap.has(folder.parentId)) {
        // This is a child folder, add it to its parent
        folderMap.get(folder.parentId).children.push(folderWithChildren);
      }
    });

    // Add files to the tree if requested
    if (includeFiles) {
      // Get all files for the company
      const files = await prisma.media.findMany({
        where: { companyId },
        orderBy: { title: 'asc' }
      });

      // Add files to their respective folders or to the root
      files.forEach(file => {
        const fileNode = {
          ...file,
          type: 'file'
        };

        if (file.folderId === rootFolderId) {
          // This is a root file or a direct child of the specified root
          tree.push(fileNode);
        } else if (file.folderId && folderMap.has(file.folderId)) {
          // This file belongs to a folder, add it to that folder
          folderMap.get(file.folderId).children.push(fileNode);
        }
      });
    }

    return tree;
  }
}

module.exports = new MediaService();
