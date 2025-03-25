import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BoardMinuteModal from './BoardMinuteModal';
import ImportBoardMinuteModal from './ImportBoardMinuteModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaFile, FaFileSignature, FaTrash, FaEye } from 'react-icons/fa';
import MainView from '../../../shared/MainView';
import { BoardMinute } from '../../../../services/statutory/types';
import { formatDDMMYYYY } from '../../../../utils';

const BoardMinutes: React.FC = () => {
  const navigate = useNavigate();
  const [boardMinutes, setBoardMinutes] = useState<BoardMinute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Final' | 'Signed'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedMinute, setSelectedMinute] = useState<BoardMinute | undefined>(undefined);

  useEffect(() => {
    fetchBoardMinutes();
  }, [statusFilter]);

  const fetchBoardMinutes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/statutory/board-minutes/${user?.companyId}?status=${statusFilter}`);
      if (Array.isArray(response.data)) {
        setBoardMinutes(response.data);
      } else {
        setBoardMinutes([]);
        console.error('Expected array of board minutes but got:', response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to load board minutes');
      console.error('Error fetching board minutes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/statutory/board-minutes/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `board-minutes.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting board minutes:', error);
      alert('Failed to export board minutes. Please try again.');
    }
  };

  const handleAddMinute = () => {
    setSelectedMinute(undefined);
    setShowAddModal(true);
  };

  const handleEditMinute = (minute: BoardMinute) => {
    setSelectedMinute(minute);
    setShowAddModal(true);
  };

  const handleDeleteMinute = async (minute: BoardMinute) => {
    if (window.confirm(`Are you sure you want to delete this board minute? This action cannot be undone.`)) {
      try {
        await api.delete(`/statutory/board-minutes/${user?.companyId}/${minute.id}`);
        fetchBoardMinutes();
      } catch (error) {
        console.error('Error deleting board minute:', error);
        alert('Failed to delete board minute. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchBoardMinutes();
  };

  // Format time
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(`2000-01-01T${timeString}`);
      return date.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'secondary';
      case 'Final':
        return 'info';
      case 'Signed':
        return 'success';
      default:
        return 'secondary';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft':
        return <FaFile className="text-secondary" />;
      case 'Final':
        return <FaFile className="text-info" />;
      case 'Signed':
        return <FaFileSignature className="text-success" />;
      default:
        return <FaFile className="text-secondary" />;
    }
  };

  // Define summary cards
  const summaryCards = [
    {
      title: 'Total Minutes',
      value: boardMinutes.length,
      icon: <FaFile className="text-primary" size={24} />,
      color: 'primary'
    },
    {
      title: 'Draft Minutes',
      value: boardMinutes.filter(m => m.status === 'Draft').length,
      icon: <FaFile className="text-secondary" size={24} />,
      color: 'secondary'
    },
    {
      title: 'Signed Minutes',
      value: boardMinutes.filter(m => m.status === 'Signed').length,
      icon: <FaFileSignature className="text-success" size={24} />,
      color: 'success'
    }
  ];

  // Define action buttons
  const renderActions = () => (
    <>
      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
        <FaFileImport className="me-2" /> Import
      </Button>
      <Button variant="primary" onClick={handleAddMinute}>
        <FaPlus className="me-2" /> Add Minutes
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
        variant={statusFilter === 'Draft' ? 'primary' : 'outline-primary'}
        onClick={() => setStatusFilter('Draft')}
      >
        Draft
      </Button>
      <Button
        variant={statusFilter === 'Final' ? 'primary' : 'outline-primary'}
        onClick={() => setStatusFilter('Final')}
      >
        Final
      </Button>
      <Button
        variant={statusFilter === 'Signed' ? 'primary' : 'outline-primary'}
        onClick={() => setStatusFilter('Signed')}
      >
        Signed
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
              <th>Minute ID</th>
              <th>Meeting Type</th>
              <th>Date & Time</th>
              <th>Chairperson</th>
              <th>Discussions</th>
              <th>Status</th>
              {user?.roles?.includes('super_admin') && <th>Company</th>}
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {boardMinutes.map((minute) => (
              <tr key={minute.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      {getStatusIcon(minute.status)}
                    </div>
                    <div className="fw-bold">{minute.minuteId}</div>
                  </div>
                </td>
                <td>{minute.meetingType}</td>
                <td>
                  <div>{formatDDMMYYYY(new Date(minute.meetingDate))}</div>
                  <div className="text-muted small">
                    {formatTime(minute.startTime)} - {formatTime(minute.endTime)}
                  </div>
                </td>
                <td>{minute.chairperson}</td>
                <td>
                  <div>{minute.discussions?.length || 0} topics</div>
                  <div className="text-muted small">
                    {minute.resolutions?.length || 0} resolutions
                  </div>
                </td>
                <td>
                  <Badge bg={getStatusBadgeColor(minute.status)}>
                    {minute.status}
                  </Badge>
                </td>
                {user?.roles?.includes('super_admin') && (
                  <td>{minute.company?.name || minute.company?.legalName}</td>
                )}
                <td className="text-end">
                  <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => navigate(`/statutory/board-minutes/${minute.id}`)}
                    title="View details"
                  >
                    <FaEye className="text-info" />
                  </Button>
                  <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => handleEditMinute(minute)}
                    title="Edit"
                  >
                    <FaEdit className="text-primary" />
                  </Button>
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => handleDeleteMinute(minute)}
                    title="Delete"
                  >
                    <FaTrash className="text-danger" />
                  </Button>
                </td>
              </tr>
            ))}
            {boardMinutes.length === 0 && (
              <tr>
                <td colSpan={user?.roles?.includes('super_admin') ? 8 : 7} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center">
                    <div className="bg-light p-4 rounded-circle mb-3">
                      <FaFile className="text-muted" size={32} />
                    </div>
                    <h5 className="text-muted mb-2">No Board Minutes Found</h5>
                    <p className="text-muted mb-4">Get started by adding your first board minute or importing data</p>
                    <div>
                      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                        <FaFileImport className="me-2" /> Import Minutes
                      </Button>
                      <Button variant="primary" onClick={handleAddMinute}>
                        <FaPlus className="me-2" /> Add Minutes
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
      <BoardMinuteModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        minute={selectedMinute}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportBoardMinuteModal
          show={showImportModal}
          onHide={() => setShowImportModal(false)}
          onSuccess={handleModalSuccess}
          companyId={user.companyId}
        />
      )}
      
      <MainView
        title="Board Minutes"
        description="Record and manage company board meeting minutes"
        entityType="board-minute"
        summaryCards={summaryCards}
        renderTable={renderTable}
        renderActions={renderActions}
        renderFilters={renderFilters}
        handleExport={handleExport}
      />
    </>
  );
};

export default BoardMinutes;
