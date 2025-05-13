import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { FaFolder, FaImage, FaVideo, FaFile, FaTrash, FaCheck } from 'react-icons/fa';
import { MediaItem, Folder } from '../../../services/media';

interface FileGridProps {
  mediaItems: MediaItem[];
  currentFolder: Folder | null;
  selectedMedia: MediaItem[];
  onMediaSelect: (media: MediaItem) => void;
  onDeleteMedia: (id: string) => void;
  onFolderClick: (folder: Folder) => void;
  onDeleteFolder: (id: string) => void;
}

const FileGrid: React.FC<FileGridProps> = ({
  mediaItems,
  currentFolder,
  selectedMedia,
  onMediaSelect,
  onDeleteMedia,
  onFolderClick,
  onDeleteFolder
}) => {
  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to get media type icon
  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <FaImage />;
      case 'VIDEO':
        return <FaVideo />;
      case 'DOCUMENT':
      case 'OTHER':
      default:
        return <FaFile />;
    }
  };

  // Render subfolders if we're in a folder
  const renderFolders = () => {
    if (!currentFolder?.children?.length) return null;

    return currentFolder.children.map((folder: Folder) => (
      <Col key={folder.id} xs={6} sm={4} md={3} lg={2} className="mb-3">
        <Card 
          className="h-100 folder-card"
          onClick={() => onFolderClick(folder)}
          style={{ cursor: 'pointer' }}
        >
          <div 
            className="card-img-top d-flex align-items-center justify-content-center bg-light"
            style={{ height: '120px' }}
          >
            <FaFolder size={40} className="text-warning" />
          </div>
          <Card.Body className="p-2">
            <div className="d-flex justify-content-between align-items-start">
              <div className="text-truncate">
                <div className="small fw-bold text-truncate" title={folder.name}>
                  {folder.name}
                </div>
                <div className="small text-muted">
                  {folder._count?.media || 0} files
                </div>
              </div>
              <div>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 text-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(folder.id);
                  }}
                >
                  <FaTrash />
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    ));
  };

  // Render media items
  const renderMediaItems = () => {
    return mediaItems.map(media => {
      const isSelected = selectedMedia.some(item => item.id === media.id);
      
      return (
        <Col key={media.id} xs={6} sm={4} md={3} lg={2} className="mb-3">
          <Card 
            className={`h-100 ${isSelected ? 'border-primary' : ''}`}
            onClick={() => onMediaSelect(media)}
            style={{ cursor: 'pointer' }}
          >
            <div 
              className="card-img-top d-flex align-items-center justify-content-center bg-light"
              style={{ height: '120px', overflow: 'hidden' }}
            >
              {media.type === 'IMAGE' ? (
                <img 
                  src={media.thumbnailUrl || media.url} 
                  alt={media.alt || media.title || media.originalName}
                  className="img-fluid"
                  style={{ maxHeight: '120px', objectFit: 'contain' }}
                />
              ) : (
                <div className="text-center p-3">
                  {getMediaTypeIcon(media.type)}
                  <div className="mt-2 small">{media.originalName}</div>
                </div>
              )}
            </div>
            <Card.Body className="p-2">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="small fw-bold text-truncate" title={media.title || media.originalName}>
                    {media.title || media.originalName}
                  </div>
                  <div className="small text-muted">
                    {formatFileSize(media.size)}
                  </div>
                </div>
                <div>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 text-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMedia(media.id);
                    }}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </div>
            </Card.Body>
            {isSelected && (
              <div className="position-absolute top-0 end-0 p-2">
                <div className="bg-primary text-white rounded-circle p-1">
                  <FaCheck size={12} />
                </div>
              </div>
            )}
          </Card>
        </Col>
      );
    });
  };

  return (
    <Row className="file-grid">
      {renderFolders()}
      {renderMediaItems()}
    </Row>
  );
};

export default FileGrid;
