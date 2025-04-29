import React from 'react';
import { Card } from 'react-bootstrap';
import { FaHeading, FaParagraph, FaListUl } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';

interface TextElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

export interface TextElementData {
  id: string;
  type: string;
  label: string;
  content?: string;
  textType?: 'heading' | 'paragraph' | 'list';
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  headingAlignment?: 'left' | 'center' | 'right';
  headingColor?: string;
  headingSize?: string;
  headingWeight?: 'normal' | 'bold' | 'light';
  headingTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  paragraphAlignment?: 'left' | 'center' | 'right' | 'justify';
  paragraphColor?: string;
  paragraphSize?: string;
  paragraphLineHeight?: string;
  paragraphLetterSpacing?: string;
  paragraphIndent?: string;
  listType?: 'ordered' | 'unordered';
  listItems?: string[];
  listStyle?: 'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';
  listSpacing?: string;
  listColor?: string;
  listSize?: string;
  fontFamily?: string;
  textShadow?: string;
  animation?: 'none' | 'fade' | 'slide' | 'bounce';
  margin?: string;
  padding?: string;
  backgroundColor?: string;
  borderRadius?: string;
  border?: string;
  required: boolean;
  description?: string;
}

const TextElement: React.FC<TextElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('text')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon">
          <div className="d-flex flex-column align-items-center">
            <FaHeading className="mb-1" style={{ fontSize: '0.8rem' }} />
            <FaParagraph className="mb-1" style={{ fontSize: '0.8rem' }} />
            <FaListUl style={{ fontSize: '0.8rem' }} />
          </div>
        </div>
        <div className="element-label">Text</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for a text element
export const getTextElementProperties = (): Partial<TextElementData> => {
  return {
    type: 'text',
    label: 'Text Element',
    content: '',
    textType: 'paragraph',
    // Heading properties
    headingLevel: 2,
    headingAlignment: 'left',
    headingColor: '#212529',
    headingSize: '1.75rem',
    headingWeight: 'bold',
    headingTransform: 'none',
    // Paragraph properties
    paragraphAlignment: 'left',
    paragraphColor: '#212529',
    paragraphSize: '1rem',
    paragraphLineHeight: '1.5',
    paragraphLetterSpacing: 'normal',
    paragraphIndent: '0',
    // List properties
    listType: 'unordered',
    listItems: ['Item 1', 'Item 2', 'Item 3'],
    listStyle: 'disc',
    listSpacing: '0.5rem',
    listColor: '#212529',
    listSize: '1rem',
    // Common properties
    fontFamily: 'inherit',
    textShadow: 'none',
    animation: 'none',
    margin: '0 0 1rem 0',
    padding: '0',
    backgroundColor: 'transparent',
    borderRadius: '0',
    border: 'none',
    required: false,
    description: 'Text content for headings, paragraphs, or lists'
  };
};

