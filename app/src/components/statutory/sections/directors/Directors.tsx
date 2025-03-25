import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DirectorModal from './DirectorModal';
import ResignDirectorModal from './ResignDirectorModal';
import ImportDirectorModal from './ImportDirectorModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaSignOutAlt, FaFileImport, FaUsers, FaUserCheck, FaUserMinus, FaTrash, FaEye } from 'react-icons/fa';
import MainView from '../../../shared/MainView';
import { Director } from '../../../../services/statutory/types';
import { formatDDMMYYYY } from '../../../../utils';

const Directors: React.FC = () => {
  const navigate = useNavigate();
  const [directors, setDirectors] = useState<Director[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Resigned'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState<Director | undefined>(undefined);

  useEffect(() => {
    fetchDirectors();
  }, [statusFilter]); // Refresh when status filter changes

  const fetchDirectors = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/statutory/directors/${user?.companyId}?status=${statusFilter}`);
      if (Array.isArray(response.data)) {
        setDirectors(response.data);
      } else {
        setDirectors([]);
        console.error('Expected array of directors but got:', response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to load directors');
      console.error('Error fetching directors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/statutory/directors/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `directors.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting directors:', error);
      alert('Failed to export directors. Please try again.');
    }
  };

  const handleAddDirector = () => {
    setSelectedDirector(undefined);
    setShowAddModal(true);
  };

  const handleEditDirector = (director: Director) => {
    setSelectedDirector(director);
    setShowAddModal(true);
  };

  const handleResignDirector = (director: Director) => {
    setSelectedDirector(director);
    setShowResignModal(true);
  };

  const handleDeleteDirector = async (director: Director) => {
    if (window.confirm(`Are you sure you want to delete ${director.firstName} ${director.lastName}? This action cannot be undone.`)) {
      try {
        await api.delete(`/statutory/directors/${user?.companyId}/${director.id}`);
        fetchDirectors();
      } catch (error) {
        console.error('Error deleting director:', error);
        alert('Failed to delete director. Please try again.');
      }
    }
  };

  const handleConfirmResign = async (resignationDate: string) => {
    try {
      await api.post(`/statutory/directors/${user?.companyId}/${selectedDirector?.id}/resign`, {
        resignationDate
      });
      setShowResignModal(false);
      fetchDirectors();
    } catch (err) {
      setError('Failed to resign director');
      console.error('Error resigning director:', err);
    }
  };

  const handleModalSuccess = () => {
    fetchDirectors();
  };

  // Define summary cards
  const summaryCards = [
    {
      title: 'Total Directors',
      value: directors.length,
      icon: <FaUsers className="text-primary" size={24} />,
      color: 'primary'
    },
    {
      title: 'Active Directors',
      value: directors.filter(d => d.status === 'Active').length,
      icon: <FaUserCheck className="text-success" size={24} />,
      color: 'success'
    },
    {
      title: 'Resigned Directors',
      value: directors.filter(d => d.status === 'Resigned').length,
      icon: <FaUserMinus className="text-secondary" size={24} />,
      color: 'secondary'
    }
  ];

  // Define action buttons
  const renderActions = () => (
    <>
      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
        <FaFileImport className="me-2" /> Import
      </Button>
      <Button variant="primary" onClick={handleAddDirector}>
        <FaPlus className="me-2" /> Add Director
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
        variant={statusFilter === 'Resigned' ? 'primary' : 'outline-primary'}
        onClick={() => setStatusFilter('Resigned')}
      >
        Resigned
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
              <th>Type</th>
              <th>Appointment Date</th>
              <th>Status</th>
              {user?.roles?.includes('super_admin') && <th>Company</th>}
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {directors.map((director) => (
              <tr key={director.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div>
                      <div className="fw-bold">{`${director.title} ${director.firstName} ${director.lastName}`}</div>
                      <div className="text-muted small">{director.occupation}</div>
                    </div>
                  </div>
                </td>
                <td>{director.directorType}</td>
                <td>{formatDDMMYYYY(new Date(director.appointmentDate))}</td>
                <td>
                  <Badge bg={director.status === 'Active' ? 'success' : 'secondary'}>
                    {director.status}
                  </Badge>
                </td>
                {user?.roles?.includes('super_admin') && (
                  <td>{director.company?.name || director.company?.legalName}</td>
                )}
                <td className="text-end">
                  <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => navigate(`/statutory/directors/${director.id}`)}
                    title="View details"
                  >
                    <FaEye className="text-info" />
                  </Button>
                  <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => handleEditDirector(director)}
                    title="Edit"
                  >
                    <FaEdit className="text-primary" />
                  </Button>
                  {director.status === 'Active' && (
                    <>
                      <Button
                        variant="link"
                        className="p-0 me-3"
                        onClick={() => handleResignDirector(director)}
                        title="Resign"
                      >
                        <FaSignOutAlt className="text-danger" />
                      </Button>
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => handleDeleteDirector(director)}
                        title="Delete"
                      >
                        <FaTrash className="text-danger" />
                      </Button>
                    </>
                  )}
                  {director.status === 'Resigned' && (
                    <Button
                      variant="link"
                      className="p-0"
                      onClick={() => handleDeleteDirector(director)}
                      title="Delete"
                    >
                      <FaTrash className="text-danger" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {directors.length === 0 && (
              <tr>
                <td colSpan={user?.roles?.includes('super_admin') ? 6 : 5} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center">
                    <div className="bg-light p-4 rounded-circle mb-3">
                      <FaUsers className="text-muted" size={32} />
                    </div>
                    <h5 className="text-muted mb-2">No Directors Found</h5>
                    <p className="text-muted mb-4">Get started by adding your first director or importing data</p>
                    <div>
                      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                        <FaFileImport className="me-2" /> Import Directors
                      </Button>
                      <Button variant="primary" onClick={handleAddDirector}>
                        <FaPlus className="me-2" /> Add Director
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
      <DirectorModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        director={selectedDirector}
        onSuccess={handleModalSuccess}
      />
      {selectedDirector && (
        <ResignDirectorModal
          show={showResignModal}
          onHide={() => setShowResignModal(false)}
          director={selectedDirector}
          onConfirm={handleConfirmResign}
        />
      )}
      {user?.companyId && (
        <ImportDirectorModal
          show={showImportModal}
          onHide={() => setShowImportModal(false)}
          onSuccess={handleModalSuccess}
          companyId={user.companyId}
        />
      )}
      
      <MainView
        title="Directors & Secretaries"
        description="Record and manage company directors, secretaries and their details"
        entityType="director"
        summaryCards={summaryCards}
        renderTable={renderTable}
        renderActions={renderActions}
        renderFilters={renderFilters}
        handleExport={handleExport}
      />
    </>
  );
};

export default Directors;
