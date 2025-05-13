import React, { useEffect, useRef, useState } from 'react';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import { FaSync } from 'react-icons/fa';
import InsightsService from '../../../../services/insights';

interface DashboardEmbedProps {
  dashboardId: string;
  title: string;
  height?: string;
}

const DashboardEmbed: React.FC<DashboardEmbedProps> = ({ 
  dashboardId, 
  title,
  height = '600px' 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check if this is a local demo dashboard
        if (dashboardId.startsWith('local-')) {
          setLoading(false);
          return; // Handle demo mode differently
        }
        
        console.log('Fetching guest token for dashboard:', dashboardId);
        const guestToken = await InsightsService.getSupersetGuestToken(dashboardId);
        console.log('Received guest token:', guestToken);
        setToken(guestToken);
        
        // We'll set loading to false once the iframe loads
      } catch (err: any) {
        console.error('Error loading dashboard:', err);
        setError('Unable to load dashboard at this time. Please try again later.');
        setLoading(false);
      }
    };
    
    loadDashboard();
  }, [dashboardId, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleIframeLoad = () => {
    console.log('Iframe loaded successfully');
    setLoading(false);
  };

  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('Iframe loading error:', e);
    setError('Failed to load the dashboard. Please try again later.');
    setLoading(false);
  };

  // Demo mode rendering
  if (dashboardId.startsWith('local-')) {
    return (
      <Card className="h-100">
        <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center p-5">
          <div className="mb-4">
            <i className="bi bi-bar-chart-fill fs-1 text-primary"></i>
          </div>
          <h4>Demo Dashboard</h4>
          <p className="text-muted mb-4">
            This is a demo dashboard. In a production environment, this would display an interactive dashboard from your business intelligence platform.
          </p>
          <div className="border rounded p-3 w-100 text-start mb-4" style={{ maxWidth: '600px' }}>
            <h5 className="border-bottom pb-2">Dashboard Information</h5>
            <p><strong>Title:</strong> {title}</p>
            <p><strong>ID:</strong> {dashboardId}</p>
            <p><strong>Status:</strong> <span className="badge bg-success">Active</span></p>
            <p className="mb-0"><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          </div>
          <Button variant="outline-primary" onClick={handleRetry}>
            <FaSync className="me-2" />
            Refresh Dashboard
          </Button>
        </Card.Body>
      </Card>
    );
  }

  if (loading && !token) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height }}>
        <div className="text-center">
          <Spinner animation="border" className="text-primary mb-3" />
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="h-100">
        <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center p-5">
          <div className="mb-4">
            <i className="bi bi-exclamation-triangle fs-1 text-warning"></i>
          </div>
          <h4>Dashboard Unavailable</h4>
          <p className="text-muted mb-4">
            {error}
          </p>
          <div className="border rounded p-3 w-100 text-start mb-4" style={{ maxWidth: '600px' }}>
            <h5 className="border-bottom pb-2">Dashboard Information</h5>
            <p><strong>Title:</strong> {title}</p>
            <p><strong>ID:</strong> {dashboardId}</p>
            <p><strong>Status:</strong> <span className="badge bg-warning">Connection Error</span></p>
            <p className="mb-0"><strong>Last Attempt:</strong> {new Date().toLocaleString()}</p>
          </div>
          <Button variant="primary" onClick={handleRetry}>
            <FaSync className="me-2" />
            Retry
          </Button>
        </Card.Body>
      </Card>
    );
  }

  // Construct the embed URL with the guest token
  const supersetHost = import.meta.env.VITE_SUPERSET_HOST || 'http://localhost:8088';
  const embedUrl = `${supersetHost}/superset/dashboard/${dashboardId}/?standalone=true&token=${token}`;
  
  console.log('Embedding dashboard with URL:', embedUrl);

  return (
    <div className="dashboard-embed position-relative" style={{ height }}>
      {loading && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-light bg-opacity-75 z-index-1">
          <div className="text-center">
            <Spinner animation="border" className="text-primary mb-3" />
            <p className="text-muted">Loading dashboard...</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        width="100%"
        height={height}
        frameBorder="0"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        style={{ 
          borderRadius: '4px',
          border: '1px solid #e9ecef',
          position: 'relative',
          zIndex: 0
        }}
        allow="fullscreen"
        sandbox="allow-same-origin allow-scripts allow-forms allow-downloads allow-modals"
      />
    </div>
  );
};

export default DashboardEmbed;
