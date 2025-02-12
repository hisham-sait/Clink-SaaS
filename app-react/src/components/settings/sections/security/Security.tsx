import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Form, Table } from 'react-bootstrap';
import ChangePasswordModal from './ChangePasswordModal';

interface LoginHistory {
  date: string;
  ip: string;
  device: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  sessionTimeout: number;
  loginHistory: LoginHistory[];
}

const Security: React.FC = () => {
  const [security, setSecurity] = useState<SecuritySettings | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // TODO: Replace with actual API call
  useEffect(() => {
    // Simulated security data
    setSecurity({
      twoFactorEnabled: false,
      lastPasswordChange: new Date().toISOString(),
      sessionTimeout: 30,
      loginHistory: [
        {
          date: new Date().toISOString(),
          ip: '192.168.1.1',
          device: 'Chrome on MacOS'
        },
        {
          date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          ip: '192.168.1.1',
          device: 'Safari on iPhone'
        }
      ]
    });
  }, []);

  const handleToggleTwoFactor = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    if (security) {
      // TODO: Replace with actual API call
      setSecurity({
        ...security,
        twoFactorEnabled: enabled
      });
    }
  };

  const handleChangePassword = (currentPassword: string, newPassword: string) => {
    // TODO: Replace with actual API call
    console.log('Password change requested:', { currentPassword, newPassword });
    setShowChangePasswordModal(false);
  };

  if (!security) return null;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Security Settings</h1>
          <p className="text-muted mb-0">Manage your password and security settings</p>
        </div>
        <Button 
          variant="primary"
          className="d-inline-flex align-items-center gap-2"
          onClick={() => setShowChangePasswordModal(true)}
        >
          <i className="bi bi-key"></i>
          <span>Change Password</span>
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">2FA Status</div>
                  <h3 className="mb-0">{security.twoFactorEnabled ? 'Enabled' : 'Disabled'}</h3>
                  <small className="text-muted">Two-factor authentication</small>
                </div>
                <div className={`bg-${security.twoFactorEnabled ? 'success' : 'warning'} bg-opacity-10 p-3 rounded`}>
                  <i className={`bi bi-shield-${security.twoFactorEnabled ? 'check' : 'exclamation'} text-${security.twoFactorEnabled ? 'success' : 'warning'}`} style={{ fontSize: '24px' }}></i>
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
                  <div className="text-muted mb-1">Password Age</div>
                  <h3 className="mb-0">
                    {Math.floor((Date.now() - new Date(security.lastPasswordChange).getTime()) / (1000 * 60 * 60 * 24))}d
                  </h3>
                  <small className="text-muted">Since last change</small>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-clock-history text-info" style={{ fontSize: '24px' }}></i>
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
                  <div className="text-muted mb-1">Session Timeout</div>
                  <h3 className="mb-0">{security.sessionTimeout}m</h3>
                  <small className="text-muted">Auto logout time</small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-stopwatch text-primary" style={{ fontSize: '24px' }}></i>
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
                  <div className="text-muted mb-1">Recent Logins</div>
                  <h3 className="mb-0">{security.loginHistory.length}</h3>
                  <small className="text-muted">Login attempts</small>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-box-arrow-in-right text-success" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Two-Factor Authentication */}
      <Card className="mb-4">
        <Card.Header className="bg-white py-3">
          <h5 className="mb-0">Two-Factor Authentication</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="mb-0">{security.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
              <small className="text-muted">
                Last updated: {new Date(security.lastPasswordChange).toLocaleString()}
              </small>
            </div>
            <Form.Check
              type="switch"
              id="two-factor-toggle"
              checked={security.twoFactorEnabled}
              onChange={handleToggleTwoFactor}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Session Settings */}
      <Card className="mb-4">
        <Card.Header className="bg-white py-3">
          <h5 className="mb-0">Session Settings</h5>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <div className="text-uppercase small fw-semibold text-secondary mb-2">Session Timeout</div>
            <p className="mb-0">{security.sessionTimeout} minutes</p>
          </div>
        </Card.Body>
      </Card>

      {/* Login History */}
      <Card>
        <Card.Header className="bg-white py-3">
          <h5 className="mb-0">Login History</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="text-uppercase small fw-semibold text-secondary">Date</th>
                  <th className="text-uppercase small fw-semibold text-secondary">IP Address</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Device</th>
                </tr>
              </thead>
              <tbody>
                {security.loginHistory.map((login, index) => (
                  <tr key={index}>
                    <td>{new Date(login.date).toLocaleString()}</td>
                    <td>{login.ip}</td>
                    <td>{login.device}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          onSave={handleChangePassword}
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}
    </div>
  );
};

export default Security;
