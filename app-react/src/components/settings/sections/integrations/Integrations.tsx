import React from 'react';
import { Button, Card, Row, Col, Badge, Table, ListGroup, ButtonGroup, Dropdown } from 'react-bootstrap';

interface APIKey {
  name: string;
  created: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

interface Webhook {
  endpoint: string;
  events: string;
  lastDelivery: string;
  status: 'active' | 'inactive';
}

const Integrations: React.FC = () => {
  const apiKeys: APIKey[] = [
    {
      name: 'Production API Key',
      created: 'Jan 1, 2024',
      lastUsed: 'Today',
      status: 'active'
    },
    {
      name: 'Development API Key',
      created: 'Dec 15, 2023',
      lastUsed: 'Yesterday',
      status: 'active'
    },
    {
      name: 'Testing API Key',
      created: 'Nov 30, 2023',
      lastUsed: '30 days ago',
      status: 'revoked'
    }
  ];

  const webhooks: Webhook[] = [
    {
      endpoint: 'https://api.example.com/webhooks/orders',
      events: 'order.created, order.updated',
      lastDelivery: '5 minutes ago',
      status: 'active'
    },
    {
      endpoint: 'https://api.example.com/webhooks/users',
      events: 'user.created, user.updated',
      lastDelivery: '1 hour ago',
      status: 'active'
    }
  ];

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Integrations</h1>
          <p className="text-muted mb-0">Connect and manage external services and APIs</p>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Connected Services</div>
                  <h3 className="mb-0">2</h3>
                  <small className="text-muted">Active connections</small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-plug text-primary" style={{ fontSize: '24px' }}></i>
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
                  <div className="text-muted mb-1">Active API Keys</div>
                  <h3 className="mb-0">{apiKeys.filter(k => k.status === 'active').length}</h3>
                  <small className="text-muted">Valid API keys</small>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-key text-success" style={{ fontSize: '24px' }}></i>
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
                  <div className="text-muted mb-1">Active Webhooks</div>
                  <h3 className="mb-0">{webhooks.filter(w => w.status === 'active').length}</h3>
                  <small className="text-muted">Configured endpoints</small>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-broadcast text-info" style={{ fontSize: '24px' }}></i>
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
                  <div className="text-muted mb-1">Available Services</div>
                  <h3 className="mb-0">3</h3>
                  <small className="text-muted">Integration options</small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-grid text-primary" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Connected Services */}
      <Card className="mb-4">
        <Card.Header className="bg-white py-3">
          <h5 className="mb-0">Connected Services</h5>
        </Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
            {/* Google Calendar */}
            <ListGroup.Item className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="bg-light p-2 rounded me-3">
                    <i className="bi bi-google text-primary" style={{ fontSize: '24px' }}></i>
                  </div>
                  <div>
                    <h6 className="mb-1">Google Calendar</h6>
                    <p className="text-muted small mb-0">Connected as john.smith@company.com</p>
                  </div>
                </div>
                <Button variant="outline-danger" size="sm">
                  Disconnect
                </Button>
              </div>
            </ListGroup.Item>

            {/* Slack */}
            <ListGroup.Item className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="bg-light p-2 rounded me-3">
                    <i className="bi bi-slack text-primary" style={{ fontSize: '24px' }}></i>
                  </div>
                  <div>
                    <h6 className="mb-1">Slack</h6>
                    <p className="text-muted small mb-0">Connected to workspace: Acme Corp</p>
                  </div>
                </div>
                <Button variant="outline-danger" size="sm">
                  Disconnect
                </Button>
              </div>
            </ListGroup.Item>

            {/* GitHub */}
            <ListGroup.Item className="py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="bg-light p-2 rounded me-3">
                    <i className="bi bi-github text-dark" style={{ fontSize: '24px' }}></i>
                  </div>
                  <div>
                    <h6 className="mb-1">GitHub</h6>
                    <p className="text-muted small mb-0">Not connected</p>
                  </div>
                </div>
                <Button variant="outline-primary" size="sm">
                  Connect
                </Button>
              </div>
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>

      {/* API Keys */}
      <Card className="mb-4">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0">API Keys</h5>
          <Button variant="primary" className="d-inline-flex align-items-center gap-2">
            <i className="bi bi-plus-lg"></i>
            <span>Generate New Key</span>
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="text-uppercase small fw-semibold text-secondary">Key Name</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Created</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Last Used</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Status</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key, index) => (
                  <tr key={index}>
                    <td>{key.name}</td>
                    <td>{key.created}</td>
                    <td>{key.lastUsed}</td>
                    <td>
                      <Badge bg={key.status === 'active' ? 'success' : 'danger'}>
                        {key.status === 'active' ? 'Active' : 'Revoked'}
                      </Badge>
                    </td>
                    <td>
                      <ButtonGroup>
                        <Button variant="link" className="btn-sm text-body px-2" title="View">
                          <i className="bi bi-eye"></i>
                        </Button>
                        {key.status === 'active' && (
                          <Button variant="link" className="btn-sm text-danger px-2" title="Revoke">
                            <i className="bi bi-trash"></i>
                          </Button>
                        )}
                        <Dropdown as={ButtonGroup}>
                          <Dropdown.Toggle split variant="link" className="btn-sm text-body px-2">
                            <i className="bi bi-three-dots-vertical"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            <Dropdown.Item>
                              <i className="bi bi-eye me-2"></i>
                              View Details
                            </Dropdown.Item>
                            {key.status === 'active' && (
                              <Dropdown.Item className="text-danger">
                                <i className="bi bi-trash me-2"></i>
                                Revoke Key
                              </Dropdown.Item>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Webhooks */}
      <Card>
        <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0">Webhooks</h5>
          <Button variant="primary" className="d-inline-flex align-items-center gap-2">
            <i className="bi bi-plus-lg"></i>
            <span>Add Webhook</span>
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="text-uppercase small fw-semibold text-secondary">Endpoint</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Events</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Last Delivery</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Status</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {webhooks.map((webhook, index) => (
                  <tr key={index}>
                    <td>{webhook.endpoint}</td>
                    <td>{webhook.events}</td>
                    <td>{webhook.lastDelivery}</td>
                    <td>
                      <Badge bg={webhook.status === 'active' ? 'success' : 'danger'}>
                        {webhook.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <ButtonGroup>
                        <Button variant="link" className="btn-sm text-body px-2" title="Configure">
                          <i className="bi bi-gear"></i>
                        </Button>
                        <Button variant="link" className="btn-sm text-danger px-2" title="Delete">
                          <i className="bi bi-trash"></i>
                        </Button>
                        <Dropdown as={ButtonGroup}>
                          <Dropdown.Toggle split variant="link" className="btn-sm text-body px-2">
                            <i className="bi bi-three-dots-vertical"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            <Dropdown.Item>
                              <i className="bi bi-gear me-2"></i>
                              Configure Webhook
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <i className="bi bi-arrow-clockwise me-2"></i>
                              Test Webhook
                            </Dropdown.Item>
                            <Dropdown.Item className="text-danger">
                              <i className="bi bi-trash me-2"></i>
                              Delete Webhook
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Integrations;
