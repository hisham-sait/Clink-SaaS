import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import { FaDownload, FaSave } from 'react-icons/fa';
import { LinksTypes } from '../../../../services/links';
import * as QRCodesService from '../../../../services/links/qrcodes';
import QRBorderPlugin from 'qr-border-plugin';

// Use the global QRCodeStyling object
declare global {
  interface Window {
    QRCodeStyling: any;
    QRBorderPlugin: any;
  }
}

interface QRCodeCustomizerModalProps {
  show: boolean;
  onHide: () => void;
  qrCode: LinksTypes.QRCode;
  onSave: () => void;
}

const QRCodeCustomizerModal: React.FC<QRCodeCustomizerModalProps> = ({
  show,
  onHide,
  qrCode,
  onSave
}) => {
  const [config, setConfig] = useState<LinksTypes.QRCodeConfig>({
    foreground: '#000000',
    background: '#FFFFFF',
    margin: 1,
    size: 200,
    errorCorrectionLevel: 'M',
    logo: null,
    logoSize: 0.2,
    body: 'square',
    eye: 'square',
    eyeBall: 'square',
    cornerSquareColor: '#000000',
    cornerDotColor: '#000000',
    gradient: false,
    gradientColors: ['#000000', '#000000'],
    gradientType: 'linear',
    // Default border options
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#000000',
    borderRadius: 0,
    borderMargin: 10,
    borderGradient: false,
    borderGradientColors: ['#000000', '#000000'],
    borderGradientType: 'linear'
  });
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Initialize config from qrCode
  useEffect(() => {
    if (qrCode && qrCode.config) {
      setConfig({
        ...config,
        ...qrCode.config
      });
    }
  }, [qrCode]);

  // Generate preview when config changes
  useEffect(() => {
    generatePreview();
  }, [config]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setConfig({
        ...config,
        [name]: checked
      });
    } else if (type === 'number') {
      setConfig({
        ...config,
        [name]: parseFloat(value)
      });
    } else {
      setConfig({
        ...config,
        [name]: value
      });
    }
  };

  const handleGradientColorChange = (index: number, color: string) => {
    const newGradientColors = [...(config.gradientColors || ['#000000', '#000000'])];
    newGradientColors[index] = color;
    
    setConfig({
      ...config,
      gradientColors: newGradientColors
    });
  };

  const handleBorderGradientColorChange = (index: number, color: string) => {
    const newBorderGradientColors = [...(config.borderGradientColors || ['#000000', '#000000'])];
    newBorderGradientColors[index] = color;
    
    setConfig({
      ...config,
      borderGradientColors: newBorderGradientColors
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setConfig({
            ...config,
            logo: event.target.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const qrCodeRef = useRef<HTMLDivElement>(null);

  const generatePreview = async () => {
    try {
      if (!qrCodeRef.current) return;
      
      // Clear previous QR code
      qrCodeRef.current.innerHTML = '';
      
      // Create QR code options
      // Check if content is empty and provide a default value
      const content = qrCode.content || 'https://example.com';
      console.log('QR Code Content:', content);
      
      const qrCodeOptions: any = {
        width: config.size || 200,
        height: config.size || 200,
        type: 'svg',
        data: content,
        margin: config.margin || 1,
        qrOptions: {
          errorCorrectionLevel: config.errorCorrectionLevel || 'M'
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: config.logo ? (config.logoSize || 0.2) : 0,
          margin: 0
        },
        dotsOptions: {
          type: config.body || 'square',
          color: config.foreground || '#000000'
        },
        backgroundOptions: {
          color: config.background || '#FFFFFF',
        },
        cornersSquareOptions: {
          type: config.eye || 'square',
          color: config.cornerSquareColor || config.foreground || '#000000'
        },
        cornersDotOptions: {
          type: config.eyeBall || 'square',
          color: config.cornerDotColor || config.foreground || '#000000'
        }
      };
      
      // Add gradient if enabled
      if (config.gradient && config.gradientColors && config.gradientColors.length >= 2) {
        qrCodeOptions.dotsOptions.gradient = {
          type: config.gradientType || 'linear',
          rotation: config.gradientType === 'linear' ? 0 : 0,
          colorStops: [
            { offset: 0, color: config.gradientColors[0] || '#000000' },
            { offset: 1, color: config.gradientColors[1] || '#000000' }
          ]
        };
      }
      
      // Add logo if provided
      if (config.logo) {
        qrCodeOptions.image = config.logo;
      }
      
      // Add border options if border width is greater than 0
      if (config.borderWidth && config.borderWidth > 0) {
        qrCodeOptions.borderOptions = {
          width: config.borderWidth,
          style: config.borderStyle || 'solid',
          color: config.borderColor || '#000000',
          radius: config.borderRadius || 0,
          margin: config.borderMargin || 10
        };
        
        // Add border gradient if enabled
        if (config.borderGradient && config.borderGradientColors && config.borderGradientColors.length >= 2) {
          qrCodeOptions.borderOptions.gradient = {
            type: config.borderGradientType || 'linear',
            rotation: config.borderGradientType === 'linear' ? 0 : 0,
            colorStops: [
              { offset: 0, color: config.borderGradientColors[0] || '#000000' },
              { offset: 1, color: config.borderGradientColors[1] || '#000000' }
            ]
          };
        }
      }
      
      // Register the border plugin
      if (window.QRBorderPlugin) {
        const borderPlugin = new window.QRBorderPlugin();
        
        // Create QR code with the border plugin
        const qrCodeInstance = new window.QRCodeStyling(qrCodeOptions);
        qrCodeInstance.use(borderPlugin);
        
        // Append to container
        if (qrCodeRef.current) {
          qrCodeInstance.append(qrCodeRef.current);
        }
        
        // Get data URL for download
        qrCodeInstance.getRawData('png').then((blob: Blob) => {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        });
      } else {
        console.error('QRBorderPlugin not found. Make sure it is properly loaded.');
        
        // Fallback to regular QR code without border
        const qrCodeInstance = new window.QRCodeStyling(qrCodeOptions);
        
        // Append to container
        if (qrCodeRef.current) {
          qrCodeInstance.append(qrCodeRef.current);
        }
        
        // Get data URL for download
        qrCodeInstance.getRawData('png').then((blob: Blob) => {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        });
      }
    } catch (error) {
      console.error('Error generating QR code preview:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Update the QR code with the new config only
      // Preserve all other fields by only sending the config update
      await QRCodesService.updateQRCode(qrCode.id, {
        config: config,
        // Include the existing content and contentType to ensure they're preserved
        content: qrCode.content,
        contentType: qrCode.contentType
      });
      
      // Call the onSave callback
      onSave();
      
      // Close the modal
      onHide();
    } catch (error) {
      console.error('Error saving QR code:', error);
    }
  };

  const handleDownload = () => {
    // Create a link element
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `qrcode-${qrCode.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Customize QR Code</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={5} className="text-center mb-2">
            <Card className="p-2">
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '150px' }}>
                <div ref={qrCodeRef} className="qr-code-container"></div>
                {!previewUrl && (
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <Button 
                  variant="outline-primary" 
                  className="me-2" 
                  onClick={handleDownload}
                >
                  <FaDownload className="me-2" />
                  Download
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleSave}
                >
                  <FaSave className="me-2" />
                  Save Changes
                </Button>
              </div>
            </Card>
          </Col>
          <Col md={7}>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'basic')}
              className="mb-2"
            >
              <Tab eventKey="basic" title="Basic">
                <Form>
                  <Form.Group className="mb-2">
                    <Form.Label>Size (px)</Form.Label>
                    <Form.Control
                      type="number"
                      name="size"
                      value={config.size}
                      onChange={handleInputChange}
                      min={100}
                      max={1000}
                      step={10}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-2">
                    <Form.Label>Foreground Color</Form.Label>
                    <Form.Control
                      type="color"
                      name="foreground"
                      value={config.foreground}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Background Color</Form.Label>
                    <Form.Control
                      type="color"
                      name="background"
                      value={config.background}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Margin</Form.Label>
                    <Form.Control
                      type="number"
                      name="margin"
                      value={config.margin}
                      onChange={handleInputChange}
                      min={0}
                      max={5}
                      step={1}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Error Correction Level</Form.Label>
                    <Form.Select
                      name="errorCorrectionLevel"
                      value={config.errorCorrectionLevel}
                      onChange={handleInputChange}
                    >
                      <option value="L">Low (7%)</option>
                      <option value="M">Medium (15%)</option>
                      <option value="Q">Quartile (25%)</option>
                      <option value="H">High (30%)</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Higher levels make the QR code more resistant to damage but increase its size.
                    </Form.Text>
                  </Form.Group>
                </Form>
              </Tab>
              
              <Tab eventKey="style" title="Style">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Body Style</Form.Label>
                    <Form.Select
                      name="body"
                      value={config.body}
                      onChange={handleInputChange}
                    >
                      <option value="square">Square</option>
                      <option value="dots">Dots</option>
                      <option value="rounded">Rounded</option>
                      <option value="extra-rounded">Extra Rounded</option>
                      <option value="classy">Classy</option>
                      <option value="classy-rounded">Classy Rounded</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Eye Style</Form.Label>
                    <Form.Select
                      name="eye"
                      value={config.eye}
                      onChange={handleInputChange}
                    >
                      <option value="square">Square</option>
                      <option value="dot">Dot</option>
                      <option value="extra-rounded">Extra Rounded</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Eye Ball Style</Form.Label>
                    <Form.Select
                      name="eyeBall"
                      value={config.eyeBall}
                      onChange={handleInputChange}
                    >
                      <option value="square">Square</option>
                      <option value="dot">Dot</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Corner Square Color</Form.Label>
                    <Form.Control
                      type="color"
                      name="cornerSquareColor"
                      value={config.cornerSquareColor}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Corner Dot Color</Form.Label>
                    <Form.Control
                      type="color"
                      name="cornerDotColor"
                      value={config.cornerDotColor}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Form>
              </Tab>
              
              <Tab eventKey="gradient" title="Gradient">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Use Gradient"
                      name="gradient"
                      checked={config.gradient}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  
                  {config.gradient && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Gradient Type</Form.Label>
                        <Form.Select
                          name="gradientType"
                          value={config.gradientType}
                          onChange={handleInputChange}
                        >
                          <option value="linear">Linear</option>
                          <option value="radial">Radial</option>
                        </Form.Select>
                      </Form.Group>
                      
                      <Row className="mb-3">
                        <Col>
                          <Form.Group>
                            <Form.Label>Start Color</Form.Label>
                            <Form.Control
                              type="color"
                              value={config.gradientColors?.[0] || '#000000'}
                              onChange={(e) => handleGradientColorChange(0, e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group>
                            <Form.Label>End Color</Form.Label>
                            <Form.Control
                              type="color"
                              value={config.gradientColors?.[1] || '#000000'}
                              onChange={(e) => handleGradientColorChange(1, e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </>
                  )}
                </Form>
              </Tab>
              
              <Tab eventKey="logo" title="Logo">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Upload Logo</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                    <Form.Text className="text-muted">
                      Recommended: square image, transparent background, max 1MB
                    </Form.Text>
                  </Form.Group>
                  
                  {config.logo && (
                    <div className="text-center mb-3">
                      <img 
                        src={config.logo as string} 
                        alt="Logo Preview" 
                        style={{ maxWidth: '100px', maxHeight: '100px' }} 
                      />
                    </div>
                  )}
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Logo Size (relative to QR code)</Form.Label>
                    <Form.Control
                      type="range"
                      name="logoSize"
                      value={config.logoSize}
                      onChange={handleInputChange}
                      min={0.1}
                      max={0.4}
                      step={0.05}
                    />
                    <div className="d-flex justify-content-between">
                      <small>Small</small>
                      <small>Large</small>
                    </div>
                  </Form.Group>
                </Form>
              </Tab>
              
              <Tab eventKey="border" title="Border">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Border Width (px)</Form.Label>
                    <Form.Control
                      type="number"
                      name="borderWidth"
                      value={config.borderWidth}
                      onChange={handleInputChange}
                      min={0}
                      max={20}
                      step={1}
                    />
                    <Form.Text className="text-muted">
                      Set to 0 to disable the border
                    </Form.Text>
                  </Form.Group>
                  
                  {(config.borderWidth || 0) > 0 && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Border Style</Form.Label>
                        <Form.Select
                          name="borderStyle"
                          value={config.borderStyle}
                          onChange={handleInputChange}
                        >
                          <option value="solid">Solid</option>
                          <option value="dashed">Dashed</option>
                          <option value="dotted">Dotted</option>
                          <option value="double">Double</option>
                        </Form.Select>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Border Color</Form.Label>
                        <Form.Control
                          type="color"
                          name="borderColor"
                          value={config.borderColor}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Border Radius (px)</Form.Label>
                        <Form.Control
                          type="number"
                          name="borderRadius"
                          value={config.borderRadius}
                          onChange={handleInputChange}
                          min={0}
                          max={50}
                          step={1}
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Border Margin (px)</Form.Label>
                        <Form.Control
                          type="number"
                          name="borderMargin"
                          value={config.borderMargin}
                          onChange={handleInputChange}
                          min={0}
                          max={50}
                          step={1}
                        />
                        <Form.Text className="text-muted">
                          Space between the QR code and the border
                        </Form.Text>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          label="Use Border Gradient"
                          name="borderGradient"
                          checked={config.borderGradient}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                      
                      {config.borderGradient && (
                        <>
                          <Form.Group className="mb-3">
                            <Form.Label>Border Gradient Type</Form.Label>
                            <Form.Select
                              name="borderGradientType"
                              value={config.borderGradientType}
                              onChange={handleInputChange}
                            >
                              <option value="linear">Linear</option>
                              <option value="radial">Radial</option>
                            </Form.Select>
                          </Form.Group>
                          
                          <Row className="mb-3">
                            <Col>
                              <Form.Group>
                                <Form.Label>Start Color</Form.Label>
                                <Form.Control
                                  type="color"
                                  value={config.borderGradientColors?.[0] || '#000000'}
                                  onChange={(e) => handleBorderGradientColorChange(0, e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                            <Col>
                              <Form.Group>
                                <Form.Label>End Color</Form.Label>
                                <Form.Control
                                  type="color"
                                  value={config.borderGradientColors?.[1] || '#000000'}
                                  onChange={(e) => handleBorderGradientColorChange(1, e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </>
                      )}
                    </>
                  )}
                </Form>
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QRCodeCustomizerModal;
