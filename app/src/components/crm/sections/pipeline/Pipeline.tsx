import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button, Card, Row, Col, Dropdown } from 'react-bootstrap';
import PipelineModal from './PipelineModal';
import DealModal from './DealModal';
import AutomationModal from './AutomationModal';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../contexts/AuthContext';
import { getPipelines, moveDeal, moveContact } from '../../../../services/crm/pipeline';
import type { Pipeline as PipelineType, Stage, Deal, Contact } from '../../types';

interface PipelineItem {
  id: string;
  name: string;
  amount: number;
  contact: {
    firstName: string;
    lastName: string;
  };
  probability?: number;
  type: 'deal' | 'contact';
}

interface StageWithItems extends Stage {
  items: PipelineItem[];
}

interface PipelineWithItems extends Omit<PipelineType, 'stages'> {
  stages: StageWithItems[];
}

const Pipeline: React.FC = () => {
  const [pipelines, setPipelines] = useState<PipelineWithItems[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineWithItems | null>(null);
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    if (user?.companyId) {
      fetchPipelines();
    }
  }, [user?.companyId]);

  const fetchPipelines = async () => {
    try {
      if (!user?.companyId) {
        toast.error('No company selected. Please select a company first.');
        setLoading(false);
        return;
      }

      const data = await getPipelines(user.companyId);
      
      // Transform the data to combine deals and contacts
      const transformedData = data.map(pipeline => ({
        ...pipeline,
        stages: pipeline.stages.map(stage => ({
          ...stage,
          items: [
            ...(stage.deals || []).map(deal => ({
              ...deal,
              type: 'deal' as const
            })),
            ...(stage.contacts || []).map((contactStage) => ({
              id: contactStage.contactId,
              name: `${contactStage.contact.firstName} ${contactStage.contact.lastName}`,
              amount: contactStage.contact.estimatedValue || 0,
              contact: {
                firstName: contactStage.contact.firstName,
                lastName: contactStage.contact.lastName
              },
              type: 'contact' as const,
              contactId: contactStage.contactId // Add this for move operation
            }))
          ]
        }))
      }));

      setPipelines(transformedData);
      if (transformedData.length > 0) {
        setSelectedPipeline(transformedData[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      toast.error('Failed to load pipelines');
      setLoading(false);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    try {
      if (!user?.companyId) return;

      // Extract the actual ID from the draggableId (remove the prefix)
      const [itemType, itemId] = draggableId.split('-');
      
      const moveParams = {
        sourceStageId: source.droppableId,
        destinationStageId: destination.droppableId,
        newIndex: destination.index,
      };

      if (itemType === 'deal') {
        await moveDeal(user.companyId, itemId, moveParams);
      } else if (itemType === 'contact') {
        await moveContact(user.companyId, itemId, moveParams);
      }

      // Update local state
      const newPipelines = [...pipelines];
      const pipelineIndex = newPipelines.findIndex(p => p.id === selectedPipeline?.id);
      
      if (pipelineIndex === -1) return;

      const sourceStageIndex = newPipelines[pipelineIndex].stages.findIndex(
        s => s.id === source.droppableId
      );
      const destStageIndex = newPipelines[pipelineIndex].stages.findIndex(
        s => s.id === destination.droppableId
      );

      const [removed] = newPipelines[pipelineIndex].stages[sourceStageIndex].items.splice(source.index, 1);
      newPipelines[pipelineIndex].stages[destStageIndex].items.splice(destination.index, 0, removed);

      setPipelines(newPipelines);
      setSelectedPipeline(newPipelines[pipelineIndex]);
    } catch (error) {
      console.error('Error moving item:', error);
      toast.error('Failed to move item');
    }
  };

  if (!user?.companyId) {
    return (
      <div className="p-4">
        <div className="alert alert-warning">
          Please select a company to view pipelines.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <h4 className="mb-0 me-3">Pipeline</h4>
          {pipelines.length > 0 && (
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="pipeline-selector">
                {selectedPipeline?.name || 'Select Pipeline'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {pipelines.map(pipeline => (
                  <Dropdown.Item
                    key={pipeline.id}
                    onClick={() => setSelectedPipeline(pipeline)}
                  >
                    {pipeline.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
        <div>
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={() => setShowAutomationModal(true)}
          >
            <i className="bi bi-gear me-2"></i>
            Automations
          </Button>
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={() => setShowPipelineModal(true)}
          >
            <i className="bi bi-plus-lg me-2"></i>
            New Pipeline
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowDealModal(true)}
          >
            <i className="bi bi-plus-lg me-2"></i>
            New Deal
          </Button>
        </div>
      </div>

      {selectedPipeline && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Row className="g-4 flex-nowrap overflow-auto pb-3">
            {selectedPipeline.stages.map(stage => (
              <Col key={stage.id} xs="auto" style={{ minWidth: '300px' }}>
                <Card>
                  <Card.Header
                    className="d-flex justify-content-between align-items-center"
                    style={{ backgroundColor: stage.color }}
                  >
                    <h6 className="mb-0">{stage.name}</h6>
                    <span className="badge bg-light text-dark">
                      {stage.items.length}
                    </span>
                  </Card.Header>
                  <Droppable droppableId={stage.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-2"
                        style={{ minHeight: '100px' }}
                      >
                        {stage.items.map((item, index) => (
                          <Draggable
                            key={`${item.type}-${item.id}`}
                            draggableId={`${item.type}-${item.id}`}
                            index={index}
                          >
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-2"
                              >
                                <Card.Body>
                                  <div className="d-flex align-items-center mb-2">
                                    <h6 className="mb-0">{item.name}</h6>
                                    <span className={`badge ms-2 ${item.type === 'deal' ? 'bg-primary' : 'bg-secondary'}`}>
                                      {item.type === 'deal' ? 'Deal' : 'Contact'}
                                    </span>
                                  </div>
                                  <div className="small text-muted">
                                    {item.contact.firstName} {item.contact.lastName}
                                  </div>
                                  <div className="d-flex justify-content-between align-items-center mt-2">
                                    <span className="badge bg-success">
                                      ${item.amount.toLocaleString()}
                                    </span>
                                    {item.type === 'deal' && (
                                      <span className="badge bg-info">
                                        {item.probability}%
                                      </span>
                                    )}
                                  </div>
                                </Card.Body>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Card>
              </Col>
            ))}
          </Row>
        </DragDropContext>
      )}

      <PipelineModal
        show={showPipelineModal}
        onHide={() => setShowPipelineModal(false)}
        onSave={fetchPipelines}
        companyId={user?.companyId}
      />
      <DealModal
        show={showDealModal}
        onHide={() => setShowDealModal(false)}
        onSave={fetchPipelines}
        pipelineId={selectedPipeline?.id}
        companyId={user?.companyId}
      />
      <AutomationModal
        show={showAutomationModal}
        onHide={() => setShowAutomationModal(false)}
        pipelineId={selectedPipeline?.id}
        companyId={user?.companyId}
      />
    </div>
  );
};

export default Pipeline;
