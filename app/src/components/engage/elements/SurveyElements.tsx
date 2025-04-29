import React from 'react';
import { Accordion, Row, Col } from 'react-bootstrap';
import { FaPuzzlePiece } from 'react-icons/fa';
import TextFieldElement from './TextFieldElement';
import TextAreaElement from './TextAreaElement';
import CheckboxElement from './CheckboxElement';
import RadioElement from './RadioElement';
import SelectElement from './SelectElement';
import DatePickerElement from './DatePickerElement';
import FileUploadElement from './FileUploadElement';
import ScaleElement from './ScaleElement';
import LikertElement from './LikertElement';
import './elements.css';

interface SurveyElementsProps {
  onAddElement: (type: string) => void;
}

const SurveyElements: React.FC<SurveyElementsProps> = ({ onAddElement }) => {
  return (
    <Accordion defaultActiveKey="0" className="mb-3">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <div className="d-flex align-items-center">
            <FaPuzzlePiece className="me-2" />
            <span>Elements</span>
          </div>
        </Accordion.Header>
        <Accordion.Body className="p-2">
          <Row className="g-2 elements-grid">
            <Col xs={4}>
              <TextFieldElement onAdd={onAddElement} size="tiny" />
            </Col>
            <Col xs={4}>
              <TextAreaElement onAdd={onAddElement} size="tiny" />
            </Col>
            <Col xs={4}>
              <CheckboxElement onAdd={onAddElement} size="tiny" />
            </Col>
            <Col xs={4}>
              <RadioElement onAdd={onAddElement} size="tiny" />
            </Col>
            <Col xs={4}>
              <SelectElement onAdd={onAddElement} size="tiny" />
            </Col>
            <Col xs={4}>
              <ScaleElement onAdd={onAddElement} size="tiny" />
            </Col>
            <Col xs={4}>
              <LikertElement onAdd={onAddElement} size="tiny" />
            </Col>
            <Col xs={4}>
              <DatePickerElement onAdd={onAddElement} size="tiny" />
            </Col>
            <Col xs={4}>
              <FileUploadElement onAdd={onAddElement} size="tiny" />
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default SurveyElements;
