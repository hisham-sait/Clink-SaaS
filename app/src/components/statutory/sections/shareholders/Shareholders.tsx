import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShareholderModal from './ShareholderModal';
import ImportShareholderModal from './ImportShareholderModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaPeopleArrows, FaUserCheck, FaUserSlash, FaTrash, FaEye } from 'react-icons/fa';
import MainView from '../../../shared/MainView';
import { Shareholder } from '../../../../services/statutory/types';
import { formatDDMMYYYY } from '../../../../utils';

const Shareholders: React.FC = () => {
  const navigate = useNavigate();
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedShareholder, setSelectedShareholder] = useState<Shareholder | undefined>(undefined);

  useEffect(() => {
    fetchShareholders();
  }, [statusFilter]);

  const fetchShareholders = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/statutory/shareholders/${user?.companyId}?status=${statusFilter}`);
      if (Array.isArray(response.data)) {
        setShareholders(response.data);
      } else {
        setShareholders([]);
        console.error('Expected array of shareholders but got:', response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to load shareholders');
      console.error('Error fetching shareholders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/statutory/shareholders/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shareholders.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting shareholders:', error);
      alert('Failed to export shareholders. Please try again.');
    }
  };

  const handleAddShareholder = () => {
    setSelectedShareholder(undefined);
    setShowAddModal(true);
  };

  const handleEditShareholder = (shareholder: Shareholder) => {
    setSelectedShareholder(shareholder);
    setShowAddModal(true);
  };

  const handleDeleteShareholder = async (shareholder: Shareholder) => {
    if (window.confirm(`Are you sure you want to delete ${shareholder.firstName} ${shareholder.lastName}? This action cannot be undone.`)) {
      try {
        await api.delete(`/statutory/shareholders/${user?.companyId}/${shareholder.id}`);
        fetchShareholders();
      } catch (error) {
        console.error('Error deleting shareholder:', error);
        alert('Failed to delete shareholder. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchShareholders();
  };

  // Define summary cards
  const summaryCards = [
    {
      title: 'Total Members',
      value: shareholders.length,
      icon: <FaPeopleArrows className="text-primary" size={24} />,
      color: 'primary'
    },
    {
      title: 'Active Members',
      value: shareholders.filter(s => s.status === 'Active').length,
      icon: <FaUserCheck className="text-success" size={24} />,
      color: 'success'
    },
    {
      title: 'Inactive Members',
      value: shareholders.filter(s => s.status === 'Inactive').length,
      icon: <FaUserSlash className="text-secondary" size={24} />,
      color: 'secondary'
    }
  ];

  // Define action buttons
  const renderActions = () => (
    <>
      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
        <FaFileImport className="me-2" /> Import
      </Button>
      <Button variant="primary" onClick={handleAddShareholder}>
        <FaPlus className="me-2" /> Add Member
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
              <th>Shares</th>
              <th>Date Acquired</th>
              <th>Status</th>
              {user?.roles?.includes('super_admin') && <th>Company</th>}
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shareholders.map((shareholder) => (
              <tr key={shareholder.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div>
                      <div className="fw-bold">{`${shareholder.title} ${shareholder.firstName} ${shareholder.lastName}`}</div>
                      <div className="text-muted small">{shareholder.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div>Ordinary: {shareholder.ordinaryShares}</div>
                  <div>Preferential: {shareholder.preferentialShares}</div>
                </td>
                <td>{formatDDMMYYYY(new Date(shareholder.dateAcquired))}</td>
                <td>
                  <Badge bg={shareholder.status === 'Active' ? 'success' : 'secondary'}>
                    {shareholder.status}
                  </Badge>
                </td>
                {user?.roles?.includes('super_admin') && (
                  <td>{shareholder.company?.name || shareholder.company?.legalName}</td>
                )}
                <td className="text-end">
                  <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => navigate(`/statutory/shareholders/${shareholder.id}`)}
                    title="View details"
                  >
                    <FaEye className="text-info" />
                  </Button>
                  <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => handleEditShareholder(shareholder)}
                    title="Edit"
                  >
                    <FaEdit className="text-primary" />
                  </Button>
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => handleDeleteShareholder(shareholder)}
                    title="Delete"
                  >
                    <FaTrash className="text-danger" />
                  </Button>
                </td>
              </tr>
            ))}
            {shareholders.length === 0 && (
              <tr>
                <td colSpan={user?.roles?.includes('super_admin') ? 6 : 5} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center">
                    <div className="bg-light p-4 rounded-circle mb-3">
                      <FaPeopleArrows className="text-muted" size={32} />
                    </div>
                    <h5 className="text-muted mb-2">No Members Found</h5>
                    <p className="text-muted mb-4">Get started by adding your first member or importing data</p>
                    <div>
                      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                        <FaFileImport className="me-2" /> Import Members
                      </Button>
                      <Button variant="primary" onClick={handleAddShareholder}>
                        <FaPlus className="me-2" /> Add Member
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
      <ShareholderModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        shareholder={selectedShareholder}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportShareholderModal
          show={showImportModal}
          onHide={() => setShowImportModal(false)}
          onSuccess={handleModalSuccess}
          companyId={user.companyId}
        />
      )}
      
      <MainView
        title="Members Register"
        description="Record and manage company members and their shareholdings"
        entityType="shareholder"
        summaryCards={summaryCards}
        renderTable={renderTable}
        renderActions={renderActions}
        renderFilters={renderFilters}
        handleExport={handleExport}
      />
    </>
  );
};

export default Shareholders;
