import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Table, Badge, Spinner } from 'react-bootstrap';
import { FaChartLine, FaUsers, FaClipboardList, FaFileAlt, FaEye, FaEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getAllForms } from '../../../../services/engage/forms';
import { getAllSurveys } from '../../../../services/engage/surveys';
import { FormData, SurveyData } from '../../../../services/engage/types';

const Dashboard: React.FC = () => {
  // State for forms and surveys
  const [forms, setForms] = useState<FormData[]>([]);
  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [totalFormSubmissions, setTotalFormSubmissions] = useState<number>(0);
  const [totalSurveyResponses, setTotalSurveyResponses] = useState<number>(0);
  
  // Loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch forms and surveys
        const formsData = await getAllForms();
        const surveysData = await getAllSurveys();
        
        setForms(formsData);
        setSurveys(surveysData);
        
        // Calculate total submissions and responses
        const formSubmissionsTotal = formsData.reduce((total: number, form: FormData) => total + (form.submissions || 0), 0);
        const surveyResponsesTotal = surveysData.reduce((total: number, survey: SurveyData) => total + (survey.responses || 0), 0);
        
        setTotalFormSubmissions(formSubmissionsTotal);
        setTotalSurveyResponses(surveyResponsesTotal);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate response rate
  const calculateResponseRate = (): string => {
    const totalItems = forms.length + surveys.length;
    if (totalItems === 0) return '0%';
    
    const itemsWithResponses = forms.filter(form => (form.submissions || 0) > 0).length + 
                              surveys.filter(survey => (survey.responses || 0) > 0).length;
    
    const rate = Math.round((itemsWithResponses / totalItems) * 100);
    return `${rate}%`;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get form type from settings or default to "Form"
  const getFormType = (form: FormData): string => {
    if (form.settings && typeof form.settings === 'object' && 'type' in form.settings) {
      return form.settings.type as string;
    }
    return form.type || "Form";
  };

  // Get survey type from settings or default to "Survey"
  const getSurveyType = (survey: SurveyData): string => {
    if (survey.settings && typeof survey.settings === 'object' && 'type' in survey.settings) {
      return survey.settings.type as string;
    }
    return "Survey";
  };

  // Render loading spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Render error message
  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Engage Dashboard</h1>
          <p className="text-muted mb-0">Overview of your forms and surveys</p>
        </div>
        <div>
          <Button 
            variant="primary" 
            className="me-2" 
            as={Link as any}
            to="/engage/forms"
          >
            <FaFileAlt className="me-2" />
            Manage Forms
          </Button>
          <Button 
            variant="outline-primary" 
            as={Link as any}
            to="/engage/survey"
          >
            <FaClipboardList className="me-2" />
            Manage Surveys
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <FaFileAlt className="text-primary fs-4" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Forms</h6>
                <h3 className="mb-0">{forms.length}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <FaClipboardList className="text-success fs-4" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Surveys</h6>
                <h3 className="mb-0">{surveys.length}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                <FaUsers className="text-info fs-4" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Responses</h6>
                <h3 className="mb-0">{totalFormSubmissions + totalSurveyResponses}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                <FaChartLine className="text-warning fs-4" />
              </div>
              <div>
                <h6 className="text-muted mb-1">Response Rate</h6>
                <h3 className="mb-0">{calculateResponseRate()}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Forms */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Recent Forms</h5>
            <Button variant="link" className="text-decoration-none" as={Link as any} to="/engage/forms">View All</Button>
          </div>
        </Card.Header>
        <Card.Body>
          {forms.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted mb-0">No forms available. Create your first form to get started.</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Form Name</th>
                  <th>Type</th>
                  <th>Responses</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.slice(0, 3).map((form) => (
                  <tr key={form.id}>
                    <td>{form.title}</td>
                    <td>{getFormType(form)}</td>
                    <td>{form.submissions || 0}</td>
                    <td>{form.createdAt ? formatDate(form.createdAt) : 'N/A'}</td>
                    <td>
                      <Badge bg={form.status === 'Active' ? 'success' : 
                              form.status === 'Draft' ? 'secondary' : 'danger'}>
                        {form.status}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="View"
                        as={Link as any}
                        to={`/engage/forms/${form.id}`}
                      >
                        <FaEye />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0" 
                        title="Edit"
                        as={Link as any}
                        to={`/engage/forms/designer/${form.id}`}
                      >
                        <FaEdit />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Recent Surveys */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Recent Surveys</h5>
            <Button variant="link" className="text-decoration-none" as={Link as any} to="/engage/survey">View All</Button>
          </div>
        </Card.Header>
        <Card.Body>
          {surveys.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted mb-0">No surveys available. Create your first survey to get started.</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Survey Name</th>
                  <th>Type</th>
                  <th>Responses</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {surveys.slice(0, 3).map((survey) => (
                  <tr key={survey.id}>
                    <td>{survey.title}</td>
                    <td>{getSurveyType(survey)}</td>
                    <td>{survey.responses || 0}</td>
                    <td>{survey.createdAt ? formatDate(survey.createdAt) : 'N/A'}</td>
                    <td>
                      <Badge bg={survey.status === 'Active' ? 'success' : 
                              survey.status === 'Draft' ? 'secondary' : 'danger'}>
                        {survey.status}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="View"
                        as={Link as any}
                        to={`/engage/survey/${survey.id}`}
                      >
                        <FaEye />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0" 
                        title="Edit"
                        as={Link as any}
                        to={`/engage/survey/designer/${survey.id}`}
                      >
                        <FaEdit />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;
