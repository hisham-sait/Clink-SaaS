import { ButtonElementData } from '../ButtonElementData';

// Default properties for a button element
export const getButtonElementProperties = (): Partial<ButtonElementData> => {
  return {
    type: 'button',
    label: 'Button Element',
    
    // Content properties
    buttonText: 'Click Me',
    buttonType: 'link',
    url: '#',
    target: '_self',
    icon: '',
    iconPosition: 'left',
    
    // Styling properties
    buttonStyle: 'filled',
    buttonVariant: 'primary',
    buttonSize: 'md',
    buttonColor: '#007bff',
    textColor: '#ffffff',
    
    // Layout properties
    width: 'auto',
    height: 'auto',
    fullWidth: false,
    alignment: 'left',
    
    // Border properties
    borderRadius: '4px',
    borderWidth: '1px',
    borderColor: '#007bff',
    borderStyle: 'solid',
    
    // Shadow properties
    boxShadow: 'none',
    boxShadowColor: 'rgba(0,0,0,0.2)',
    boxShadowBlur: '10px',
    boxShadowSpread: '0',
    boxShadowOffsetX: '0',
    boxShadowOffsetY: '4px',
    
    // Spacing properties
    margin: '0 0 1rem 0',
    padding: '6px 12px',
    
    // Animation properties
    animation: 'none',
    animationDuration: '1s',
    animationDelay: '0s',
    animationEasing: 'ease',
    hoverEffect: false,
    hoverEffectType: 'brighten',
    
    // Responsive properties
    hideOnMobile: false,
    hideOnDesktop: false,
    mobileWidth: 'auto',
    mobileHeight: 'auto',
    
    // Accessibility properties
    ariaLabel: '',
    role: 'button',
    tabIndex: 0,
    
    required: false,
    description: 'Button element for your page'
  };
};

// Helper function to update box shadow based on individual properties
export const updateBoxShadow = (element: ButtonElementData): string => {
  if (element.boxShadow === 'none') {
    return 'none';
  }
  
  const color = element.boxShadowColor || 'rgba(0,0,0,0.2)';
  const blur = element.boxShadowBlur || '10px';
  const spread = element.boxShadowSpread || '0';
  const offsetX = element.boxShadowOffsetX || '0';
  const offsetY = element.boxShadowOffsetY || '4px';
  
  return `${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
};

// Helper function to get button style based on properties
export const getButtonStyle = (element: ButtonElementData): React.CSSProperties => {
  const styles: React.CSSProperties = {
    display: 'inline-block',
    fontWeight: 400,
    textAlign: 'center',
    verticalAlign: 'middle',
    userSelect: 'none',
    border: '1px solid transparent',
    padding: element.padding || '6px 12px',
    fontSize: element.buttonSize === 'sm' ? '0.875rem' : 
              element.buttonSize === 'lg' ? '1.25rem' : '1rem',
    lineHeight: 1.5,
    borderRadius: element.borderRadius || '4px',
    transition: 'color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    textDecoration: 'none',
    cursor: 'pointer',
  };
  
  // Apply width and height
  if (element.width && element.width !== 'auto') {
    styles.width = element.width;
  }
  
  if (element.height && element.height !== 'auto') {
    styles.height = element.height;
  }
  
  if (element.fullWidth) {
    styles.width = '100%';
  }
  
  // Apply button style
  switch (element.buttonStyle) {
    case 'outline':
      styles.backgroundColor = 'transparent';
      styles.color = element.buttonColor || '#007bff';
      styles.borderColor = element.buttonColor || '#007bff';
      break;
    case 'text':
      styles.backgroundColor = 'transparent';
      styles.color = element.buttonColor || '#007bff';
      styles.borderColor = 'transparent';
      break;
    case 'gradient':
      styles.backgroundImage = `linear-gradient(45deg, ${element.buttonColor || '#007bff'}, ${adjustColor(element.buttonColor || '#007bff', 40)})`;
      styles.color = element.textColor || '#ffffff';
      styles.borderColor = 'transparent';
      break;
    default: // filled
      styles.backgroundColor = element.buttonColor || '#007bff';
      styles.color = element.textColor || '#ffffff';
      styles.borderColor = element.buttonColor || '#007bff';
      break;
  }
  
  // Apply box shadow
  if (element.boxShadow && element.boxShadow !== 'none') {
    styles.boxShadow = updateBoxShadow(element);
  }
  
  return styles;
};

// Helper function to adjust color brightness
export const adjustColor = (color: string, amount: number): string => {
  // Convert hex to RGB
  let hex = color;
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }
  
  // Parse the hex values
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);
  
  // Adjust the values
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};
