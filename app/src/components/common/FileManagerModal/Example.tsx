import React, { useState } from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import FileManagerModal from './FileManagerModal';
import { MediaItem } from '../../../services/media';

/**
 * Example component demonstrating how to use the FileManagerModal
 */
const FileManagerExample: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<MediaItem[]>([]);
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>('single');

  // Example company ID - replace with actual company ID from your application
  const companyId = 'your-company-id';

  const handleSelectSingle = (media: MediaItem | MediaItem[]) => {
    if (!Array.isArray(media)) {
      setSelectedFile(media);
    }
  };

  const handleSelectMultiple = (media: MediaItem | MediaItem[]) => {
    if (Array.isArray(media)) {
      setSelectedFiles(media);
    }
  };

  const openSingleSelectionModal = () => {
    setSelectionMode('single');
    setShowModal(true);
  };

  const openMultipleSelectionModal = () => {
    setSelectionMode('multiple');
    setShowModal(true);
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">File Manager Example</h2>
      
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>Single File Selection</Card.Header>
            <Card.Body>
              <p>Select a single file from the file manager.</p>
              <Button 
                variant="primary" 
                onClick={openSingleSelectionModal}
              >
                Select File
              </Button>
              
              {selectedFile && (
                <div className="mt-3">
                  <h5>Selected File:</h5>
                  <div className="d-flex align-items-center mt-2">
                    {selectedFile.type === 'IMAGE' && (
                      <img 
                        src={selectedFile.thumbnailUrl || selectedFile.url} 
                        alt={selectedFile.title || selectedFile.originalName}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                      />
                    )}
                    <div>
                      <div><strong>{selectedFile.title || selectedFile.originalName}</strong></div>
                      <div className="small text-muted">{selectedFile.type} • {new Date(selectedFile.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>Multiple File Selection</Card.Header>
            <Card.Body>
              <p>Select multiple files from the file manager.</p>
              <Button 
                variant="primary" 
                onClick={openMultipleSelectionModal}
              >
                Select Files
              </Button>
              
              {selectedFiles.length > 0 && (
                <div className="mt-3">
                  <h5>Selected Files ({selectedFiles.length}):</h5>
                  <ul className="list-group mt-2">
                    {selectedFiles.map(file => (
                      <li key={file.id} className="list-group-item d-flex align-items-center">
                        {file.type === 'IMAGE' && (
                          <img 
                            src={file.thumbnailUrl || file.url} 
                            alt={file.title || file.originalName}
                            style={{ width: '30px', height: '30px', objectFit: 'cover', marginRight: '10px' }}
                          />
                        )}
                        <div>
                          <div><strong>{file.title || file.originalName}</strong></div>
                          <div className="small text-muted">{file.type}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* File Manager Modal */}
      <FileManagerModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSelect={selectionMode === 'single' ? handleSelectSingle : handleSelectMultiple}
        companyId={companyId}
        title={selectionMode === 'single' ? 'Select a File' : 'Select Files'}
        allowMultiple={selectionMode === 'multiple'}
        allowedTypes={['IMAGE', 'DOCUMENT']}
      />
    </Container>
  );
};

export default FileManagerExample;
