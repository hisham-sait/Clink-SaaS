import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaBuilding, FaCheckCircle, FaTimesCircle, FaTrash } from 'react-icons/fa';
import * as crmService from '../../../../services/crm';
import api from '../../../../services/api';
import { Client } from '../../types';
import { useAuth } from '../../../../contexts/AuthContext';
import ClientModal from './ClientModal';
import ImportClientModal from './ImportClientModal';
import MainView, { ActionButton, StatusBadge } from '../../../shared/MainView';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Archived'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);

  useEffect(() => {
    fetchClients();
  }, [statusFilter]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      if (user?.companyId) {
        const clients = await crmService.getClients(user.companyId, statusFilter);
        setClients(clients);
        setError('');
      }
    } catch (err) {
      setError('Failed to load clients');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/crm/clients/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clients.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting clients:', error);
      alert('Failed to export clients. Please try again.');
    }
  };

  const handleAddClient = () => {
    setSelectedClient(undefined);
    setShowAddModal(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowAddModal(true);
  };

  const handleDeleteClient = async (client: Client) => {
    if (window.confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
      try {
        await api.delete(`/crm/clients/${user?.companyId}/${client.id}`);
        fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Failed to delete client. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchClients();
  };

  // Define summary cards
  const summaryCards = [
    {
      title: 'Total Clients',
      value: clients.length,
      icon: <FaBuilding className="text-primary" size={24} />,
      color: 'primary'
    },
    {
      title: 'Active Clients',
      value: clients.filter(c => c.status === 'Active').length,
      icon: <FaCheckCircle className="text-success" size={24} />,
      color: 'success'
    },
    {
      title: 'Inactive/Archived',
      value: clients.filter(c => c.status !== 'Active').length,
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
      <Button variant="primary" onClick={handleAddClient}>
        <FaPlus className="me-2" /> Add Client
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
              <th>Last Contact</th>
              <th>Revenue</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div>
                      <div className="fw-bold">{client.name}</div>
                      <div className="text-muted small">{client.website}</div>
                    </div>
                  </div>
                </td>
                <td>{client.industry}</td>
                <td>{client.type.join(', ')}</td>
                <td>{new Date(client.lastContact).toLocaleDateString('en-IE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}</td>
                <td>{client.revenue}</td>
                <td>
                  <StatusBadge status={client.status} />
                </td>
                <td className="text-end">
                  <ActionButton
                    icon={<FaEdit className="text-primary" />}
                    onClick={() => handleEditClient(client)}
                    tooltip="Edit Client"
                  />
                  <ActionButton
                    icon={<FaTrash className="text-danger" />}
                    onClick={() => handleDeleteClient(client)}
                    tooltip="Delete Client"
                  />
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center">
                    <div className="bg-light p-4 rounded-circle mb-3">
                      <FaBuilding className="text-muted" size={32} />
                    </div>
                    <h5 className="text-muted mb-2">No Clients Found</h5>
                    <p className="text-muted mb-4">Get started by adding your first client or importing data</p>
                    <div>
                      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                        <FaFileImport className="me-2" /> Import Clients
                      </Button>
                      <Button variant="primary" onClick={handleAddClient}>
                        <FaPlus className="me-2" /> Add Client
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
      <ClientModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        client={selectedClient}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportClientModal
          show={showImportModal}
          onHide={() => setShowImportModal(false)}
          onSuccess={handleModalSuccess}
          companyId={user.companyId}
        />
      )}
      
      <MainView
        title="Client Management"
        description="Manage and track all your business clients"
        entityType="client"
        summaryCards={summaryCards}
        renderTable={renderTable}
        renderActions={renderActions}
        renderFilters={renderFilters}
        handleExport={handleExport}
      />
    </>
  );
};

export default Clients;
