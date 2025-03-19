import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';

import { Director } from '../../../../services/statutory/types';
import { 
  parseDate, 
  formatYYYYMMDD, 
  formatDDMMYYYY,
  isValidStatutoryDate,
  formatStatutoryDate
} from '@bradan/shared';

interface ResignDirectorModalProps {
  show: boolean;
  onHide: () => void;
  director: Director;
  onConfirm: (date: string) => void;
}

const ResignDirectorModal: React.FC<ResignDirectorModalProps> = ({
  show,
  onHide,
  director,
  onConfirm
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resignationDate, setResignationDate] = useState(
    formatYYYYMMDD(new Date())
  );

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setResignationDate(value);
    setError(null);
  };

  const validateDate = () => {
    const date = new Date(resignationDate);
    const appointmentDate = parseDate(director.appointmentDate);

    if (!isValidStatutoryDate(date, { allowFuture: false })) {
      setError('Invalid resignation date');
      return false;
    }

    if (appointmentDate && date < appointmentDate) {
      setError('Resignation date cannot be before appointment date');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateDate()) return;
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError(null);
  };

  const handleConfirm = () => {
    if (!validateDate()) return;
    
    setLoading(true);
    onConfirm(resignationDate);
    setSuccess(true);
    
    // Wait for 1.5 seconds to show success message before closing
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    setStep(1);
    setSuccess(false);
    setLoading(false);
    setError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {step === 1 ? 'Resign Director' : 'Confirm Resignation'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        {success ? (
          <div className="alert alert-success">
            <div className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                <FaCheck className="text-success" />
              </div>
              <div>
                Director resigned successfully!
              </div>
            </div>
          </div>
        ) : step === 1 ? (
          <>
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              You are about to resign the following director:
            </div>
            <div className="mb-4">
              <p className="mb-2">
                <strong>Name:</strong>{' '}
                {`${director.title} ${director.firstName} ${director.lastName}`}
              </p>
              <p className="mb-2">
                <strong>Position:</strong> {director.directorType}
              </p>
              <p className="mb-2">
                <strong>Appointment Date:</strong> {formatDDMMYYYY(parseDate(director.appointmentDate)!)}
              </p>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Resignation Date</Form.Label>
              <Form.Control
                type="date"
                value={resignationDate}
                onChange={handleDateChange}
                max={new Date().toISOString().split('T')[0]}
                required
              />
              <Form.Text className="text-muted">
                Select the date when the director resigned
              </Form.Text>
            </Form.Group>
          </>
        ) : (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Please confirm:</strong>
            <p className="mt-2 mb-0">
              This action will mark{' '}
              {`${director.title} ${director.firstName} ${director.lastName}`} as
              resigned from {formatDDMMYYYY(new Date(resignationDate))}. This action cannot be undone.
            </p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!success && (
          <>
            {step === 1 ? (
              <>
                <Button variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleNext}
                  disabled={!resignationDate}
                >
                  Next
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  variant="danger" 
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Resigning...
                    </>
                  ) : (
                    'Confirm Resignation'
                  )}
                </Button>
              </>
            )}
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ResignDirectorModal;
