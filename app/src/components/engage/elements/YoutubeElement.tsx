import React from 'react';
import { Card } from 'react-bootstrap';
import { FaYoutube } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';

interface YoutubeElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

export interface YoutubeElementData {
  id: string;
  type: string;
  label: string;
  videoId?: string;
  url?: string;
  width?: string;
  height?: string;
  autoplay?: boolean;
  controls?: boolean;
  mute?: boolean;
  loop?: boolean;
  showRelated?: boolean;
  showInfo?: boolean;
  startAt?: number;
  endAt?: number;
  caption?: string;
  required: boolean;
  description?: string;
}

const YoutubeElement: React.FC<YoutubeElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('youtube')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaYoutube /></div>
        <div className="element-label">YouTube</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for a YouTube element
export const getYoutubeElementProperties = (): Partial<YoutubeElementData> => {
  return {
    type: 'youtube',
    label: 'YouTube Embed',
    videoId: '',
    url: '',
    width: '100%',
    height: '315',
    autoplay: false,
    controls: true,
    mute: false,
    loop: false,
    showRelated: false,
    showInfo: true,
    startAt: 0,
    endAt: 0,
    caption: '',
    required: false,
    description: ''
  };
};

export default YoutubeElement;
