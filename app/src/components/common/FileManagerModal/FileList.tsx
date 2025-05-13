import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { FaFolder, FaImage, FaVideo, FaFile, FaTrash, FaCheck } from 'react-icons/fa';
import { MediaItem, Folder } from '../../../services/media';

interface FileListProps {
  mediaItems: MediaItem[];
  currentFolder: Folder | null;
  selectedMedia: MediaItem[];
  onMediaSelect: (media: MediaItem) => void;
  onDeleteMedia: (id: string) => void;
  onFolderClick: (folder: Folder) => void;
  onDeleteFolder: (id: string) => void;
}

const FileList: React.FC<FileListProps> = ({
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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Helper function to get media type icon
  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <FaImage className="text-primary" />;
      case 'VIDEO':
        return <FaVideo className="text-success" />;
      case 'DOCUMENT':
      case 'OTHER':
      default:
        return <FaFile className="text-secondary" />;
    }
  };

  return (
    <div className="file-list">
      <Table hover responsive>
        <thead>
          <tr>
            <th style={{ width: '40px' }}></th>
            <th>Name</th>
            <th>Size</th>
            <th>Type</th>
            <th>Modified</th>
            <th style={{ width: '60px' }}></th>
          </tr>
        </thead>
        <tbody>
          {/* Render folders first */}
          {currentFolder?.children?.map((folder: Folder) => (
            <tr 
              key={`folder-${folder.id}`}
              onClick={() => onFolderClick(folder)}
              style={{ cursor: 'pointer' }}
              className="folder-row"
            >
              <td>
                <FaFolder className="text-warning" />
              </td>
              <td className="text-truncate" style={{ maxWidth: '300px' }}>
                {folder.name}
              </td>
              <td>-</td>
              <td>Folder</td>
              <td>-</td>
              <td>
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
              </td>
            </tr>
          ))}
          
          {/* Render media items */}
          {mediaItems.map(media => {
            const isSelected = selectedMedia.some(item => item.id === media.id);
            
            return (
              <tr 
                key={`media-${media.id}`}
                onClick={() => onMediaSelect(media)}
                style={{ cursor: 'pointer' }}
                className={isSelected ? 'table-primary' : ''}
              >
                <td>
                  {getMediaTypeIcon(media.type)}
                </td>
                <td className="text-truncate" style={{ maxWidth: '300px' }}>
                  {media.title || media.originalName}
                  {isSelected && (
                    <span className="ms-2 text-primary">
                      <FaCheck size={12} />
                    </span>
                  )}
                </td>
                <td>{formatFileSize(media.size)}</td>
                <td>{media.type}</td>
                <td>{formatDate(media.updatedAt)}</td>
                <td>
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
                </td>
              </tr>
            );
          })}
          
          {/* Empty state */}
          {mediaItems.length === 0 && (!currentFolder?.children || currentFolder.children.length === 0) && (
            <tr>
              <td colSpan={6} className="text-center py-4">
                No files or folders found in this location.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default FileList;
