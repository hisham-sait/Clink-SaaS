import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';

interface BackgroundPositionControlProps {
  position: string;
  onChange: (position: string) => void;
}

const BackgroundPositionControl: React.FC<BackgroundPositionControlProps> = ({
  position,
  onChange
}) => {
  // Parse the position string
  const getPositionValues = () => {
    if (!position || position === 'center') {
      return { x: 'center', y: 'center' };
    }
    
    const parts = position.split(' ');
    if (parts.length === 1) {
      return { x: parts[0], y: 'center' };
    }
    
    return { x: parts[0], y: parts[1] };
  };
  
  const { x, y } = getPositionValues();
  
  // Handle position button click
  const handlePositionClick = (xPos: string, yPos: string) => {
    onChange(`${xPos} ${yPos}`);
  };
  
  // Check if a position is active
  const isPositionActive = (xPos: string, yPos: string) => {
    return x === xPos && y === yPos;
  };
  
  // Render a position button
  const renderPositionButton = (xPos: string, yPos: string, label: string) => {
    const active = isPositionActive(xPos, yPos);
    
    return (
      <Button
        variant={active ? 'primary' : 'outline-secondary'}
        size="sm"
        className="position-relative p-2"
        onClick={() => handlePositionClick(xPos, yPos)}
        style={{ width: '100%', height: '40px' }}
      >
        {label}
        {active && (
          <div className="position-absolute top-0 end-0 p-1">
            <FaCheck size={10} />
          </div>
        )}
      </Button>
    );
  };
  
  return (
    <div className="background-position-control">
      <Form.Label className="mb-2">Background Position</Form.Label>
      
      <Row className="g-1 mb-2">
        <Col xs={4}>
          {renderPositionButton('left', 'top', 'Top Left')}
        </Col>
        <Col xs={4}>
          {renderPositionButton('center', 'top', 'Top')}
        </Col>
        <Col xs={4}>
          {renderPositionButton('right', 'top', 'Top Right')}
        </Col>
      </Row>
      
      <Row className="g-1 mb-2">
        <Col xs={4}>
          {renderPositionButton('left', 'center', 'Left')}
        </Col>
        <Col xs={4}>
          {renderPositionButton('center', 'center', 'Center')}
        </Col>
        <Col xs={4}>
          {renderPositionButton('right', 'center', 'Right')}
        </Col>
      </Row>
      
      <Row className="g-1 mb-2">
        <Col xs={4}>
          {renderPositionButton('left', 'bottom', 'Bottom Left')}
        </Col>
        <Col xs={4}>
          {renderPositionButton('center', 'bottom', 'Bottom')}
        </Col>
        <Col xs={4}>
          {renderPositionButton('right', 'bottom', 'Bottom Right')}
        </Col>
      </Row>
      
      <Form.Group className="mb-2">
        <Form.Label>Custom Position</Form.Label>
        <Form.Control
          type="text"
          value={position}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., center center, 50% 50%, 20px 30px"
          size="sm"
        />
        <Form.Text className="text-muted">
          Enter CSS background-position value
        </Form.Text>
      </Form.Group>
    </div>
  );
};

export default BackgroundPositionControl;
