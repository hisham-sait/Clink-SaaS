import React, { useState, useCallback } from 'react';
import { ListGroup, Button, Spinner } from 'react-bootstrap';
import { FaFolder, FaFolderOpen, FaTrash, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import mediaService, { Folder } from '../../../services/media';

interface FolderTreeProps {
  folders: Folder[];
  onFolderClick: (folder: Folder) => void;
  onDeleteFolder: (id: string) => void;
  currentFolderId?: string | null;
  companyId: string;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  onFolderClick,
  onDeleteFolder,
  currentFolderId,
  companyId
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [folderChildren, setFolderChildren] = useState<Record<string, Folder[]>>({});
  const [loadingFolders, setLoadingFolders] = useState<Record<string, boolean>>({});

  const fetchFolderChildren = useCallback(async (folderId: string) => {
    if (folderChildren[folderId]) {
      // Children already loaded, just toggle
      setExpandedFolders(prev => ({
        ...prev,
        [folderId]: !prev[folderId]
      }));
      return;
    }

    // Set loading state
    setLoadingFolders(prev => ({
      ...prev,
      [folderId]: true
    }));

    try {
      // Fetch children from API
      const children = await mediaService.getFolders(companyId, { parentId: folderId });
      
      // Store children and expand folder
      setFolderChildren(prev => ({
        ...prev,
        [folderId]: children
      }));
      
      setExpandedFolders(prev => ({
        ...prev,
        [folderId]: true
      }));
    } catch (error) {
      console.error('Error fetching folder children:', error);
    } finally {
      // Clear loading state
      setLoadingFolders(prev => ({
        ...prev,
        [folderId]: false
      }));
    }
  }, [companyId, folderChildren]);

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (expandedFolders[folderId]) {
      // If already expanded, just collapse
      setExpandedFolders(prev => ({
        ...prev,
        [folderId]: false
      }));
    } else {
      // If not expanded, fetch children and expand
      fetchFolderChildren(folderId);
    }
  };

  const handleDeleteFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteFolder(folderId);
  };

  const renderFolderItem = (folder: Folder) => {
    const isExpanded = expandedFolders[folder.id];
    const isActive = folder.id === currentFolderId;
    const hasChildren = folder.children?.length || folder._count?.children;
    const isLoading = loadingFolders[folder.id];
    const children = folderChildren[folder.id] || folder.children;

    return (
      <div key={folder.id} className="folder-tree-item">
        <div
          className={`list-group-item d-flex align-items-center ${isActive ? 'active' : ''}`}
          onClick={() => onFolderClick(folder)}
          style={{ cursor: 'pointer' }}
        >
          <div className="d-flex align-items-center flex-grow-1">
            {hasChildren ? (
              <span
                className="p-0 me-1 text-secondary"
                onClick={(e) => toggleFolder(folder.id, e)}
                style={{ cursor: 'pointer' }}
              >
                {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
              </span>
            ) : (
              <span className="ms-3 me-1"></span>
            )}
            
            {isActive ? <FaFolderOpen className="me-2" /> : <FaFolder className="me-2" />}
            <span className="text-truncate">{folder.name}</span>
          </div>
          
          <span
            className="p-0 text-danger"
            onClick={(e) => handleDeleteFolder(folder.id, e)}
            style={{ cursor: 'pointer' }}
          >
            <FaTrash size={12} />
          </span>
        </div>
        
        {isExpanded && (
          <div className="ms-3 mt-1">
            {isLoading ? (
              <div className="text-center py-2">
                <Spinner animation="border" size="sm" />
              </div>
            ) : children && children.length > 0 ? (
              children.map((childFolder: Folder) => renderFolderItem(childFolder))
            ) : (
              <div className="text-muted small py-2">No subfolders</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="folder-tree">
      <h6 className="mb-3">Folders</h6>
      <ListGroup variant="flush">
        {folders.map(folder => renderFolderItem(folder))}
      </ListGroup>
    </div>
  );
};

export default FolderTree;
