import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { FaImage } from 'react-icons/fa';

interface FileUploadElementProps {
  onAdd: (type: string) => void;
}

const FileUploadElement: React.FC<FileUploadElementProps> = ({ onAdd }) => {
  return (
    <ListGroup.Item 
      action
      onClick={() => onAdd('file')}
      className="d-flex align-items-center"
    >
      <div className="me-2"><FaImage /></div>
      File Upload
    </ListGroup.Item>
  );
};

export default FileUploadElement;
