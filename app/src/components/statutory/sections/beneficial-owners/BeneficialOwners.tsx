import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BeneficialOwnerModal from './BeneficialOwnerModal';
import ImportBeneficialOwnerModal from './ImportBeneficialOwnerModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaUserShield, FaCheckCircle, FaTimesCircle, FaArchive, FaTrash, FaEye } from 'react-icons/fa';
import MainView from '../../../shared/MainView';
import { BeneficialOwner } from '../../../../services/statutory/types';
import { formatDDMMYYYY } from '../../../../utils';

const BeneficialOwners: React.FC = () => {
  const navigate = useNavigate();
  const [beneficialOwners, setBeneficialOwners] = useState<BeneficialOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Archived'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<BeneficialOwner | undefined>(undefined);

  useEffect(() => {
    fetchBeneficialOwners();
  }, [statusFilter]);

  const fetchBeneficialOwners = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/statutory/beneficial-owners/${user?.companyId}?status=${statusFilter}`);
      if (Array.isArray(response.data)) {
        setBeneficialOwners(response.data);
      } else {
        setBeneficialOwners([]);
        console.error('Expected array of beneficial owners but got:', response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to load beneficial owners');
      console.error('Error fetching beneficial owners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/statutory/beneficial-owners/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `beneficial-owners.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting beneficial owners:', error);
      alert('Failed to export beneficial owners. Please try again.');
    }
  };

  const handleAddOwner = () => {
    setSelectedOwner(undefined);
    setShowAddModal(true);
  };

  const handleEditOwner = (owner: BeneficialOwner) => {
    setSelectedOwner(owner);
    setShowAddModal(true);
  };

  const handleDeleteOwner = async (owner: BeneficialOwner) => {
    if (window.confirm(`Are you sure you want to delete ${owner.firstName} ${owner.lastName}? This action cannot be undone.`)) {
      try {
        await api.delete(`/statutory/beneficial-owners/${user?.companyId}/${owner.id}`);
        fetchBeneficialOwners();
      } catch (error) {
        console.error('Error deleting beneficial owner:', error);
        alert('Failed to delete beneficial owner. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchBeneficialOwners();
  };

  // Define summary cards
  const summaryCards = [
    {
      title: 'Total Beneficial Owners',
      value: beneficialOwners.length,
      icon: <FaUserShield className="text-primary" size={24} />,
      color: 'primary'
    },
    {
      title: 'Active Beneficial Owners',
      value: beneficialOwners.filter(o => o.status === 'Active').length,
      icon: <FaCheckCircle className="text-success" size={24} />,
      color: 'success'
    },
    {
      title: 'Inactive Beneficial Owners',
      value: beneficialOwners.filter(o => o.status === 'Inactive' || o.status === 'Archived').length,
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
      <Button variant="primary" onClick={handleAddOwner}>
        <FaPlus className="me-2" /> Add Beneficial Owner
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
              <th>Ownership</th>
              <th>Nature of Control</th>
              <th>Registration Date</th>
              <th>Status</th>
              {user?.roles?.includes('super_admin') && <th>Company</th>}
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {beneficialOwners.map((owner) => (
              <tr key={owner.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div>
                      <div className="fw-bold">{`${owner.title} ${owner.firstName} ${owner.lastName}`}</div>
                      <div className="text-muted small">{owner.nationality}</div>
                    </div>
                  </div>
                </td>
                <td>{owner.ownershipPercentage}%</td>
                <td>
                  {owner.natureOfControl.map((control, index) => (
                    <Badge bg="info" className="me-1 mb-1" key={index}>
                      {control}
                    </Badge>
                  ))}
                </td>
                <td>{formatDDMMYYYY(new Date(owner.registrationDate))}</td>
                <td>
                  <Badge 
                    bg={
                      owner.status === 'Active' 
                        ? 'success' 
                        : owner.status === 'Archived' 
                          ? 'warning' 
                          : 'secondary'
                    }
                  >
                    {owner.status}
                  </Badge>
                </td>
                {user?.roles?.includes('super_admin') && (
                  <td>{owner.company?.name || owner.company?.legalName}</td>
                )}
                <td className="text-end">
                  <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => navigate(`/statutory/beneficial-owners/${owner.id}`)}
                    title="View details"
                  >
                    <FaEye className="text-info" />
                  </Button>
                  <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => handleEditOwner(owner)}
                    title="Edit"
                  >
                    <FaEdit className="text-primary" />
                  </Button>
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => handleDeleteOwner(owner)}
                    title="Delete"
                  >
                    <FaTrash className="text-danger" />
                  </Button>
                </td>
              </tr>
            ))}
            {beneficialOwners.length === 0 && (
              <tr>
                <td colSpan={user?.roles?.includes('super_admin') ? 7 : 6} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center">
                    <div className="bg-light p-4 rounded-circle mb-3">
                      <FaUserShield className="text-muted" size={32} />
                    </div>
                    <h5 className="text-muted mb-2">No Beneficial Owners Found</h5>
                    <p className="text-muted mb-4">Get started by adding your first beneficial owner or importing data</p>
                    <div>
                      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                        <FaFileImport className="me-2" /> Import Beneficial Owners
                      </Button>
                      <Button variant="primary" onClick={handleAddOwner}>
                        <FaPlus className="me-2" /> Add Beneficial Owner
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
      <BeneficialOwnerModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        owner={selectedOwner}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportBeneficialOwnerModal
          show={showImportModal}
          onHide={() => setShowImportModal(false)}
          onSuccess={handleModalSuccess}
          companyId={user.companyId}
        />
      )}
      
      <MainView
        title="Beneficial Owners"
        description="Record and manage company beneficial owners and their details"
        entityType="beneficial-owner"
        summaryCards={summaryCards}
        renderTable={renderTable}
        renderActions={renderActions}
        renderFilters={renderFilters}
        handleExport={handleExport}
      />
    </>
  );
};

export default BeneficialOwners;
