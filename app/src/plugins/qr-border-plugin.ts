import QRBorderPlugin from 'qr-border-plugin';

/**
 * Register the QR Border Plugin with QRCodeStyling
 * This makes the border plugin available globally for all QR code instances
 */
export const registerQRBorderPlugin = (): void => {
  try {
    // Make the plugin available globally
    if (typeof window !== 'undefined') {
      window.QRBorderPlugin = QRBorderPlugin;
      
      // Log success message
      console.log('QR Border Plugin registered globally');
    }
  } catch (error) {
    console.error('Failed to register QR Border Plugin:', error);
  }
};

export default registerQRBorderPlugin;
