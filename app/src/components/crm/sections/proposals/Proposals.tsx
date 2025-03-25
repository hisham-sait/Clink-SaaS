import React, { useState, useEffect } from 'react';
import './proposals.css';
import { Table, Button, Badge, ButtonGroup, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import { FaFileContract, FaCheckCircle, FaPauseCircle, FaPlus, FaEdit, FaTrash, FaFileImport, FaEye, FaTools, FaClone, FaPuzzlePiece } from 'react-icons/fa';
import UnifiedProposalModal from './ProposalModal';
import ProposalPreview from './ProposalPreview';
import SectionTemplatesModal from './SectionTemplatesModal';
import { Proposal, Contact } from '../../../crm/types';
import * as crmService from '../../../../services/crm';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../../../services/api';
import MainView, { ActionButton, StatusBadge } from '../../../shared/MainView';

const Proposals: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSectionTemplates, setShowSectionTemplates] = useState(false);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [contacts, setContacts] = useState<{ [key: string]: Contact }>({});
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Archived'>('All');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.companyId) {
      loadData();
    }
  }, [user?.companyId, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (!user?.companyId) {
        toast.error('No company selected. Please select a company first.');
        return;
      }
      const [proposalsData, contactsData] = await Promise.all([
        crmService.getProposals(user.companyId),
        crmService.getContacts(user.companyId),
      ]);
      
      // Create a map of contacts for quick lookup
      const contactsMap = contactsData.reduce((acc: { [key: string]: Contact }, contact: Contact) => {
        acc[contact.id] = contact;
        return acc;
      }, {} as { [key: string]: Contact });

      setContacts(contactsMap);
      
      // Apply status filter if not 'All'
      if (statusFilter !== 'All') {
        setProposals(proposalsData.filter(proposal => proposal.status === statusFilter));
      } else {
        setProposals(proposalsData);
      }
      
      setError('');
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
      setError('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEdit = async (proposal: Proposal | null) => {
    if (proposal) {
      let loadingToastId: React.ReactText | null = null;
      try {
        if (!user?.companyId) {
          toast.error('No company selected. Please select a company first.');
          return;
        }
        
        // Show loading indicator
        loadingToastId = toast.info('Loading proposal details...', { 
          autoClose: false,
          closeButton: false
        });
        
        console.log('Fetching proposal details for ID:', proposal.id);
        
        // Get full proposal details before opening the modal
        const fullProposal = await crmService.getProposal(user.companyId, proposal.id);
        
        // Dismiss loading indicator
        if (loadingToastId) toast.dismiss(loadingToastId);
        
        console.log('Received full proposal data:', fullProposal);
        
        if (!fullProposal) {
          toast.error('Failed to load proposal details. Proposal not found.');
          return;
        }
        
        // Ensure the proposal has all required fields
        if (!fullProposal.name) {
          console.error('Proposal is missing name field:', fullProposal);
        }
        
        if (!fullProposal.contactId) {
          console.error('Proposal is missing contactId field:', fullProposal);
        }
        
        setSelectedProposal(fullProposal);
        console.log('Setting selectedProposal state:', fullProposal);
        setShowModal(true);
      } catch (error) {
        console.error('Error loading proposal details:', error);
        toast.error('Failed to load proposal details');
        if (loadingToastId) toast.dismiss(loadingToastId);
        return;
      }
    } else {
      setSelectedProposal(null);
      setShowModal(true);
    }
  };

  const handleClose = () => {
    setSelectedProposal(null);
    setShowModal(false);
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      if (!user?.companyId) return;
      const response = await api.get(`/crm/proposals/${user.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `proposals.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting proposals:', error);
      toast.error('Failed to export proposals. Please try again.');
    }
  };

  const handleSave = async (proposal: Proposal) => {
    try {
      if (!user?.companyId) {
        toast.error('No company selected. Please select a company first.');
        return;
      }
      if (selectedProposal) {
        await crmService.updateProposal(user.companyId, selectedProposal.id, proposal);
        toast.success('Proposal updated successfully');
      } else {
        await crmService.createProposal(user.companyId, proposal);
        toast.success('Proposal created successfully');
      }
      loadData();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving proposal:', error);
      toast.error('Failed to save proposal');
    }
  };

  const handleDelete = async (proposalId: string) => {
    if (!proposalId || proposalId.trim() === '') {
      console.error('Invalid proposal ID:', proposalId);
      toast.error('Cannot delete proposal: Invalid proposal ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      return;
    }
    
    let deleteToastId: React.ReactText | null = null;
    try {
      if (!user?.companyId) {
        toast.error('No company selected. Please select a company first.');
        return;
      }
      
      // Show loading indicator
      deleteToastId = toast.info('Deleting proposal...', { 
        autoClose: false,
        closeButton: false
      });
      
      console.log(`Attempting to delete proposal with ID: ${proposalId} for company: ${user.companyId}`);
      
      // Validate parameters before calling the API
      if (!user.companyId.trim()) {
        throw new Error('Company ID is empty');
      }
      
      if (!proposalId.trim()) {
        throw new Error('Proposal ID is empty');
      }
      
      // Try using axios directly
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const url = `/api/crm/proposals/${user.companyId}/${proposalId}`;
      console.log(`Making direct axios DELETE request to: ${url}`);
      
      const response = await axios.delete(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Company-ID': user.companyId
        }
      });
      
      console.log('Delete response:', response);
      
      // Dismiss loading indicator and show success message
      if (deleteToastId) toast.dismiss(deleteToastId);
      toast.success('Proposal deleted successfully');
      
      // Refresh the list to reflect the changes
      loadData();
    } catch (error: any) {
      console.error('Error deleting proposal:', error);
      
      // Log more detailed error information
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      if (deleteToastId) toast.dismiss(deleteToastId);
      toast.error(`Failed to delete proposal: ${error.message || 'Unknown error'}`);
    }
  };

  const handlePreview = async (proposal: Proposal) => {
    let previewToastId: React.ReactText | null = null;
    try {
      setLoadingPreview(true);
      
      if (!user?.companyId) {
        toast.error('No company selected. Please select a company first.');
        return;
      }
      
      // Show loading indicator
      previewToastId = toast.info('Loading proposal preview...', { 
        autoClose: false,
        closeButton: false
      });
      
      // Get full proposal details including product tiers
      const fullProposal = await crmService.getProposal(user.companyId, proposal.id);
      
      // Dismiss loading indicator
      if (previewToastId) toast.dismiss(previewToastId);
      
      if (!fullProposal) {
        toast.error('Failed to load proposal details. Proposal not found.');
        setLoadingPreview(false);
        return;
      }
      
      // Log the proposal data to help with debugging
      console.log('Full proposal data for preview:', fullProposal);
      
      // Set the selected proposal and show the preview
      setSelectedProposal(fullProposal);
      setShowPreview(true);
    } catch (error) {
      console.error('Error loading proposal details:', error);
      toast.error('Failed to load proposal details');
      if (previewToastId) toast.dismiss(previewToastId);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleEditInBuilder = (proposalId: string) => {
    navigate(`/crm/proposals/builder/${proposalId}`);
  };

  const handleCloneProposal = async (proposal: Proposal) => {
    let cloningToastId: React.ReactText | null = null;
    try {
      if (!user?.companyId) {
        toast.error('No company selected. Please select a company first.');
        return;
      }

      // Show loading indicator
      cloningToastId = toast.info('Cloning proposal...', { 
        autoClose: false,
        closeButton: false
      });

      console.log(`Attempting to clone proposal with ID: ${proposal.id} for company: ${user.companyId}`);

      // Get full proposal details
      const fullProposal = await crmService.getProposal(user.companyId, proposal.id);
      
      if (!fullProposal) {
        toast.error('Failed to clone proposal. Original proposal not found.');
        if (cloningToastId) toast.dismiss(cloningToastId);
        return;
      }
      
      console.log('Full proposal data for cloning:', fullProposal);
      
      // Create a simplified version of the proposal for cloning
      // Only include the necessary fields that the API expects
      // We need to use type assertion to match the expected type
      const clonedProposal = {
        name: `${fullProposal.name} (Copy)`,
        content: fullProposal.content || {},
        variables: fullProposal.variables || {},
        status: fullProposal.status,
        validUntil: fullProposal.validUntil,
        contactId: fullProposal.contactId,
        dealId: fullProposal.dealId,
        // The backend API will handle creating the proper structure for products
        products: fullProposal.products.map(product => ({
          productId: product.productId,
          planType: product.planType,
          tierId: product.tierId || product.planType,
          quantity: product.quantity,
          price: product.price,
          features: product.features || []
        }))
      } as Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>;
      
      console.log('Cloned proposal data to be sent:', clonedProposal);
      
      // Save the cloned proposal
      const savedProposal = await crmService.createProposal(user.companyId, clonedProposal);
      
      console.log('Cloned proposal response:', savedProposal);
      
      if (cloningToastId) toast.dismiss(cloningToastId);
      toast.success('Proposal cloned successfully');
      
      // Refresh the list
      loadData();
      
      // Navigate to the builder for the new proposal
      navigate(`/crm/proposals/builder/${savedProposal.id}`);
    } catch (error: any) {
      console.error('Error cloning proposal:', error);
      
      // Log more detailed error information
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      if (cloningToastId) toast.dismiss(cloningToastId);
      toast.error(`Failed to clone proposal: ${error.message || 'Unknown error'}`);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  // Generate a unique proposal ID with PRO prefix and 5 random alphanumeric characters
  const generateProposalId = (dbId: string) => {
    // Use the first 5 characters of the database ID as a seed
    const seed = dbId.substring(0, 5);
    
    // Create a deterministic but seemingly random string based on the seed
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Use the hash to generate 5 alphanumeric characters
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters (O, 0, 1, I)
    let result = 'PRO';
    
    // Use the absolute value of hash to ensure positive numbers
    const absHash = Math.abs(hash);
    
    for (let i = 0; i < 5; i++) {
      const index = (absHash + i * 7919) % characters.length; // Use prime number 7919 to spread values
      result += characters.charAt(index);
    }
    
    return result;
  };

  const getContactName = (contactId?: string) => {
    if (!contactId) return 'N/A';
    const contact = contacts[contactId];
    return contact ? `${contact.firstName} ${contact.lastName}` : contactId;
  };

  // Calculate total for each tier
  const getBasicTierTotal = (proposal: Proposal) => {
    return proposal.products
      .filter(p => p.planType === 'BASIC')
      .reduce((sum, p) => sum + p.price * p.quantity, 0)
      .toFixed(2);
  };

  const getStandardTierTotal = (proposal: Proposal) => {
    return proposal.products
      .filter(p => p.planType === 'STANDARD')
      .reduce((sum, p) => sum + p.price * p.quantity, 0)
      .toFixed(2);
  };

  const getPremiumTierTotal = (proposal: Proposal) => {
    return proposal.products
      .filter(p => p.planType === 'PREMIUM')
      .reduce((sum, p) => sum + p.price * p.quantity, 0)
      .toFixed(2);
  };

  // Define summary cards
  const summaryCards = [
    {
      title: 'Total Proposals',
      value: proposals.length,
      icon: <FaFileContract className="text-primary" size={24} />,
      color: 'primary'
    },
    {
      title: 'Active Proposals',
      value: proposals.filter(p => p.status === 'Active').length,
      icon: <FaCheckCircle className="text-success" size={24} />,
      color: 'success'
    },
    {
      title: 'Inactive/Archived',
      value: proposals.filter(p => p.status !== 'Active').length,
      icon: <FaPauseCircle className="text-secondary" size={24} />,
      color: 'secondary'
    }
  ];

  // Define action buttons
  const renderActions = () => (
    <>
      <OverlayTrigger
        placement="bottom"
        overlay={<Tooltip>Manage Section Templates</Tooltip>}
      >
        <Button 
          variant="outline-primary" 
          className="me-2"
          onClick={() => setShowSectionTemplates(true)}
        >
          <FaPuzzlePiece className="me-2" />
          Section Templates
        </Button>
      </OverlayTrigger>
      <Button variant="primary" onClick={() => handleAddEdit(null)}>
        <FaPlus className="me-2" />
        Create Proposal
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
      ) : proposals.length === 0 ? (
        <div className="text-center py-5">
          <div className="d-flex flex-column align-items-center">
            <div className="bg-light p-4 rounded-circle mb-3">
              <FaFileContract className="text-muted" size={32} />
            </div>
            <h5 className="text-muted mb-2">No Proposals Found</h5>
            <p className="text-muted mb-4">Get started by creating your first proposal</p>
            <div>
              <Button variant="primary" onClick={() => handleAddEdit(null)}>
                <FaPlus className="me-2" /> Create Proposal
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Table responsive hover className="align-middle">
          <thead className="bg-light">
            <tr>
              <th>Proposal ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Basic Tier</th>
              <th>Standard Tier</th>
              <th>Premium Tier</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((proposal) => (
              <tr key={proposal.id}>
                <td>
                  <div className="fw-bold">{generateProposalId(proposal.id)}</div>
                </td>
                <td>{proposal.name}</td>
                <td>{getContactName(proposal.contactId)}</td>
                <td>${getBasicTierTotal(proposal)}</td>
                <td>${getStandardTierTotal(proposal)}</td>
                <td>${getPremiumTierTotal(proposal)}</td>
                <td>
                  {proposal.validUntil
                    ? formatDate(proposal.validUntil)
                    : 'N/A'}
                </td>
                <td>
                  <StatusBadge status={proposal.status} />
                </td>
                <td>
                  <ActionButton
                    icon={<FaEdit className="text-primary" />}
                    onClick={() => handleAddEdit(proposal)}
                    tooltip="Edit Proposal Details"
                  />
                  <ActionButton
                    icon={<FaTools className="text-primary" />}
                    onClick={() => handleEditInBuilder(proposal.id)}
                    tooltip="Edit in Proposal Builder"
                  />
                  <ActionButton
                    icon={<FaClone className="text-primary" />}
                    onClick={() => handleCloneProposal(proposal)}
                    tooltip="Clone Proposal"
                  />
                  <ActionButton
                    icon={<FaEye className="text-primary" />}
                    onClick={() => handlePreview(proposal)}
                    tooltip="Preview Proposal"
                  />
                  <ActionButton
                    icon={<FaTrash className="text-danger" />}
                    onClick={() => handleDelete(proposal.id)}
                    tooltip="Delete Proposal"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );

  return (
    <>
      <MainView
        title="Proposal Management"
        description="Create and manage client proposals and quotes"
        entityType="proposal"
        summaryCards={summaryCards}
        renderTable={renderTable}
        renderActions={renderActions}
        renderFilters={renderFilters}
        handleExport={handleExport}
      />

      {/* Modals */}
      <UnifiedProposalModal
        show={showModal}
        onHide={handleClose}
        onSave={handleSave}
        proposal={showPreview ? null : selectedProposal}
        isBuilder={false}
        key={selectedProposal?.id || 'new'} // Add a key to force re-render when proposal changes
      />
      
      {showPreview && (
        loadingPreview ? (
          <Modal show centered>
            <Modal.Body className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </Modal.Body>
          </Modal>
        ) : selectedProposal && (
          <ProposalPreview
            show={showPreview}
            onHide={() => {
              setShowPreview(false);
              setSelectedProposal(null);
            }}
            proposal={selectedProposal}
          />
        )
      )}
      
      {/* Section Templates Modal */}
      <SectionTemplatesModal
        show={showSectionTemplates}
        onHide={() => setShowSectionTemplates(false)}
      />
    </>
  );
};

export default Proposals;
