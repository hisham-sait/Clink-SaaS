import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { FaSearch, FaEye } from 'react-icons/fa';
import { TextElementData } from '../TextElementData';
import { textStyles as styles } from '../../shared';
import { DimensionInput, ColorInput } from '../../shared/components';

interface TypographyProps {
  element: TextElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

/**
 * Typography section for text elements
 * Handles font family and basic typography settings
 */
const Typography: React.FC<TypographyProps> = ({ element, onChange }) => {
  const [fontSearch, setFontSearch] = useState('');
  const [showFontPreview, setShowFontPreview] = useState(false);
  
  // Google Fonts list - popular fonts
  const googleFonts = [
    { name: 'Roboto', value: "'Roboto', sans-serif" },
    { name: 'Open Sans', value: "'Open Sans', sans-serif" },
    { name: 'Lato', value: "'Lato', sans-serif" },
    { name: 'Montserrat', value: "'Montserrat', sans-serif" },
    { name: 'Poppins', value: "'Poppins', sans-serif" },
    { name: 'Raleway', value: "'Raleway', sans-serif" },
    { name: 'Nunito', value: "'Nunito', sans-serif" },
    { name: 'Source Sans Pro', value: "'Source Sans Pro', sans-serif" },
    { name: 'PT Sans', value: "'PT Sans', sans-serif" },
    { name: 'Oswald', value: "'Oswald', sans-serif" },
    { name: 'Merriweather', value: "'Merriweather', serif" },
    { name: 'Ubuntu', value: "'Ubuntu', sans-serif" },
    { name: 'Playfair Display', value: "'Playfair Display', serif" },
  ];

  // System fonts
  const systemFonts = [
    { name: 'Arial', value: "Arial, sans-serif" },
    { name: 'Helvetica', value: "'Helvetica Neue', Helvetica, sans-serif" },
    { name: 'Times New Roman', value: "'Times New Roman', Times, serif" },
    { name: 'Georgia', value: "Georgia, serif" },
    { name: 'Courier New', value: "'Courier New', Courier, monospace" },
    { name: 'Verdana', value: "Verdana, Geneva, sans-serif" },
    { name: 'Segoe UI', value: "'Segoe UI', Tahoma, Geneva, sans-serif" },
  ];
  
  // Filter fonts based on search
  const filteredFonts = [...systemFonts, ...googleFonts].filter(font => 
    font.name.toLowerCase().includes(fontSearch.toLowerCase())
  );

  // Handle font search change
  const handleFontSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSearch(e.target.value);
  };

