import React from 'react';
import { Accordion, Row, Col } from 'react-bootstrap';
import { FaBoxOpen } from 'react-icons/fa';
import './elements.css';

// Import all element components
import TextElement from './text/TextElement';
import ImageElement from './image/ImageElement';
import VideoElement from './video/VideoElement';
import ButtonElement from './button/ButtonElement';
import FormElement from './FormElement';
import CarouselElement from './CarouselElement';
import WysiwygElement from './WysiwygElement';
import ProfileElement from './profile/ProfileElement';
import SocialElement from './social/SocialElement';
import InstagramElement from './InstagramElement';
import FacebookElement from './FacebookElement';
import YoutubeElement from './YoutubeElement';
import ProductElement from './ProductElement';

interface PageElementsProps {
  onAddElement: (type: string) => void;
}

const PageElements: React.FC<PageElementsProps> = ({ onAddElement }) => {
  return (
    <Accordion defaultActiveKey="0" className="mb-3">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <div className="d-flex align-items-center">
            <FaBoxOpen className="me-2" />
            <span>Page Elements</span>
          </div>
        </Accordion.Header>
        <Accordion.Body className="p-2">
          <Row className="g-2 elements-grid">
            {/* Text Elements */}
            <Col xs={4}>
              <TextElement onAdd={onAddElement} size="tiny" />
            </Col>
            
            {/* Image Element */}
            <Col xs={4}>
              <ImageElement onAdd={onAddElement} size="tiny" />
            </Col>
            
            {/* Video Element */}
            <Col xs={4}>
              <VideoElement onAdd={onAddElement} size="tiny" />
            </Col>
            
            {/* Button Element */}
            <Col xs={4}>
              <ButtonElement onAdd={onAddElement} size="tiny" />
            </Col>
            
            {/* Form Element */}
            <Col xs={4}>
              <FormElement onAdd={onAddElement} size="tiny" />
            </Col>
            
            {/* Carousel Element */}
            <Col xs={4}>
              <CarouselElement onAdd={onAddElement} size="tiny" />
            </Col>
            
            {/* WYSIWYG Editor Element */}
            <Col xs={4}>
              <WysiwygElement onAdd={onAddElement} size="tiny" />
            </Col>
            
            {/* Profile Element */}
            <Col xs={4}>
              <ProfileElement onAdd={onAddElement} size="tiny" />
            </Col>
            
            {/* Social Media Links Element */}
            <Col xs={4}>
              <SocialElement onAdd={onAddElement} size="tiny" />
            </Col>
            
            {/* Instagram Embed Element */}
            <Col xs={4}>
              <InstagramElement onAdd={onAddElement} size="tiny" />
            </Col>
            
            {/* Facebook Embed Element */}
            <Col xs={4}>
              <FacebookElement onAdd={onAddElement} size="tiny" />
            </Col>
            
            {/* YouTube Embed Element */}
            <Col xs={4}>
              <YoutubeElement onAdd={onAddElement} size="tiny" />
            </Col>
            
            {/* Product Data Element */}
            <Col xs={4}>
              <ProductElement onAdd={onAddElement} size="tiny" />
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default PageElements;
