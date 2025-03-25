import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChargeModal from './ChargeModal';
import ImportChargeModal from './ImportChargeModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaLandmark, FaCheckCircle, FaTimesCircle, FaUnlock, FaTrash, FaEye } from 'react-icons/fa';
import MainView from '../../../shared/MainView';
import { Charge } from '../../../../services/statutory/types';
import { formatDDMMYYYY } from '../../../../utils';

const Charges: React.FC = () => {
  const navigate = useNavigate();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Satisfied' | 'Released'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<Charge | undefined>(undefined);

  useEffect(() => {
    fetchCharges();
  }, [statusFilter]);

  const fetchCharges = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/statutory/charges/${user?.companyId}?status=${statusFilter}`);
      if (Array.isArray(response.data)) {
        setCharges(response.data);
      } else {
        setCharges([]);
        console.error('Expected array of charges but got:', response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to load charges');
      console.error('Error fetching charges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/statutory/charges/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `charges.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting charges:', error);
      alert('Failed to export charges. Please try again.');
    }
  };

  const handleAddCharge = () => {
    setSelectedCharge(undefined);
    setShowAddModal(true);
  };

  const handleEditCharge = (charge: Charge) => {
    setSelectedCharge(charge);
    setShowAddModal(true);
  };

  const handleDeleteCharge = async (charge: Charge) => {
    if (window.confirm(`Are you sure you want to delete this charge? This action cannot be undone.`)) {
      try {
        await api.delete(`/statutory/charges/${user?.companyId}/${charge.id}`);
        fetchCharges();
      } catch (error) {
        console.error('Error deleting charge:', error);
        alert('Failed to delete charge. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchCharges();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Define summary cards
  const summaryCards = [
    {
      title: 'Total Charges',
      value: charges.length,
      icon: <FaLandmark className="text-primary" size={24} />,
      color: 'primary'
    },
    {
      title: 'Active Charges',
      value: charges.filter(c => c.status === 'Active').length,
      icon: <FaCheckCircle className="text-success" size={24} />,
      color: 'success'
    },
    {
      title: 'Satisfied Charges',
      value: charges.filter(c => c.status === 'Satisfied' || c.status === 'Released').length,
      icon: <FaUnlock className="text-secondary" size={24} />,
      color: 'secondary'
    }
  ];

  // Define action buttons
  const renderActions = () => (
    <>
      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
        <FaFileImport className="me-2" /> Import
      </Button>
      <Button variant="primary" onClick={handleAddCharge}>
        <FaPlus className="me-2" /> Add Charge
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
        variant={statusFilter === 'Satisfied' ? 'primary' : 'outline-primary'}
        onClick={() => setStatusFilter('Satisfied')}
      >
        Satisfied
      </Button>
      <Button
        variant={statusFilter === 'Released' ? 'primary' : 'outline-primary'}
        onClick={() => setStatusFilter('Released')}
      >
        Released
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
              <th>Charge ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Date Created</th>
              <th>Registration Date</th>
              <th>Status</th>
              {user?.roles?.includes('super_admin') && <th>Company</th>}
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {charges.map((charge) => (
              <tr key={charge.id}>
                <td>
                  <div className="fw-bold">{charge.chargeId}</div>
                  <div className="text-muted small">{charge.description}</div>
                </td>
                <td>{charge.chargeType}</td>
                <td>{formatCurrency(charge.amount)}</td>
                <td>{formatDDMMYYYY(new Date(charge.dateCreated))}</td>
                <td>{formatDDMMYYYY(new Date(charge.registrationDate))}</td>
                <td>
                  <Badge 
                    bg={
                      charge.status === 'Active' 
                        ? 'success' 
                        : charge.status === 'Satisfied' 
                          ? 'info' 
                          : 'secondary'
                    }
                  >
                    {charge.status}
                  </Badge>
                </td>
                {user?.roles?.includes('super_admin') && (
                  <td>{charge.company?.name || charge.company?.legalName}</td>
                )}
                <td className="text-end">
                  <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => navigate(`/statutory/charges/${charge.id}`)}
                    title="View details"
                  >
                    <FaEye className="text-info" />
                  </Button>
                  <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => handleEditCharge(charge)}
                    title="Edit"
                  >
                    <FaEdit className="text-primary" />
                  </Button>
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => handleDeleteCharge(charge)}
                    title="Delete"
                  >
                    <FaTrash className="text-danger" />
                  </Button>
                </td>
              </tr>
            ))}
            {charges.length === 0 && (
              <tr>
                <td colSpan={user?.roles?.includes('super_admin') ? 8 : 7} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center">
                    <div className="bg-light p-4 rounded-circle mb-3">
                      <FaLandmark className="text-muted" size={32} />
                    </div>
                    <h5 className="text-muted mb-2">No Charges Found</h5>
                    <p className="text-muted mb-4">Get started by adding your first charge or importing data</p>
                    <div>
                      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                        <FaFileImport className="me-2" /> Import Charges
                      </Button>
                      <Button variant="primary" onClick={handleAddCharge}>
                        <FaPlus className="me-2" /> Add Charge
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
      <ChargeModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        charge={selectedCharge}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportChargeModal
          show={showImportModal}
          onHide={() => setShowImportModal(false)}
          onSuccess={handleModalSuccess}
          companyId={user.companyId}
        />
      )}
      
      <MainView
        title="Charges Register"
        description="Record and manage company charges and securities"
        entityType="charge"
        summaryCards={summaryCards}
        renderTable={renderTable}
        renderActions={renderActions}
        renderFilters={renderFilters}
        handleExport={handleExport}
      />
    </>
  );
};

export default Charges;
