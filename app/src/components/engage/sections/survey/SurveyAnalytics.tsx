import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Spinner, Alert, Form, Tabs, Tab, Table, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaCalendarAlt, FaChartBar, FaGlobe, FaUsers, FaEye, FaClock, FaMobile, FaDesktop, FaTabletAlt, FaCheck } from 'react-icons/fa';
import { SurveysService } from '../../../../services/engage';
import * as AnalyticsService from '../../../../services/engage/analytics';
import { formatDateToISOString, formatNumberWithCommas, formatPercentage, formatDuration } from '../../../../services/utils';

// Chart.js components
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const SurveyAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [survey, setSurvey] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: formatDateToISOString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
    endDate: formatDateToISOString(new Date()) // Today
  });

  // Fetch survey and analytics data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get survey data
        const surveyData = await SurveysService.getSurveyById(id);
        setSurvey(surveyData);
        
        // Get analytics data
        const analyticsData = await AnalyticsService.getSurveyAnalytics(id, dateRange);
        setAnalytics(analyticsData);
        
        // Get survey responses
        const responsesData = await AnalyticsService.getSurveyResponses(id);
        setResponses(responsesData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load survey analytics');
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
    navigate('/engage/survey');
  };

  // Handle toggle analytics
  const handleToggleAnalytics = async (enabled: boolean) => {
    if (!id || !survey) return;
    
    try {
      setLoading(true);
      await AnalyticsService.updateSurveyAnalyticsSettings(id, {
        enableAnalytics: enabled
      });
      
      // Update survey state
      setSurvey({
        ...survey,
        settings: {
          ...survey.settings,
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
    const responsesData = analytics.dailyViews.map((item: any) => item.responses);
    
    return {
      labels,
      datasets: [
        {
          label: 'Survey Views',
          data: viewsData,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.2
        },
        {
          label: 'Survey Responses',
          data: responsesData,
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
    
    const completed = analytics.completedResponses || 0;
    const abandoned = analytics.abandonedResponses || 0;
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

  const prepareQuestionResponsesChartData = () => {
    if (!analytics || !analytics.questionStats) return null;
    
    // Sort questions by response rate
    const sortedQuestions = Object.entries(analytics.questionStats)
      .sort((a: any, b: any) => b[1].responseRate - a[1].responseRate);
    
    const labels = sortedQuestions.map(([question]: any) => question);
    const data = sortedQuestions.map(([, stats]: any) => stats.responseRate * 100);
    
    return {
      labels,
      datasets: [
        {
          label: 'Question Response Rate (%)',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // Render loading state
  if (loading && !survey) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" className="text-primary" />
        <span className="ms-3">Loading survey analytics...</span>
      </div>
    );
  }

  // Render error state
  if (error && !survey) {
    return (
      <Alert variant="danger" className="m-4">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={handleBack}>
          <FaArrowLeft className="me-2" />
          Back to Surveys
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
          <span className="h3">{survey?.title} Analytics</span>
        </div>
        <div>
          <Form.Check 
            type="switch"
            id="analytics-toggle"
            label="Enable Analytics"
            checked={survey?.settings?.enableAnalytics !== false}
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
      {survey?.settings?.enableAnalytics === false && (
        <Alert variant="warning" className="mb-4">
          <Alert.Heading>Analytics Disabled</Alert.Heading>
          <p>Analytics tracking is currently disabled for this survey. Enable analytics to start collecting visitor data.</p>
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
                    <h6 className="text-muted mb-1">Responses</h6>
                    <h3 className="mb-0">{formatNumberWithCommas(analytics.totalResponses || 0)}</h3>
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
                        analytics.totalViews ? (analytics.totalResponses / analytics.totalViews) * 100 : 0,
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
              {/* Views and Responses Chart */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Survey Views & Responses Over Time</h5>
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
                      {analytics.completedResponses !== undefined && analytics.abandonedResponses !== undefined && (
                        <div className="mt-4 text-center">
                          <h4>
                            {formatPercentage(
                              (analytics.completedResponses / (analytics.completedResponses + analytics.abandonedResponses)) * 100 || 0,
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

              {/* Question Response Rates */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Question Response Rates</h5>
                </Card.Header>
                <Card.Body>
                  {prepareQuestionResponsesChartData() ? (
                    <div style={{ height: '300px' }}>
                      <Bar 
                        data={prepareQuestionResponsesChartData() as any}
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
                      <p className="text-muted">No question response data available</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="responses" title="Responses">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Survey Responses</h5>
                </Card.Header>
                <Card.Body>
                  {responses && responses.length > 0 ? (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Date & Time</th>
                          <th>Respondent</th>
                          <th>Device</th>
                          <th>Completion Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {responses.map((response: any, index: number) => (
                          <tr key={index}>
                            <td>{new Date(response.timestamp).toLocaleString()}</td>
                            <td>{response.email || response.name || 'Anonymous'}</td>
                            <td>
                              {response.device === 'Desktop' && <FaDesktop className="me-2" />}
                              {response.device === 'Mobile' && <FaMobile className="me-2" />}
                              {response.device === 'Tablet' && <FaTabletAlt className="me-2" />}
                              {response.device || 'Unknown'}
                            </td>
                            <td>{formatDuration(response.completionTime || 0)}</td>
                            <td>
                              <Badge bg={response.status === 'completed' ? 'success' : 'warning'}>
                                {response.status === 'completed' ? 'Completed' : 'Partial'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">No responses available for the selected period</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="questions" title="Question Analysis">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Question Performance</h5>
                </Card.Header>
                <Card.Body>
                  {analytics.questionStats && Object.keys(analytics.questionStats).length > 0 ? (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Question</th>
                          <th>Response Rate</th>
                          <th>Avg. Time Spent</th>
                          <th>Skip Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(analytics.questionStats)
                          .sort((a: any, b: any) => b[1].responseRate - a[1].responseRate)
                          .map(([question, stats]: [string, any], index: number) => (
                            <tr key={index}>
                              <td>{question}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="me-2">
                                    {formatPercentage(stats.responseRate * 100, 1)}
                                  </div>
                                  <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                    <div 
                                      className="progress-bar" 
                                      style={{ width: `${stats.responseRate * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td>{formatDuration(stats.avgTimeSpent || 0)}</td>
                              <td>
                                <Badge bg={stats.skipRate > 0.1 ? 'warning' : 'success'}>
                                  {formatPercentage(stats.skipRate * 100, 1)}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">No question data available</p>
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

export default SurveyAnalytics;
