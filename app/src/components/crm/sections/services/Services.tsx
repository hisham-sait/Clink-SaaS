import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Badge, Row, Col, Card, Dropdown } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaCheckCircle, FaPauseCircle, FaClock, FaTrash, FaFileExport, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { FaGears } from 'react-icons/fa6';
import * as crmService from '../../../../services/crm';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Product, Activity } from '../../types';
import ServiceModal from './ServiceModal';
import ImportServiceModal from './ImportServiceModal';
import { toast } from 'react-toastify';

const Services: React.FC = () => {
  const navigate = useNavigate();
  const timelineStyles = {
    timeline: {
      position: 'relative' as const,
      padding: 0,
      margin: 0,
      listStyle: 'none'
    },
    timelineItem: {
      position: 'relative' as const,
      borderLeft: '2px solid #e9ecef',
      marginLeft: '1rem',
      paddingLeft: '1.5rem'
    }
  };

  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [services, setServices] = useState<Product[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [selectedService, setSelectedService] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Archived'>('All');

  useEffect(() => {
    if (user?.companyId) {
      loadServices();
      fetchRecentActivities();
    }
  }, [user?.companyId, statusFilter]);

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      if (user?.companyId) {
        const activities = await crmService.getActivities(user.companyId, 'product');
        setRecentActivities(activities);
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      if (!user?.companyId) {
        toast.error('No company selected. Please select a company first.');
        return;
      }
      // Get all products and filter for services
      const data = await crmService.getProducts(user.companyId);
      // Filter to only show services
      let servicesOnly = data.filter(product => product.type === 'SERVICE');
      
      // Apply status filter if not 'All'
      if (statusFilter !== 'All') {
        servicesOnly = servicesOnly.filter(service => service.status === statusFilter);
      }
      
      setServices(servicesOnly);
      setError('');
    } catch (error: any) {
      console.error('Error loading services:', error);
      setError('Failed to load services');
      toast.error(error.response?.data?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      if (!user?.companyId) return;
      const response = await api.get(`/crm/services/${user.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `services.${type === 'pdf' ? 'pdf' : 'csv'}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting services:', error);
      toast.error('Failed to export services. Please try again.');
    }
  };

  const handleAddEdit = async (service: Product | null) => {
    if (service) {
      // Fetch the latest service data when editing
      try {
        const updatedService = await crmService.getProduct(user?.companyId || '', service.id);
        setSelectedService(updatedService);
      } catch (error) {
        console.error('Error fetching service details:', error);
        toast.error('Failed to fetch service details');
        return;
      }
    } else {
      setSelectedService(null);
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setSelectedService(null);
    setShowModal(false);
  };

  const handleSave = async (service: Product) => {
    try {
      if (!user?.companyId) {
        toast.error('No company selected. Please select a company first.');
        return;
      }

      // Always set type to SERVICE
      const serviceData = {
        ...service,
        type: 'SERVICE' as const
      };
      
      if (selectedService) {
        await crmService.updateProduct(user.companyId, selectedService.id, serviceData);
        toast.success('Service updated successfully');
      } else {
        await crmService.createProduct(user.companyId, serviceData);
        toast.success('Service created successfully');
      }
      
      await loadServices();
      await fetchRecentActivities();
      setShowModal(false);
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast.error(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      if (!user?.companyId) {
        toast.error('No company selected. Please select a company first.');
        return;
      }
      
      await crmService.deleteProduct(user.companyId, serviceId);
      toast.success('Service deleted successfully');
      await loadServices();
      await fetchRecentActivities();
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast.error(error.response?.data?.message || 'Failed to delete service');
    }
  };

  const handleModalSuccess = () => {
    loadServices();
    fetchRecentActivities();
  };

  if (loading && services.length === 0) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ServiceModal
        show={showModal}
        onHide={handleClose}
        onSave={handleSave}
        service={selectedService}
      />
      {user?.companyId && (
        <ImportServiceModal
          show={showImportModal}
          onHide={() => setShowImportModal(false)}
          onSuccess={handleModalSuccess}
          companyId={user.companyId}
        />
      )}
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-0">Service Management</h1>
            <p className="text-muted mb-0">Manage and track all your service offerings and packages</p>
          </div>
          <div className="d-flex">
            <Dropdown className="me-2">
              <Dropdown.Toggle variant="outline-primary" id="export-dropdown">
                <FaFileExport className="me-2" /> Export
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleExport('pdf')}>
                  <FaFilePdf className="me-2" /> Export as PDF
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleExport('excel')}>
                  <FaFileExcel className="me-2" /> Export as Excel
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
              <FaFileImport className="me-2" /> Import
            </Button>
            <Button variant="primary" onClick={() => handleAddEdit(null)}>
              <FaPlus className="me-2" /> Add Service
            </Button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted mb-1">Total Services</div>
                    <h3 className="mb-0">{services.length}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FaGears className="text-primary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted mb-1">Active Services</div>
                    <h3 className="mb-0">{services.filter(p => p.status === 'Active').length}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <FaCheckCircle className="text-success" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted mb-1">Inactive/Archived</div>
                    <h3 className="mb-0">{services.filter(p => p.status !== 'Active').length}</h3>
                  </div>
                  <div className="bg-secondary bg-opacity-10 p-3 rounded">
                    <FaPauseCircle className="text-secondary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Services Table */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-end mb-3">
              <div className="btn-group">
                <Button
                  variant={statusFilter === 'All' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('All')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'Active' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('Active')}
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === 'Inactive' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('Inactive')}
                >
                  Inactive
                </Button>
                <Button
                  variant={statusFilter === 'Archived' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('Archived')}
                >
                  Archived
                </Button>
              </div>
            </div>
            <Table responsive hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div>
                          <div className="fw-bold">{service.name}</div>
                          <div className="text-muted small">{service.description.substring(0, 60)}...</div>
                        </div>
                      </div>
                    </td>
                    <td>{service.category}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {service.tiers.map(tier => (
                          <div key={tier.type} className="d-inline-flex align-items-center">
                            <Badge 
                              bg={
                                tier.type === 'BASIC' ? 'secondary' : 
                                tier.type === 'STANDARD' ? 'info' : 
                                'primary'
                              } 
                              className="d-flex align-items-center py-1 px-2 me-1"
                              style={{ fontSize: '0.7rem', fontWeight: 'normal' }}
                            >
                              <span className="fw-bold me-1" style={{ fontSize: '0.7rem' }}>
                                {tier.type.charAt(0)}
                              </span>
                              €{tier.price.toFixed(2)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Badge bg={
                        service.status === 'Active' ? 'success' :
                        service.status === 'Inactive' ? 'warning' :
                        'secondary'
                      }>
                        {service.status}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Button
                        variant="link"
                        className="p-0 me-3"
                        onClick={() => handleAddEdit(service)}
                        title="Edit Service"
                      >
                        <FaEdit className="text-primary" />
                      </Button>
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => handleDelete(service.id)}
                        title="Delete Service"
                      >
                        <FaTrash className="text-danger" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {services.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <div className="d-flex flex-column align-items-center">
                        <div className="bg-light p-4 rounded-circle mb-3">
                          <FaGears className="text-muted" size={32} />
                        </div>
                        <h5 className="text-muted mb-2">No Services Found</h5>
                        <p className="text-muted mb-4">Get started by adding your first service or importing data</p>
                        <div>
                          <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                            <FaFileImport className="me-2" /> Import Services
                          </Button>
                          <Button variant="primary" onClick={() => handleAddEdit(null)}>
                            <FaPlus className="me-2" /> Add Service
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            {loading && services.length > 0 && (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
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
              <div style={timelineStyles.timeline}>
                {recentActivities.map((activity: Activity, index: number) => (
                  <div key={index} style={timelineStyles.timelineItem} className="pb-3">
                    <div className="d-flex">
                      <div className="me-3">
                        <Badge bg="light" className="p-2">
                          {activity.type === 'added' ? (
                            <FaPlus className="text-success" />
                          ) : activity.type === 'updated' ? (
                            <FaEdit className="text-primary" />
                          ) : activity.type === 'removed' ? (
                            <FaTrash className="text-danger" />
                          ) : (
                            <FaEdit className="text-primary" />
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
      </div>
    </>
  );
};

export default Services;
