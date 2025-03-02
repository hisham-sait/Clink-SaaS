import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Row, Col } from 'react-bootstrap';
import { FaFileContract, FaCheckCircle, FaPauseCircle, FaClock } from 'react-icons/fa';
import ProposalModal from './ProposalModal';
import ProposalPreview from './ProposalPreview';
import { Proposal, Contact } from '../../../crm/types';
import * as crmService from '../../../../services/crm';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../contexts/AuthContext';

const Proposals: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [contacts, setContacts] = useState<{ [key: string]: Contact }>({});

  useEffect(() => {
    if (user?.companyId) {
      loadData();
    }
  }, [user?.companyId]);

  const loadData = async () => {
    try {
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
      setProposals(proposalsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEdit = (proposal: Proposal | null) => {
    setSelectedProposal(proposal);
    setShowModal(true);
  };

  const handleClose = () => {
    setSelectedProposal(null);
    setShowModal(false);
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
    if (!window.confirm('Are you sure you want to delete this proposal?')) return;
    
    try {
      if (!user?.companyId) return;
      await crmService.deleteProposal(user.companyId, proposalId);
      toast.success('Proposal deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast.error('Failed to delete proposal');
    }
  };

  const handlePreview = async (proposal: Proposal) => {
    try {
      setLoadingPreview(true);
      // Get full proposal details including product tiers
      if (!user?.companyId) return;
      const fullProposal = await crmService.getProposal(user.companyId, proposal.id);
      setSelectedProposal(fullProposal);
      setShowPreview(true);
    } catch (error) {
      console.error('Error loading proposal details:', error);
      toast.error('Failed to load proposal details');
    } finally {
      setLoadingPreview(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getContactName = (contactId?: string) => {
    if (!contactId) return 'N/A';
    const contact = contacts[contactId];
    return contact ? `${contact.firstName} ${contact.lastName}` : contactId;
  };

  const getTotalAmount = (proposal: Proposal) => {
    return proposal.products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Active: 'success',
      Inactive: 'secondary',
      Archived: 'danger',
    };
    return <Badge bg={colors[status as keyof typeof colors] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Proposals</h1>
          <p className="text-muted mb-0">Create and manage client proposals and quotes</p>
        </div>
        <Button variant="primary" onClick={() => handleAddEdit(null)}>
          <i className="bi bi-plus-lg me-2"></i>
          Create Proposal
        </Button>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Total Proposals</div>
                  <h3 className="mb-0">{proposals.length}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FaFileContract className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Active Proposals</div>
                  <h3 className="mb-0">{proposals.filter(p => p.status === 'Active').length}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FaCheckCircle className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Inactive/Archived</div>
                  <h3 className="mb-0">{proposals.filter(p => p.status !== 'Active').length}</h3>
                </div>
                <div className="bg-secondary bg-opacity-10 p-3 rounded">
                  <FaPauseCircle className="text-secondary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Proposals Table */}
      <Card className="mb-4">
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-file-earmark-text fs-1 text-muted"></i>
              <p className="mt-2 mb-0">No proposals created yet</p>
              <p className="text-muted small">Create your first proposal to get started</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Deal</th>
                  <th>Products</th>
                  <th>Total Amount</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <tr key={proposal.id}>
                    <td>{proposal.name}</td>
                    <td>{getContactName(proposal.contactId)}</td>
                    <td>{proposal.deal?.name || 'N/A'}</td>
                    <td>
                      <Badge bg="info">{proposal.products.length}</Badge>
                    </td>
                    <td>${getTotalAmount(proposal)}</td>
                    <td>
                      {proposal.validUntil
                        ? formatDate(proposal.validUntil)
                        : 'N/A'}
                    </td>
                    <td>{getStatusBadge(proposal.status)}</td>
                    <td>
                      <Button
                        variant="link"
                        className="p-0 me-3"
                        onClick={() => handleAddEdit(proposal)}
                        title="Edit Proposal"
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="link"
                        className="p-0 me-3"
                        onClick={() => handlePreview(proposal)}
                        title="Preview Proposal"
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                      <Button
                        variant="link"
                        className="p-0 text-danger"
                        onClick={() => handleDelete(proposal.id)}
                        title="Delete Proposal"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Recent Activities */}
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <FaClock className="me-2" />
              Recent Proposal Activities
            </h5>
          </div>
          <div className="text-muted small">
            Proposal updates and changes will appear here
          </div>
        </Card.Body>
      </Card>

      <>
        <ProposalModal
          show={showModal}
          onHide={handleClose}
          onSave={handleSave}
          proposal={showPreview ? null : selectedProposal}
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
      </>
    </div>
  );
};

export default Proposals;
