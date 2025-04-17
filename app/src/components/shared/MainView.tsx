import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Row, Col, Card, Dropdown } from 'react-bootstrap';
import { FaClock, FaFileExport, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Activity } from '../../services/types';
import { formatDDMMYYYY } from '../../utils';

// All styles moved from MainView.css into this component
const styles: Record<string, React.CSSProperties> = {
  // Name cell styles
  nameCell: {
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  nameCellHover: {
    backgroundColor: 'rgba(0, 123, 255, 0.05)',
    textDecoration: 'underline',
  },
  
  // Action button styles
  actionButton: {
    transition: 'transform 0.1s ease-in-out',
  },
  actionButtonHover: {
    transform: 'scale(1.1)',
  },
  
  // Table hover styles
  tableHover: {
    backgroundColor: 'rgba(0, 123, 255, 0.03)',
  },
  
  // Status badge styles
  badge: {
    fontWeight: 500,
    padding: '0.4em 0.6em',
  },
  
  // Summary card styles
  summaryCard: {
    transition: 'transform 0.2s',
    borderRadius: '0.5rem',
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
  },
  summaryCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.1)',
  },
  
  // Filter button styles
  filterButton: {
    borderRadius: '0.25rem',
    marginRight: '0.25rem',
  },
  filterButtonLast: {
    marginRight: 0,
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
  },
};

interface SummaryCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface MainViewProps {
  title: string;
  description: string;
  entityType: string;
  summaryCards: SummaryCard[];
  renderTable: () => React.ReactNode;
  renderActions: () => React.ReactNode;
  renderFilters?: () => React.ReactNode;
  handleExport?: (type: 'pdf' | 'excel') => Promise<void>;
  children?: React.ReactNode;
}

// Helper components for entity views to use
export const ActionButton: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
  variant?: string;
}> = ({ icon, onClick, tooltip, variant = 'link' }) => (
  <Button
    variant={variant}
    className="p-0 mx-1"
    style={styles.actionButton}
    onClick={onClick}
    title={tooltip}
  >
    {icon}
  </Button>
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

const MainView: React.FC<MainViewProps> = ({
  title,
  description,
  entityType,
  summaryCards,
  renderTable,
  renderActions,
  renderFilters,
  handleExport,
  children
}) => {
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.companyId) {
      fetchRecentActivities();
    }
  }, [entityType, user?.companyId]);

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      
      // Use CRM activities endpoint
      const activities = await api.get(`/crm/activities/${user?.companyId}?entityType=${entityType}&limit=5`);
      if (activities.data) {
        setRecentActivities(activities.data);
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const defaultHandleExport = async (type: 'pdf' | 'excel') => {
    try {
      let endpoint = `/crm/${entityType}s/${user?.companyId}/export/${type}`;
      
      const response = await api.get(endpoint, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${entityType}s.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error(`Error exporting ${entityType}s:`, error);
      alert(`Failed to export ${entityType}s. Please try again.`);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">{title}</h1>
          <p className="text-muted mb-0">{description}</p>
        </div>
        <div className="d-flex">
          {handleExport && (
            <Dropdown className="me-2">
              <Dropdown.Toggle variant="outline-primary" id="export-dropdown">
                <FaFileExport className="me-2" /> Export
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => (handleExport ? handleExport('pdf') : defaultHandleExport('pdf'))}>
                  <FaFilePdf className="me-2" /> Export as PDF
                </Dropdown.Item>
                <Dropdown.Item onClick={() => (handleExport ? handleExport('excel') : defaultHandleExport('excel'))}>
                  <FaFileExcel className="me-2" /> Export as Excel
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
          {renderActions()}
        </div>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        {summaryCards.map((card, index) => (
          <Col md={4} key={index}>
            <Card style={styles.summaryCard} className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted mb-1">{card.title}</div>
                    <h3 className="mb-0">{card.value}</h3>
                  </div>
                  <div className={`bg-${card.color} bg-opacity-10 p-3 rounded`}>
                    {card.icon}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <div className="card mb-4">
        <div className="card-body">
          {renderFilters && (
            <div className="d-flex justify-content-end mb-3">
              {renderFilters()}
            </div>
          )}
          {renderTable()}
        </div>
      </div>

      {/* Recent Activities */}
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <FaClock className="me-2" />
              Recent Activities
            </h5>
          </div>
          {activitiesLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary"></div>
              <p className="text-muted small mt-2 mb-0">Loading activities...</p>
            </div>
          ) : recentActivities.length > 0 ? (
            <div style={styles.timeline}>
              {recentActivities.map((activity, index) => (
                <div key={index} style={styles.timelineItem} className="pb-3">
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
            <p className="text-muted mb-0">No recent activities</p>
          )}
        </Card.Body>
      </Card>

      {/* Additional content */}
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

export default MainView;
