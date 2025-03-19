import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaArrowUp, FaArrowDown, FaTrash } from 'react-icons/fa';

interface PageBreakSectionProps {
  id: string;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

const PageBreakSection: React.FC<PageBreakSectionProps> = ({
  id,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  return (
    <div className="proposal-section page-break-section mb-4">
      <Card>
        <Card.Body className="p-2">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="page-break-icon me-3">
                <i className="bi bi-file-break fs-4"></i>
              </div>
              <div>
                <h6 className="mb-0">Page Break</h6>
                <p className="text-muted small mb-0">Content after this point will start on a new page</p>
              </div>
            </div>
            <div className="section-controls">
              <Button 
                variant="link" 
                className="p-1 text-muted" 
                onClick={() => onMoveUp(id)}
                title="Move Up"
              >
                <FaArrowUp />
              </Button>
              <Button 
                variant="link" 
                className="p-1 text-muted" 
                onClick={() => onMoveDown(id)}
                title="Move Down"
              >
                <FaArrowDown />
              </Button>
              <Button 
                variant="link" 
                className="p-1 text-danger" 
                onClick={() => onDelete(id)}
                title="Delete"
              >
                <FaTrash />
              </Button>
            </div>
          </div>
          <div className="page-break-indicator mt-2">
            <div className="page-break-line"></div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PageBreakSection;
