import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Spinner, Alert, Form, Tabs, Tab, Table, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaCalendarAlt, FaChartBar, FaGlobe, FaUsers, FaEye, FaClock, FaMobile, FaDesktop, FaTabletAlt, FaCheck } from 'react-icons/fa';
import { FormsService } from '../../../../services/engage';
import * as AnalyticsService from '../../../../services/engage/analytics';
import { formatDateToISOString, formatNumberWithCommas, formatPercentage, formatDuration } from '../../../../services/utils';

// Chart.js components
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const FormAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: formatDateToISOString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
    endDate: formatDateToISOString(new Date()) // Today
  });

  // Fetch form and analytics data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get form data
        const formData = await FormsService.getFormById(id);
        setForm(formData);
        
        // Get analytics data
        const analyticsData = await AnalyticsService.getFormAnalytics(id, dateRange);
        setAnalytics(analyticsData);
        
        // Get form submissions
        const submissionsData = await AnalyticsService.getFormSubmissions(id);
        setSubmissions(submissionsData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load form analytics');
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
    navigate('/engage/forms');
  };

  // Handle toggle analytics
  const handleToggleAnalytics = async (enabled: boolean) => {
    if (!id || !form) return;
    
    try {
      setLoading(true);
      await AnalyticsService.updateFormAnalyticsSettings(id, {
        enableAnalytics: enabled
      });
      
      // Update form state
      setForm({
        ...form,
        settings: {
          ...form.settings,
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
    const viewsData = analytics.dailyViews.map((item: any) => item.views);
    const submissionsData = analytics.dailyViews.map((item: any) => item.submissions);
    
    return {
      labels,
      datasets: [
        {
          label: 'Form Views',
          data: viewsData,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.2
        },
        {
          label: 'Form Submissions',
          data: submissionsData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
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

  const prepareCompletionRateChartData = () => {
    if (!analytics) return null;
    
    const completed = analytics.completedSubmissions || 0;
    const abandoned = analytics.abandonedSubmissions || 0;
    const total = completed + abandoned;
    
    if (total === 0) return null;
    
    return {
      labels: ['Completed', 'Abandoned'],
      datasets: [
        {
          data: [completed, abandoned],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const prepareFieldCompletionChartData = () => {
    if (!analytics || !analytics.fieldStats) return null;
    
    // Sort fields by completion rate
    const sortedFields = Object.entries(analytics.fieldStats)
      .sort((a: any, b: any) => b[1].completionRate - a[1].completionRate);
    
    const labels = sortedFields.map(([field]: any) => field);
    const data = sortedFields.map(([, stats]: any) => stats.completionRate * 100);
    
    return {
      labels,
      datasets: [
        {
          label: 'Field Completion Rate (%)',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // Render loading state
  if (loading && !form) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" className="text-primary" />
        <span className="ms-3">Loading form analytics...</span>
      </div>
    );
  }

  // Render error state
  if (error && !form) {
    return (
      <Alert variant="danger" className="m-4">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={handleBack}>
          <FaArrowLeft className="me-2" />
          Back to Forms
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
          <span className="h3">{form?.title} Analytics</span>
        </div>
        <div>
          <Form.Check 
            type="switch"
            id="analytics-toggle"
            label="Enable Analytics"
            checked={form?.settings?.enableAnalytics !== false}
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
      {form?.settings?.enableAnalytics === false && (
        <Alert variant="warning" className="mb-4">
          <Alert.Heading>Analytics Disabled</Alert.Heading>
          <p>Analytics tracking is currently disabled for this form. Enable analytics to start collecting visitor data.</p>
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
                    <FaCheck className="text-success" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Submissions</h6>
                    <h3 className="mb-0">{formatNumberWithCommas(analytics.totalSubmissions || 0)}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                    <FaUsers className="text-info" size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Conversion Rate</h6>
                    <h3 className="mb-0">
                      {formatPercentage(
                        analytics.totalViews ? (analytics.totalSubmissions / analytics.totalViews) * 100 : 0,
                        1
                      )}
                    </h3>
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
                    <h6 className="text-muted mb-1">Avg. Completion Time</h6>
                    <h3 className="mb-0">{formatDuration(analytics.avgCompletionTime || 0)}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tabs */}
          <Tabs defaultActiveKey="overview" className="mb-4">
            <Tab eventKey="overview" title="Overview">
              {/* Views and Submissions Chart */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Form Views & Submissions Over Time</h5>
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
                {/* Completion Rate */}
                <Col md={6}>
                  <Card className="mb-4 h-100">
                    <Card.Header>
                      <h5 className="mb-0">Completion Rate</h5>
                    </Card.Header>
                    <Card.Body className="d-flex flex-column justify-content-center">
                      {prepareCompletionRateChartData() ? (
                        <div style={{ height: '300px' }}>
                          <Doughnut 
                            data={prepareCompletionRateChartData() as any}
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
                          <p className="text-muted">No completion data available</p>
                        </div>
                      )}
                      {analytics.completedSubmissions !== undefined && analytics.abandonedSubmissions !== undefined && (
                        <div className="mt-4 text-center">
                          <h4>
                            {formatPercentage(
                              (analytics.completedSubmissions / (analytics.completedSubmissions + analytics.abandonedSubmissions)) * 100 || 0,
                              1
                            )}
                          </h4>
                          <p className="text-muted">Completion Rate</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

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
              </Row>

              {/* Field Completion Rates */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Field Completion Rates</h5>
                </Card.Header>
                <Card.Body>
                  {prepareFieldCompletionChartData() ? (
                    <div style={{ height: '300px' }}>
                      <Bar 
                        data={prepareFieldCompletionChartData() as any}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">No field completion data available</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="submissions" title="Submissions">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Form Submissions</h5>
                </Card.Header>
                <Card.Body>
                  {submissions && submissions.length > 0 ? (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Date & Time</th>
                          <th>Submitter</th>
                          <th>Device</th>
                          <th>Completion Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((submission: any, index: number) => (
                          <tr key={index}>
                            <td>{new Date(submission.timestamp).toLocaleString()}</td>
                            <td>{submission.email || submission.name || 'Anonymous'}</td>
                            <td>
                              {submission.device === 'Desktop' && <FaDesktop className="me-2" />}
                              {submission.device === 'Mobile' && <FaMobile className="me-2" />}
                              {submission.device === 'Tablet' && <FaTabletAlt className="me-2" />}
                              {submission.device || 'Unknown'}
                            </td>
                            <td>{formatDuration(submission.completionTime || 0)}</td>
                            <td>
                              <Badge bg={submission.status === 'completed' ? 'success' : 'warning'}>
                                {submission.status === 'completed' ? 'Completed' : 'Partial'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">No submissions available for the selected period</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="fields" title="Field Analysis">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Field Performance</h5>
                </Card.Header>
                <Card.Body>
                  {analytics.fieldStats && Object.keys(analytics.fieldStats).length > 0 ? (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Field Name</th>
                          <th>Completion Rate</th>
                          <th>Avg. Time Spent</th>
                          <th>Error Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(analytics.fieldStats)
                          .sort((a: any, b: any) => b[1].completionRate - a[1].completionRate)
                          .map(([field, stats]: [string, any], index: number) => (
                            <tr key={index}>
                              <td>{field}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="me-2">
                                    {formatPercentage(stats.completionRate * 100, 1)}
                                  </div>
                                  <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                    <div 
                                      className="progress-bar" 
                                      style={{ width: `${stats.completionRate * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td>{formatDuration(stats.avgTimeSpent || 0)}</td>
                              <td>
                                <Badge bg={stats.errorRate > 0.1 ? 'danger' : 'success'}>
                                  {formatPercentage(stats.errorRate * 100, 1)}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">No field data available</p>
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

export default FormAnalytics;