// Function to render the text element properties UI
export const renderTextElementPropertiesUI = (
  element: TextElementData,
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
) => {
  return (
    <>
      {/* Common Properties */}
      <div className="mb-3">
        <label className="form-label">Text Type</label>
        <select
          className="form-select"
          name="textType"
          value={element.textType}
          onChange={onChange}
        >
          <option value="heading">Heading</option>
          <option value="paragraph">Paragraph</option>
          <option value="list">List</option>
        </select>
      </div>

      {/* Content */}
      <div className="mb-3">
        <label className="form-label">Content</label>
        <textarea
          className="form-control"
          name="content"
          value={element.content}
          onChange={onChange}
          rows={4}
        ></textarea>
      </div>

      {/* Type-specific Properties */}
      {element.textType === 'heading' && (
        <>
          <div className="mb-3">
            <label className="form-label">Heading Level</label>
            <select
              className="form-select"
              name="headingLevel"
              value={element.headingLevel}
              onChange={onChange}
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
              <option value={5}>H5</option>
              <option value={6}>H6</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Alignment</label>
            <select
              className="form-select"
              name="headingAlignment"
              value={element.headingAlignment}
              onChange={onChange}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Color</label>
            <input
              type="color"
              className="form-control form-control-color"
              name="headingColor"
              value={element.headingColor}
              onChange={onChange}
            />
          </div>
        </>
      )}

      {element.textType === 'paragraph' && (
        <>
          <div className="mb-3">
            <label className="form-label">Alignment</label>
            <select
              className="form-select"
              name="paragraphAlignment"
              value={element.paragraphAlignment}
              onChange={onChange}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Color</label>
            <input
              type="color"
              className="form-control form-control-color"
              name="paragraphColor"
              value={element.paragraphColor}
              onChange={onChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Line Height</label>
            <input
              type="text"
              className="form-control"
              name="paragraphLineHeight"
              value={element.paragraphLineHeight}
              onChange={onChange}
            />
          </div>
        </>
      )}

      {element.textType === 'list' && (
        <>
          <div className="mb-3">
            <label className="form-label">List Type</label>
            <select
              className="form-select"
              name="listType"
              value={element.listType}
              onChange={onChange}
            >
              <option value="ordered">Ordered</option>
              <option value="unordered">Unordered</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">List Style</label>
            <select
              className="form-select"
              name="listStyle"
              value={element.listStyle}
              onChange={onChange}
            >
              {element.listType === 'unordered' ? (
                <>
                  <option value="disc">Disc</option>
                  <option value="circle">Circle</option>
                  <option value="square">Square</option>
                </>
              ) : (
                <>
                  <option value="decimal">Numbers (1, 2, 3)</option>
                  <option value="lower-alpha">Lowercase Letters (a, b, c)</option>
                  <option value="upper-alpha">Uppercase Letters (A, B, C)</option>
                  <option value="lower-roman">Lowercase Roman (i, ii, iii)</option>
                  <option value="upper-roman">Uppercase Roman (I, II, III)</option>
                </>
              )}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Color</label>
            <input
              type="color"
              className="form-control form-control-color"
              name="listColor"
              value={element.listColor}
              onChange={onChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">List Items</label>
            <textarea
              className="form-control"
              name="listItems"
              value={element.listItems?.join('\n')}
              onChange={(e) => {
                const items = e.target.value.split('\n').filter(item => item.trim() !== '');
                const syntheticEvent = {
                  target: {
                    name: 'listItems',
                    value: items
                  }
                } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
                onChange(syntheticEvent);
              }}
              rows={4}
              placeholder="Enter one item per line"
            ></textarea>
          </div>
        </>
      )}

      {/* Common Styling */}
      <div className="mb-3">
        <label className="form-label">Font Family</label>
        <select
          className="form-select"
          name="fontFamily"
          value={element.fontFamily}
          onChange={onChange}
        >
          <option value="inherit">Default</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="'Courier New', monospace">Courier New</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
          <option value="Verdana, sans-serif">Verdana</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Background Color</label>
        <input
          type="color"
          className="form-control form-control-color"
          name="backgroundColor"
          value={element.backgroundColor !== 'transparent' ? element.backgroundColor : '#ffffff'}
          onChange={onChange}
        />
        <div className="form-check mt-1">
          <input
            className="form-check-input"
            type="checkbox"
            id="transparentBg"
            checked={element.backgroundColor === 'transparent'}
            onChange={(e) => {
              const syntheticEvent = {
                target: {
                  name: 'backgroundColor',
                  value: e.target.checked ? 'transparent' : '#ffffff'
                }
              } as unknown as React.ChangeEvent<HTMLInputElement>;
              onChange(syntheticEvent);
            }}
          />
          <label className="form-check-label" htmlFor="transparentBg">
            Transparent Background
          </label>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Margin</label>
        <input
          type="text"
          className="form-control"
          name="margin"
          value={element.margin}
          onChange={onChange}
          placeholder="e.g., 0 0 1rem 0"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Padding</label>
        <input
          type="text"
          className="form-control"
          name="padding"
          value={element.padding}
          onChange={onChange}
          placeholder="e.g., 1rem"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Border Radius</label>
        <input
          type="text"
          className="form-control"
          name="borderRadius"
          value={element.borderRadius}
          onChange={onChange}
          placeholder="e.g., 5px"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Animation</label>
        <select
          className="form-select"
          name="animation"
          value={element.animation}
          onChange={onChange}
        >
          <option value="none">None</option>
          <option value="fade">Fade In</option>
          <option value="slide">Slide In</option>
          <option value="bounce">Bounce</option>
        </select>
      </div>
    </>
  );
};

export default TextElement;
