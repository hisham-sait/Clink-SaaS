import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaCheck, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';

import { Meeting, Resolution } from '../../../../services/statutory/types';
import { 
  parseDate, 
  formatYYYYMMDD, 
  formatDDMMYYYY,
  isValidStatutoryDate,
  formatStatutoryDate
} from '../../../../utils';

interface MeetingModalProps {
  show: boolean;
  onHide: () => void;
  meeting?: Meeting;
  onSuccess: () => void;
}

const MeetingModal: React.FC<MeetingModalProps> = ({ show, onHide, meeting, onSuccess }) => {
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

  const [formData, setFormData] = useState<Meeting>({
    meetingType: 'Board Meeting',
    meetingDate: formatYYYYMMDD(new Date()),
    startTime: '',
    endTime: '',
    venue: '',
    chairperson: '',
    quorumRequired: 1,
    quorumPresent: 0,
    quorumAchieved: false,
    attendees: [],
    agenda: '',
    status: 'Draft',
    resolutions: []
  });

  useEffect(() => {
    if (meeting) {
      // Parse date from DD/MM/YYYY format to YYYY-MM-DD for form input
      const meetingDateObj = parseDate(meeting.meetingDate);
      
      // Parse times from the API format
      const startTimeObj = new Date(meeting.startTime);
      const endTimeObj = new Date(meeting.endTime);

      setFormData({
        ...meeting,
        meetingDate: meetingDateObj ? formatYYYYMMDD(meetingDateObj) : '',
        startTime: startTimeObj.toTimeString().slice(0, 5), // HH:mm format
        endTime: endTimeObj.toTimeString().slice(0, 5) // HH:mm format
      });
    } else {
      setFormData({
        meetingType: 'Board Meeting',
        meetingDate: formatYYYYMMDD(new Date()),
        startTime: '',
        endTime: '',
        venue: '',
        chairperson: '',
        quorumRequired: 1,
        quorumPresent: 0,
        quorumAchieved: false,
        attendees: [],
        agenda: '',
        status: 'Draft',
        resolutions: []
      });
    }
    setError('');
  }, [meeting, show]);

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
        !formData.agenda || formData.attendees.length === 0) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Validate meeting date
    const meetingDate = new Date(formData.meetingDate);
    if (!isValidStatutoryDate(meetingDate, { allowFuture: true })) {
      setError('Invalid meeting date');
      setLoading(false);
      return;
    }

    // Validate start and end times
    const startDateTime = new Date(`${formData.meetingDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.meetingDate}T${formData.endTime}`);
    if (endDateTime <= startDateTime) {
      setError('End time must be after start time');
      setLoading(false);
      return;
    }

    try {
      // Convert YYYY-MM-DD date to DD/MM/YYYY format for API
      const apiData = {
        ...formData,
        meetingDate: formatDDMMYYYY(new Date(formData.meetingDate)),
        // Combine date and time for API
        startTime: `${formData.meetingDate}T${formData.startTime}:00`,
        endTime: `${formData.meetingDate}T${formData.endTime}:00`,
        quorumAchieved: formData.quorumPresent >= formData.quorumRequired
      };

      if (meeting?.id) {
        await api.put(`/statutory/meetings/${user.companyId}/${meeting.id}`, apiData);
      } else {
        await api.post(`/statutory/meetings/${user.companyId}`, apiData);
      }
      setSuccess(true);
      onSuccess();
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err) {
      console.error('Error saving meeting:', err);
      setError('Failed to save meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const { name, value } = target;
    
    if (name === 'quorumRequired' || name === 'quorumPresent') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0,
        quorumAchieved: name === 'quorumPresent' ? 
          parseInt(value) >= prev.quorumRequired :
          name === 'quorumRequired' ?
          prev.quorumPresent >= parseInt(value) :
          prev.quorumAchieved
      }));
    } else if (name === 'attendees') {
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

  const handleResolutionChange = (index: number, field: keyof Resolution, value: string) => {
    setFormData(prev => ({
      ...prev,
      resolutions: prev.resolutions.map((resolution, i) => 
        i === index ? { ...resolution, [field]: value } : resolution
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
          <Modal.Title style={{ fontSize: '1.1rem' }}>{meeting ? 'Edit Meeting' : 'Add New Meeting'}</Modal.Title>
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
                  Meeting {meeting ? 'updated' : 'added'} successfully!
                </div>
              </div>
            </div>
          )}
          
          <div className="row g-2">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Meeting Type" tooltip="Type of meeting being conducted" />
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
                <RequiredLabel text="Meeting Date" tooltip="Date of the meeting" />
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
                <RequiredLabel text="Start Time" tooltip="Meeting start time" />
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
                <RequiredLabel text="End Time" tooltip="Meeting end time" />
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
                <RequiredLabel text="Venue" tooltip="Location where the meeting is held" />
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
                <RequiredLabel text="Chairperson" tooltip="Person chairing the meeting" />
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

          <div className="row g-2">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Quorum Required" tooltip="Minimum number of members required for the meeting" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="number"
                  name="quorumRequired"
                  value={formData.quorumRequired}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Quorum Present" tooltip="Actual number of members present" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="number"
                  name="quorumPresent"
                  value={formData.quorumPresent}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <RequiredLabel text="Attendees" tooltip="List of people attending the meeting (comma-separated)" />
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
            <RequiredLabel text="Agenda" tooltip="Topics to be discussed in the meeting" />
            <Form.Control
              style={{ 
                fontSize: '0.875rem',
                padding: '0.375rem 0.75rem'
              }}
              as="textarea"
              name="agenda"
              value={formData.agenda}
              onChange={handleChange}
              required
              rows={3}
            />
          </Form.Group>

          {meeting && (
            <Form.Group className="mb-3">
              <RequiredLabel text="Status" tooltip="Current status of the meeting" />
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
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          )}

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
                  <div className="row g-2">
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
                  {meeting && (
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

export default MeetingModal;
