import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Form } from 'react-bootstrap';

interface NotificationSettings {
  sound: boolean;
  desktop: boolean;
  email: boolean;
}

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
}

interface DisplaySettings {
  compactMode: boolean;
  showTips: boolean;
  sidebarCollapsed: boolean;
}

interface AppPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  notifications: NotificationSettings;
  accessibility: AccessibilitySettings;
  display: DisplaySettings;
}

const Preferences: React.FC = () => {
  const [preferences, setPreferences] = useState<AppPreferences>({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    notifications: {
      sound: true,
      desktop: true,
      email: true
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false
    },
    display: {
      compactMode: false,
      showTips: true,
      sidebarCollapsed: false
    }
  });

  // TODO: Replace with actual API call
  useEffect(() => {
    // Simulated API call to get preferences
  }, []);

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const theme = e.target.value as 'light' | 'dark' | 'system';
    setPreferences(prev => ({ ...prev, theme }));
    // TODO: Apply theme change
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const [section, field] = name.split('.');
      
      if (section === 'notifications') {
        setPreferences(prev => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            [field]: checkbox.checked
          }
        }));
      } else if (section === 'accessibility') {
        setPreferences(prev => ({
          ...prev,
          accessibility: {
            ...prev.accessibility,
            [field]: checkbox.checked
          }
        }));
      } else if (section === 'display') {
        setPreferences(prev => ({
          ...prev,
          display: {
            ...prev.display,
            [field]: checkbox.checked
          }
        }));
      }
    } else {
      setPreferences(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save preferences to API
    console.log('Saving preferences:', preferences);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Preferences</h1>
          <p className="text-muted mb-0">Customize your application experience</p>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Theme</div>
                  <h3 className="mb-0 text-capitalize">{preferences.theme}</h3>
                  <small className="text-muted">Current theme mode</small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-palette text-primary" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Active Features</div>
                  <h3 className="mb-0">
                    {Object.values(preferences.display).filter(Boolean).length}
                  </h3>
                  <small className="text-muted">Enabled display options</small>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-toggles text-success" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Accessibility</div>
                  <h3 className="mb-0">
                    {Object.values(preferences.accessibility).filter(Boolean).length}
                  </h3>
                  <small className="text-muted">Active a11y features</small>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-universal-access text-info" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Notifications</div>
                  <h3 className="mb-0">
                    {Object.values(preferences.notifications).filter(Boolean).length}
                  </h3>
                  <small className="text-muted">Active notifications</small>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-bell text-warning" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit}>
        {/* Appearance */}
        <Card className="mb-4">
          <Card.Header className="bg-white py-3">
            <h5 className="mb-0">Appearance</h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Theme</Form.Label>
                  <Form.Select 
                    name="theme" 
                    value={preferences.theme}
                    onChange={handleThemeChange}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Language</Form.Label>
                  <Form.Select 
                    name="language"
                    value={preferences.language}
                    onChange={handleInputChange}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Regional */}
        <Card className="mb-4">
          <Card.Header className="bg-white py-3">
            <h5 className="mb-0">Regional</h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Timezone</Form.Label>
                  <Form.Select 
                    name="timezone"
                    value={preferences.timezone}
                    onChange={handleInputChange}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date Format</Form.Label>
                  <Form.Select 
                    name="dateFormat"
                    value={preferences.dateFormat}
                    onChange={handleInputChange}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Time Format</Form.Label>
                  <Form.Select 
                    name="timeFormat"
                    value={preferences.timeFormat}
                    onChange={handleInputChange}
                  >
                    <option value="12h">12-hour</option>
                    <option value="24h">24-hour</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Currency</Form.Label>
                  <Form.Select 
                    name="currency"
                    value={preferences.currency}
                    onChange={handleInputChange}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Notifications */}
        <Card className="mb-4">
          <Card.Header className="bg-white py-3">
            <h5 className="mb-0">Notifications</h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <Form.Check
                  type="switch"
                  id="sound-notifications"
                  label="Sound"
                  name="notifications.sound"
                  checked={preferences.notifications.sound}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md={4}>
                <Form.Check
                  type="switch"
                  id="desktop-notifications"
                  label="Desktop"
                  name="notifications.desktop"
                  checked={preferences.notifications.desktop}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md={4}>
                <Form.Check
                  type="switch"
                  id="email-notifications"
                  label="Email"
                  name="notifications.email"
                  checked={preferences.notifications.email}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Accessibility */}
        <Card className="mb-4">
          <Card.Header className="bg-white py-3">
            <h5 className="mb-0">Accessibility</h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <Form.Check
                  type="switch"
                  id="high-contrast"
                  label="High Contrast"
                  name="accessibility.highContrast"
                  checked={preferences.accessibility.highContrast}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md={4}>
                <Form.Check
                  type="switch"
                  id="large-text"
                  label="Large Text"
                  name="accessibility.largeText"
                  checked={preferences.accessibility.largeText}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md={4}>
                <Form.Check
                  type="switch"
                  id="reduced-motion"
                  label="Reduced Motion"
                  name="accessibility.reducedMotion"
                  checked={preferences.accessibility.reducedMotion}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Display */}
        <Card className="mb-4">
          <Card.Header className="bg-white py-3">
            <h5 className="mb-0">Display</h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <Form.Check
                  type="switch"
                  id="compact-mode"
                  label="Compact Mode"
                  name="display.compactMode"
                  checked={preferences.display.compactMode}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md={4}>
                <Form.Check
                  type="switch"
                  id="show-tips"
                  label="Show Tips"
                  name="display.showTips"
                  checked={preferences.display.showTips}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md={4}>
                <Form.Check
                  type="switch"
                  id="sidebar-collapsed"
                  label="Collapse Sidebar"
                  name="display.sidebarCollapsed"
                  checked={preferences.display.sidebarCollapsed}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Actions */}
        <div className="d-flex justify-content-end">
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Preferences;
