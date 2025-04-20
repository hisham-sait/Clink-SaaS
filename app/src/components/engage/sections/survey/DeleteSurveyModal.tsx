import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface DeleteSurveyModalProps {
  show: boolean;
  onHide: () => void;
  survey: {
    id: string;
    title: string;
  } | null;
  handleDeleteSurvey: () => void;
}

const DeleteSurveyModal: React.FC<DeleteSurveyModalProps> = ({
  show,
  onHide,
  survey,
  handleDeleteSurvey
}) => {
  if (!survey) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Survey</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete the survey <strong>"{survey.title}"</strong>?</p>
        <p className="text-danger">This action cannot be undone and will delete all associated responses.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDeleteSurvey}>
          Delete Survey
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteSurveyModal;
