import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, ListGroup } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import * as crmService from '../../../../services/crm';

interface Stage {
  id: string;
  name: string;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  conditions: {
    type: string;
    value: any;
  }[];
  actions: {
    type: string;
    value: any;
  }[];
  isActive: boolean;
}

interface AutomationModalProps {
  show: boolean;
  onHide: () => void;
  pipelineId?: string;
  companyId?: string;
}

const AutomationModal: React.FC<AutomationModalProps> = ({ show, onHide, pipelineId, companyId }) => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState('stage_change');
  const [conditions, setConditions] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);

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

      const [automationsData, stagesData] = await Promise.all([
        crmService.getAutomations(companyId, pipelineId),
        crmService.getPipelineStages(companyId, pipelineId)
      ]);

      setAutomations(automationsData);
      setStages(stagesData);
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
      const automationData = {
        name,
        description,
        trigger,
        conditions,
        actions,
        pipelineId,
      };

      if (editingAutomation) {
        await crmService.updateAutomation(companyId, editingAutomation.id, automationData);
      } else {
        await crmService.createAutomation(companyId, automationData);
      }

      toast.success(`Automation ${editingAutomation ? 'updated' : 'created'} successfully`);
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving automation:', error);
      toast.error(`Failed to ${editingAutomation ? 'update' : 'create'} automation`);
    }
  };

  const handleEdit = (automation: Automation) => {
    setEditingAutomation(automation);
    setName(automation.name);
    setDescription(automation.description);
    setTrigger(automation.trigger);
    setConditions(automation.conditions);
    setActions(automation.actions);
  };

  const handleDelete = async (id: string) => {
    try {
      if (!companyId) return;
      await crmService.deleteAutomation(companyId, id);
      toast.success('Automation deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting automation:', error);
      toast.error('Failed to delete automation');
    }
  };

  const resetForm = () => {
    setEditingAutomation(null);
    setName('');
    setDescription('');
    setTrigger('stage_change');
    setConditions([]);
    setActions([]);
  };

  const addCondition = () => {
    setConditions([...conditions, { type: 'stage', value: '' }]);
  };

  const addAction = () => {
    setActions([...actions, { type: 'update_stage', value: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  if (loading) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Pipeline Automations</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <h6 className="mb-3">Existing Automations</h6>
            <ListGroup>
              {automations.map((automation) => (
                <ListGroup.Item
                  key={automation.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div className="fw-bold">{automation.name}</div>
                    <small className="text-muted">{automation.description}</small>
                  </div>
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(automation)}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(automation.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
          <Col md={6}>
            <h6 className="mb-3">
              {editingAutomation ? 'Edit Automation' : 'Create New Automation'}
            </h6>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter automation name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Trigger</Form.Label>
                <Form.Select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                >
                  <option value="stage_change">Stage Change</option>
                  <option value="deal_amount_change">Deal Amount Change</option>
                  <option value="probability_change">Probability Change</option>
                </Form.Select>
              </Form.Group>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label>Conditions</Form.Label>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={addCondition}
                  >
                    <i className="bi bi-plus-lg"></i>
                  </Button>
                </div>
                {conditions.map((condition, index) => (
                  <Row key={index} className="mb-2">
                    <Col xs={5}>
                      <Form.Select
                        value={condition.type}
                        onChange={(e) =>
                          setConditions(
                            conditions.map((c, i) =>
                              i === index ? { ...c, type: e.target.value } : c
                            )
                          )
                        }
                      >
                        <option value="stage">Stage</option>
                        <option value="amount">Amount</option>
                        <option value="probability">Probability</option>
                      </Form.Select>
                    </Col>
                    <Col xs={5}>
                      <Form.Control
                        type="text"
                        placeholder="Value"
                        value={condition.value}
                        onChange={(e) =>
                          setConditions(
                            conditions.map((c, i) =>
                              i === index ? { ...c, value: e.target.value } : c
                            )
                          )
                        }
                      />
                    </Col>
                    <Col xs={2}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeCondition(index)}
                        className="w-100"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                ))}
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label>Actions</Form.Label>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={addAction}
                  >
                    <i className="bi bi-plus-lg"></i>
                  </Button>
                </div>
                {actions.map((action, index) => (
                  <Row key={index} className="mb-2">
                    <Col xs={5}>
                      <Form.Select
                        value={action.type}
                        onChange={(e) =>
                          setActions(
                            actions.map((a, i) =>
                              i === index ? { ...a, type: e.target.value } : a
                            )
                          )
                        }
                      >
                        <option value="update_stage">Update Stage</option>
                        <option value="update_probability">Update Probability</option>
                        <option value="send_notification">Send Notification</option>
                      </Form.Select>
                    </Col>
                    <Col xs={5}>
                      <Form.Control
                        type="text"
                        placeholder="Value"
                        value={action.value}
                        onChange={(e) =>
                          setActions(
                            actions.map((a, i) =>
                              i === index ? { ...a, value: e.target.value } : a
                            )
                          )
                        }
                      />
                    </Col>
                    <Col xs={2}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeAction(index)}
                        className="w-100"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                ))}
              </div>

              <div className="d-flex justify-content-end">
                {editingAutomation && (
                  <Button
                    variant="outline-secondary"
                    className="me-2"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                )}
                <Button variant="primary" type="submit">
                  {editingAutomation ? 'Update' : 'Create'} Automation
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default AutomationModal;
