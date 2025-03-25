import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaBuilding, FaCheckCircle, FaTimesCircle, FaTrash, FaStar } from 'react-icons/fa';
import * as crmService from '../../../../services/crm';
import api from '../../../../services/api';
import { Organisation } from '../../types';
import { useAuth } from '../../../../contexts/AuthContext';
import OrganisationModal from './OrganisationModal';
import ImportOrganisationModal from './ImportOrganisationModal';
import MainView, { ActionButton, StatusBadge } from '../../../shared/MainView';

const Organisations: React.FC = () => {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Archived'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedOrganisation, setSelectedOrganisation] = useState<Organisation | undefined>(undefined);

  useEffect(() => {
    fetchOrganisations();
  }, [statusFilter]);

  const fetchOrganisations = async () => {
    try {
      setLoading(true);
      if (user?.companyId) {
        const organisations = await crmService.getOrganisations(user.companyId, statusFilter);
        setOrganisations(organisations);
        setError('');
      }
    } catch (err) {
      setError('Failed to load organisations');
      console.error('Error fetching organisations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/crm/organisations/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `organisations.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting organisations:', error);
      alert('Failed to export organisations. Please try again.');
    }
  };

  const handleAddOrganisation = () => {
    setSelectedOrganisation(undefined);
    setShowAddModal(true);
  };

  const handleEditOrganisation = (organisation: Organisation) => {
    setSelectedOrganisation(organisation);
    setShowAddModal(true);
  };

  const handleDeleteOrganisation = async (organisation: Organisation) => {
    if (window.confirm(`Are you sure you want to delete ${organisation.name}? This action cannot be undone.`)) {
      try {
        await api.delete(`/crm/organisations/${user?.companyId}/${organisation.id}`);
        fetchOrganisations();
      } catch (error) {
        console.error('Error deleting organisation:', error);
        alert('Failed to delete organisation. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchOrganisations();
  };

  const renderRating = (rating?: number) => {
    if (!rating) return '-';
    return [...Array(rating)].map((_, i) => (
      <FaStar key={i} className="text-warning" />
    ));
  };

  // Define summary cards
  const summaryCards = [
    {
      title: 'Total Organisations',
      value: organisations.length,
      icon: <FaBuilding className="text-primary" size={24} />,
      color: 'primary'
    },
    {
      title: 'Active Organisations',
      value: organisations.filter(o => o.status === 'Active').length,
      icon: <FaCheckCircle className="text-success" size={24} />,
      color: 'success'
    },
    {
      title: 'Inactive/Archived',
      value: organisations.filter(o => o.status !== 'Active').length,
      icon: <FaTimesCircle className="text-secondary" size={24} />,
      color: 'secondary'
    }
  ];

  // Define action buttons
  const renderActions = () => (
    <>
      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
        <FaFileImport className="me-2" /> Import
      </Button>
      <Button variant="primary" onClick={handleAddOrganisation}>
        <FaPlus className="me-2" /> Add Organisation
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
              <th>Industry</th>
              <th>Type</th>
              <th>Rating</th>
              <th>Last Contact</th>
              <th>Next Follow-up</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {organisations.map((organisation) => (
              <tr key={organisation.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div>
                      <div className="fw-bold">{organisation.name}</div>
                      <div className="text-muted small">
                        {organisation.email}
                        {organisation.phone && <span className="ms-2">{organisation.phone}</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {organisation.industry}
                  {organisation.subIndustry && (
                    <div className="text-muted small">{organisation.subIndustry}</div>
                  )}
                </td>
                <td>{organisation.type.join(', ')}</td>
                <td>{renderRating(organisation.rating)}</td>
                <td>{organisation.lastContact ? new Date(organisation.lastContact).toLocaleDateString('en-IE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) : '-'}</td>
                <td>{organisation.nextFollowUp ? new Date(organisation.nextFollowUp).toLocaleDateString('en-IE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) : '-'}</td>
                <td>
                  <StatusBadge status={organisation.status} />
                </td>
                <td className="text-end">
                  <ActionButton
                    icon={<FaEdit className="text-primary" />}
                    onClick={() => handleEditOrganisation(organisation)}
                    tooltip="Edit Organisation"
                  />
                  <ActionButton
                    icon={<FaTrash className="text-danger" />}
                    onClick={() => handleDeleteOrganisation(organisation)}
                    tooltip="Delete Organisation"
                  />
                </td>
              </tr>
            ))}
            {organisations.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center">
                    <div className="bg-light p-4 rounded-circle mb-3">
                      <FaBuilding className="text-muted" size={32} />
                    </div>
                    <h5 className="text-muted mb-2">No Organisations Found</h5>
                    <p className="text-muted mb-4">Get started by adding your first organisation or importing data</p>
                    <div>
                      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                        <FaFileImport className="me-2" /> Import Organisations
                      </Button>
                      <Button variant="primary" onClick={handleAddOrganisation}>
                        <FaPlus className="me-2" /> Add Organisation
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
      <OrganisationModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        organisation={selectedOrganisation}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportOrganisationModal
          show={showImportModal}
          onHide={() => setShowImportModal(false)}
          onSuccess={handleModalSuccess}
          companyId={user.companyId}
        />
      )}
      
      <MainView
        title="Organisation Management"
        description="Manage and track all your business organisations"
        entityType="organisation"
        summaryCards={summaryCards}
        renderTable={renderTable}
        renderActions={renderActions}
        renderFilters={renderFilters}
        handleExport={handleExport}
      />
    </>
  );
};

export default Organisations;
