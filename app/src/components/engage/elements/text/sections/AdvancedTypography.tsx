import React from 'react';
import { Form } from 'react-bootstrap';
import { TextElementData } from '../TextElementData';
import { textStyles as styles } from '../../shared';
import { ColorInput, DimensionInput } from '../../shared/components';
import { updateTextShadow } from '../utils/textShadowUtils';

interface AdvancedTypographyProps {
  element: TextElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

/**
 * Advanced typography settings section for text elements
 */
const AdvancedTypography: React.FC<AdvancedTypographyProps> = ({ element, onChange }) => {
  const textType = element.textType || 'paragraph';
  
  // Create a synthetic event for updating text shadow
  const handleTextShadowUpdate = (type: string, forceNone: boolean = false) => {
    const prefix = type;
    
    // If forceNone is true or the element's text shadow is set to 'none', use 'none'
    if (forceNone || element[`${prefix}TextShadow` as keyof TextElementData] === 'none') {
      const event = {
        target: {
          name: `${prefix}TextShadow`,
          value: 'none'
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange(event);
      return;
    }
    
    // Otherwise, build the text shadow string
    const color = element[`${prefix}TextShadowColor` as keyof TextElementData] as string || 'rgba(0,0,0,0.3)';
    const blur = element[`${prefix}TextShadowBlur` as keyof TextElementData] as string || '2px';
    const offsetX = element[`${prefix}TextShadowOffsetX` as keyof TextElementData] as string || '1px';
    const offsetY = element[`${prefix}TextShadowOffsetY` as keyof TextElementData] as string || '1px';
    
    const textShadow = `${offsetX} ${offsetY} ${blur} ${color}`;
    
    const event = {
      target: {
        name: `${prefix}TextShadow`,
        value: textShadow
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(event);
  };
  
  return (
    <>
      {textType === 'heading' && (
        <div style={styles.grid2}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Text Shadow</div>
            <Form.Select
              name="headingTextShadow"
              value={element.headingTextShadow === 'none' ? 'none' : 'custom'}
              onChange={(e) => {
                // First set the text shadow property to 'none' or 'custom'
                const event = {
                  ...e,
                  target: {
                    ...e.target,
                    name: 'headingTextShadow',
                    value: e.target.value === 'none' ? 'none' : '1px 1px 2px rgba(0,0,0,0.3)'
                  }
                };
                onChange(event);
                
                // If switching to 'none', ensure we update the shadow in the preview
                if (e.target.value === 'none') {
                  setTimeout(() => handleTextShadowUpdate('heading', true), 10);
                }
              }}
              style={styles.select}
              size="sm"
            >
              <option value="none">None</option>
              <option value="custom">Custom</option>
            </Form.Select>
          </div>
          
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Shadow Color</div>
            <ColorInput
              name="headingTextShadowColor"
              value={element.headingTextShadowColor || 'rgba(0,0,0,0.3)'}
              onChange={(e) => {
                const event = {
                  ...e,
                  target: {
                    ...e.target,
                    name: 'headingTextShadowColor',
                    value: e.target.value
                  }
                };
                onChange(event);
                setTimeout(() => handleTextShadowUpdate('heading'), 10);
              }}
              disabled={element.headingTextShadow === 'none'}
            />
          </div>
          
          {element.headingTextShadow !== 'none' && (
            <div style={styles.grid3}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Blur</div>
                <DimensionInput
                  name="headingTextShadowBlur"
                  value={element.headingTextShadowBlur || '2px'}
                  onChange={(e) => {
                    onChange(e);
                    setTimeout(() => handleTextShadowUpdate('heading'), 10);
                  }}
                  placeholder="2px"
                />
              </div>
              
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Offset X</div>
                <DimensionInput
                  name="headingTextShadowOffsetX"
                  value={element.headingTextShadowOffsetX || '1px'}
                  onChange={(e) => {
                    onChange(e);
                    setTimeout(() => handleTextShadowUpdate('heading'), 10);
                  }}
                  placeholder="1px"
                />
              </div>
              
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Offset Y</div>
                <DimensionInput
                  name="headingTextShadowOffsetY"
                  value={element.headingTextShadowOffsetY || '1px'}
                  onChange={(e) => {
                    onChange(e);
                    setTimeout(() => handleTextShadowUpdate('heading'), 10);
                  }}
                  placeholder="1px"
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {textType === 'paragraph' && (
        <div style={styles.grid2}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Text Shadow</div>
            <Form.Select
              name="paragraphTextShadow"
              value={element.paragraphTextShadow === 'none' ? 'none' : 'custom'}
              onChange={(e) => {
                // First set the text shadow property to 'none' or 'custom'
                const event = {
                  ...e,
                  target: {
                    ...e.target,
                    name: 'paragraphTextShadow',
                    value: e.target.value === 'none' ? 'none' : '1px 1px 2px rgba(0,0,0,0.3)'
                  }
                };
                onChange(event);
                
                // If switching to 'none', ensure we update the shadow in the preview
                if (e.target.value === 'none') {
                  setTimeout(() => handleTextShadowUpdate('paragraph', true), 10);
                }
              }}
              style={styles.select}
              size="sm"
            >
              <option value="none">None</option>
              <option value="custom">Custom</option>
            </Form.Select>
          </div>
          
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Shadow Color</div>
            <ColorInput
              name="paragraphTextShadowColor"
              value={element.paragraphTextShadowColor || 'rgba(0,0,0,0.3)'}
              onChange={(e) => {
                const event = {
                  ...e,
                  target: {
                    ...e.target,
                    name: 'paragraphTextShadowColor',
                    value: e.target.value
                  }
                };
                onChange(event);
                setTimeout(() => handleTextShadowUpdate('paragraph'), 10);
              }}
              disabled={element.paragraphTextShadow === 'none'}
            />
          </div>
          
          {element.paragraphTextShadow !== 'none' && (
            <div style={styles.grid3}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Blur</div>
                <DimensionInput
                  name="paragraphTextShadowBlur"
                  value={element.paragraphTextShadowBlur || '2px'}
                  onChange={(e) => {
                    onChange(e);
                    setTimeout(() => handleTextShadowUpdate('paragraph'), 10);
                  }}
                  placeholder="2px"
                />
              </div>
              
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Offset X</div>
                <DimensionInput
                  name="paragraphTextShadowOffsetX"
                  value={element.paragraphTextShadowOffsetX || '1px'}
                  onChange={(e) => {
                    onChange(e);
                    setTimeout(() => handleTextShadowUpdate('paragraph'), 10);
                  }}
                  placeholder="1px"
                />
              </div>
              
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Offset Y</div>
                <DimensionInput
                  name="paragraphTextShadowOffsetY"
                  value={element.paragraphTextShadowOffsetY || '1px'}
                  onChange={(e) => {
                    onChange(e);
                    setTimeout(() => handleTextShadowUpdate('paragraph'), 10);
                  }}
                  placeholder="1px"
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {textType === 'list' && (
        <div style={styles.grid2}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Text Shadow</div>
            <Form.Select
              name="listTextShadow"
              value={element.listTextShadow === 'none' ? 'none' : 'custom'}
              onChange={(e) => {
                // First set the text shadow property to 'none' or 'custom'
                const event = {
                  ...e,
                  target: {
                    ...e.target,
                    name: 'listTextShadow',
                    value: e.target.value === 'none' ? 'none' : '1px 1px 2px rgba(0,0,0,0.3)'
                  }
                };
                onChange(event);
                
                // If switching to 'none', ensure we update the shadow in the preview
                if (e.target.value === 'none') {
                  setTimeout(() => handleTextShadowUpdate('list', true), 10);
                }
              }}
              style={styles.select}
              size="sm"
            >
              <option value="none">None</option>
              <option value="custom">Custom</option>
            </Form.Select>
          </div>
          
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Shadow Color</div>
            <ColorInput
              name="listTextShadowColor"
              value={element.listTextShadowColor || 'rgba(0,0,0,0.3)'}
              onChange={(e) => {
                const event = {
                  ...e,
                  target: {
                    ...e.target,
                    name: 'listTextShadowColor',
                    value: e.target.value
                  }
                };
                onChange(event);
                setTimeout(() => handleTextShadowUpdate('list'), 10);
              }}
              disabled={element.listTextShadow === 'none'}
            />
          </div>
          
          {element.listTextShadow !== 'none' && (
            <div style={styles.grid3}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Blur</div>
                <DimensionInput
                  name="listTextShadowBlur"
                  value={element.listTextShadowBlur || '2px'}
                  onChange={(e) => {
                    onChange(e);
                    setTimeout(() => handleTextShadowUpdate('list'), 10);
                  }}
                  placeholder="2px"
                />
              </div>
              
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Offset X</div>
                <DimensionInput
                  name="listTextShadowOffsetX"
                  value={element.listTextShadowOffsetX || '1px'}
                  onChange={(e) => {
                    onChange(e);
                    setTimeout(() => handleTextShadowUpdate('list'), 10);
                  }}
                  placeholder="1px"
                />
              </div>
              
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Offset Y</div>
                <DimensionInput
                  name="listTextShadowOffsetY"
                  value={element.listTextShadowOffsetY || '1px'}
                  onChange={(e) => {
                    onChange(e);
                    setTimeout(() => handleTextShadowUpdate('list'), 10);
                  }}
                  placeholder="1px"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdvancedTypography;
