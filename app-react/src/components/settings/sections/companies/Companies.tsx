import React, { useState, useEffect } from 'react';
import * as CompaniesService from '../../../../services/settings/companies';
import { handleApiError, formatDateShort } from '../../../../services/settings';
import type { Company, CompanyStatus } from '../../../../services/settings/companies';
import CompanyModal from './CompanyModal';
import ImportCompanyModal from './ImportCompanyModal';
import { Button, Card, Row, Col, Badge, Table, Form, Dropdown, ButtonGroup } from 'react-bootstrap';

interface Activity {
  id: string;
  type: 'added' | 'updated' | 'removed' | 'status_changed';
  entityType: string;
  entityId: string;
  description: string;
  user: string;
  time: string;
}

// Timeline styles are now handled by CSS classes

const Companies: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState('');

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CompaniesService.getCompanies();
      setCompanies(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await CompaniesService.getActivities();
      setRecentActivities(response.activities);
    } catch (err) {
      console.error('Error fetching recent activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await CompaniesService.exportCompanies(type);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `companies.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting companies:', error);
      alert('Failed to export companies. Please try again.');
    }
  };

  const handleDelete = async (company: Company) => {
    if (!window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      return;
    }

    try {
      await CompaniesService.deleteCompany(company.id);
      await loadCompanies();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleArchive = async (company: Company) => {
    try {
      await CompaniesService.archiveCompany(company.id);
      await loadCompanies();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleActivate = async (company: Company) => {
    try {
      await CompaniesService.activateCompany(company.id);
      await loadCompanies();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleSetPrimary = async (company: Company) => {
    try {
      await CompaniesService.setPrimaryOrganization(company.id);
      await loadCompanies();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = (
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.registrationNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    const matchesType = !typeFilter || company.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const uniqueTypes = Array.from(new Set(companies.map(c => c.type).filter(Boolean)));

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Companies</h1>
          <p className="text-muted mb-0">Manage companies and their relationships</p>
        </div>
        <div className="d-flex gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="outline-primary" id="export-dropdown" className="d-inline-flex align-items-center gap-2">
              <i className="bi bi-download"></i>
              <span>Export</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleExport('pdf')} className="d-flex align-items-center gap-2">
                <i className="bi bi-file-pdf"></i>
                <span>Export as PDF</span>
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleExport('excel')} className="d-flex align-items-center gap-2">
                <i className="bi bi-file-excel"></i>
                <span>Export as Excel</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="outline-primary" className="d-inline-flex align-items-center gap-2" onClick={() => setShowImportModal(true)}>
            <i className="bi bi-upload"></i>
            <span>Import</span>
          </Button>
          <Button 
            variant="primary"
            className="d-inline-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-lg"></i>
            <span>Add Company</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Total Companies</div>
                  <h3 className="mb-0">{companies.length}</h3>
                  <small className="text-muted">All companies</small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-building text-primary" style={{ fontSize: '24px' }}></i>
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
                  <div className="text-muted mb-1">Active Companies</div>
                  <h3 className="mb-0">{companies.filter(c => c.status === 'Active').length}</h3>
                  <small className="text-muted">Currently active</small>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-building-check text-success" style={{ fontSize: '24px' }}></i>
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
                  <div className="text-muted mb-1">Archived Companies</div>
                  <h3 className="mb-0">{companies.filter(c => c.status === 'Archived').length}</h3>
                  <small className="text-muted">Archived companies</small>
                </div>
                <div className="bg-secondary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-archive text-secondary" style={{ fontSize: '24px' }}></i>
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
                  <div className="text-muted mb-1">Total Users</div>
                  <h3 className="mb-0">
                    {companies.reduce((sum, company) => sum + (company.billingForUsers?.length || 0), 0)}
                  </h3>
                  <small className="text-muted">Across all companies</small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-people text-primary" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0">All Companies</h5>
          <div className="d-flex gap-2">
            <div className="input-group">
              <span className="input-group-text border-end-0 bg-white">
                <i className="bi bi-search text-muted"></i>
              </span>
              <Form.Control
                type="text"
                className="border-start-0"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Form.Select
              className="w-auto"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as CompanyStatus | 'all')}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </Form.Select>
            <Form.Select
              className="w-auto"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Form.Select>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="text-uppercase small fw-semibold text-secondary">Company Name</th>
                    <th className="text-uppercase small fw-semibold text-secondary">Registration Number</th>
                    <th className="text-uppercase small fw-semibold text-secondary">Type</th>
                    <th className="text-uppercase small fw-semibold text-secondary">Status</th>
                    <th className="text-uppercase small fw-semibold text-secondary">Users</th>
                    <th className="text-uppercase small fw-semibold text-secondary text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map(company => (
                    <tr key={company.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className={`bg-${CompaniesService.getCompanyStatusBadgeColor(company.status)} bg-opacity-10 rounded-circle p-2`}>
                            <i className={`bi bi-building text-${CompaniesService.getCompanyStatusBadgeColor(company.status)}`}></i>
                          </div>
                          <div>
                            <span>{CompaniesService.formatCompanyName(company)}</span>
                            {company.isPrimary && (
                              <Badge bg="primary" className="ms-2">Primary</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{company.registrationNumber || '-'}</td>
                      <td>{company.type || '-'}</td>
                      <td>
                        <Badge bg={CompaniesService.getCompanyStatusBadgeColor(company.status)}>
                          {company.status}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="secondary">
                          {company.billingForUsers?.length || 0} Users
                        </Badge>
                      </td>
                      <td className="text-end">
                        <div className="btn-group">
                          <Button
                            variant="link"
                            className="btn-sm text-body px-2"
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowModal(true);
                            }}
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="link"
                            className="btn-sm text-danger px-2"
                            onClick={() => handleDelete(company)}
                            disabled={company.billingForUsers && company.billingForUsers.length > 0}
                            title={company.billingForUsers && company.billingForUsers.length > 0 ? 'Cannot delete company with users' : 'Delete'}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                          <Dropdown as={ButtonGroup}>
                            <Dropdown.Toggle split variant="link" className="btn-sm text-body px-2">
                              <i className="bi bi-three-dots-vertical"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu align="end">
                              {!company.isPrimary && (
                                <Dropdown.Item onClick={() => handleSetPrimary(company)}>
                                  <i className="bi bi-star me-2"></i>
                                  Set as Primary
                                </Dropdown.Item>
                              )}
                              {company.status === 'Active' ? (
                                <Dropdown.Item onClick={() => handleArchive(company)}>
                                  <i className="bi bi-archive me-2"></i>
                                  Archive Company
                                </Dropdown.Item>
                              ) : (
                                <Dropdown.Item onClick={() => handleActivate(company)}>
                                  <i className="bi bi-arrow-clockwise me-2"></i>
                                  Activate Company
                                </Dropdown.Item>
                              )}
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCompanies.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-5">
                        <div className="d-flex flex-column align-items-center">
                          <div className="bg-light p-4 rounded-circle mb-3">
                            <i className="bi bi-building text-muted" style={{ fontSize: '32px' }}></i>
                          </div>
                          <h5 className="text-muted mb-2">No Companies Found</h5>
                          <p className="text-muted mb-4">Get started by adding your first company or importing data</p>
                          <div>
                            <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                              <i className="bi bi-upload me-2"></i> Import Companies
                            </Button>
                            <Button variant="primary" onClick={() => setShowModal(true)}>
                              <i className="bi bi-plus-lg me-2"></i> Add Company
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Recent Activities */}
      <Card className="mt-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <i className="bi bi-clock-history me-2"></i>
              Recent Activities
            </h5>
          </div>
          {activitiesLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary"></div>
              <p className="text-muted small mt-2 mb-0">Loading activities...</p>
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="timeline">
              {recentActivities.map((activity, index) => (
                <div key={index} className="timeline-item pb-3">
                  <div className="d-flex">
                    <div className="me-3">
                      <Badge bg="light" className="p-2">
                        {activity.type === 'added' ? (
                          <i className="bi bi-plus-circle text-success"></i>
                        ) : activity.type === 'updated' ? (
                          <i className="bi bi-pencil text-primary"></i>
                        ) : activity.type === 'removed' ? (
                          <i className="bi bi-trash text-danger"></i>
                        ) : (
                          <i className="bi bi-pencil text-primary"></i>
                        )}
                      </Badge>
                    </div>
                    <div>
                      <p className="mb-0">{activity.description}</p>
                      <small className="text-muted">
                        {new Date(activity.time).toLocaleString('en-IE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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

      <CompanyModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedCompany(undefined);
        }}
        company={selectedCompany}
        onSuccess={() => {
          loadCompanies();
          setShowModal(false);
          setSelectedCompany(undefined);
        }}
      />
      <ImportCompanyModal
        show={showImportModal}
        onHide={() => setShowImportModal(false)}
        onSuccess={() => {
          loadCompanies();
          setShowImportModal(false);
        }}
      />

      <style>
        {`
          .timeline {
            position: relative;
            padding: 0;
            margin: 0;
            list-style: none;
          }
          .timeline .timeline-item {
            position: relative;
            border-left: 2px solid #e9ecef;
            margin-left: 1rem;
            padding-left: 1.5rem;
          }
        `}
      </style>
    </div>
  );
};

export default Companies;
