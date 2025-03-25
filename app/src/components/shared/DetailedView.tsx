import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, ButtonGroup, Nav } from 'react-bootstrap';
import { FaArrowLeft, FaEdit, FaClock, FaFile } from 'react-icons/fa';
import { Activity } from '../../services/statutory/types';
import { formatDDMMYYYY } from '../../utils';

// All styles moved from DetailedView.css into this component
const styles: Record<string, React.CSSProperties> = {
  // Action button styles
  actionButton: {
    transition: 'transform 0.1s ease-in-out',
  },
  actionButtonHover: {
    transform: 'scale(1.1)',
  },
  
  // Info card styles
  infoCard: {
    transition: 'transform 0.2s',
    borderRadius: '0.5rem',
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
  },
  infoCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.1)',
  },
  
  // Tab navigation styles
  tabLink: {
    color: '#495057',
    borderRadius: '0.25rem 0.25rem 0 0',
    transition: 'background-color 0.2s',
  },
  tabLinkHover: {
    backgroundColor: 'rgba(0, 123, 255, 0.05)',
    borderColor: '#dee2e6 #dee2e6 #fff',
  },
  tabLinkActive: {
    fontWeight: 500,
  },
  
  // Timeline styles
  timeline: {
    position: 'relative' as const,
    padding: 0,
    margin: 0,
    listStyle: 'none',
  },
  timelineItem: {
    position: 'relative' as const,
    borderLeft: '2px solid #e9ecef',
    marginLeft: '1rem',
    paddingLeft: '1.5rem',
    paddingBottom: '1.5rem',
  },
  timelineItemLast: {
    borderLeft: 'none',
    paddingBottom: 0,
  },
  
  // Badge styles
  badge: {
    fontWeight: 500,
    padding: '0.4em 0.6em',
  },
  
  // Info list styles
  infoList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  infoListItem: {
    padding: '0.75rem 1.25rem',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
  },
  infoListItemLast: {
    borderBottom: 'none',
  },
  infoLabel: {
    color: '#6c757d',
    fontWeight: 500,
  },
  infoValue: {
    fontWeight: 500,
    textAlign: 'right' as const,
  },
  
  // Document item styles
  documentItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem',
    border: '1px solid #e9ecef',
    borderRadius: '0.5rem',
    marginBottom: '0.75rem',
    transition: 'background-color 0.2s',
  },
  documentItemHover: {
    backgroundColor: 'rgba(0, 123, 255, 0.03)',
  },
  documentIcon: {
    marginRight: '1rem',
    color: '#6c757d',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontWeight: 500,
    marginBottom: '0.25rem',
  },
  documentMeta: {
    color: '#6c757d',
    fontSize: '0.875rem',
  },
  documentActions: {
    display: 'flex',
    gap: '0.5rem',
  },
};

interface DetailedViewProps {
  // Basic info
  title: string;
  subtitle?: string;
  entityType: string;
  
  // Navigation
  onBack: () => void;
  onEdit?: () => void;
  
  // Content rendering functions
  renderInfo: () => React.ReactNode;  // Left column with entity details
  renderTabs?: () => React.ReactNode; // Custom tabs content
  
  // Optional props
  loading?: boolean;
  activities?: Activity[];
  activitiesLoading?: boolean;
  children?: React.ReactNode;
}

// Helper components for entity views to use
export const InfoList: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <ul style={styles.infoList}>{children}</ul>
);

export const InfoListItem: React.FC<{label: React.ReactNode; value: React.ReactNode; isLast?: boolean}> = 
  ({ label, value, isLast }) => (
    <li style={{...styles.infoListItem, ...(isLast ? styles.infoListItemLast : {})}}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </li>
  );

export const SectionHeader: React.FC<{title: string}> = ({ title }) => (
  <h6 className="border-bottom pb-2 mb-3">{title}</h6>
);

export const StatusBadge: React.FC<{status: string; type?: string}> = ({ status, type }) => {
  const getBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      default: return 'secondary';
    }
  };
  
  return (
    <>
      <Badge bg={getBadgeColor(status)} style={styles.badge} className="me-1">
        {status}
      </Badge>
      {type && (
        <Badge bg="info" style={styles.badge} className="me-1">
          {type}
        </Badge>
      )}
    </>
  );
};

