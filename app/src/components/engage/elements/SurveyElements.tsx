import React from 'react';
import { Accordion, ListGroup } from 'react-bootstrap';
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
        <Accordion.Body className="p-0">
          <ListGroup variant="flush">
            <TextFieldElement onAdd={onAddElement} />
            <TextAreaElement onAdd={onAddElement} />
            <CheckboxElement onAdd={onAddElement} />
            <RadioElement onAdd={onAddElement} />
            <SelectElement onAdd={onAddElement} />
            <ScaleElement onAdd={onAddElement} />
            <LikertElement onAdd={onAddElement} />
            <DatePickerElement onAdd={onAddElement} />
            <FileUploadElement onAdd={onAddElement} />
          </ListGroup>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default SurveyElements;
