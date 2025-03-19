import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Pipeline, Stage, Contact } from '../../types';
import { getPipelines, addContactToPipeline } from '../../../../services/crm/pipeline';
import { useAuth } from '../../../../contexts/AuthContext';
import { FaEuroSign, FaDollarSign } from 'react-icons/fa';

interface PipelineModalProps {
  show: boolean;
  onHide: () => void;
  contact: Contact;
  onSuccess: () => void;
}

const PipelineModal: React.FC<PipelineModalProps> = ({ show, onHide, contact, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [estimatedValue, setEstimatedValue] = useState<string>(
    contact.estimatedValue ? contact.estimatedValue.toString() : ''
  );
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (show && user?.companyId) {
      fetchPipelines();
    }
  }, [show, user?.companyId]);

  const fetchPipelines = async () => {
    try {
      if (!user?.companyId) return;
      setError(null);
      const data = await getPipelines(user.companyId);
      setPipelines(data);
      if (data.length > 0) {
        setSelectedPipeline(data[0].id);
        if (data[0].stages.length > 0) {
          setSelectedStage(data[0].stages[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      setError('Failed to load pipelines');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.companyId) return;

    try {
      setLoading(true);
      setError(null);
      if (!selectedPipeline || !selectedStage) {
        setError('Please select a pipeline and stage');
        return;
      }

      await addContactToPipeline(
        user.companyId,
        contact.id,
        {
          contactId: contact.id,
          pipelineId: selectedPipeline,
          stageId: selectedStage,
          estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
          notes: notes.trim() || undefined,
        }
      );
      onSuccess();
      onHide();
    } catch (error: any) {
      console.error('Error adding contact to pipeline:', error);
      if (error.response?.data?.error === 'Contact is already in a pipeline') {
        setError('This contact is already in a pipeline');
      } else {
        setError('Failed to add contact to pipeline');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStages = (): Stage[] => {
    const pipeline = pipelines.find(p => p.id === selectedPipeline);
    return pipeline?.stages || [];
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Add to Pipeline</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger mb-3" role="alert">
              {error}
            </div>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Pipeline</Form.Label>
            <Form.Select
              value={selectedPipeline}
              onChange={(e) => {
                setSelectedPipeline(e.target.value);
                const stages = pipelines.find(p => p.id === e.target.value)?.stages || [];
                if (stages.length > 0) {
                  setSelectedStage(stages[0].id);
                }
              }}
            >
              {pipelines.map(pipeline => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Initial Stage</Form.Label>
            <Form.Select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
            >
              {getCurrentStages().map(stage => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estimated Value</Form.Label>
            <div className="input-group">
              <span className="input-group-text">
                {contact.currency === 'EUR' ? <FaEuroSign /> : <FaDollarSign />}
              </span>
              <Form.Control
                type="number"
                step="0.01"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="Enter estimated value"
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any relevant notes"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add to Pipeline'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PipelineModal;