const DetailedView: React.FC<DetailedViewProps> = ({
  title,
  subtitle,
  entityType,
  onBack,
  onEdit,
  renderInfo,
  renderTabs,
  loading = false,
  activities = [],
  activitiesLoading = false,
  children
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-fluid py-4">
      {/* Header - Styled to match MainView */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button 
            variant="link" 
            className="p-0 me-3" 
            style={styles.actionButton}
            onClick={onBack}
          >
            <FaArrowLeft className="text-primary" size={18} />
          </Button>
          <div>
            <h1 className="h3 mb-0">{title}</h1>
            {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
          </div>
        </div>
        {onEdit && (
          <Button variant="primary" onClick={onEdit}>
            <FaEdit className="me-2" /> Edit
          </Button>
        )}
      </div>

      <Row>
        {/* Left Column - Entity Info (30%) */}
        <Col lg={4}>
          <Card style={styles.infoCard} className="mb-4">
            <Card.Body>
              {renderInfo()}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Tabs (70%) */}
        <Col lg={8}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')}
                style={{
                  ...styles.tabLink,
                  ...(activeTab === 'overview' ? styles.tabLinkActive : {})
                }}
              >
                Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'timeline'} 
                onClick={() => setActiveTab('timeline')}
                style={{
                  ...styles.tabLink,
                  ...(activeTab === 'timeline' ? styles.tabLinkActive : {})
                }}
              >
                Timeline
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'documents'} 
                onClick={() => setActiveTab('documents')}
                style={{
                  ...styles.tabLink,
                  ...(activeTab === 'documents' ? styles.tabLinkActive : {})
                }}
              >
                Documents
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Card style={styles.infoCard}>
            <Card.Body>
              {activeTab === 'overview' && (
                renderTabs ? renderTabs() : (
                  <div>
                    <h5 className="mb-3">
                      <FaClock className="me-2" />
                      Recent Activities
                    </h5>
                    {activitiesLoading ? (
                      <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm text-primary"></div>
                        <p className="text-muted small mt-2 mb-0">Loading activities...</p>
                      </div>
                    ) : activities.length > 0 ? (
                      <div style={styles.timeline}>
                        {activities.slice(0, 3).map((activity, index) => (
                          <div 
                            key={index} 
                            style={{
                              ...styles.timelineItem,
                              ...(index === activities.slice(0, 3).length - 1 ? styles.timelineItemLast : {})
                            }}
                          >
                            <div className="d-flex">
                              <div className="me-3">
                                <Badge bg="light" className="p-2">
                                  {getActivityIcon(activity.type)}
                                </Badge>
                              </div>
                              <div>
                                <p className="mb-0">{activity.description}</p>
                                <small className="text-muted">
                                  {formatDDMMYYYY(new Date(activity.time))}
                                </small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">No recent activities</p>
                    )}
                  </div>
                )
              )}

              {activeTab === 'timeline' && (
                <div>
                  <h5 className="mb-3">
                    <FaClock className="me-2" />
                    Activity Timeline
                  </h5>
                  {activitiesLoading ? (
                    <div className="text-center py-3">
                      <div className="spinner-border spinner-border-sm text-primary"></div>
                      <p className="text-muted small mt-2 mb-0">Loading activities...</p>
                    </div>
                  ) : activities.length > 0 ? (
                    <div style={styles.timeline}>
                      {activities.map((activity, index) => (
                        <div 
                          key={index} 
                          style={{
                            ...styles.timelineItem,
                            ...(index === activities.length - 1 ? styles.timelineItemLast : {})
                          }}
                        >
                          <div className="d-flex">
                            <div className="me-3">
                              <Badge bg="light" className="p-2">
                                {getActivityIcon(activity.type)}
                              </Badge>
                            </div>
                            <div>
                              <p className="mb-0">{activity.description}</p>
                              <small className="text-muted">
                                {formatDDMMYYYY(new Date(activity.time))}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted mb-0">No activities found</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div>
                  <h5 className="mb-3">
                    <FaFile className="me-2" />
                    Documents
                  </h5>
                  <div className="text-center py-4 border rounded">
                    <FaFile className="mb-3" size={32} />
                    <p className="mb-2">No documents found</p>
                    <Button variant="outline-primary" size="sm">
                      Upload Document
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {children}
    </div>
  );
};

// Helper function to get the appropriate icon for an activity type
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'appointment':
    case 'added':
      return <i className="bi bi-plus-circle text-success"></i>;
    case 'updated':
      return <i className="bi bi-pencil text-primary"></i>;
    case 'resignation':
    case 'status_changed':
      return <i className="bi bi-arrow-right text-warning"></i>;
    case 'deletion':
    case 'removed':
      return <i className="bi bi-trash text-danger"></i>;
    default:
      return <i className="bi bi-info-circle text-primary"></i>;
  }
};

export default DetailedView;
