import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

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
  const [resignationDate, setResignationDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleConfirm = () => {
    onConfirm(resignationDate);
  };

  const handleClose = () => {
    setStep(1);
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
        {step === 1 ? (
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
                type="date"
                value={resignationDate}
                onChange={(e) => setResignationDate(e.target.value)}
              />
            </Form.Group>
          </>
        ) : (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Please confirm:</strong>
            <p className="mt-2 mb-0">
              This action will mark{' '}
              {`${director.title} ${director.firstName} ${director.lastName}`} as
              resigned from {new Date(resignationDate).toLocaleDateString()}. This
              action cannot be undone.
            </p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {step === 1 ? (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleNext}>
              Next
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button variant="danger" onClick={handleConfirm}>
              Confirm Resignation
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ResignDirectorModal;
