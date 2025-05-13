import React from 'react';
import { Form } from 'react-bootstrap';
import { TextElementData } from '../TextElementData';
import { textStyles as styles } from '../../shared';

interface ContentPropertiesProps {
  element: TextElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  companyId?: string;
}

/**
 * Content properties section for text elements
 * Handles text type and content
 */
const ContentProperties: React.FC<ContentPropertiesProps> = ({ element, onChange, companyId }) => {
  return (
    <>
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Text Type</div>
        <Form.Select
          className="form-select"
          name="textType"
          value={element.textType}
          onChange={onChange}
          style={styles.select}
          size="sm"
          data-testid="text-type-select"
        >
          <option value="heading">Heading</option>
          <option value="paragraph">Paragraph</option>
          <option value="list">List</option>
        </Form.Select>
      </div>

      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Content</div>
        <Form.Control
          as="textarea"
          className="form-control"
          name="content"
          value={element.content || ''}
          onChange={onChange}
          rows={3}
          style={{ fontSize: '11px', padding: '4px 6px' }}
          data-testid="text-content-textarea"
          placeholder={
            element.textType === 'heading' ? 'Enter heading text...' :
            element.textType === 'paragraph' ? 'Enter paragraph text...' :
            'Enter list items, one per line...'
          }
        />
        {element.textType === 'list' && (
          <div style={styles.helpText}>
            Enter one list item per line. Items will be automatically converted to a list.
          </div>
        )}
      </div>
    </>
  );
};

export default ContentProperties;
