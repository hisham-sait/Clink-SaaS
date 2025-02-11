import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaCheck, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';

interface BoardMinuteModalProps {
  show: boolean;
  onHide: () => void;
  minute?: BoardMinute;
  onSuccess: () => void;
}

interface BoardMinute {
  id?: string;
  meetingType: 'AGM' | 'EGM' | 'Board Meeting' | 'Committee Meeting';
  meetingDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  chairperson: string;
  attendees: string[];
  content: string;
  discussions: Discussion[];
  resolutions: Resolution[];
  status: 'Draft' | 'Final' | 'Signed';
  company?: {
    name: string;
    legalName: string;
  };
}

interface Discussion {
  id?: string;
  topic: string;
  details: string;
  decisions: string;
  actionItems: ActionItem[];
}

interface ActionItem {
  id?: string;
  task: string;
  assignee: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
}

interface Resolution {
  id?: string;
  title: string;
  type: 'Ordinary' | 'Special';
  description: string;
  outcome: 'Pending' | 'Passed' | 'Failed' | 'Withdrawn';
  proposedBy: string;
  secondedBy: string;
}

const BoardMinuteModal: React.FC<BoardMinuteModalProps> = ({ show, onHide, minute, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const renderTooltip = (text: string) => (
    <Tooltip>{text}</Tooltip>
  );

  const RequiredLabel: React.FC<{ text: string; tooltip?: string }> = ({ text, tooltip }) => (
    <Form.Label className="d-flex align-items-center">
      {text} <span className="text-danger ms-1">*</span>
      {tooltip && (
        <OverlayTrigger placement="top" overlay={renderTooltip(tooltip)}>
          <span className="ms-1">
            <FaInfoCircle className="text-muted" style={{ fontSize: '0.875rem' }} />
          </span>
        </OverlayTrigger>
      )}
    </Form.Label>
  );

  const [formData, setFormData] = useState<BoardMinute>({
    meetingType: 'Board Meeting',
    meetingDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    chairperson: '',
    attendees: [],
    content: '',
    discussions: [],
    resolutions: [],
    status: 'Draft'
  });

  useEffect(() => {
    if (minute) {
      setFormData({
        ...minute,
        meetingDate: new Date(minute.meetingDate).toISOString().split('T')[0],
        startTime: new Date(minute.startTime).toISOString().slice(11, 16),
        endTime: new Date(minute.endTime).toISOString().slice(11, 16),
        discussions: minute.discussions.map(d => ({
          ...d,
          actionItems: d.actionItems.map(a => ({
            ...a,
            dueDate: new Date(a.dueDate).toISOString().split('T')[0]
          }))
        }))
      });
    } else {
      setFormData({
        meetingType: 'Board Meeting',
        meetingDate: '',
        startTime: '',
        endTime: '',
        venue: '',
        chairperson: '',
        attendees: [],
        content: '',
        discussions: [],
        resolutions: [],
        status: 'Draft'
      });
    }
    setError('');
  }, [minute, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user?.companyId) {
      setError('No company selected');
      setLoading(false);
      return;
    }

    // Validate required fields
    if (!formData.meetingType || !formData.meetingDate || !formData.startTime || 
        !formData.endTime || !formData.venue || !formData.chairperson || 
        !formData.content || formData.attendees.length === 0) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      if (minute?.id) {
        await api.put(`/statutory/board-minutes/${user.companyId}/${minute.id}`, formData);
      } else {
        await api.post(`/statutory/board-minutes/${user.companyId}`, formData);
      }
      setSuccess(true);
      onSuccess();
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err) {
      console.error('Error saving board minute:', err);
      setError('Failed to save board minute. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const { name, value } = target;
    
    if (name === 'attendees') {
      setFormData(prev => ({
        ...prev,
        attendees: value.split(',').map(item => item.trim())
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDiscussionChange = (index: number, field: keyof Discussion, value: string) => {
    setFormData(prev => ({
      ...prev,
      discussions: prev.discussions.map((discussion, i) => 
        i === index ? { ...discussion, [field]: value } : discussion
      )
    }));
  };

  const handleActionItemChange = (discussionIndex: number, itemIndex: number, field: keyof ActionItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      discussions: prev.discussions.map((discussion, i) => 
        i === discussionIndex ? {
          ...discussion,
          actionItems: discussion.actionItems.map((item, j) =>
            j === itemIndex ? { ...item, [field]: value } : item
          )
        } : discussion
      )
    }));
  };

  const handleResolutionChange = (index: number, field: keyof Resolution, value: string) => {
    setFormData(prev => ({
      ...prev,
      resolutions: prev.resolutions.map((resolution, i) => 
        i === index ? { ...resolution, [field]: value } : resolution
      )
    }));
  };

  const addDiscussion = () => {
    setFormData(prev => ({
      ...prev,
      discussions: [
        ...prev.discussions,
        {
          topic: '',
          details: '',
          decisions: '',
          actionItems: []
        }
      ]
    }));
  };

  const removeDiscussion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      discussions: prev.discussions.filter((_, i) => i !== index)
    }));
  };

  const addActionItem = (discussionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      discussions: prev.discussions.map((discussion, i) => 
        i === discussionIndex ? {
          ...discussion,
          actionItems: [
            ...discussion.actionItems,
            {
              task: '',
              assignee: '',
              dueDate: '',
              status: 'Pending'
            }
          ]
        } : discussion
      )
    }));
  };

  const removeActionItem = (discussionIndex: number, itemIndex: number) => {
    setFormData(prev => ({
      ...prev,
      discussions: prev.discussions.map((discussion, i) => 
        i === discussionIndex ? {
          ...discussion,
          actionItems: discussion.actionItems.filter((_, j) => j !== itemIndex)
        } : discussion
      )
    }));
  };

  const addResolution = () => {
    setFormData(prev => ({
      ...prev,
      resolutions: [
        ...prev.resolutions,
        {
          title: '',
          type: 'Ordinary',
          description: '',
          outcome: 'Pending',
          proposedBy: '',
          secondedBy: ''
        }
      ]
    }));
  };

  const removeResolution = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resolutions: prev.resolutions.filter((_, i) => i !== index)
    }));
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg"
      style={{
        '--bs-modal-padding': '0.75rem',
        '--bs-modal-margin': '0.75rem',
      } as React.CSSProperties}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton style={{ padding: '0.75rem 1rem' }}>
          <Modal.Title style={{ fontSize: '1.1rem' }}>{minute ? 'Edit Board Minute' : 'Add New Board Minute'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '0.75rem 1rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && (
            <div className="alert alert-success">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                  <FaCheck className="text-success" />
                </div>
                <div>
                  Board Minute {minute ? 'updated' : 'added'} successfully!
                </div>
              </div>
            </div>
          )}
          
          <div className="row g-2">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Meeting Type" tooltip="Type of meeting being minuted" />
                <Form.Select
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  name="meetingType"
                  value={formData.meetingType}
                  onChange={handleChange}
                  required
                >
                  <option value="Board Meeting">Board Meeting</option>
                  <option value="AGM">Annual General Meeting</option>
                  <option value="EGM">Extraordinary General Meeting</option>
                  <option value="Committee Meeting">Committee Meeting</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Meeting Date" tooltip="Date when the meeting was held" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="date"
                  name="meetingDate"
                  value={formData.meetingDate}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </Form.Group>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Start Time" tooltip="Time when the meeting started" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="End Time" tooltip="Time when the meeting ended" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Venue" tooltip="Location where the meeting was held" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Chairperson" tooltip="Person who chaired the meeting" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="text"
                  name="chairperson"
                  value={formData.chairperson}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <RequiredLabel text="Attendees" tooltip="List of people who attended the meeting (comma-separated)" />
            <Form.Control
              style={{ 
                fontSize: '0.875rem',
                padding: '0.375rem 0.75rem'
              }}
              as="textarea"
              name="attendees"
              value={formData.attendees.join(', ')}
              onChange={handleChange}
              required
              rows={2}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <RequiredLabel text="Content" tooltip="Main content and proceedings of the meeting" />
            <Form.Control
              style={{ 
                fontSize: '0.875rem',
                padding: '0.375rem 0.75rem'
              }}
              as="textarea"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={5}
            />
          </Form.Group>

          {/* Discussions and Action Items */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0" style={{ fontSize: '1rem' }}>Discussions</h6>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={addDiscussion}
                style={{ 
                  fontSize: '0.875rem',
                  padding: '0.375rem 0.75rem'
                }}
              >
                Add Discussion
              </Button>
            </div>
            {formData.discussions.map((discussion, index) => (
              <div key={index} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <h6 className="mb-0">Discussion {index + 1}</h6>
                    <Button
                      variant="link"
                      className="text-danger p-0"
                      onClick={() => removeDiscussion(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <Form.Group className="mb-3">
                    <RequiredLabel text="Topic" tooltip="Main topic of discussion" />
                    <Form.Control
                      style={{ 
                        fontSize: '0.875rem',
                        padding: '0.375rem 0.75rem',
                        height: 'calc(1.5em + 0.75rem + 2px)'
                      }}
                      type="text"
                      value={discussion.topic}
                      onChange={(e) => handleDiscussionChange(index, 'topic', e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <RequiredLabel text="Details" tooltip="Detailed points discussed" />
                    <Form.Control
                      style={{ 
                        fontSize: '0.875rem',
                        padding: '0.375rem 0.75rem'
                      }}
                      as="textarea"
                      rows={3}
                      value={discussion.details}
                      onChange={(e) => handleDiscussionChange(index, 'details', e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <RequiredLabel text="Decisions" tooltip="Decisions made during the discussion" />
                    <Form.Control
                      style={{ 
                        fontSize: '0.875rem',
                        padding: '0.375rem 0.75rem'
                      }}
                      as="textarea"
                      rows={2}
                      value={discussion.decisions}
                      onChange={(e) => handleDiscussionChange(index, 'decisions', e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* Action Items */}
                  <div className="mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0" style={{ fontSize: '0.875rem' }}>Action Items</h6>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => addActionItem(index)}
                        style={{ 
                          fontSize: '0.875rem',
                          padding: '0.375rem 0.75rem'
                        }}
                      >
                        Add Action Item
                      </Button>
                    </div>
                    {discussion.actionItems.map((item, itemIndex) => (
                      <div key={itemIndex} className="card mb-2">
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-2">
                            <small>Action Item {itemIndex + 1}</small>
                            <Button
                              variant="link"
                              className="text-danger p-0"
                              onClick={() => removeActionItem(index, itemIndex)}
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <Form.Group className="mb-2">
                                <RequiredLabel text="Task" tooltip="Action item to be completed" />
                                <Form.Control
                                  style={{ 
                                    fontSize: '0.875rem',
                                    padding: '0.375rem 0.75rem',
                                    height: 'calc(1.5em + 0.75rem + 2px)'
                                  }}
                                  type="text"
                                  value={item.task}
                                  onChange={(e) => handleActionItemChange(index, itemIndex, 'task', e.target.value)}
                                  required
                                />
                              </Form.Group>
                            </div>
                            <div className="col-md-6">
                              <Form.Group className="mb-2">
                                <RequiredLabel text="Assignee" tooltip="Person responsible for the task" />
                                <Form.Control
                                  style={{ 
                                    fontSize: '0.875rem',
                                    padding: '0.375rem 0.75rem',
                                    height: 'calc(1.5em + 0.75rem + 2px)'
                                  }}
                                  type="text"
                                  value={item.assignee}
                                  onChange={(e) => handleActionItemChange(index, itemIndex, 'assignee', e.target.value)}
                                  required
                                />
                              </Form.Group>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <Form.Group className="mb-2">
                                <RequiredLabel text="Due Date" tooltip="Deadline for completing the task" />
                                <Form.Control
                                  style={{ 
                                    fontSize: '0.875rem',
                                    padding: '0.375rem 0.75rem',
                                    height: 'calc(1.5em + 0.75rem + 2px)'
                                  }}
                                  type="date"
                                  value={item.dueDate}
                                  onChange={(e) => handleActionItemChange(index, itemIndex, 'dueDate', e.target.value)}
                                  required
                                  max={new Date().toISOString().split('T')[0]}
                                />
                              </Form.Group>
                            </div>
                            <div className="col-md-6">
                              <Form.Group className="mb-2">
                                <RequiredLabel text="Status" tooltip="Current status of the task" />
                                <Form.Select
                                  style={{ 
                                    fontSize: '0.875rem',
                                    padding: '0.375rem 0.75rem',
                                    height: 'calc(1.5em + 0.75rem + 2px)'
                                  }}
                                  value={item.status}
                                  onChange={(e) => handleActionItemChange(index, itemIndex, 'status', e.target.value)}
                                  required
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </Form.Select>
                              </Form.Group>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resolutions */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0" style={{ fontSize: '1rem' }}>Resolutions</h6>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={addResolution}
                style={{ 
                  fontSize: '0.875rem',
                  padding: '0.375rem 0.75rem'
                }}
              >
                Add Resolution
              </Button>
            </div>
            {formData.resolutions.map((resolution, index) => (
              <div key={index} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <h6 className="mb-0">Resolution {index + 1}</h6>
                    <Button
                      variant="link"
                      className="text-danger p-0"
                      onClick={() => removeResolution(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <Form.Group className="mb-3">
                    <RequiredLabel text="Title" tooltip="Title of the resolution" />
                    <Form.Control
                      style={{ 
                        fontSize: '0.875rem',
                        padding: '0.375rem 0.75rem',
                        height: 'calc(1.5em + 0.75rem + 2px)'
                      }}
                      type="text"
                      value={resolution.title}
                      onChange={(e) => handleResolutionChange(index, 'title', e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <RequiredLabel text="Type" tooltip="Type of resolution" />
                    <Form.Select
                      style={{ 
                        fontSize: '0.875rem',
                        padding: '0.375rem 0.75rem',
                        height: 'calc(1.5em + 0.75rem + 2px)'
                      }}
                      value={resolution.type}
                      onChange={(e) => handleResolutionChange(index, 'type', e.target.value)}
                      required
                    >
                      <option value="Ordinary">Ordinary</option>
                      <option value="Special">Special</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <RequiredLabel text="Description" tooltip="Detailed description of the resolution" />
                    <Form.Control
                      style={{ 
                        fontSize: '0.875rem',
                        padding: '0.375rem 0.75rem'
                      }}
                      as="textarea"
                      rows={2}
                      value={resolution.description}
                      onChange={(e) => handleResolutionChange(index, 'description', e.target.value)}
                      required
                    />
                  </Form.Group>
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <RequiredLabel text="Proposed By" tooltip="Person who proposed the resolution" />
                        <Form.Control
                          style={{ 
                            fontSize: '0.875rem',
                            padding: '0.375rem 0.75rem',
                            height: 'calc(1.5em + 0.75rem + 2px)'
                          }}
                          type="text"
                          value={resolution.proposedBy}
                          onChange={(e) => handleResolutionChange(index, 'proposedBy', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <RequiredLabel text="Seconded By" tooltip="Person who seconded the resolution" />
                        <Form.Control
                          style={{ 
                            fontSize: '0.875rem',
                            padding: '0.375rem 0.75rem',
                            height: 'calc(1.5em + 0.75rem + 2px)'
                          }}
                          type="text"
                          value={resolution.secondedBy}
                          onChange={(e) => handleResolutionChange(index, 'secondedBy', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </div>
                  </div>
                  {minute && (
                    <Form.Group>
                      <RequiredLabel text="Outcome" tooltip="Result of the resolution" />
                      <Form.Select
                        style={{ 
                          fontSize: '0.875rem',
                          padding: '0.375rem 0.75rem',
                          height: 'calc(1.5em + 0.75rem + 2px)'
                        }}
                        value={resolution.outcome}
                        onChange={(e) => handleResolutionChange(index, 'outcome', e.target.value)}
                        required
                      >
                        <option value="Pending">Pending</option>
                        <option value="Passed">Passed</option>
                        <option value="Failed">Failed</option>
                        <option value="Withdrawn">Withdrawn</option>
                      </Form.Select>
                    </Form.Group>
                  )}
                </div>
              </div>
            ))}
          </div>

          {minute && (
            <Form.Group className="mb-3">
              <RequiredLabel text="Status" tooltip="Current status of the board minute" />
              <Form.Select
                style={{ 
                  fontSize: '0.875rem',
                  padding: '0.375rem 0.75rem',
                  height: 'calc(1.5em + 0.75rem + 2px)'
                }}
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Draft">Draft</option>
                <option value="Final">Final</option>
                <option value="Signed">Signed</option>
              </Form.Select>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer style={{ padding: '0.75rem 1rem', borderTop: '1px solid #dee2e6' }}>
          <Button 
            variant="secondary" 
            onClick={onHide}
            size="sm"
            style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
            size="sm"
            style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BoardMinuteModal;
