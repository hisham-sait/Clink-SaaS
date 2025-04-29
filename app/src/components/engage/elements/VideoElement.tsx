import React from 'react';
import { Card } from 'react-bootstrap';
import { FaVideo } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';

interface VideoElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

export interface VideoElementData {
  id: string;
  type: string;
  label: string;
  videoType?: 'youtube' | 'vimeo' | 'custom';
  videoId?: string;
  url?: string;
  width?: string;
  height?: string;
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  caption?: string;
  required: boolean;
  description?: string;
}

const VideoElement: React.FC<VideoElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('video')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaVideo /></div>
        <div className="element-label">Video</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for a video element
export const getVideoElementProperties = (): Partial<VideoElementData> => {
  return {
    type: 'video',
    label: 'Video Element',
    videoType: 'youtube',
    videoId: '',
    url: '',
    width: '100%',
    height: 'auto',
    autoplay: false,
    controls: true,
    muted: false,
    loop: false,
    caption: '',
    required: false,
    description: ''
  };
};

export default VideoElement;
