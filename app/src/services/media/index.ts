import api from '../api';

const API_URL = '/media';

export interface MediaItem {
  id: string;
  companyId: string;
  section: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER';
  url: string;
  thumbnailUrl?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  title?: string;
  description?: string;
  alt?: string;
  folderId?: string | null;
  path?: string | null;
  createdAt: string;
  updatedAt: string;
  folder?: {
    id: string;
    name: string;
    path: string;
  };
}

export interface MediaListResponse {
  media: MediaItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface MediaUploadOptions {
  section?: string;
  title?: string;
  description?: string;
  alt?: string;
  folderId?: string | null;
}

export interface Folder {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  type: 'folder';  // Make type required
  parent?: {
    id: string;
    name: string;
    path: string;
  };
  children?: Folder[];
  _count?: {
    children: number;
    media: number;
  };
}

export interface FolderCreateOptions {
  name: string;
  parentId?: string | null;
}

class MediaService {
  /**
   * Get all media files with optional filtering
   */
  async getMedia(
    companyId: string,
    options: {
      type?: string;
      section?: string;
      page?: number;
      limit?: number;
      search?: string;
      folderId?: string | null;
    } = {}
  ): Promise<MediaListResponse> {
    const { type, section, page = 1, limit = 20, search = '', folderId } = options;
    
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (section) params.append('section', section);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (folderId !== undefined) params.append('folderId', folderId === null ? 'null' : folderId);
    
    const response = await api.get(`${API_URL}/${companyId}?${params.toString()}`);
    return response.data;
  }

  /**
   * Get a single media file by ID
   */
  async getMediaById(companyId: string, id: string): Promise<MediaItem> {
    const response = await api.get(`${API_URL}/${companyId}/${id}`);
    return response.data;
  }

  /**
   * Upload a new media file
   */
  async uploadMedia(
    companyId: string,
    file: File,
    options: MediaUploadOptions = {}
  ): Promise<MediaItem> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.section) formData.append('section', options.section);
    if (options.title) formData.append('title', options.title);
    if (options.description) formData.append('description', options.description);
    if (options.alt) formData.append('alt', options.alt);
    if (options.folderId !== undefined) {
      formData.append('folderId', options.folderId === null ? 'null' : options.folderId);
    }
    
    const response = await api.post(
      `${API_URL}/${companyId}/upload`,
      formData
    );
    
    return response.data;
  }

  /**
   * Update media details
   */
  async updateMedia(
    companyId: string,
    id: string,
    data: {
      title?: string;
      description?: string;
      alt?: string;
      section?: string;
      folderId?: string | null;
    }
  ): Promise<MediaItem> {
    const response = await api.put(`${API_URL}/${companyId}/${id}`, data);
    return response.data;
  }

  /**
   * Delete a media file
   */
  async deleteMedia(companyId: string, id: string): Promise<void> {
    await api.delete(`${API_URL}/${companyId}/${id}`);
  }

  /**
   * Get all folders with optional filtering
   */
  async getFolders(
    companyId: string,
    options: {
      parentId?: string | null;
      search?: string;
    } = {}
  ): Promise<Folder[]> {
    const { parentId, search } = options;
    
    const params = new URLSearchParams();
    if (parentId !== undefined) params.append('parentId', parentId === null ? 'null' : parentId);
    if (search) params.append('search', search);
    
    const response = await api.get(`${API_URL}/${companyId}/folders?${params.toString()}`);
    
    // Add type property to each folder
    const folders = response.data.map((folder: any) => ({
      ...folder,
      type: 'folder' as const
    }));
    
    return folders;
  }

  /**
   * Get a single folder by ID
   */
  async getFolderById(companyId: string, id: string): Promise<Folder> {
    const response = await api.get(`${API_URL}/${companyId}/folders/${id}`);
    
    // Add type property to the folder and its children
    const folder = {
      ...response.data,
      type: 'folder' as const
    };
    
    if (folder.children && folder.children.length > 0) {
      folder.children = folder.children.map((child: any) => ({
        ...child,
        type: 'folder' as const
      }));
    }
    
    return folder;
  }

  /**
   * Create a new folder
   */
  async createFolder(
    companyId: string,
    data: FolderCreateOptions
  ): Promise<Folder> {
    const response = await api.post(`${API_URL}/${companyId}/folders`, {
      name: data.name,
      parentId: data.parentId === undefined ? undefined : data.parentId === null ? 'null' : data.parentId
    });
    
    // Add type property to the created folder
    return {
      ...response.data,
      type: 'folder' as const
    };
  }

  /**
   * Update folder details
   */
  async updateFolder(
    companyId: string,
    id: string,
    data: {
      name: string;
    }
  ): Promise<Folder> {
    const response = await api.put(`${API_URL}/${companyId}/folders/${id}`, data);
    
    // Add type property to the updated folder
    return {
      ...response.data,
      type: 'folder' as const
    };
  }

  /**
   * Delete a folder
   */
  async deleteFolder(companyId: string, id: string, recursive: boolean = false): Promise<void> {
    await api.delete(`${API_URL}/${companyId}/folders/${id}?recursive=${recursive}`);
  }

  /**
   * Get a hierarchical tree structure of folders and files
   */
  async getMediaTree(
    companyId: string,
    options: {
      includeFiles?: boolean;
      rootFolderId?: string | null;
    } = {}
  ): Promise<(Folder | MediaItem)[]> {
    const { includeFiles = true, rootFolderId } = options;
    
    const params = new URLSearchParams();
    params.append('includeFiles', includeFiles.toString());
    if (rootFolderId !== undefined) {
      params.append('rootFolderId', rootFolderId === null ? 'null' : rootFolderId);
    }
    
    const response = await api.get(`${API_URL}/${companyId}/tree?${params.toString()}`);
    
    // Add type property to folders in the tree
    const tree = response.data.map((item: any) => {
      if (item.children !== undefined) {
        // This is a folder
        return {
          ...item,
          type: 'folder' as const,
          children: item.children.map((child: any) => {
            if (child.children !== undefined) {
              // This is a subfolder
              return {
                ...child,
                type: 'folder' as const
              };
            }
            return child;
          })
        };
      }
      return item;
    });
    
    return tree;
  }
}

export default new MediaService();
