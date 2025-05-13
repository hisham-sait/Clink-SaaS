import React, { useState, useEffect } from 'react';
import { Form, Row, Col, InputGroup, Button } from 'react-bootstrap';
import { FaPalette, FaSearch, FaLock, FaUnlock, FaChevronDown, FaChevronUp, FaImage, FaUpload } from 'react-icons/fa';
import { getCurrentCompanyId } from '../../../../../services/engage';
import FileManagerModal from '../../../../common/FileManagerModal';
import BackgroundPositionControl from '../../../../common/BackgroundPositionControl';
import { MediaItem } from '../../../../../services/media';

interface PageAppearanceProps {
  appearance: {
    backgroundColor: string;
    backgroundImage: string;
    backgroundType?: 'color' | 'image' | 'simpleGradient' | 'abstractGradient' | 'customGradient';
    backgroundGradient?: string;
    backgroundGradientStartColor?: string;
    backgroundGradientEndColor?: string;
    backgroundGradientAngle?: number;
    backgroundAttachment?: 'scroll' | 'fixed';
    backgroundPosition?: string;
    backgroundSize?: string;
    backgroundRepeat?: string;
    fontFamily: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    borderRadius: string;
    boxShadow: string;
    headerAlignment: string;
    buttonStyle: string;
    width: string;
    padding: string;
    sectionTitleColor: string;
    sectionDividerColor: string;
    elementSpacing: string;
    usePhoneSilhouette?: boolean;
    phoneModel?: 'iphone14' | 'iphone13' | 'pixel7' | 'galaxy';
    phoneColor?: string;
    showButtons?: boolean;
    showHomeIndicator?: boolean;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

// Predefined gradients
const simpleGradients = [
  { name: 'Purple to Pink', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { name: 'Blue to Cyan', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Orange to Red', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { name: 'Teal to Cyan', value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  { name: 'Pink', value: 'linear-gradient(135deg, #f78ca0 0%, #f9748f 100%)' },
  { name: 'Blue', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Purple to Blue', value: 'linear-gradient(135deg, #a18cd1 0%, #6b8dd6 100%)' },
  { name: 'Gray', value: 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)' },
  { name: 'Dark Purple', value: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' },
  { name: 'Light Blue', value: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { name: 'Light Pink', value: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
  { name: 'Mint', value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
];

// Abstract gradients with complex patterns
const abstractGradients = [
  // Complex multi-layer gradients with blend modes
  { name: 'Neon Fusion', value: 'linear-gradient(120deg, #FF00C7 0%, #51003F 100%), linear-gradient(120deg, #0030AD 0%, #00071A 100%), linear-gradient(180deg, #000346 0%, #FF0000 100%), linear-gradient(60deg, #0029FF 0%, #AA0014 100%), radial-gradient(100% 165% at 100% 100%, #FF00A8 0%, #00FF47 100%), radial-gradient(100% 150% at 0% 0%, #FFF500 0%, #51D500 100%)' },
  
  { name: 'Cosmic Blend', value: 'linear-gradient(115deg, rgb(211, 255, 215) 0%, rgb(0, 0, 0) 100%), radial-gradient(90% 100% at 50% 0%, rgb(200, 200, 200) 0%, rgb(22, 0, 45) 100%), radial-gradient(100% 100% at 80% 0%, rgb(250, 255, 0) 0%, rgb(36, 0, 0) 100%), radial-gradient(150% 210% at 100% 0%, rgb(112, 255, 0) 0%, rgb(20, 175, 125) 0%, rgb(0, 10, 255) 100%), radial-gradient(100% 100% at 100% 30%, rgb(255, 77, 0) 0%, rgba(0, 200, 255, 1) 100%), linear-gradient(60deg, rgb(255, 0, 0) 0%, rgb(120, 86, 255) 100%)' },
  
  { name: 'Neon Spectrum', value: 'linear-gradient(115deg, #000000 0%, #00C508 55%, #000000 100%), linear-gradient(115deg, #0057FF 0%, #020077 100%), conic-gradient(from 110deg at -5% 35%, #000000 0deg, #FAFF00 360deg), conic-gradient(from 220deg at 30% 30%, #FF0000 0deg, #0000FF 220deg, #240060 360deg), conic-gradient(from 235deg at 60% 35%, #0089D7 0deg, #0000FF 180deg, #240060 360deg)' },
  
  { name: 'Pastel Fusion', value: 'linear-gradient(180deg, #FFB7B7 0%, #727272 100%), radial-gradient(60.91% 100% at 50% 0%, #FFD1D1 0%, #260000 100%), linear-gradient(238.72deg, #FFDDDD 0%, #720066 100%), linear-gradient(127.43deg, #00FFFF 0%, #FF4444 100%), radial-gradient(100.22% 100% at 70.57% 0%, #FF0000 0%, #00FFE0 100%), linear-gradient(127.43deg, #B7D500 0%, #3300FF 100%)' },
  
  { name: 'Sunset Radiance', value: 'radial-gradient(100% 225% at 0% 0%, #DE3E3E 0%, #17115C 100%), radial-gradient(100% 225% at 100% 0%, #FF9040 0%, #FF0000 100%), linear-gradient(180deg, #CE63B7 0%, #ED6283 100%), radial-gradient(100% 120% at 75% 0%, #A74600 0%, #000000 100%), linear-gradient(310deg, #0063D8 0%, #16009A 50%)' },
  
  { name: 'Vibrant Layers', value: 'linear-gradient(120deg, #FF0000 0%, #2400FF 100%), linear-gradient(120deg, #FA00FF 0%, #208200 100%), linear-gradient(130deg, #00F0FF 0%, #000000 100%), radial-gradient(110% 140% at 15% 90%, #ffffff 0%, #1700A4 100%), radial-gradient(100% 100% at 50% 0%, #AD00FF 0%, #00FFE0 100%), radial-gradient(100% 100% at 50% 0%, #00FFE0 0%, #7300A9 80%), linear-gradient(30deg, #7ca304 0%, #2200AA 100%)' },
  
  { name: 'Mint Overlay', value: 'linear-gradient(180deg, #0C003C 0%, #BFFFAF 100%), linear-gradient(165deg, #480045 25%, #E9EAAF 100%), linear-gradient(145deg, #480045 25%, #E9EAAF 100%), linear-gradient(300deg, rgba(233, 223, 255, 0) 0%, #AF89FF 100%), linear-gradient(90deg, #45EBA5 0%, #45EBA5 30%, #21ABA5 30%, #21ABA5 60%, #1D566E 60%, #1D566E 70%, #163A5F 70%, #163A5F 100%)' },
  
  { name: 'Geometric Burn', value: 'linear-gradient(235deg, #BABC4A 0%, #000000 100%), linear-gradient(235deg, #0026AC 0%, #282534 100%), linear-gradient(235deg, #00FFD1 0%, #000000 100%), radial-gradient(120% 185% at 25% -25%, #EEEEEE 0%, #EEEEEE 40%, #7971EA calc(40% + 1px), #7971EA 50%, #393E46 calc(50% + 1px), #393E46 70%, #222831 calc(70% + 1px), #222831 100%), radial-gradient(70% 140% at 90% 10%, #F5F5C6 0%, #F5F5C6 30%, #7DA87B calc(30% + 1px), #7DA87B 60%, #326765 calc(60% + 1px), #326765 80%, #27253D calc(80% + 1px), #27253D 100%)' },
];

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
  { name: 'Quicksand', value: "'Quicksand', sans-serif" },
  { name: 'Rubik', value: "'Rubik', sans-serif" },
  { name: 'Work Sans', value: "'Work Sans', sans-serif" },
  { name: 'Noto Sans', value: "'Noto Sans', sans-serif" },
  { name: 'Nunito Sans', value: "'Nunito Sans', sans-serif" },
  { name: 'Cabin', value: "'Cabin', sans-serif" },
  { name: 'Josefin Sans', value: "'Josefin Sans', sans-serif" },
  { name: 'Comfortaa', value: "'Comfortaa', cursive" },
  { name: 'Bitter', value: "'Bitter', serif" },
  { name: 'Crimson Text', value: "'Crimson Text', serif" },
  { name: 'Libre Baskerville', value: "'Libre Baskerville', serif" },
  { name: 'Karla', value: "'Karla', sans-serif" },
  { name: 'Fira Sans', value: "'Fira Sans', sans-serif" },
  { name: 'Mulish', value: "'Mulish', sans-serif" },
  { name: 'Barlow', value: "'Barlow', sans-serif" },
  { name: 'Dancing Script', value: "'Dancing Script', cursive" },
  { name: 'Pacifico', value: "'Pacifico', cursive" },
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

// Custom styles for ultra-compact form elements
const styles = {
  formGroup: {
    marginBottom: '3px',
  },
  label: {
    fontSize: '10px',
    marginBottom: '1px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  formControl: {
    fontSize: '11px',
    padding: '2px 6px',
    height: '22px',
  },
  select: {
    fontSize: '11px',
    padding: '2px 6px',
    height: '22px',
  },
  colorPicker: {
    width: '22px',
    height: '22px',
    padding: '1px',
    marginRight: '2px',
  },
  helpText: {
    fontSize: '9px',
    marginTop: '1px',
    color: '#6c757d',
  },
  row: {
    marginBottom: '2px',
  },
  header: {
    fontSize: '12px',
    fontWeight: 600,
    marginBottom: '4px',
  },
  container: {
    padding: '0px',
  },
  fontPreview: {
    fontSize: '11px',
    padding: '2px',
    marginTop: '2px',
    border: '1px solid #dee2e6',
    borderRadius: '3px',
    backgroundColor: '#f8f9fa',
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: 600,
    marginTop: '6px',
    marginBottom: '1px',
    borderBottom: '1px solid #dee2e6',
    paddingBottom: '1px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  inlineLabel: {
    fontSize: '10px',
    fontWeight: 500,
    marginBottom: '0',
    marginRight: '4px',
    whiteSpace: 'nowrap',
  },
  inlineControl: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '3px',
  },
  compactColorControl: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ced4da',
    borderRadius: '3px',
    overflow: 'hidden',
    height: '22px',
  },
  colorText: {
    fontSize: '11px',
    padding: '2px 6px',
    border: 'none',
    flex: 1,
    height: '22px',
  },
  colorSwatch: {
    width: '22px',
    height: '22px',
    border: 'none',
    padding: '0',
  },
  unitInput: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ced4da',
    borderRadius: '3px',
    overflow: 'hidden',
    height: '22px',
  },
  valueInput: {
    fontSize: '11px',
    padding: '2px 6px',
    border: 'none',
    width: '60%',
    height: '22px',
  },
  unitSelect: {
    fontSize: '11px',
    padding: '0 2px',
    border: 'none',
    borderLeft: '1px solid #ced4da',
    width: '40%',
    height: '22px',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '4px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px',
  },
  gradientSwatch: {
    width: '100%',
    height: '22px',
    borderRadius: '3px',
    border: '1px solid #ced4da',
    cursor: 'pointer',
    marginBottom: '2px',
  },
  gradientGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '4px',
    marginTop: '2px',
  },
  sliderContainer: {
    marginBottom: '4px',
  },
  sliderLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '10px',
    marginBottom: '1px',
  },
  slider: {
    width: '100%',
    height: '14px',
    padding: '0',
  },
  collapsibleSection: {
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-out',
    padding: '0',
  },
  sectionCollapsed: {
    maxHeight: '0',
    padding: '0',
  },
  sectionExpanded: {
    maxHeight: '1000px',
    padding: '2px 0 0 0',
  },
  miniButton: {
    fontSize: '9px',
    padding: '0px 4px',
    height: '18px',
    lineHeight: '16px',
  },
  switchLabel: {
    fontSize: '10px',
    marginLeft: '4px',
  }
};

// Custom color input component
interface ColorInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const ColorInput: React.FC<ColorInputProps> = ({ name, value, onChange, disabled = false }) => {
  return (
    <div style={styles.compactColorControl}>
      <input
        type="color"
        name={name}
        value={value}
        onChange={onChange}
        style={styles.colorSwatch}
        disabled={disabled}
      />
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        style={styles.colorText}
        disabled={disabled}
      />
    </div>
  );
};

// Custom dimension input component
interface DimensionInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}

const DimensionInput: React.FC<DimensionInputProps> = ({ name, value, onChange, placeholder = "", disabled = false }) => {
  // Extract numeric value and unit
  const match = value ? value.match(/^([\d.]+)(.*)$/) : null;
  const numValue = match ? match[1] : "";
  const unit = match ? match[2] : "px";
  
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value + unit;
    const event = {
      ...e,
      target: {
        ...e.target,
        name,
        value: newValue
      }
    };
    onChange(event);
  };
  
  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = numValue + e.target.value;
    const event = {
      ...e,
      target: {
        ...e.target,
        name,
        value: newValue
      }
    };
    onChange(event);
  };
  
  return (
    <div style={styles.unitInput}>
      <input
        type="text"
        value={numValue}
        onChange={handleValueChange}
        placeholder={placeholder}
        style={styles.valueInput}
        disabled={disabled}
      />
      <select
        value={unit}
        onChange={handleUnitChange}
        style={styles.unitSelect}
        disabled={disabled}
      >
        <option value="px">px</option>
        <option value="%">%</option>
        <option value="em">em</option>
        <option value="rem">rem</option>
        <option value="vh">vh</option>
        <option value="vw">vw</option>
      </select>
    </div>
  );
};

// Collapsible section component
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  return (
    <>
      <div 
        style={styles.sectionHeader} 
        onClick={() => setExpanded(!expanded)}
      >
        <span>{title}</span>
        {expanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
      </div>
      <div 
        style={{
          ...styles.collapsibleSection,
          ...(expanded ? styles.sectionExpanded : styles.sectionCollapsed)
        }}
      >
        {children}
      </div>
    </>
  );
};

const PageAppearanceSettings: React.FC<PageAppearanceProps> = ({ appearance, onChange }) => {
  const [fontSearch, setFontSearch] = useState('');
  const [showFontPreview, setShowFontPreview] = useState(false);
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const companyId = getCurrentCompanyId();

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

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    const event = {
      target: {
        name,
        value: checked,
        type: 'checkbox',
        checked
      }
    } as any;
    onChange(event);
  };

  // Handle media selection
  const handleMediaSelect = (media: MediaItem | MediaItem[]) => {
    // Ensure we're working with a single media item
    const singleMedia = Array.isArray(media) ? media[0] : media;
    
    const event = {
      target: {
        name: 'backgroundImage',
        value: singleMedia.url
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  // Handle background position change
  const handlePositionChange = (position: string) => {
    const event = {
      target: {
        name: 'backgroundPosition',
        value: position
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  // Handle background size change
  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const event = {
      target: {
        name: 'backgroundSize',
        value: e.target.value
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(event);
  };

  // Handle background repeat change
  const handleRepeatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const event = {
      target: {
        name: 'backgroundRepeat',
        value: e.target.value
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(event);
  };

  return (
    <div className="page-appearance-settings" style={styles.container}>
      <div className="d-flex align-items-center mb-1">
        <FaPalette className="me-1" size={10} />
        <h6 className="mb-0" style={styles.header}>Page Appearance</h6>
      </div>

      <Form>
        <CollapsibleSection title="Background" defaultExpanded={true}>
          {/* Background Type Selection */}
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Background Type</div>
            <Form.Select
              name="backgroundType"
              value={appearance.backgroundType || 'color'}
              onChange={(e) => {
                const event = {
                  ...e,
                  target: {
                    ...e.target,
                    name: 'backgroundType',
                    value: e.target.value
                  }
                };
                onChange(event);
              }}
              style={styles.select}
              size="sm"
            >
              <option value="color">Custom Color</option>
              <option value="simpleGradient">Simple Gradients</option>
              <option value="abstractGradient">Abstract Gradients</option>
              <option value="customGradient">Custom Gradient</option>
              <option value="image">Custom Image/Video</option>
            </Form.Select>
          </div>

          {/* Background Color */}
          {(!appearance.backgroundType || appearance.backgroundType === 'color') && (
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Background Color</div>
              <ColorInput
                name="backgroundColor"
                value={appearance.backgroundColor}
                onChange={onChange}
              />
            </div>
          )}

          {/* Simple Gradients */}
          {appearance.backgroundType === 'simpleGradient' && (
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Simple Gradients</div>
              <div style={styles.gradientGrid}>
                {simpleGradients.map((gradient, index) => (
                  <div 
                    key={`simple-${index}`}
                    style={{
                      ...styles.gradientSwatch,
                      background: gradient.value,
                      border: appearance.backgroundGradient === gradient.value ? '2px solid #007bff' : '1px solid #ced4da'
                    }}
                    title={gradient.name}
                    onClick={() => {
                      const event = {
                        target: {
                          name: 'backgroundGradient',
                          value: gradient.value
                        }
                      } as any;
                      onChange(event);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Abstract Gradients */}
          {appearance.backgroundType === 'abstractGradient' && (
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Abstract Gradients</div>
              <div style={styles.gradientGrid}>
                {abstractGradients.map((gradient, index) => (
                  <div 
                    key={`abstract-${index}`}
                    style={{
                      ...styles.gradientSwatch,
                      background: gradient.value,
                      border: appearance.backgroundGradient === gradient.value ? '2px solid #007bff' : '1px solid #ced4da'
                    }}
                    title={gradient.name}
                    onClick={() => {
                      const event = {
                        target: {
                          name: 'backgroundGradient',
                          value: gradient.value
                        }
                      } as any;
                      onChange(event);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom Gradient */}
          {appearance.backgroundType === 'customGradient' && (
            <>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Start Color</div>
                <ColorInput
                  name="backgroundGradientStartColor"
                  value={appearance.backgroundGradientStartColor || '#f5f7fa'}
                  onChange={(e) => {
                    // Create a direct event for the start color
                    const startColorEvent = {
                      target: {
                        name: 'backgroundGradientStartColor',
                        value: e.target.value
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    
                    // Update the start color first
                    onChange(startColorEvent);
                    
                    // Then update the gradient string
                    const angle = appearance.backgroundGradientAngle || 135;
                    const startColor = e.target.value;
                    const endColor = appearance.backgroundGradientEndColor || '#c3cfe2';
                    
                    // Create a standard event for the gradient
                    const gradientEvent = {
                      target: {
                        name: 'backgroundGradient',
                        value: `linear-gradient(${angle}deg, ${startColor} 0%, ${endColor} 100%)`
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    
                    // Update the gradient after a small delay to ensure the color is updated first
                    setTimeout(() => onChange(gradientEvent), 10);
                  }}
                />
              </div>
              
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>End Color</div>
                <ColorInput
                  name="backgroundGradientEndColor"
                  value={appearance.backgroundGradientEndColor || '#c3cfe2'}
                  onChange={(e) => {
                    // Create a direct event for the end color
                    const endColorEvent = {
                      target: {
                        name: 'backgroundGradientEndColor',
                        value: e.target.value
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    
                    // Update the end color first
                    onChange(endColorEvent);
                    
                    // Then update the gradient string
                    const angle = appearance.backgroundGradientAngle || 135;
                    const startColor = appearance.backgroundGradientStartColor || '#f5f7fa';
                    const endColor = e.target.value;
                    
                    // Create a standard event for the gradient
                    const gradientEvent = {
                      target: {
                        name: 'backgroundGradient',
                        value: `linear-gradient(${angle}deg, ${startColor} 0%, ${endColor} 100%)`
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    
                    // Update the gradient after a small delay to ensure the color is updated first
                    setTimeout(() => onChange(gradientEvent), 10);
                  }}
                />
              </div>
              
              <div style={styles.sliderContainer}>
                <div style={styles.sliderLabel}>
                  <span>Gradient Angle</span>
                  <span>{appearance.backgroundGradientAngle || 135}°</span>
                </div>
                <Form.Range
                  name="backgroundGradientAngle"
                  min={0}
                  max={360}
                  step={1}
                  value={appearance.backgroundGradientAngle || 135}
                  onChange={(e) => {
                    // First update the angle directly
                    const angle = parseInt(e.target.value);
                    const angleEvent = {
                      target: {
                        name: 'backgroundGradientAngle',
                        value: angle.toString()
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    
                    // Update the angle first
                    onChange(angleEvent);
                    
                    // Then update the gradient string
                    const startColor = appearance.backgroundGradientStartColor || '#f5f7fa';
                    const endColor = appearance.backgroundGradientEndColor || '#c3cfe2';
                    
                    // Create a standard event for the gradient
                    const gradientEvent = {
                      target: {
                        name: 'backgroundGradient',
                        value: `linear-gradient(${angle}deg, ${startColor} 0%, ${endColor} 100%)`
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    
                    // Update the gradient after a small delay to ensure the angle is updated first
                    setTimeout(() => onChange(gradientEvent), 10);
                  }}
                />
              </div>
              
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Preview</div>
                <div 
                  style={{
                    ...styles.gradientSwatch,
                    background: appearance.backgroundGradient || `linear-gradient(135deg, ${appearance.backgroundGradientStartColor || '#f5f7fa'} 0%, ${appearance.backgroundGradientEndColor || '#c3cfe2'} 100%)`,
                    height: '30px'
                  }}
                />
              </div>
              
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Custom CSS (Advanced)</div>
                <Form.Control
                  type="text"
                  name="backgroundGradient"
                  value={appearance.backgroundGradient || 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}
                  onChange={onChange}
                  placeholder="linear-gradient(to right, #ff0000, #0000ff)"
                  style={styles.formControl}
                  size="sm"
                />
              </div>
            </>
          )}

          {/* Background Image URL and Media Browser */}
          {appearance.backgroundType === 'image' && (
            <>
              <div style={styles.formGroup}>
                <div className="d-flex justify-content-between align-items-center">
                  <div style={styles.inlineLabel}>Background Image</div>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    style={styles.miniButton}
                    onClick={() => {
                    console.log('Opening media browser in PageAppearanceSettings with company ID:', companyId);
                    console.log('Section:', 'pages');
                    setShowMediaBrowser(true);
                  }}
                  >
                    <FaImage size={10} className="me-1" /> Browse Media
                  </Button>
                </div>
                <Form.Control
                  type="text"
                  name="backgroundImage"
                  value={appearance.backgroundImage}
                  onChange={onChange}
                  placeholder="https://example.com/image.jpg"
                  style={styles.formControl}
                  size="sm"
                />
              </div>
              
              {/* Background Position Control */}
              <div style={styles.formGroup}>
                <BackgroundPositionControl
                  position={appearance.backgroundPosition || 'center center'}
                  onChange={handlePositionChange}
                />
              </div>
              
              {/* Background Size */}
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Background Size</div>
                <Form.Select
                  name="backgroundSize"
                  value={appearance.backgroundSize || 'cover'}
                  onChange={handleSizeChange}
                  style={styles.select}
                  size="sm"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="100% auto">100% Width</option>
                  <option value="auto 100%">100% Height</option>
                  <option value="auto">Auto</option>
                </Form.Select>
              </div>
              
              {/* Background Repeat */}
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Background Repeat</div>
                <Form.Select
                  name="backgroundRepeat"
                  value={appearance.backgroundRepeat || 'no-repeat'}
                  onChange={handleRepeatChange}
                  style={styles.select}
                  size="sm"
                >
                  <option value="no-repeat">No Repeat</option>
                  <option value="repeat">Repeat</option>
                  <option value="repeat-x">Repeat X</option>
                  <option value="repeat-y">Repeat Y</option>
                </Form.Select>
              </div>
              
              {/* File Manager Modal */}
              <FileManagerModal
                show={showMediaBrowser}
                onHide={() => setShowMediaBrowser(false)}
                onSelect={handleMediaSelect}
                companyId={companyId}
                section="pages"
                allowedTypes={['IMAGE']}
                title="Select Background Image"
              />
            </>
          )}

          {/* Background Attachment */}
          {(appearance.backgroundType === 'image' || 
            appearance.backgroundType === 'simpleGradient' || 
            appearance.backgroundType === 'abstractGradient' || 
            appearance.backgroundType === 'customGradient') && (
            <div style={styles.grid2}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Attachment</div>
                <Form.Select
                  name="backgroundAttachment"
                  value={appearance.backgroundAttachment || 'scroll'}
                  onChange={onChange}
                  style={styles.select}
                  size="sm"
                >
                  <option value="scroll">Scroll</option>
                  <option value="fixed">Fixed</option>
                </Form.Select>
              </div>
            </div>
          )}

          {/* Background blur and brightness controls removed */}
        </CollapsibleSection>

        <CollapsibleSection title="Layout & Colors" defaultExpanded={false}>
          {/* Layout Grid */}
          <div style={styles.grid3}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Width</div>
              <Form.Select
                name="width"
                value={appearance.width}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value="100%">Full</option>
                <option value="800px">800px</option>
                <option value="600px">600px</option>
                <option value="1000px">1000px</option>
              </Form.Select>
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Padding</div>
              <Form.Select
                name="padding"
                value={appearance.padding}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value="10px">10px</option>
                <option value="20px">20px</option>
                <option value="30px">30px</option>
              </Form.Select>
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Radius</div>
              <DimensionInput
                name="borderRadius"
                value={appearance.borderRadius}
                onChange={onChange}
                placeholder="10px"
              />
            </div>
          </div>
          
          {/* Colors Grid */}
          <div style={styles.grid3}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>BG</div>
              <ColorInput
                name="backgroundColor"
                value={appearance.backgroundColor}
                onChange={onChange}
              />
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Text</div>
              <ColorInput
                name="textColor"
                value={appearance.textColor}
                onChange={onChange}
              />
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Primary</div>
              <ColorInput
                name="primaryColor"
                value={appearance.primaryColor}
                onChange={onChange}
              />
            </div>
          </div>
          
          {/* Background Image */}
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Background Image URL</div>
            <Form.Control
              type="text"
              name="backgroundImage"
              value={appearance.backgroundImage}
              onChange={onChange}
              placeholder="https://example.com/image.jpg"
              style={styles.formControl}
              size="sm"
            />
          </div>
          
          {/* Font Family with Integrated Search */}
          <div style={styles.formGroup}>
            <div className="d-flex justify-content-between align-items-center">
              <div style={styles.inlineLabel}>Font</div>
              <Button 
                variant="link" 
                size="sm" 
                style={styles.miniButton}
                onClick={() => setShowFontPreview(!showFontPreview)}
              >
                {showFontPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
            </div>
            <InputGroup size="sm" className="mb-1">
              <InputGroup.Text style={{ padding: '0 4px' }}>
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
                value={appearance.fontFamily} 
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
                  fontFamily: appearance.fontFamily
                }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
            )}
          </div>
          
          {/* Alignment and Button Style */}
          <div style={styles.grid3}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Align</div>
              <Form.Select
                name="headerAlignment"
                value={appearance.headerAlignment}
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
              <div style={styles.inlineLabel}>Button</div>
              <Form.Select
                name="buttonStyle"
                value={appearance.buttonStyle}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value="default">Default</option>
                <option value="rounded">Round</option>
                <option value="square">Square</option>
                <option value="outline">Outline</option>
              </Form.Select>
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Shadow</div>
              <Form.Select
                name="boxShadow"
                value={appearance.boxShadow === "none" ? "none" : "default"}
                onChange={(e) => {
                  const value = e.target.value === "none" ? "none" : "0 0 20px rgba(0, 0, 0, 0.1)";
                  const event = {
                    ...e,
                    target: {
                      ...e.target,
                      value
                    }
                  };
                  onChange(event);
                }}
                style={styles.select}
                size="sm"
              >
                <option value="default">Default</option>
                <option value="none">None</option>
              </Form.Select>
            </div>
          </div>
        </CollapsibleSection>
        
        <CollapsibleSection title="Section Styling" defaultExpanded={false}>
          <div style={styles.grid3}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Title</div>
              <ColorInput
                name="sectionTitleColor"
                value={appearance.sectionTitleColor}
                onChange={onChange}
              />
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Divider</div>
              <ColorInput
                name="sectionDividerColor"
                value={appearance.sectionDividerColor}
                onChange={onChange}
              />
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Spacing</div>
              <DimensionInput
                name="elementSpacing"
                value={appearance.elementSpacing}
                onChange={onChange}
                placeholder="15px"
              />
            </div>
          </div>
        </CollapsibleSection>
        
        <CollapsibleSection title="Phone Preview" defaultExpanded={false}>
          <div className="d-flex align-items-center mb-1">
            <Form.Check
              type="switch"
              id="usePhoneSilhouette"
              checked={appearance.usePhoneSilhouette !== undefined ? appearance.usePhoneSilhouette : true}
              onChange={(e) => handleSwitchChange('usePhoneSilhouette', e.target.checked)}
              style={{ marginBottom: 0 }}
            />
            <span style={styles.switchLabel}>Use Phone Frame</span>
          </div>
          
          <div style={styles.grid3}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Model</div>
              <Form.Select
                name="phoneModel"
                value={appearance.phoneModel || 'iphone14'}
                onChange={onChange}
                style={styles.select}
                size="sm"
                disabled={appearance.usePhoneSilhouette === false}
              >
                <option value="iphone14">iPhone 14</option>
                <option value="iphone13">iPhone 13</option>
                <option value="pixel7">Pixel 7</option>
                <option value="galaxy">Galaxy</option>
              </Form.Select>
            </div>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Color</div>
              <ColorInput
                name="phoneColor"
                value={appearance.phoneColor || '#1a1a1a'}
                onChange={onChange}
                disabled={appearance.usePhoneSilhouette === false}
              />
            </div>
          </div>
          
          <div className="d-flex">
            <div className="d-flex align-items-center me-3">
              <Form.Check
                type="switch"
                id="showButtons"
                checked={appearance.showButtons !== undefined ? appearance.showButtons : true}
                onChange={(e) => handleSwitchChange('showButtons', e.target.checked)}
                disabled={appearance.usePhoneSilhouette === false}
                style={{ marginBottom: 0 }}
              />
              <span style={styles.switchLabel}>Buttons</span>
            </div>
            
            <div className="d-flex align-items-center">
              <Form.Check
                type="switch"
                id="showHomeIndicator"
                checked={appearance.showHomeIndicator !== undefined ? appearance.showHomeIndicator : true}
                onChange={(e) => handleSwitchChange('showHomeIndicator', e.target.checked)}
                disabled={appearance.usePhoneSilhouette === false}
                style={{ marginBottom: 0 }}
              />
              <span style={styles.switchLabel}>Home Indicator</span>
            </div>
          </div>
        </CollapsibleSection>
      </Form>
    </div>
  );
};

export default PageAppearanceSettings;
