import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaCheckCircle, FaPauseCircle, FaTrash } from 'react-icons/fa';
import { FaGears } from 'react-icons/fa6';
import * as crmService from '../../../../services/crm';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Product } from '../../types';
import ServiceModal from './ServiceModal';
import ImportServiceModal from './ImportServiceModal';
import MainView, { ActionButton, StatusBadge } from '../../../shared/MainView';
import { toast } from 'react-toastify';

const Services: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [services, setServices] = useState<Product[]>([]);
  const [selectedService, setSelectedService] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Archived'>('All');

  useEffect(() => {
    if (user?.companyId) {
      loadServices();
    }
  }, [user?.companyId, statusFilter]);

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
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast.error(error.response?.data?.message || 'Failed to delete service');
    }
  };

  const handleModalSuccess = () => {
    loadServices();
  };

  // Define summary cards
  const summaryCards = [
    {
      title: 'Total Services',
      value: services.length,
      icon: <FaGears className="text-primary" size={24} />,
      color: 'primary'
    },
    {
      title: 'Active Services',
      value: services.filter(p => p.status === 'Active').length,
      icon: <FaCheckCircle className="text-success" size={24} />,
      color: 'success'
    },
    {
      title: 'Inactive/Archived',
      value: services.filter(p => p.status !== 'Active').length,
      icon: <FaPauseCircle className="text-secondary" size={24} />,
      color: 'secondary'
    }
  ];

  // Define action buttons
  const renderActions = () => (
    <>
      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
        <FaFileImport className="me-2" /> Import
      </Button>
      <Button variant="primary" onClick={() => handleAddEdit(null)}>
        <FaPlus className="me-2" /> Add Service
      </Button>
    </>
  );

  // Define filters
  const renderFilters = () => (
    <ButtonGroup>
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
    </ButtonGroup>
  );

  // Define table rendering
  const renderTable = () => (
    <>
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
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
                  <StatusBadge status={service.status} />
                </td>
                <td className="text-end">
                  <ActionButton
                    icon={<FaEdit className="text-primary" />}
                    onClick={() => handleAddEdit(service)}
                    tooltip="Edit Service"
                  />
                  <ActionButton
                    icon={<FaTrash className="text-danger" />}
                    onClick={() => handleDelete(service.id)}
                    tooltip="Delete Service"
                  />
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
      )}
    </>
  );

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
      
      <MainView
        title="Service Management"
        description="Manage and track all your service offerings and packages"
        entityType="service"
        summaryCards={summaryCards}
        renderTable={renderTable}
        renderActions={renderActions}
        renderFilters={renderFilters}
        handleExport={handleExport}
      />
    </>
  );
};

export default Services;
