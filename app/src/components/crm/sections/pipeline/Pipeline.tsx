import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button, Card, Row, Col, Dropdown } from 'react-bootstrap';
import PipelineModal from './PipelineModal';
import DealModal from './DealModal';
import AutomationModal from './AutomationModal';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../contexts/AuthContext';
import * as crmService from '../../../../services/crm';

interface Deal {
  id: string;
  name: string;
  amount: number;
  probability: number;
  status: string;
  contact: {
    firstName: string;
    lastName: string;
  };
  stage: {
    id: string;
    name: string;
  };
}

interface Stage {
  id: string;
  name: string;
  color: string;
  deals: Deal[];
}

interface Pipeline {
  id: string;
  name: string;
  stages: Stage[];
}

const Pipeline: React.FC = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    console.log('Pipeline - User:', user);
    console.log('Pipeline - Company ID:', user?.companyId);
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
      console.log('Pipeline - Fetching pipelines for company:', user.companyId);
      const data = await crmService.getPipelines(user.companyId);
      console.log('Pipeline - Fetched data:', data);
      setPipelines(data);
      if (data.length > 0) {
        setSelectedPipeline(data[0]);
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
      await crmService.moveDeal(user.companyId, draggableId, {
        sourceStageId: source.droppableId,
        destinationStageId: destination.droppableId,
        newIndex: destination.index,
      });

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

      const [removed] = newPipelines[pipelineIndex].stages[sourceStageIndex].deals.splice(source.index, 1);
      newPipelines[pipelineIndex].stages[destStageIndex].deals.splice(destination.index, 0, removed);

      setPipelines(newPipelines);
      setSelectedPipeline(newPipelines[pipelineIndex]);
    } catch (error) {
      console.error('Error moving deal:', error);
      toast.error('Failed to move deal');
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
                      {stage.deals.length}
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
                        {stage.deals.map((deal, index) => (
                          <Draggable
                            key={deal.id}
                            draggableId={deal.id}
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
                                  <h6>{deal.name}</h6>
                                  <div className="small text-muted">
                                    {deal.contact.firstName} {deal.contact.lastName}
                                  </div>
                                  <div className="d-flex justify-content-between align-items-center mt-2">
                                    <span className="badge bg-success">
                                      ${deal.amount.toLocaleString()}
                                    </span>
                                    <span className="badge bg-info">
                                      {deal.probability}%
                                    </span>
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
