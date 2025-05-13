import React from 'react';
import { Card } from 'react-bootstrap';
import { FaVideo } from 'react-icons/fa';

interface VideoElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

/**
 * Video Element component for the element palette
 * This component is used to add a new video element to a page
 */
const VideoElement: React.FC<VideoElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('video')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
      data-testid="video-element-card"
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon">
          <FaVideo className="mb-1" />
        </div>
        <div className="element-label">Video</div>
      </Card.Body>
    </Card>
  );
};

export default VideoElement;
