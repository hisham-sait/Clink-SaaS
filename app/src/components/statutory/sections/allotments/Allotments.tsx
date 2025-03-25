import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AllotmentModal from './AllotmentModal';
import ImportAllotmentModal from './ImportAllotmentModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaCertificate, FaCheckCircle, FaTimesCircle, FaTrash, FaEye } from 'react-icons/fa';
import MainView from '../../../shared/MainView';
import { Allotment } from '../../../../services/statutory/types';
import { formatDDMMYYYY } from '../../../../utils';

const Allotments: React.FC = () => {
  const navigate = useNavigate();
  const [allotments, setAllotments] = useState<Allotment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Cancelled'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedAllotment, setSelectedAllotment] = useState<Allotment | undefined>(undefined);

  useEffect(() => {
    fetchAllotments();
  }, [statusFilter]);

  const fetchAllotments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/statutory/allotments/${user?.companyId}?status=${statusFilter}`);
      if (Array.isArray(response.data)) {
        setAllotments(response.data);
      } else {
        setAllotments([]);
        console.error('Expected array of allotments but got:', response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to load allotments');
      console.error('Error fetching allotments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/statutory/allotments/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `allotments.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting allotments:', error);
      alert('Failed to export allotments. Please try again.');
    }
  };

  const handleAddAllotment = () => {
    setSelectedAllotment(undefined);
    setShowAddModal(true);
  };

  const handleEditAllotment = (allotment: Allotment) => {
    setSelectedAllotment(allotment);
    setShowAddModal(true);
  };

  const handleDeleteAllotment = async (allotment: Allotment) => {
    if (window.confirm(`Are you sure you want to delete this allotment? This action cannot be undone.`)) {
      try {
        await api.delete(`/statutory/allotments/${user?.companyId}/${allotment.id}`);
        fetchAllotments();
      } catch (error) {
        console.error('Error deleting allotment:', error);
        alert('Failed to delete allotment. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchAllotments();
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
      title: 'Total Allotments',
      value: allotments.length,
      icon: <FaCertificate className="text-primary" size={24} />,
      color: 'primary'
    },
    {
      title: 'Active Allotments',
      value: allotments.filter(a => a.status === 'Active').length,
      icon: <FaCheckCircle className="text-success" size={24} />,
      color: 'success'
    },
    {
      title: 'Cancelled Allotments',
      value: allotments.filter(a => a.status === 'Cancelled').length,
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
      <Button variant="primary" onClick={handleAddAllotment}>
        <FaPlus className="me-2" /> Add Allotment
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
        variant={statusFilter === 'Cancelled' ? 'primary' : 'outline-primary'}
        onClick={() => setStatusFilter('Cancelled')}
      >
        Cancelled
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
              <th>Allotment ID</th>
              <th>Share Class</th>
              <th>Shares</th>
              <th>Allottee</th>
              <th>Allotment Date</th>
              <th>Payment Status</th>
              <th>Status</th>
              {user?.roles?.includes('super_admin') && <th>Company</th>}
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allotments.map((allotment) => (
              <tr key={allotment.id}>
                <td>
                  <div className="fw-bold">{allotment.allotmentId}</div>
                  <div className="text-muted small">
                    {allotment.certificateNumber && `Certificate: ${allotment.certificateNumber}`}
                  </div>
                </td>
                <td>{allotment.shareClass}</td>
                <td>
                  <div>{allotment.numberOfShares} shares</div>
                  <div className="text-muted small">
                    {formatCurrency(allotment.pricePerShare)} per share
                  </div>
                </td>
                <td>{allotment.allottee}</td>
                <td>{formatDDMMYYYY(new Date(allotment.allotmentDate))}</td>
                <td>
                  <Badge 
                    bg={
                      allotment.paymentStatus === 'Paid' 
                        ? 'success' 
                        : allotment.paymentStatus === 'Partially Paid' 
                          ? 'warning' 
                          : 'secondary'
                    }
                  >
                    {allotment.paymentStatus}
                  </Badge>
                  {allotment.paymentStatus !== 'Pending' && allotment.amountPaid && (
                    <div className="text-muted small">
                      {formatCurrency(allotment.amountPaid)}
                      {allotment.paymentDate && ` on ${formatDDMMYYYY(new Date(allotment.paymentDate))}`}
                    </div>
                  )}
                </td>
                <td>
                  <Badge 
                    bg={allotment.status === 'Active' ? 'success' : 'secondary'}
                  >
                    {allotment.status}
                  </Badge>
                </td>
                {user?.roles?.includes('super_admin') && (
                  <td>{allotment.company?.name || allotment.company?.legalName}</td>
                )}
                <td className="text-end">
                  <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => navigate(`/statutory/allotments/${allotment.id}`)}
                    title="View details"
                  >
                    <FaEye className="text-info" />
                  </Button>
                  <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => handleEditAllotment(allotment)}
                    title="Edit"
                  >
                    <FaEdit className="text-primary" />
                  </Button>
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => handleDeleteAllotment(allotment)}
                    title="Delete"
                  >
                    <FaTrash className="text-danger" />
                  </Button>
                </td>
              </tr>
            ))}
            {allotments.length === 0 && (
              <tr>
                <td colSpan={user?.roles?.includes('super_admin') ? 9 : 8} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center">
                    <div className="bg-light p-4 rounded-circle mb-3">
                      <FaCertificate className="text-muted" size={32} />
                    </div>
                    <h5 className="text-muted mb-2">No Allotments Found</h5>
                    <p className="text-muted mb-4">Get started by adding your first allotment or importing data</p>
                    <div>
                      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                        <FaFileImport className="me-2" /> Import Allotments
                      </Button>
                      <Button variant="primary" onClick={handleAddAllotment}>
                        <FaPlus className="me-2" /> Add Allotment
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
      <AllotmentModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        allotment={selectedAllotment}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportAllotmentModal
          show={showImportModal}
          onHide={() => setShowImportModal(false)}
          onSuccess={handleModalSuccess}
          companyId={user.companyId}
        />
      )}
      
      <MainView
        title="Share Allotments"
        description="Record and manage company share allotments"
        entityType="allotment"
        summaryCards={summaryCards}
        renderTable={renderTable}
        renderActions={renderActions}
        renderFilters={renderFilters}
        handleExport={handleExport}
      />
    </>
  );
};

export default Allotments;
