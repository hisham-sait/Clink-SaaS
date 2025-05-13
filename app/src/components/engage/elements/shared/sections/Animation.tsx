import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { getAnimationStyles, getHoverStyles, getTransitionStyles } from '../animationUtils';

interface AnimationProps<T> {
  element: T;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  styles: any;
}

/**
 * Shared Animation section for all element types
 * Handles animation properties
 */
const Animation = <T extends Record<string, any>>({
  element,
  onChange,
  styles
}: AnimationProps<T>) => {
  return (
    <>
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Animation Type</div>
        <Form.Select
          name="animation"
          value={element.animation || 'none'}
          onChange={onChange}
          style={styles.select}
          size="sm"
        >
          <option value="none">None</option>
          <option value="fade">Fade In</option>
          <option value="slide">Slide In</option>
          <option value="bounce">Bounce</option>
          <option value="zoom">Zoom</option>
          <option value="flip">Flip</option>
          <option value="rotate">Rotate</option>
          <option value="pulse">Pulse</option>
        </Form.Select>
      </div>
      
      {element.animation !== 'none' && (
        <>
          <Row>
            <Col xs={6}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Duration</div>
                <Form.Control
                  type="text"
                  name="animationDuration"
                  value={element.animationDuration || '1s'}
                  onChange={onChange}
                  placeholder="1s"
                  style={styles.formControl}
                  size="sm"
                />
              </div>
            </Col>
            <Col xs={6}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Delay</div>
                <Form.Control
                  type="text"
                  name="animationDelay"
                  value={element.animationDelay || '0s'}
                  onChange={onChange}
                  placeholder="0s"
                  style={styles.formControl}
                  size="sm"
                />
              </div>
            </Col>
          </Row>
          
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Easing</div>
            <Form.Select
              name="animationEasing"
              value={element.animationEasing || 'ease'}
              onChange={onChange}
              style={styles.select}
              size="sm"
            >
              <option value="linear">Linear</option>
              <option value="ease">Ease (default)</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In Out</option>
            </Form.Select>
          </div>
          
          <div style={styles.helpText}>
            Animation will play when the element enters the viewport
          </div>
        </>
      )}
    </>
  );
};

export default Animation;
