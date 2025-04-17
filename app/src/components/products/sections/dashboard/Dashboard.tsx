import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FaBox, FaTag, FaLayerGroup, FaFileImport } from 'react-icons/fa';

const Dashboard: React.FC = () => {
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Products Dashboard</h1>
          <p className="text-muted mb-0">Overview of your product catalog and management</p>
        </div>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Total Products</div>
                  <h3 className="mb-0">0</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FaBox className="text-primary" size={24} />
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
                  <div className="text-muted mb-1">Categories</div>
                  <h3 className="mb-0">0</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FaLayerGroup className="text-success" size={24} />
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
                  <div className="text-muted mb-1">Attributes</div>
                  <h3 className="mb-0">0</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <FaTag className="text-info" size={24} />
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
                  <div className="text-muted mb-1">Families</div>
                  <h3 className="mb-0">0</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <FaFileImport className="text-warning" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Recent Activity</h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted">No recent activity to display.</p>
        </Card.Body>
      </Card>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Quick Actions</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3} className="mb-3 mb-md-0">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <FaBox className="text-primary mb-3" size={32} />
                  <h5>Add Product</h5>
                  <p className="small text-muted">Create a new product in your catalog</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <FaLayerGroup className="text-success mb-3" size={32} />
                  <h5>Manage Categories</h5>
                  <p className="small text-muted">Organize your product categories</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <FaTag className="text-info mb-3" size={32} />
                  <h5>Define Attributes</h5>
                  <p className="small text-muted">Create and manage product attributes</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <FaFileImport className="text-warning mb-3" size={32} />
                  <h5>Import Products</h5>
                  <p className="small text-muted">Bulk import products from CSV</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;
