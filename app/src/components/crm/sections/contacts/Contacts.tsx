import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactModal from './ContactModal';
import ImportContactModal from './ImportContactModal';
import { Table, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaUsers, FaUserCheck, FaUserMinus, FaTrash, FaEye } from 'react-icons/fa';
import MainView, { ActionButton, StatusBadge } from '../../../shared/MainView';
import * as crmService from '../../../../services/crm';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';

import { Contact } from '../../../../components/crm/types';

const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Archived'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined);

  useEffect(() => {
    fetchContacts();
  }, [statusFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      if (user?.companyId) {
        const contacts = await crmService.getContacts(user.companyId, statusFilter);
        setContacts(contacts);
        setError('');
      }
    } catch (err) {
      setError('Failed to load contacts');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      if (!user?.companyId) return;
      const response = await api.get(`/crm/contacts/${user.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contacts.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting contacts:', error);
      alert('Failed to export contacts. Please try again.');
    }
  };

  const handleAddContact = () => {
    setSelectedContact(undefined);
    setShowAddModal(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowAddModal(true);
  };

  const handleDeleteContact = async (contact: Contact) => {
    if (!user?.companyId) return;
    if (window.confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}? This action cannot be undone.`)) {
      try {
        await crmService.deleteContact(user.companyId, contact.id);
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Failed to delete contact. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchContacts();
  };

  // Define summary cards
  const summaryCards = [
    {
      title: 'Total Contacts',
      value: contacts.length,
      icon: <FaUsers className="text-primary" size={24} />,
      color: 'primary'
    },
    {
      title: 'Active Contacts',
      value: contacts.filter(c => c.status === 'Active').length,
      icon: <FaUserCheck className="text-success" size={24} />,
      color: 'success'
    },
    {
      title: 'Inactive/Archived',
      value: contacts.filter(c => c.status !== 'Active').length,
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
      <Button variant="primary" onClick={handleAddContact}>
        <FaPlus className="me-2" /> Add Contact
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
              <th>Department</th>
              <th>Position</th>
              <th>Contact Type</th>
              <th>Last Contact</th>
              <th>Next Follow-up</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div>
                      <div className="fw-bold">
                        {`${contact.title} ${contact.firstName} ${contact.lastName}`}
                      </div>
                      <div className="text-muted small">
                        {contact.email}
                        {contact.mobile && <span className="ms-2">{contact.mobile}</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{contact.department || '-'}</td>
                <td>{contact.position}</td>
                <td>{contact.type.join(', ')}</td>
                <td>{new Date(contact.lastContact).toLocaleDateString('en-IE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}</td>
                <td>{contact.nextFollowUp ? new Date(contact.nextFollowUp).toLocaleDateString('en-IE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) : '-'}</td>
                <td>
                  <StatusBadge status={contact.status} />
                </td>
                <td className="text-end">
                  <ActionButton
                    icon={<FaEye className="text-primary" />}
                    onClick={() => navigate(`/crm/contacts/${contact.id}`)}
                    tooltip="View Contact"
                  />
                  <ActionButton
                    icon={<FaEdit className="text-primary" />}
                    onClick={() => handleEditContact(contact)}
                    tooltip="Edit Contact"
                  />
                  <ActionButton
                    icon={<FaTrash className="text-danger" />}
                    onClick={() => handleDeleteContact(contact)}
                    tooltip="Delete Contact"
                  />
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center">
                    <div className="bg-light p-4 rounded-circle mb-3">
                      <FaUsers className="text-muted" size={32} />
                    </div>
                    <h5 className="text-muted mb-2">No Contacts Found</h5>
                    <p className="text-muted mb-4">Get started by adding your first contact or importing data</p>
                    <div>
                      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                        <FaFileImport className="me-2" /> Import Contacts
                      </Button>
                      <Button variant="primary" onClick={handleAddContact}>
                        <FaPlus className="me-2" /> Add Contact
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
      <ContactModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        contact={selectedContact}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportContactModal
          show={showImportModal}
          onHide={() => setShowImportModal(false)}
          onSuccess={handleModalSuccess}
          companyId={user.companyId}
        />
      )}
      
      <MainView
        title="Contact Management"
        description="Manage and track all your business contacts"
        entityType="contact"
        summaryCards={summaryCards}
        renderTable={renderTable}
        renderActions={renderActions}
        renderFilters={renderFilters}
        handleExport={handleExport}
      />
    </>
  );
};

export default Contacts;
