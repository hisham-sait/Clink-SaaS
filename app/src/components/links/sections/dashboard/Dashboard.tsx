import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import { FaLink, FaQrcode, FaFolder, FaPlus, FaChartLine, FaEye, FaEdit, FaGlobe, FaMobile } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getShortLinks } from '../../../../services/links/shortlinks';
import { getDigitalLinks } from '../../../../services/links/digitallinks';
import { getCategories } from '../../../../services/links/categories';
import { getQRCodes } from '../../../../services/links/qrcodes';
import { AnalyticsService } from '../../../../services/links';
import { formatTimeAgo } from '../../../../services/links';

interface DashboardStats {
  totalShortLinks: number;
  totalDigitalLinks: number;
  totalQRCodes: number;
  totalCategories: number;
  totalClicks: number;
}

interface AnalyticsSummary {
  totalLinks: number;
  totalShortlinks: number;
  totalDigitallinks: number;
  totalClicks: number;
  totalShortlinkClicks: number;
  totalDigitallinkClicks: number;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalShortLinks: 0,
    totalDigitalLinks: 0,
    totalQRCodes: 0,
    totalCategories: 0,
    totalClicks: 0
  });
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
  const [recentShortLinks, setRecentShortLinks] = useState<any[]>([]);
  const [recentDigitalLinks, setRecentDigitalLinks] = useState<any[]>([]);
  const [recentQRCodes, setRecentQRCodes] = useState<any[]>([]);
  const [recentClicks, setRecentClicks] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }

      // Fetch shortlinks using the service layer
      try {
        const shortlinksResponse = await getShortLinks();
        const shortlinks = shortlinksResponse.shortLinks || [];
        setStats(prev => ({ ...prev, totalShortLinks: shortlinks.length }));
        setRecentShortLinks(shortlinks.slice(0, 5)); // Get the 5 most recent shortlinks
      } catch (err) {
        console.error('Error fetching shortlinks:', err);
        // Don't set error state to avoid blocking the UI
      }
      
      // Fetch digitallinks using the service layer
      try {
        const digitallinksResponse = await getDigitalLinks();
        const digitallinks = digitallinksResponse.digitalLinks || [];
        setStats(prev => ({ ...prev, totalDigitalLinks: digitallinks.length }));
        setRecentDigitalLinks(digitallinks.slice(0, 5)); // Get the 5 most recent digitallinks
      } catch (err) {
        console.error('Error fetching digitallinks:', err);
        // Don't set error state to avoid blocking the UI
      }
      
      // Fetch QR codes using the service layer
      try {
        const qrCodesResponse = await getQRCodes();
        const qrCodes = qrCodesResponse.qrCodes || [];
        setStats(prev => ({ ...prev, totalQRCodes: qrCodes.length }));
        setRecentQRCodes(qrCodes.slice(0, 5)); // Get the 5 most recent QR codes
      } catch (err) {
        console.error('Error fetching QR codes:', err);
        // Don't set error state to avoid blocking the UI
      }
      
      // Fetch categories using the service layer
      try {
        const categoriesResponse = await getCategories();
        const categories = categoriesResponse.categories || [];
        setStats(prev => ({ ...prev, totalCategories: categories.length }));
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Don't set error state to avoid blocking the UI
      }
      
      // Fetch analytics summary
      try {
        const summary = await AnalyticsService.getSummaryAnalytics();
        setAnalyticsSummary(summary);
        setStats(prev => ({ ...prev, totalClicks: summary.totalClicks || 0 }));
      } catch (err) {
        console.error('Error fetching analytics summary:', err);
        // Don't set error state to avoid blocking the UI
      }
      
      // Fetch recent clicks
      try {
        const recentClicksData = await AnalyticsService.getRecentClicks(1, 5);
        setRecentClicks(recentClicksData.clicks || []);
      } catch (err) {
        console.error('Error fetching recent clicks:', err);
        // Don't set error state to avoid blocking the UI
      }
      
      // Fetch recent activity
      try {
        const activityData = await AnalyticsService.getRecentActivity(5);
        setRecentActivity(activityData || []);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
        // Don't set error state to avoid blocking the UI
      }
      
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Function to truncate URL
  const truncateUrl = (url: string, maxLength: number = 30) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  // Function to get content type label
  const getContentTypeLabel = (contentType: string) => {
    switch (contentType) {
      case 'url':
        return 'URL';
      case 'text':
        return 'Text';
      case 'vcard':
        return 'Contact Card';
      case 'email':
        return 'Email';
      case 'sms':
        return 'SMS';
      case 'wifi':
        return 'WiFi';
      case 'location':
        return 'Location';
      case 'phone':
        return 'Phone';
      default:
        return contentType;
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Links Dashboard</h1>
          <p className="text-muted mb-0">Overview of your links</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" className="text-primary" />
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted mb-1">Short Links</div>
                    <h3 className="mb-0">{stats.totalShortLinks}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FaLink className="text-primary" size={24} />
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" className="text-success" />
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted mb-1">Digital Links</div>
                    <h3 className="mb-0">{stats.totalDigitalLinks}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <FaGlobe className="text-success" size={24} />
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" className="text-warning" />
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted mb-1">QR Codes</div>
                    <h3 className="mb-0">{stats.totalQRCodes}</h3>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <FaQrcode className="text-warning" size={24} />
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" className="text-info" />
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted mb-1">Total Clicks</div>
                    <h3 className="mb-0">{stats.totalClicks}</h3>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <FaChartLine className="text-info" size={24} />
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* QR Codes and Recent Clicks */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Recent QR Codes</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" className="text-warning" />
                  <p className="mt-2 text-muted">Loading QR codes...</p>
                </div>
              ) : recentQRCodes.length > 0 ? (
                <div className="list-group">
                  {recentQRCodes.map((qrCode) => (
                    <div key={qrCode.id} className="list-group-item list-group-item-action">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{qrCode.title || 'Untitled QR Code'}</h6>
                        <small className="text-muted">{qrCode.createdAt ? formatTimestamp(qrCode.createdAt) : 'N/A'}</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="me-3" style={{ width: '60px', height: '60px' }}>
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCode.content)}&size=60x60`} 
                            alt="QR Code" 
                            className="img-fluid" 
                          />
                        </div>
                        <div>
                          <p className="mb-1 small">
                            <Badge bg="secondary" className="me-2">{getContentTypeLabel(qrCode.contentType)}</Badge>
                            <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                              {truncateUrl(qrCode.content)}
                            </span>
                          </p>
                          <small className="text-muted">Scans: {qrCode.clicks || 0}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FaQrcode className="text-muted mb-3" size={32} />
                  <p className="mb-0">No QR codes created yet</p>
                  <Link to="/links/qrcodes" className="btn btn-sm btn-primary mt-3">
                    <FaPlus className="me-2" />
                    Create QR Code
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Recent Scans & Clicks</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" className="text-info" />
                  <p className="mt-2 text-muted">Loading recent activity...</p>
                </div>
              ) : recentClicks.length > 0 ? (
                <Table responsive hover size="sm">
                  <thead>
                    <tr>
                      <th>Link</th>
                      <th>Type</th>
                      <th>Device</th>
                      <th>Location</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentClicks.map((click) => (
                      <tr key={click.id}>
                        <td className="text-truncate" style={{ maxWidth: '150px' }}>
                          {click.linkTitle || click.linkUrl || 'Unknown'}
                        </td>
                        <td>
                          <Badge bg={
                            click.type === 'shortlink' ? 'primary' : 
                            click.type === 'digitallink' ? 'success' : 'warning'
                          }>
                            {click.type === 'shortlink' ? 'Short' : 
                             click.type === 'digitallink' ? 'Digital' : 'QR'}
                          </Badge>
                        </td>
                        <td>
                          <span title={click.userAgent}>
                            {click.device || 'Unknown'}
                          </span>
                        </td>
                        <td>{click.location || 'Unknown'}</td>
                        <td>{click.timestamp ? formatTimeAgo(click.timestamp) : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <FaChartLine className="text-muted mb-3" size={32} />
                  <p className="mb-0">No clicks or scans recorded yet</p>
                  <p className="text-muted small">Activity will appear here when your links are used</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Links */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Recent Short Links</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" className="text-primary" />
                  <p className="mt-2 text-muted">Loading short links...</p>
                </div>
              ) : recentShortLinks.length > 0 ? (
                <div className="list-group">
                  {recentShortLinks.map((link) => (
                    <div key={link.id} className="list-group-item list-group-item-action">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{link.title || 'Untitled Link'}</h6>
                        <small className="text-muted">{link.createdAt ? formatTimestamp(link.createdAt) : 'N/A'}</small>
                      </div>
                      <p className="mb-1 small text-truncate">
                        <span className="text-primary">{link.shortCode}</span> → {truncateUrl(link.originalUrl)}
                      </p>
                      <small className="text-muted">Clicks: {link.clicks || 0}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FaLink className="text-muted mb-3" size={32} />
                  <p className="mb-0">No short links created yet</p>
                  <Link to="/links/shortlinks" className="btn btn-sm btn-primary mt-3">
                    <FaPlus className="me-2" />
                    Create Short Link
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Recent Digital Links</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" className="text-success" />
                  <p className="mt-2 text-muted">Loading digital links...</p>
                </div>
              ) : recentDigitalLinks.length > 0 ? (
                <div className="list-group">
                  {recentDigitalLinks.map((link) => (
                    <div key={link.id} className="list-group-item list-group-item-action">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{link.title || 'Untitled Link'}</h6>
                        <small className="text-muted">{link.createdAt ? formatTimestamp(link.createdAt) : 'N/A'}</small>
                      </div>
                      <p className="mb-1 small">
                        <span className="text-success">{link.linkCode || link.gs1Key || 'N/A'}</span>
                      </p>
                      <small className="text-muted">Type: {link.type || link.gs1KeyType || 'N/A'} • Clicks: {link.clicks || 0}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FaGlobe className="text-muted mb-3" size={32} />
                  <p className="mb-0">No digital links created yet</p>
                  <Link to="/links/digitallinks" className="btn btn-sm btn-primary mt-3">
                    <FaPlus className="me-2" />
                    Create Digital Link
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Quick Actions</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3} className="mb-3 mb-md-0">
              <Link to="/links/shortlinks" style={{ textDecoration: 'none' }}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <FaLink className="text-primary mb-3" size={32} />
                    <h5>Create Short Link</h5>
                    <p className="small text-muted">Create a new short URL</p>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Link to="/links/digitallinks" style={{ textDecoration: 'none' }}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <FaGlobe className="text-success mb-3" size={32} />
                    <h5>Create Digital Link</h5>
                    <p className="small text-muted">Create a new GS1 Digital Link</p>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Link to="/links/qrcodes" style={{ textDecoration: 'none' }}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <FaQrcode className="text-warning mb-3" size={32} />
                    <h5>Create QR Code</h5>
                    <p className="small text-muted">Generate a custom QR code</p>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
            <Col md={3}>
              <Link to="/links/categories" style={{ textDecoration: 'none' }}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <FaFolder className="text-info mb-3" size={32} />
                    <h5>Manage Categories</h5>
                    <p className="small text-muted">Organize your links</p>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;
