import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShareModal from './ShareModal';
import ImportShareModal from './ImportShareModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaBookOpen, FaCheckCircle, FaTimesCircle, FaArchive, FaTrash, FaEye } from 'react-icons/fa';
import MainView from '../../../shared/MainView';
import { Share } from '../../../../services/statutory/types';

const Shares: React.FC = () => {
  const navigate = useNavigate();
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Archived'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedShare, setSelectedShare] = useState<Share | undefined>(undefined);

  useEffect(() => {
    fetchShares();
  }, [statusFilter]);

  const fetchShares = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/statutory/shares/${user?.companyId}?status=${statusFilter}`);
      if (Array.isArray(response.data)) {
        setShares(response.data);
      } else {
        setShares([]);
        console.error('Expected array of shares but got:', response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to load shares');
      console.error('Error fetching shares:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/statutory/shares/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shares.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting shares:', error);
      alert('Failed to export shares. Please try again.');
    }
  };

  const handleAddShare = () => {
    setSelectedShare(undefined);
    setShowAddModal(true);
  };

  const handleEditShare = (share: Share) => {
    setSelectedShare(share);
    setShowAddModal(true);
  };

  const handleDeleteShare = async (share: Share) => {
    if (window.confirm(`Are you sure you want to delete ${share.class} shares? This action cannot be undone.`)) {
      try {
        await api.delete(`/statutory/shares/${user?.companyId}/${share.id}`);
        fetchShares();
      } catch (error) {
        console.error('Error deleting share:', error);
        alert('Failed to delete share. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchShares();
  };

  // Define summary cards
  const summaryCards = [
    {
      title: 'Total Share Classes',
      value: shares.length,
      icon: <FaBookOpen className="text-primary" size={24} />,
      color: 'primary'
    },
    {
      title: 'Active Share Classes',
      value: shares.filter(s => s.status === 'Active').length,
      icon: <FaCheckCircle className="text-success" size={24} />,
      color: 'success'
    },
    {
      title: 'Inactive Share Classes',
      value: shares.filter(s => s.status === 'Inactive' || s.status === 'Archived').length,
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
      <Button variant="primary" onClick={handleAddShare}>
        <FaPlus className="me-2" /> Add Share Class
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
              <th>Share Class</th>
              <th>Type</th>
              <th>Nominal Value</th>
              <th>Total Issued</th>
              <th>Rights</th>
              <th>Status</th>
              {user?.roles?.includes('super_admin') && <th>Company</th>}
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shares.map((share) => (
              <tr key={share.id}>
                <td>
                  <div className="fw-bold">{share.class}</div>
                  <div className="text-muted small">{share.description}</div>
                </td>
                <td>{share.type}</td>
                <td>{share.currency} {share.nominalValue.toFixed(2)}</td>
                <td>{share.totalIssued}</td>
                <td>
                  <div>
                    <Badge bg={share.votingRights ? 'info' : 'light'} className="me-1">
                      {share.votingRights ? 'Voting' : 'Non-voting'}
                    </Badge>
                    <Badge bg={share.dividendRights ? 'info' : 'light'} className="me-1">
                      {share.dividendRights ? 'Dividend' : 'No dividend'}
                    </Badge>
                    <Badge bg={share.transferable ? 'info' : 'light'}>
                      {share.transferable ? 'Transferable' : 'Non-transferable'}
                    </Badge>
                  </div>
                </td>
                <td>
                  <Badge 
                    bg={
                      share.status === 'Active' 
                        ? 'success' 
                        : share.status === 'Archived' 
                          ? 'warning' 
                          : 'secondary'
                    }
                  >
                    {share.status}
                  </Badge>
                </td>
                {user?.roles?.includes('super_admin') && (
                  <td>{share.company?.name || share.company?.legalName}</td>
                )}
                <td className="text-end">
                  <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => navigate(`/statutory/shares/${share.id}`)}
                    title="View details"
                  >
                    <FaEye className="text-info" />
                  </Button>
                  <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => handleEditShare(share)}
                    title="Edit"
                  >
                    <FaEdit className="text-primary" />
                  </Button>
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => handleDeleteShare(share)}
                    title="Delete"
                  >
                    <FaTrash className="text-danger" />
                  </Button>
                </td>
              </tr>
            ))}
            {shares.length === 0 && (
              <tr>
                <td colSpan={user?.roles?.includes('super_admin') ? 8 : 7} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center">
                    <div className="bg-light p-4 rounded-circle mb-3">
                      <FaBookOpen className="text-muted" size={32} />
                    </div>
                    <h5 className="text-muted mb-2">No Share Classes Found</h5>
                    <p className="text-muted mb-4">Get started by adding your first share class or importing data</p>
                    <div>
                      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                        <FaFileImport className="me-2" /> Import Share Classes
                      </Button>
                      <Button variant="primary" onClick={handleAddShare}>
                        <FaPlus className="me-2" /> Add Share Class
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
      <ShareModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        share={selectedShare}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportShareModal
          show={showImportModal}
          onHide={() => setShowImportModal(false)}
          onSuccess={handleModalSuccess}
          companyId={user.companyId}
        />
      )}
      
      <MainView
        title="Share Register"
        description="Record and manage company share classes and their details"
        entityType="share"
        summaryCards={summaryCards}
        renderTable={renderTable}
        renderActions={renderActions}
        renderFilters={renderFilters}
        handleExport={handleExport}
      />
    </>
  );
};

export default Shares;
