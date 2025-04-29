import React from 'react';
import { Card } from 'react-bootstrap';
import { FaImages } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';

interface CarouselElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

export interface CarouselItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  alt?: string;
  title?: string;
  description?: string;
}

export interface CarouselElementData {
  id: string;
  type: string;
  label: string;
  items?: CarouselItem[];
  showControls?: boolean;
  showIndicators?: boolean;
  showCaptions?: boolean;
  interval?: number;
  fade?: boolean;
  autoPlay?: boolean;
  pauseOnHover?: boolean;
  required: boolean;
  description?: string;
}

const CarouselElement: React.FC<CarouselElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('carousel')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaImages /></div>
        <div className="element-label">Carousel</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for a carousel element
export const getCarouselElementProperties = (): Partial<CarouselElementData> => {
  return {
    type: 'carousel',
    label: 'Carousel Element',
    items: [
      {
        id: `item-${Date.now()}-1`,
        type: 'image',
        src: '',
        alt: 'Slide 1',
        title: 'Slide 1',
        description: 'Description for slide 1'
      },
      {
        id: `item-${Date.now()}-2`,
        type: 'image',
        src: '',
        alt: 'Slide 2',
        title: 'Slide 2',
        description: 'Description for slide 2'
      }
    ],
    showControls: true,
    showIndicators: true,
    showCaptions: true,
    interval: 5000,
    fade: false,
    autoPlay: true,
    pauseOnHover: true,
    required: false,
    description: ''
  };
};

export default CarouselElement;
