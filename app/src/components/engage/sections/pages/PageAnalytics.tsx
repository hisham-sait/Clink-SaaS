import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Spinner, Alert, Form, Tabs, Tab, Table, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaCalendarAlt, FaChartBar, FaGlobe, FaUsers, FaEye, FaClock, FaMobile, FaDesktop, FaTabletAlt } from 'react-icons/fa';
import { PagesService } from '../../../../services/engage';
import * as AnalyticsService from '../../../../services/engage/analytics';
import { formatDateToISOString, formatNumberWithCommas, formatPercentage, formatDuration } from '../../../../services/utils';

// Chart.js components
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const PageAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: formatDateToISOString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
    endDate: formatDateToISOString(new Date()) // Today
  });

  // Fetch page and analytics data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get page data
        const pageData = await PagesService.getPageById(id);
        setPage(pageData);
        
        // Get analytics data
        const analyticsData = await AnalyticsService.getPageAnalytics(id, dateRange);
        setAnalytics(analyticsData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load page analytics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, dateRange]);

  // Handle date range change
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle back button click
  const handleBack = () => {
    navigate('/engage/pages');
  };

  // Handle toggle analytics
  const handleToggleAnalytics = async (enabled: boolean) => {
    if (!id || !page) return;
    
    try {
      setLoading(true);
      await AnalyticsService.updatePageAnalyticsSettings(id, {
        enableAnalytics: enabled
      });
      
      // Update page state
      setPage({
        ...page,
        settings: {
          ...page.settings,
          enableAnalytics: enabled
        }
      });
      
      setError(null);
    } catch (err: any) {
      console.error('Error updating analytics settings:', err);
      setError(err.message || 'Failed to update analytics settings');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const prepareViewsChartData = () => {
    if (!analytics || !analytics.dailyViews) return null;
    
    const labels = analytics.dailyViews.map((item: any) => item.date);
    const data = analytics.dailyViews.map((item: any) => item.count);
    
    return {
      labels,
      datasets: [
        {
          label: 'Page Views',
          data,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.2
        }
      ]
    };
  };

  const prepareDeviceChartData = () => {
    if (!analytics || !analytics.deviceStats) return null;
    
    const labels = Object.keys(analytics.deviceStats);
    const data = Object.values(analytics.deviceStats);
    
    return {
      labels,
      datasets: [
        {
          label: 'Device Types',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const prepareLocationChartData = () => {
    if (!analytics || !analytics.locationStats) return null;
    
    // Get top 10 locations
    const topLocations = Object.entries(analytics.locationStats)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 10);
    
    const labels = topLocations.map((item: any) => item[0]);
    const data = topLocations.map((item: any) => item[1]);
    
    return {
      labels,
      datasets: [
        {
          label: 'Visitors by Location',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // Render loading state
  if (loading && !page) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" className="text-primary" />
        <span className="ms-3">Loading page analytics...</span>
      </div>
    );
  }

  // Render error state
  if (error && !page) {
    return (
      <Alert variant="danger" className="m-4">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={handleBack}>
          <FaArrowLeft className="me-2" />
          Back to Pages
        </Button>
      </Alert>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button variant="outline-secondary" onClick={handleBack} className="me-3">
            <FaArrowLeft className="me-2" />
            Back
          </Button>
          <span className="h3">{page?.title} Analytics</span>
        </div>
        <div>
          <Form.Check 
            type="switch"
            id="analytics-toggle"
            label="Enable Analytics"
            checked={page?.settings?.enableAnalytics !== false}
            onChange={(e) => handleToggleAnalytics(e.target.checked)}
            className="d-inline-block me-3"
          />
          <Button variant="outline-primary">
            <FaChartBar className="me-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6} className="d-flex align-items-center">
              <FaCalendarAlt className="text-primary me-2" />
              <span className="fw-bold">Date Range:</span>
            </Col>
            <Col md={6}>
              <div className="d-flex gap-3">
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateRangeChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateRangeChange}
                  />
                </Form.Group>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Analytics Disabled Warning */}
      {page?.settings?.enableAnalytics === false && (
        <Alert variant="warning" className="mb-4">
          <Alert.Heading>Analytics Disabled</Alert.Heading>
          <p>Analytics tracking is currently disabled for this page. Enable analytics to start collecting visitor data.</p>
          <Button variant="primary" onClick={() => handleToggleAnalytics(true)}>
            Enable Analytics
          </Button>
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" className="text-primary" />
          <p className="mt-3">Loading analytics data...</p>
        </div>
      )}

      {/* Analytics Content */}
      {!loading && analytics && (
        <>
          {/* Overview Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                    <FaEye className="text-primary" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Total Views</h6>
                    <h3 className="mb-0">{formatNumberWithCommas(analytics.totalViews || 0)}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                    <FaUsers className="text-success" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Unique Visitors</h6>
                    <h3 className="mb-0">{formatNumberWithCommas(analytics.uniqueVisitors || 0)}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                    <FaGlobe className="text-info" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Countries</h6>
                    <h3 className="mb-0">{Object.keys(analytics.locationStats || {}).length}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                    <FaClock className="text-warning" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Avg. Time on Page</h6>
                    <h3 className="mb-0">{formatDuration(analytics.avgTimeOnPage || 0)}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tabs */}
          <Tabs defaultActiveKey="overview" className="mb-4">
            <Tab eventKey="overview" title="Overview">
              {/* Views Chart */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Page Views Over Time</h5>
                </Card.Header>
                <Card.Body>
                  {prepareViewsChartData() ? (
                    <div style={{ height: '300px' }}>
                      <Line 
                        data={prepareViewsChartData() as any} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">No view data available for the selected period</p>
                    </div>
                  )}
                </Card.Body>
              </Card>

              <Row>
                {/* Device Distribution */}
                <Col md={6}>
                  <Card className="mb-4 h-100">
                    <Card.Header>
                      <h5 className="mb-0">Device Distribution</h5>
                    </Card.Header>
                    <Card.Body className="d-flex flex-column justify-content-center">
                      {prepareDeviceChartData() ? (
                        <div style={{ height: '300px' }}>
                          <Pie 
                            data={prepareDeviceChartData() as any}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom'
                                }
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-5">
                          <p className="text-muted">No device data available</p>
                        </div>
                      )}
                      <div className="mt-4">
                        <Row>
                          <Col xs={4} className="text-center">
                            <FaDesktop size={24} className="text-primary mb-2" />
                            <h6>Desktop</h6>
                            <p className="mb-0">{formatPercentage(analytics.deviceStats?.Desktop / analytics.totalViews * 100 || 0, 1)}</p>
                          </Col>
                          <Col xs={4} className="text-center">
                            <FaMobile size={24} className="text-danger mb-2" />
                            <h6>Mobile</h6>
                            <p className="mb-0">{formatPercentage(analytics.deviceStats?.Mobile / analytics.totalViews * 100 || 0, 1)}</p>
                          </Col>
                          <Col xs={4} className="text-center">
                            <FaTabletAlt size={24} className="text-warning mb-2" />
                            <h6>Tablet</h6>
                            <p className="mb-0">{formatPercentage(analytics.deviceStats?.Tablet / analytics.totalViews * 100 || 0, 1)}</p>
                          </Col>
                        </Row>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Top Locations */}
                <Col md={6}>
                  <Card className="mb-4 h-100">
                    <Card.Header>
                      <h5 className="mb-0">Top Locations</h5>
                    </Card.Header>
                    <Card.Body>
                      {prepareLocationChartData() ? (
                        <div style={{ height: '300px' }}>
                          <Bar 
                            data={prepareLocationChartData() as any}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              indexAxis: 'y' as const,
                              scales: {
                                x: {
                                  beginAtZero: true
                                }
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-5">
                          <p className="text-muted">No location data available</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="visitors" title="Visitors">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Visitor Details</h5>
                </Card.Header>
                <Card.Body>
                  {analytics.visitors && analytics.visitors.length > 0 ? (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Date & Time</th>
                          <th>Location</th>
                          <th>Device</th>
                          <th>Browser</th>
                          <th>Time on Page</th>
                          <th>Referrer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.visitors.map((visitor: any, index: number) => (
                          <tr key={index}>
                            <td>{new Date(visitor.timestamp).toLocaleString()}</td>
                            <td>{visitor.location || 'Unknown'}</td>
                            <td>
                              {visitor.device === 'Desktop' && <FaDesktop className="me-2" />}
                              {visitor.device === 'Mobile' && <FaMobile className="me-2" />}
                              {visitor.device === 'Tablet' && <FaTabletAlt className="me-2" />}
                              {visitor.device || 'Unknown'}
                            </td>
                            <td>{visitor.browser || 'Unknown'}</td>
                            <td>{formatDuration(visitor.timeOnPage || 0)}</td>
                            <td>{visitor.referrer || 'Direct'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">No visitor data available for the selected period</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="referrers" title="Referrers">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Top Referrers</h5>
                </Card.Header>
                <Card.Body>
                  {analytics.referrerStats && Object.keys(analytics.referrerStats).length > 0 ? (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Source</th>
                          <th>Visitors</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(analytics.referrerStats)
                          .sort((a: any, b: any) => b[1] - a[1])
                          .map(([source, count]: [string, any], index: number) => (
                            <tr key={index}>
                              <td>{source || 'Direct'}</td>
                              <td>{count}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="me-2">
                                    {formatPercentage(count / analytics.totalViews * 100, 1)}
                                  </div>
                                  <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                    <div 
                                      className="progress-bar" 
                                      style={{ width: `${count / analytics.totalViews * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">No referrer data available for the selected period</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default PageAnalytics;
