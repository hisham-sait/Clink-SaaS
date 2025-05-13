import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, InputGroup, Pagination, Nav, Tab } from 'react-bootstrap';
import { 
  FaSearch, 
  FaUpload, 
  FaFilter, 
  FaImage, 
  FaVideo, 
  FaFile, 
  FaTrash, 
  FaEdit, 
  FaCheck, 
  FaFolder, 
  FaFolderPlus,
  FaList,
  FaTh,
  FaArrowLeft,
  FaEye
} from 'react-icons/fa';
import mediaService, { MediaItem, MediaListResponse, Folder } from '../../../services/media';
import { useDropzone } from 'react-dropzone';
import FolderTree from './FolderTree';
import FileGrid from './FileGrid';
import FileList from './FileList';
import './styles.css';

export interface FileManagerModalProps {
  show: boolean;
  onHide: () => void;
  onSelect: (media: MediaItem | MediaItem[]) => void;
  companyId: string;
  section?: string;
  allowedTypes?: ('IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER')[];
  title?: string;
  allowMultiple?: boolean;
  initialFolderId?: string | null;
}

const FileManagerModal: React.FC<FileManagerModalProps> = ({
  show,
  onHide,
  onSelect,
  companyId,
  section = 'general',
  allowedTypes,
  title = 'File Manager',
  allowMultiple = false,
  initialFolderId = null
}) => {
  // State for media items and folders
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [folderPath, setFolderPath] = useState<Folder[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Selection state
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  
  // Upload state
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // New folder state
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Form state for media details
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaDescription, setMediaDescription] = useState('');
  const [mediaAlt, setMediaAlt] = useState('');

  // Fetch media based on current folder and filters
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const options: any = {
        page,
        limit: 20,
        section,
        search: search || undefined,
        folderId: currentFolder?.id || null
      };
      
      if (filter) {
        options.type = filter;
      }
      
      console.log('Calling mediaService.getMedia with options:', options);
      const response: MediaListResponse = await mediaService.getMedia(companyId, options);
      console.log('Media API response:', response);
      
      setMediaItems(response.media);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      console.error('Error fetching media:', err);
      console.error('Error details:', err);
      setError('Failed to load media. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [companyId, page, section, search, filter, currentFolder]);

  // Fetch folders
  const fetchFolders = useCallback(async () => {
    try {
      const rootFolders = await mediaService.getFolders(companyId, { parentId: null });
      setFolders(rootFolders);
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError('Failed to load folders. Please try again.');
    }
  }, [companyId]);

  // Fetch folder contents
  const fetchFolderContents = useCallback(async (folderId: string | null) => {
    setLoading(true);
    try {
      // If folderId is null, we're at the root level
      if (folderId === null) {
        setCurrentFolder(null);
        setFolderPath([]);
      } else {
        // Get folder details
        const folder = await mediaService.getFolderById(companyId, folderId);
        setCurrentFolder(folder);
        
        // Build folder path
        const path: Folder[] = [];
        let currentParentId = folder.parentId;
        
        while (currentParentId) {
          const parentFolder = await mediaService.getFolderById(companyId, currentParentId);
          path.unshift(parentFolder);
          currentParentId = parentFolder.parentId;
        }
        
        setFolderPath(path);
      }
      
      // Reset page when changing folders
      setPage(1);
    } catch (err) {
      console.error('Error fetching folder contents:', err);
      setError('Failed to load folder contents. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Initialize when modal is shown
  useEffect(() => {
    if (show) {
      console.log('FileManagerModal shown with props:', { companyId, section, allowedTypes, title });
      
      // Check if companyId is valid (not empty and not '1')
      if (!companyId || companyId === '1') {
        console.error('Invalid company ID:', companyId);
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.companyId) {
            console.log('Using company ID from localStorage instead:', user.companyId);
            // We can't update the companyId prop directly, but we can log it for debugging
          }
        } catch (error) {
          console.error('Error getting company ID from localStorage:', error);
        }
      }
      
      fetchFolders();
      fetchFolderContents(initialFolderId);
    }
  }, [show, fetchFolders, fetchFolderContents, initialFolderId, companyId, section, allowedTypes, title]);

  // Fetch media when folder, page, or filters change
  useEffect(() => {
    if (show) {
      console.log('Fetching media with options:', { 
        companyId, 
        section, 
        currentFolder: currentFolder?.id || 'null',
        page,
        filter,
        search
      });
      fetchMedia();
    }
  }, [show, fetchMedia, currentFolder, page, filter, search, companyId, section]);

  // Handle file upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      const uploadedMedia = await mediaService.uploadMedia(companyId, file, {
        section,
        title: mediaTitle || file.name,
        description: mediaDescription,
        alt: mediaAlt,
        folderId: currentFolder?.id || null
      });
      
      // Add the new media to the list and select it
      setMediaItems(prev => [uploadedMedia, ...prev]);
      setSelectedMedia([uploadedMedia]);
      setUploadMode(false);
      setUploadProgress(100);
      
      // Reset form
      setMediaTitle('');
      setMediaDescription('');
      setMediaAlt('');
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadError('Failed to upload file. Please try again.');
    }
  }, [companyId, section, mediaTitle, mediaDescription, mediaAlt, currentFolder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes ? {
      ...(allowedTypes.includes('IMAGE') ? { 'image/*': [] } : {}),
      ...(allowedTypes.includes('VIDEO') ? { 'video/*': [] } : {}),
      ...(allowedTypes.includes('DOCUMENT') ? { 
        'application/pdf': [],
        'application/msword': [],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': []
      } : {})
    } : undefined,
    multiple: false
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMedia();
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle media selection
  const handleMediaSelect = (media: MediaItem) => {
    if (allowMultiple) {
      // Check if already selected
      const isSelected = selectedMedia.some(item => item.id === media.id);
      
      if (isSelected) {
        // Remove from selection
        setSelectedMedia(prev => prev.filter(item => item.id !== media.id));
      } else {
        // Add to selection
        setSelectedMedia(prev => [...prev, media]);
      }
    } else {
      // Single selection mode
      setSelectedMedia([media]);
    }
  };

  // Handle folder navigation
  const handleFolderClick = (folder: Folder) => {
    fetchFolderContents(folder.id);
  };

  // Handle navigation to parent folder
  const handleNavigateUp = () => {
    if (folderPath.length > 0) {
      // Navigate to parent folder
      const parentFolder = folderPath[folderPath.length - 1];
      fetchFolderContents(parentFolder.id);
    } else {
      // Navigate to root
      fetchFolderContents(null);
    }
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Root level
      fetchFolderContents(null);
    } else {
      // Specific folder in path
      fetchFolderContents(folderPath[index].id);
    }
  };

  // Handle create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }
    
    try {
      const newFolder = await mediaService.createFolder(companyId, {
        name: newFolderName,
        parentId: currentFolder?.id || null
      });
      
      // Add new folder to the list
      if (currentFolder) {
        // If we're in a folder, refresh its contents
        fetchFolderContents(currentFolder.id);
      } else {
        // If we're at root, add to the folders list
        setFolders(prev => [...prev, newFolder]);
      }
      
      // Reset new folder state
      setShowNewFolderInput(false);
      setNewFolderName('');
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder. Please try again.');
    }
  };

  // Handle delete media
  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await mediaService.deleteMedia(companyId, id);
      setMediaItems(prev => prev.filter(item => item.id !== id));
      setSelectedMedia(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting media:', err);
      setError('Failed to delete file. Please try again.');
    }
  };

  // Handle delete folder
  const handleDeleteFolder = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this folder? All contents will be lost.')) return;
    
    try {
      await mediaService.deleteFolder(companyId, id, true);
      
      if (currentFolder?.id === id) {
        // If we're in the folder being deleted, navigate up
        handleNavigateUp();
      } else {
        // Otherwise just remove it from the list
        setFolders(prev => prev.filter(folder => folder.id !== id));
      }
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError('Failed to delete folder. Please try again.');
    }
  };

  // Handle final selection
  const handleSelect = () => {
    if (selectedMedia.length > 0) {
      onSelect(allowMultiple ? selectedMedia : selectedMedia[0]);
      onHide();
    }
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <Pagination.Item key={i} active={i === page} onClick={() => handlePageChange(i)}>
          {i}
        </Pagination.Item>
      );
    }
    
    return (
      <Pagination className="mt-3 justify-content-center">
        <Pagination.Prev 
          onClick={() => handlePageChange(page - 1)} 
          disabled={page === 1} 
        />
        {items}
        <Pagination.Next 
          onClick={() => handlePageChange(page + 1)} 
          disabled={page === totalPages} 
        />
      </Pagination>
    );
  };

  // Render breadcrumb navigation
  const renderBreadcrumbs = () => {
    return (
      <div className="d-flex align-items-center mb-3 breadcrumb-container">
        <Button 
          variant="link" 
          className="p-0 me-2" 
          onClick={handleNavigateUp}
          disabled={!currentFolder}
        >
          <FaArrowLeft />
        </Button>
        
        <div className="d-flex align-items-center flex-wrap">
          <Button 
            variant="link" 
            className={`breadcrumb-item ${!currentFolder ? 'active' : ''}`}
            onClick={() => handleBreadcrumbClick(-1)}
          >
            Files
          </Button>
          
          {folderPath.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <span className="mx-1">/</span>
              <Button 
                variant="link" 
                className={`breadcrumb-item ${index === folderPath.length - 1 && currentFolder ? 'active' : ''}`}
                onClick={() => handleBreadcrumbClick(index)}
              >
                {folder.name}
              </Button>
            </React.Fragment>
          ))}
          
          {currentFolder && (
            <>
              <span className="mx-1">/</span>
              <span className="breadcrumb-item active">{currentFolder.name}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="file-manager-modal">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {uploadMode ? (
          <div className="upload-container p-4">
            <h5>Upload New File</h5>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control 
                  type="text" 
                  value={mediaTitle} 
                  onChange={(e) => setMediaTitle(e.target.value)} 
                  placeholder="Enter file title" 
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={2} 
                  value={mediaDescription} 
                  onChange={(e) => setMediaDescription(e.target.value)} 
                  placeholder="Enter file description" 
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Alt Text (for images)</Form.Label>
                <Form.Control 
                  type="text" 
                  value={mediaAlt} 
                  onChange={(e) => setMediaAlt(e.target.value)} 
                  placeholder="Enter alt text for accessibility" 
                />
              </Form.Group>
              
              <div 
                {...getRootProps()} 
                className={`dropzone p-5 text-center border rounded mb-3 ${isDragActive ? 'border-primary bg-light' : ''}`}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the file here...</p>
                ) : (
                  <div>
                    <FaUpload className="mb-2" size={24} />
                    <p>Drag & drop a file here, or click to select a file</p>
                    <small className="text-muted">
                      {allowedTypes ? 
                        `Allowed types: ${allowedTypes.join(', ')}` : 
                        'All media types accepted'}
                    </small>
                  </div>
                )}
              </div>
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-3">
                  <Form.Label>Upload Progress</Form.Label>
                  <Form.Control
                    type="range"
                    min="0"
                    max="100"
                    value={uploadProgress}
                    readOnly
                  />
                  <small>{uploadProgress}%</small>
                </div>
              )}
              
              {uploadError && (
                <div className="alert alert-danger">{uploadError}</div>
              )}
              
              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => setUploadMode(false)}>
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        ) : (
          <div className="file-manager-container">
            {/* Toolbar */}
            <div className="file-manager-toolbar p-3 border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex">
                  <Button 
                    variant="outline-secondary" 
                    className="me-2"
                    onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                  >
                    <FaFolderPlus className="me-1" /> New Folder
                  </Button>
                  
                  <Button 
                    variant="outline-primary" 
                    className="me-2"
                    onClick={() => setUploadMode(true)}
                  >
                    <FaUpload className="me-1" /> Upload
                  </Button>
                </div>
                
                <div className="d-flex">
                  <Form onSubmit={handleSearch} className="d-flex me-2">
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search files..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <Button variant="outline-secondary" type="submit">
                        <FaSearch />
                      </Button>
                    </InputGroup>
                  </Form>
                  
                  <Form.Select 
                    className="me-2" 
                    value={filter || ''} 
                    onChange={(e) => setFilter(e.target.value || null)}
                    style={{ width: '120px' }}
                  >
                    <option value="">All Types</option>
                    <option value="IMAGE">Images</option>
                    <option value="VIDEO">Videos</option>
                    <option value="DOCUMENT">Documents</option>
                  </Form.Select>
                  
                  <div className="btn-group">
                    <Button 
                      variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'} 
                      onClick={() => setViewMode('grid')}
                    >
                      <FaTh />
                    </Button>
                    <Button 
                      variant={viewMode === 'list' ? 'primary' : 'outline-secondary'} 
                      onClick={() => setViewMode('list')}
                    >
                      <FaList />
                    </Button>
                  </div>
                </div>
              </div>
              
              {showNewFolderInput && (
                <div className="mt-3 d-flex">
                  <Form.Control
                    type="text"
                    placeholder="Enter folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="me-2"
                  />
                  <Button variant="primary" onClick={handleCreateFolder}>
                    Create
                  </Button>
                  <Button 
                    variant="link" 
                    className="text-secondary" 
                    onClick={() => {
                      setShowNewFolderInput(false);
                      setNewFolderName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            
            <div className="file-manager-content d-flex">
              {/* Folder Tree */}
              <div className="file-manager-sidebar border-end p-3">
                <FolderTree 
                  folders={folders} 
                  onFolderClick={handleFolderClick}
                  onDeleteFolder={handleDeleteFolder}
                  currentFolderId={currentFolder?.id}
                  companyId={companyId}
                />
              </div>
              
              {/* Main Content */}
              <div className="file-manager-main flex-grow-1 p-3">
                {/* Breadcrumb Navigation */}
                {renderBreadcrumbs()}
                
                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}
                
                {/* Loading Indicator */}
                {loading ? (
                  <div className="text-center p-5">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : (
                  <>
                    {/* Empty State */}
                    {mediaItems.length === 0 && !currentFolder?.children?.length ? (
                      <div className="text-center p-5">
                        <p>No files found in this location.</p>
                        <div className="mt-3">
                          <Button 
                            variant="outline-primary" 
                            className="me-2"
                            onClick={() => setUploadMode(true)}
                          >
                            <FaUpload className="me-1" /> Upload Files
                          </Button>
                          <Button 
                            variant="outline-secondary"
                            onClick={() => setShowNewFolderInput(true)}
                          >
                            <FaFolderPlus className="me-1" /> Create Folder
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* File Display */}
                        {viewMode === 'grid' ? (
                          <FileGrid 
                            mediaItems={mediaItems}
                            currentFolder={currentFolder}
                            selectedMedia={selectedMedia}
                            onMediaSelect={handleMediaSelect}
                            onDeleteMedia={handleDeleteMedia}
                            onFolderClick={handleFolderClick}
                            onDeleteFolder={handleDeleteFolder}
                          />
                        ) : (
                          <FileList 
                            mediaItems={mediaItems}
                            currentFolder={currentFolder}
                            selectedMedia={selectedMedia}
                            onMediaSelect={handleMediaSelect}
                            onDeleteMedia={handleDeleteMedia}
                            onFolderClick={handleFolderClick}
                            onDeleteFolder={handleDeleteFolder}
                          />
                        )}
                        
                        {/* Pagination */}
                        {renderPagination()}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSelect}
          disabled={selectedMedia.length === 0}
        >
          {allowMultiple 
            ? `Select (${selectedMedia.length})` 
            : 'Select'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FileManagerModal;
