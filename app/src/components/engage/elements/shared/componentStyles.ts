import { CSSProperties } from 'react';

/**
 * Shared styles for common UI components used across different elements
 */
export const componentStyles: Record<string, CSSProperties> = {
  // Section header styles
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
  
  // Form group styles
  formGroup: {
    marginBottom: '3px',
  },
  
  // Label styles
  label: {
    fontSize: '10px',
    marginBottom: '1px',
    fontWeight: 500,
  },
  
  inlineLabel: {
    fontSize: '10px',
    fontWeight: 500,
    marginBottom: '0',
    marginRight: '4px',
    whiteSpace: 'nowrap',
  },
  
  // Form control styles
  formControl: {
    fontSize: '11px',
    padding: '2px 6px',
    height: '22px',
  },
  
  // Color input styles
  compactColorControl: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ced4da',
    borderRadius: '3px',
    overflow: 'hidden',
    height: '22px',
  },
  
  colorSwatch: {
    width: '22px',
    height: '22px',
    border: 'none',
    padding: '0',
  },
  
  colorText: {
    fontSize: '11px',
    padding: '2px 6px',
    border: 'none',
    flex: 1,
    height: '22px',
  },
  
  // Dimension input styles
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
  
  // Help text styles
  helpText: {
    fontSize: '9px',
    marginTop: '1px',
    color: '#6c757d',
  },
};
