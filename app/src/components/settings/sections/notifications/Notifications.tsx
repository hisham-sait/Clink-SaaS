import React, { useState, useEffect } from 'react';
import { NotificationSettings } from './types';
import { Button, Card, Row, Col, Form, ListGroup } from 'react-bootstrap';

const Notifications: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      accountUpdates: true,
      securityAlerts: true,
      marketingUpdates: false
    },
    push: {
      taskUpdates: true,
      comments: true,
      reminders: true
    },
    schedule: {
      quietHoursStart: 20,
      quietHoursEnd: 7,
      weekendsOnly: false
    }
  });

  const handleEmailChange = (setting: keyof typeof settings.email) => {
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [setting]: !prev.email[setting]
      }
    }));
  };

  const handlePushChange = (setting: keyof typeof settings.push) => {
    setSettings(prev => ({
      ...prev,
      push: {
        ...prev.push,
        [setting]: !prev.push[setting]
      }
    }));
  };

  const handleScheduleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : Number(value)
      }
    }));
  };

  const handleSave = () => {
    // TODO: Save settings to API
    console.log('Save settings:', settings);
  };

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Notification Settings</h1>
          <p className="text-muted mb-0">Configure how and when you receive notifications</p>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Email Notifications</div>
                  <h3 className="mb-0">
                    {Object.values(settings.email).filter(Boolean).length}
                  </h3>
                  <small className="text-muted">Active email alerts</small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-envelope text-primary" style={{ fontSize: '24px' }}></i>
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
                  <div className="text-muted mb-1">Push Notifications</div>
                  <h3 className="mb-0">
                    {Object.values(settings.push).filter(Boolean).length}
                  </h3>
                  <small className="text-muted">Active push alerts</small>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-bell text-success" style={{ fontSize: '24px' }}></i>
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
                  <div className="text-muted mb-1">Quiet Hours</div>
                  <h3 className="mb-0">{settings.schedule.quietHoursEnd < settings.schedule.quietHoursStart ? 
                    24 - settings.schedule.quietHoursStart + settings.schedule.quietHoursEnd :
                    settings.schedule.quietHoursEnd - settings.schedule.quietHoursStart}h</h3>
                  <small className="text-muted">Do not disturb period</small>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-moon text-warning" style={{ fontSize: '24px' }}></i>
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
                  <div className="text-muted mb-1">Total Alerts</div>
                  <h3 className="mb-0">
                    {Object.values(settings.email).filter(Boolean).length + 
                     Object.values(settings.push).filter(Boolean).length}
                  </h3>
                  <small className="text-muted">Active notifications</small>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-app-indicator text-info" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Email Notifications */}
      <Card className="mb-4">
        <Card.Header className="bg-white py-3">
          <h5 className="mb-0">Email Notifications</h5>
        </Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
            {/* Account */}
            <ListGroup.Item className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Account Updates</h6>
                  <p className="text-muted small mb-0">Important updates about your account</p>
                </div>
                <Form.Check
                  type="switch"
                  id="accountUpdates"
                  checked={settings.email.accountUpdates}
                  onChange={() => handleEmailChange('accountUpdates')}
                />
              </div>
            </ListGroup.Item>

            {/* Security */}
            <ListGroup.Item className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Security Alerts</h6>
                  <p className="text-muted small mb-0">Security-related notifications and alerts</p>
                </div>
                <Form.Check
                  type="switch"
                  id="securityAlerts"
                  checked={settings.email.securityAlerts}
                  onChange={() => handleEmailChange('securityAlerts')}
                />
              </div>
            </ListGroup.Item>

            {/* Marketing */}
            <ListGroup.Item className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Marketing Updates</h6>
                  <p className="text-muted small mb-0">News about products and features</p>
                </div>
                <Form.Check
                  type="switch"
                  id="marketingUpdates"
                  checked={settings.email.marketingUpdates}
                  onChange={() => handleEmailChange('marketingUpdates')}
                />
              </div>
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>

      {/* Push Notifications */}
      <Card className="mb-4">
        <Card.Header className="bg-white py-3">
          <h5 className="mb-0">Push Notifications</h5>
        </Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
            {/* Task Updates */}
            <ListGroup.Item className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Task Updates</h6>
                  <p className="text-muted small mb-0">Notifications about task assignments and updates</p>
                </div>
                <Form.Check
                  type="switch"
                  id="taskUpdates"
                  checked={settings.push.taskUpdates}
                  onChange={() => handlePushChange('taskUpdates')}
                />
              </div>
            </ListGroup.Item>

            {/* Comments */}
            <ListGroup.Item className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Comments</h6>
                  <p className="text-muted small mb-0">When someone comments on your items</p>
                </div>
                <Form.Check
                  type="switch"
                  id="comments"
                  checked={settings.push.comments}
                  onChange={() => handlePushChange('comments')}
                />
              </div>
            </ListGroup.Item>

            {/* Reminders */}
            <ListGroup.Item className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Reminders</h6>
                  <p className="text-muted small mb-0">Task and deadline reminders</p>
                </div>
                <Form.Check
                  type="switch"
                  id="reminders"
                  checked={settings.push.reminders}
                  onChange={() => handlePushChange('reminders')}
                />
              </div>
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>

      {/* Notification Schedule */}
      <Card className="mb-4">
        <Card.Header className="bg-white py-3">
          <h5 className="mb-0">Notification Schedule</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Quiet Hours Start</Form.Label>
                <Form.Select
                  name="quietHoursStart"
                  value={settings.schedule.quietHoursStart}
                  onChange={handleScheduleChange}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {formatTime(i)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Quiet Hours End</Form.Label>
                <Form.Select
                  name="quietHoursEnd"
                  value={settings.schedule.quietHoursEnd}
                  onChange={handleScheduleChange}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {formatTime(i)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Form.Check
            type="checkbox"
            id="weekendsOnly"
            label="Apply quiet hours on weekends only"
            name="weekendsOnly"
            checked={settings.schedule.weekendsOnly}
            onChange={handleScheduleChange}
            className="mt-3"
          />
        </Card.Body>
      </Card>

      {/* Save Changes */}
      <div className="d-flex justify-content-end">
        <Button variant="primary" onClick={handleSave}>
          Save Notification Settings
        </Button>
      </div>
    </div>
  );
};

export default Notifications;
