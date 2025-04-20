declare module 'QRcodegenerator' {
  interface QRCodeOptions {
    content: string;
    width?: number;
    height?: number;
    colorDark?: string;
    colorLight?: string;
    correctLevel?: 'L' | 'M' | 'Q' | 'H';
    dotScale?: number;
    logo?: string;
    logoWidth?: number;
    logoHeight?: number;
    logoBackgroundColor?: string;
    logoMargin?: number;
    quietZone?: number;
    quietZoneColor?: string;
    backgroundImage?: string;
    backgroundImageAlpha?: number;
    autoColor?: boolean;
    binarize?: boolean;
    binarizeThreshold?: number;
    gifBackground?: string;
    callback?: (dataURL: string) => void;
    bindElement?: string;
    
    // QRCodeMonkey specific options
    body?: string;
    eye?: string;
    eyeBall?: string;
    bodyColor?: string;
    bgColor?: string;
    gradientType?: 'linear' | 'radial';
    gradientOnEyes?: boolean;
    gradientColors?: string[];
    cornerSquareColor?: string;
    cornerDotColor?: string;
  }

  export default class QRCodeGenerator {
    constructor(options: QRCodeOptions);
    makeCode(content: string): string;
    clear(): void;
    makeGIF(content: string, options: QRCodeOptions): void;
  }
}
