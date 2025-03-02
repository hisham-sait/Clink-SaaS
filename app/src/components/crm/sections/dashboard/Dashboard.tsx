import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FaUsers, FaBuilding, FaChartLine, FaCalendarCheck } from 'react-icons/fa';

const Dashboard: React.FC = () => {
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">CRM Dashboard</h1>
          <p className="text-muted mb-0">Overview of your customer relationships</p>
        </div>
      </div>

      {/* Summary Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Total Contacts</div>
                  <h3 className="mb-0">0</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FaUsers className="text-primary" size={24} />
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
                  <div className="text-muted mb-1">Total Companies</div>
                  <h3 className="mb-0">0</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FaBuilding className="text-success" size={24} />
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
                  <div className="text-muted mb-1">Active Deals</div>
                  <h3 className="mb-0">0</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <FaChartLine className="text-info" size={24} />
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
                  <div className="text-muted mb-1">Tasks Due</div>
                  <h3 className="mb-0">0</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <FaCalendarCheck className="text-warning" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content Area */}
      <Row className="g-4">
        <Col md={8}>
          <Card className="h-100">
            <Card.Body>
              <h5 className="mb-4">Recent Activity</h5>
              <div className="text-center text-muted py-5">
                <FaChartLine size={48} className="mb-3 text-muted opacity-50" />
                <p>Activity data will be shown here</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <h5 className="mb-4">Upcoming Tasks</h5>
              <div className="text-center text-muted py-5">
                <FaCalendarCheck size={48} className="mb-3 text-muted opacity-50" />
                <p>Task data will be shown here</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
