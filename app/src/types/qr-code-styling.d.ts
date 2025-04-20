declare global {
  interface Window {
    QRCodeStyling: any;
    QRBorderPlugin: any;
  }
}

declare module 'qr-code-styling' {
  interface QRCodeStylingOptions {
    width?: number;
    height?: number;
    type?: 'svg' | 'canvas';
    data?: string;
    margin?: number;
    qrOptions?: {
      typeNumber?: number;
      mode?: string;
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    };
    imageOptions?: {
      hideBackgroundDots?: boolean;
      imageSize?: number;
      margin?: number;
      crossOrigin?: string;
    };
    dotsOptions?: {
      type?: 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
      color?: string;
      gradient?: {
        type: 'linear' | 'radial';
        rotation?: number;
        colorStops: Array<{
          offset: number;
          color: string;
        }>;
      };
    };
    backgroundOptions?: {
      color?: string;
      gradient?: {
        type: 'linear' | 'radial';
        rotation?: number;
        colorStops: Array<{
          offset: number;
          color: string;
        }>;
      };
    };
    cornersSquareOptions?: {
      type?: 'square' | 'dot' | 'extra-rounded';
      color?: string;
      gradient?: {
        type: 'linear' | 'radial';
        rotation?: number;
        colorStops: Array<{
          offset: number;
          color: string;
        }>;
      };
    };
    cornersDotOptions?: {
      type?: 'square' | 'dot';
      color?: string;
      gradient?: {
        type: 'linear' | 'radial';
        rotation?: number;
        colorStops: Array<{
          offset: number;
          color: string;
        }>;
      };
    };
    image?: string;
    borderOptions?: {
      width?: number;
      style?: 'solid' | 'dashed' | 'dotted' | 'double';
      color?: string;
      radius?: number;
      margin?: number;
      gradient?: {
        type: 'linear' | 'radial';
        rotation?: number;
        colorStops: Array<{
          offset: number;
          color: string;
        }>;
      };
    };
  }

  class QRCodeStyling {
    constructor(options: QRCodeStylingOptions);
    append(element: HTMLElement): void;
    update(options: Partial<QRCodeStylingOptions>): void;
    download(options?: { name?: string; extension?: 'png' | 'jpeg' | 'webp' }): void;
    getRawData(extension: 'png' | 'jpeg' | 'webp'): Promise<Blob>;
  }

  export default QRCodeStyling;
}

declare module 'qr-border-plugin' {
  export interface QRBorderPluginOptions {
    width?: number;
    style?: 'solid' | 'dashed' | 'dotted' | 'double';
    color?: string;
    radius?: number;
    margin?: number;
    gradient?: {
      type: 'linear' | 'radial';
      rotation?: number;
      colorStops: Array<{
        offset: number;
        color: string;
      }>;
    };
  }

  class QRBorderPlugin {
    constructor(options?: QRBorderPluginOptions);
  }

  export default QRBorderPlugin;
}

export {};
