import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getContacts, getOrganisations } from '../../../../services/crm';
import { getPipelineStages, createDeal } from '../../../../services/crm/pipeline';
import type { Contact, Organisation, Stage, DealStatus, Priority } from '../../types';

interface DealModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
  pipelineId?: string;
  companyId?: string;
}

const DealModal: React.FC<DealModalProps> = ({ show, onHide, onSave, pipelineId, companyId }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [probability, setProbability] = useState('50');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [contactId, setContactId] = useState('');
  const [organisationId, setOrganisationId] = useState('');
  const [stageId, setStageId] = useState('');
  const [status, setStatus] = useState<DealStatus>('Open');
  const [priority, setPriority] = useState<Priority>('Medium');
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show && pipelineId) {
      fetchData();
    }
  }, [show, pipelineId]);

  const fetchData = async () => {
    try {
      if (!companyId) {
        toast.error('No company selected. Please select a company first.');
        return;
      }
      if (!pipelineId) {
        toast.error('No pipeline selected');
        return;
      }

      const [contactsData, orgsData, stagesData] = await Promise.all([
        getContacts(companyId),
        getOrganisations(companyId),
        getPipelineStages(companyId, pipelineId)
      ]);

      setContacts(contactsData);
      setOrganisations(orgsData);
      setStages(stagesData);

      if (stagesData.length > 0) {
        setStageId(stagesData[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId || !pipelineId) {
      toast.error('No company or pipeline selected');
      return;
    }

    try {
      await createDeal(companyId, {
        name,
        amount: parseFloat(amount),
        probability: parseInt(probability),
        expectedCloseDate: new Date(expectedCloseDate),
        notes,
        contactId,
        organisationId: organisationId || undefined,
        stageId,
        pipelineId,
        status,
        priority
      });

      toast.success('Deal created successfully');
      onSave();
      onHide();
      resetForm();
    } catch (error) {
      console.error('Error creating deal:', error);
      toast.error('Failed to create deal');
    }
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setProbability('50');
    setExpectedCloseDate('');
    setNotes('');
    setContactId('');
    setOrganisationId('');
    setStageId(stages[0]?.id || '');
    setStatus('Open');
    setPriority('Medium');
  };

  if (loading) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Deal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Deal Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter deal name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contact</Form.Label>
                <Form.Select
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  required
                >
                  <option value="">Select Contact</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Organisation</Form.Label>
                <Form.Select
                  value={organisationId}
                  onChange={(e) => setOrganisationId(e.target.value)}
                >
                  <option value="">Select Organisation</option>
                  {organisations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Stage</Form.Label>
                <Form.Select
                  value={stageId}
                  onChange={(e) => setStageId(e.target.value)}
                  required
                >
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Probability (%)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="100"
                  value={probability}
                  onChange={(e) => setProbability(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DealStatus)}
                  required
                >
                  <option value="Open">Open</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                  <option value="OnHold">On Hold</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  required
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Expected Close Date</Form.Label>
            <Form.Control
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Create Deal
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DealModal;
