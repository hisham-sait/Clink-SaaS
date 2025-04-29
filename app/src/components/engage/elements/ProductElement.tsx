import React from 'react';
import { Card } from 'react-bootstrap';
import { FaBoxOpen } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';

interface ProductElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

export interface ProductElementData {
  id: string;
  type: string;
  label: string;
  productId?: string;
  displayMode?: 'full' | 'compact' | 'minimal';
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showPrice?: boolean;
  showAttributes?: boolean;
  showVariants?: boolean;
  showAddToCart?: boolean;
  imageSize?: 'sm' | 'md' | 'lg';
  required: boolean;
  description?: string;
}

const ProductElement: React.FC<ProductElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('product')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaBoxOpen /></div>
        <div className="element-label">Product Data</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for a product element
export const getProductElementProperties = (): Partial<ProductElementData> => {
  return {
    type: 'product',
    label: 'Product Element',
    productId: '',
    displayMode: 'full',
    showImage: true,
    showTitle: true,
    showDescription: true,
    showPrice: true,
    showAttributes: true,
    showVariants: true,
    showAddToCart: true,
    imageSize: 'md',
    required: false,
    description: ''
  };
};

export default ProductElement;