  // Handle font selection
  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const event = {
      ...e,
      target: {
        ...e.target,
        name: 'fontFamily',
        value: e.target.value
      }
    };
    onChange(event);
  };
  
  // Render type-specific typography controls
  const renderTypeSpecificControls = () => {
    const textType = element.textType || 'paragraph';
    
    if (textType === 'heading') {
      return (
        <>
          <div style={styles.grid3}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Level</div>
              <Form.Select
                name="headingLevel"
                value={element.headingLevel}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
                <option value={4}>H4</option>
                <option value={5}>H5</option>
                <option value={6}>H6</option>
              </Form.Select>
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Align</div>
              <Form.Select
                name="headingAlignment"
                value={element.headingAlignment}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </Form.Select>
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Color</div>
              <ColorInput
                name="headingColor"
                value={element.headingColor || '#212529'}
                onChange={onChange}
              />
            </div>
          </div>
          
          <div style={styles.grid3}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Size</div>
              <DimensionInput
                name="headingSize"
                value={element.headingSize || '1.75rem'}
                onChange={onChange}
                placeholder="1.75rem"
              />
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Weight</div>
              <Form.Select
                name="headingWeight"
                value={element.headingWeight}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="light">Light</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
                <option value="600">600</option>
                <option value="700">700</option>
                <option value="800">800</option>
                <option value="900">900</option>
              </Form.Select>
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Transform</div>
              <Form.Select
                name="headingTransform"
                value={element.headingTransform}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value="none">None</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="lowercase">lowercase</option>
                <option value="capitalize">Capitalize</option>
              </Form.Select>
            </div>
          </div>
          
          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Style</div>
              <Form.Select
                name="headingStyle"
                value={element.headingStyle}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
                <option value="oblique">Oblique</option>
              </Form.Select>
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Decoration</div>
              <Form.Select
                name="headingDecoration"
                value={element.headingDecoration}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value="none">None</option>
                <option value="underline">Underline</option>
                <option value="line-through">Strikethrough</option>
                <option value="overline">Overline</option>
              </Form.Select>
            </div>
          </div>
          
          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Line Height</div>
              <DimensionInput
                name="headingLineHeight"
                value={element.headingLineHeight || '1.5'}
                onChange={onChange}
                placeholder="1.5"
              />
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Letter Spacing</div>
              <DimensionInput
                name="headingLetterSpacing"
                value={element.headingLetterSpacing || 'normal'}
                onChange={onChange}
                placeholder="normal"
              />
            </div>
          </div>
        </>
      );
    } else if (textType === 'paragraph') {
      return (
        <>
          <div style={styles.grid3}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Align</div>
              <Form.Select
                name="paragraphAlignment"
                value={element.paragraphAlignment}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </Form.Select>
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Color</div>
              <ColorInput
                name="paragraphColor"
                value={element.paragraphColor || '#212529'}
                onChange={onChange}
              />
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Size</div>
              <DimensionInput
                name="paragraphSize"
                value={element.paragraphSize || '1rem'}
                onChange={onChange}
                placeholder="1rem"
              />
            </div>
          </div>
          
          <div style={styles.grid3}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Weight</div>
              <Form.Select
                name="paragraphWeight"
                value={element.paragraphWeight}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="light">Light</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
                <option value="600">600</option>
                <option value="700">700</option>
                <option value="800">800</option>
                <option value="900">900</option>
              </Form.Select>
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Transform</div>
              <Form.Select
                name="paragraphTransform"
                value={element.paragraphTransform}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value="none">None</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="lowercase">lowercase</option>
                <option value="capitalize">Capitalize</option>
              </Form.Select>
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Style</div>
              <Form.Select
                name="paragraphStyle"
                value={element.paragraphStyle}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
                <option value="oblique">Oblique</option>
              </Form.Select>
            </div>
          </div>
          
          <div style={styles.grid3}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Decoration</div>
              <Form.Select
                name="paragraphDecoration"
                value={element.paragraphDecoration}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value="none">None</option>
                <option value="underline">Underline</option>
                <option value="line-through">Strikethrough</option>
                <option value="overline">Overline</option>
              </Form.Select>
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Line Height</div>
              <DimensionInput
                name="paragraphLineHeight"
                value={element.paragraphLineHeight || '1.5'}
                onChange={onChange}
                placeholder="1.5"
              />
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Letter Spacing</div>
              <DimensionInput
                name="paragraphLetterSpacing"
                value={element.paragraphLetterSpacing || 'normal'}
                onChange={onChange}
                placeholder="normal"
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Text Indent</div>
            <DimensionInput
              name="paragraphIndent"
              value={element.paragraphIndent || '0'}
              onChange={onChange}
              placeholder="0"
            />
          </div>
        </>
      );
    } else {
      return (
        <>
          <div style={styles.grid3}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>List Type</div>
              <Form.Select
                name="listType"
                value={element.listType}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value="ordered">Ordered</option>
                <option value="unordered">Unordered</option>
              </Form.Select>
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>List Style</div>
              <Form.Select
                name="listStyle"
                value={element.listStyle}
                onChange={onChange}
                style={styles.select}
                size="sm"
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
              </Form.Select>
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Color</div>
              <ColorInput
                name="listColor"
                value={element.listColor || '#212529'}
                onChange={onChange}
              />
            </div>
          </div>
          
          <div style={styles.grid3}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Size</div>
              <DimensionInput
                name="listSize"
                value={element.listSize || '1rem'}
                onChange={onChange}
                placeholder="1rem"
              />
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Weight</div>
              <Form.Select
                name="listWeight"
                value={element.listWeight}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="light">Light</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
                <option value="600">600</option>
                <option value="700">700</option>
                <option value="800">800</option>
                <option value="900">900</option>
              </Form.Select>
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Spacing</div>
              <DimensionInput
                name="listSpacing"
                value={element.listSpacing || '0.5rem'}
                onChange={onChange}
                placeholder="0.5rem"
              />
            </div>
          </div>
        </>
      );
    }
  };
  
  return (
    <>
      <div style={styles.formGroup}>
        <div className="d-flex justify-content-between align-items-center">
          <div style={styles.inlineLabel}>Font</div>
          <Button 
            variant="link" 
            size="sm" 
            style={styles.miniButton}
            onClick={() => setShowFontPreview(!showFontPreview)}
          >
            <FaEye size={8} className="me-1" /> {showFontPreview ? 'Hide' : 'Preview'}
          </Button>
        </div>
        <InputGroup size="sm" className="mb-1">
          <InputGroup.Text style={{ padding: '0 4px', height: '22px' }}>
            <FaSearch size={8} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search..."
            value={fontSearch}
            onChange={handleFontSearchChange}
            style={styles.formControl}
            size="sm"
          />
          <Form.Select 
            name="fontFamily" 
            value={element.fontFamily || 'inherit'} 
            onChange={handleFontChange}
            style={styles.select}
            size="sm"
          >
            <optgroup label="System">
              {systemFonts.filter(font => 
                font.name.toLowerCase().includes(fontSearch.toLowerCase())
              ).map((font, index) => (
                <option key={`system-${index}`} value={font.value}>{font.name}</option>
              ))}
            </optgroup>
            <optgroup label="Google">
              {googleFonts.filter(font => 
                font.name.toLowerCase().includes(fontSearch.toLowerCase())
              ).map((font, index) => (
                <option key={`google-${index}`} value={font.value}>{font.name}</option>
              ))}
            </optgroup>
          </Form.Select>
        </InputGroup>
        {showFontPreview && (
          <div 
            style={{
              ...styles.fontPreview,
              fontFamily: element.fontFamily
            }}
          >
            The quick brown fox jumps over the lazy dog
          </div>
        )}
      </div>
      
      {/* Type-specific typography controls */}
      {renderTypeSpecificControls()}
    </>
  );
};

export default Typography;
