import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import * as crmService from '../../../../services/crm';

interface Stage {
  name: string;
  color: string;
  order: number;
}

interface PipelineModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
  companyId?: string;
}

const PipelineModal: React.FC<PipelineModalProps> = ({ show, onHide, onSave, companyId }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stages, setStages] = useState<Stage[]>([
    { name: 'Qualified Lead', color: '#e3f2fd', order: 0 },
    { name: 'Initial Contact', color: '#bbdefb', order: 1 },
    { name: 'Meeting Scheduled', color: '#90caf9', order: 2 },
    { name: 'Proposal Sent', color: '#64b5f6', order: 3 },
    { name: 'Negotiation', color: '#42a5f5', order: 4 },
    { name: 'Closed Won', color: '#2196f3', order: 5 }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!companyId) {
        toast.error('No company selected. Please select a company first.');
        return;
      }

      await crmService.createPipeline(companyId, {
        name,
        description,
        stages,
      });

      toast.success('Pipeline created successfully');
      onSave();
      onHide();
      resetForm();
    } catch (error) {
      console.error('Error creating pipeline:', error);
      toast.error('Failed to create pipeline');
    }
  };

  const handleAddStage = () => {
    setStages([
      ...stages,
      {
        name: '',
        color: '#e3f2fd',
        order: stages.length,
      },
    ]);
  };

  const handleRemoveStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const handleStageChange = (index: number, field: keyof Stage, value: string) => {
    const newStages = [...stages];
    newStages[index] = {
      ...newStages[index],
      [field]: value,
    };
    setStages(newStages);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setStages([
      { name: 'Qualified Lead', color: '#e3f2fd', order: 0 },
      { name: 'Initial Contact', color: '#bbdefb', order: 1 },
      { name: 'Meeting Scheduled', color: '#90caf9', order: 2 },
      { name: 'Proposal Sent', color: '#64b5f6', order: 3 },
      { name: 'Negotiation', color: '#42a5f5', order: 4 },
      { name: 'Closed Won', color: '#2196f3', order: 5 }
    ]);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Pipeline</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Pipeline Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter pipeline name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter pipeline description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Pipeline Stages</h6>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleAddStage}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Add Stage
              </Button>
            </div>
            {stages.map((stage, index) => (
              <Row key={index} className="mb-2 align-items-end">
                <Col xs={5}>
                  <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Stage name"
                      value={stage.name}
                      onChange={(e) =>
                        handleStageChange(index, 'name', e.target.value)
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={5}>
                  <Form.Group>
                    <Form.Label>Color</Form.Label>
                    <Form.Control
                      type="color"
                      value={stage.color}
                      onChange={(e) =>
                        handleStageChange(index, 'color', e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col xs={2}>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemoveStage(index)}
                    className="w-100"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </Col>
              </Row>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Create Pipeline
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PipelineModal;
