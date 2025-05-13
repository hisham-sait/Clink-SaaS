import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaExternalLinkAlt, FaSync } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DashboardEmbed from './SupersetEmbed';
import InsightsService, { InsightReport } from '../../../../services/insights';

const ReportViewer: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<InsightReport | null>(null);
  
  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!reportId) {
        throw new Error('Invalid report ID');
      }
      
      // Check if it's a local report (demo mode)
      if (reportId.startsWith('local-')) {
        // Create a mock report for demo purposes
        const localReport: InsightReport = {
          id: reportId,
          title: 'Demo Report',
          description: 'This is a demo report created locally',
          dashboardId: '21356ebc-9ec7-42ea-a7f2-694a3948ec94', // Example dashboard ID
          status: 'Active',
          companyId: 'local',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setReport(localReport);
        setLoading(false);
        return;
      }
      
      const data = await InsightsService.getReportById(reportId);
      setReport(data);
      
      // Record a view for this report
      try {
        await InsightsService.recordReportView(reportId, {
          visitorId: 'web-app-user',
          device: navigator.userAgent,
          browser: navigator.userAgent,
          timeOnPage: 0
        });
      } catch (viewErr) {
        console.error('Error recording view:', viewErr);
        // Don't show an error to the user for this
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching report:', err);
      setError('Unable to load the report at this time. Please try again later.');
      toast.error('Failed to load report');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const handleBack = () => {
    navigate('/insights/reports');
  };

  const handleOpenInNewTab = () => {
    if (report) {
      // Open the dashboard in a new tab with a generic URL
      window.open(`/insights/reports/external/${report.dashboardId}`, '_blank');
    }
  };

  const handleRetry = () => {
    fetchReport();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="text-center">
          <Spinner animation="border" className="text-primary mb-3" />
          <p className="text-muted">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="container-fluid py-4">
        <Alert variant="warning">
          <Alert.Heading>Report Unavailable</Alert.Heading>
          <p>{error || 'The requested report could not be found.'}</p>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" onClick={handleRetry}>
              <FaSync className="me-2" />
              Try Again
            </Button>
            <Button variant="outline-secondary" onClick={handleBack}>
              <FaArrowLeft className="me-2" />
              Back to Reports
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button variant="outline-secondary" onClick={handleBack} className="me-2">
            <FaArrowLeft className="me-2" />
            Back to Reports
          </Button>
          <Button variant="outline-primary" onClick={handleOpenInNewTab}>
            <FaExternalLinkAlt className="me-2" />
            Open in New Tab
          </Button>
        </div>
      </div>
      
      <Card className="mb-4">
        <Card.Body>
          <h2>{report.title}</h2>
          {report.description && <p className="text-muted">{report.description}</p>}
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Body>
          <DashboardEmbed 
            dashboardId={report.dashboardId}
            title={report.title}
            height="600px"
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReportViewer;
