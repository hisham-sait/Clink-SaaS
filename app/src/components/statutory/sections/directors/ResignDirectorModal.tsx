import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';

interface ResignDirectorModalProps {
  show: boolean;
  onHide: () => void;
  director: {
    title: string;
    firstName: string;
    lastName: string;
    directorType: string;
  };
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
  const [resignationDate, setResignationDate] = useState(
    new Date().toLocaleDateString('en-IE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  );

  const validateDate = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return !isNaN(date.getTime()) && 
           date.getDate() === day && 
           date.getMonth() === month - 1 && 
           date.getFullYear() === year;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Allow empty value or validate format
    if (!value || /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      setResignationDate(value);
    }
  };

  const handleNext = () => {
    if (!validateDate(resignationDate)) {
      return; // Don't proceed if date is invalid
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleConfirm = () => {
    if (!validateDate(resignationDate)) {
      return; // Don't confirm if date is invalid
    }
    // Convert to ISO format for API
    const [day, month, year] = resignationDate.split('/').map(Number);
    const isoDate = new Date(year, month - 1, day).toISOString().split('T')[0];
    
    setLoading(true);
    onConfirm(isoDate);
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
    onHide();
  };

  const formatDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-IE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {step === 1 ? 'Resign Director' : 'Confirm Resignation'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Resignation Date</Form.Label>
              <Form.Control
                type="text"
                value={resignationDate}
                onChange={handleDateChange}
                placeholder="DD/MM/YYYY"
                pattern="\d{2}/\d{2}/\d{4}"
                required
              />
              <Form.Text className="text-muted">
                Format: DD/MM/YYYY
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
              resigned from {resignationDate}. This action cannot be undone.
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
                  disabled={!validateDate(resignationDate)}
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
