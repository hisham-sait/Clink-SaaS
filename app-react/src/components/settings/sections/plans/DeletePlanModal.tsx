import React from 'react';
import type { Plan } from '../../../../services/settings/types';
import { formatPrice, formatLimit } from '../../../../services/settings/plans';

interface DeletePlanModalProps {
  show: boolean;
  onHide: () => void;
  plan: Plan | null;
  onConfirm: () => void;
}

const DeletePlanModal: React.FC<DeletePlanModalProps> = ({ show, onHide, plan, onConfirm }) => {
  if (!show || !plan) return null;

  return (
    <div className="modal d-block">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header border-bottom-0">
            <h5 className="modal-title text-danger">Delete Plan</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <div className="text-center mb-4">
              <i className="bi bi-exclamation-triangle text-danger display-4"></i>
            </div>
            <p className="text-center mb-1">Are you sure you want to delete this plan?</p>
            <p className="text-center text-muted mb-4">This action cannot be undone.</p>

            <div className="alert alert-warning">
              <h6 className="alert-heading mb-2">Plan Details:</h6>
              <p className="mb-1"><strong>Name:</strong> {plan.name}</p>
              <p className="mb-1">
                <strong>Price:</strong> {formatPrice(plan.price, plan.billingCycle)}
              </p>
              <p className="mb-1">
                <strong>Users:</strong> {formatLimit(plan.maxUsers)}
              </p>
              <p className="mb-0">
                <strong>Companies:</strong> {formatLimit(plan.maxCompanies)}
              </p>
            </div>

            <div className="alert alert-danger mb-0">
              <i className="bi bi-exclamation-circle me-2"></i>
              Deleting this plan will remove it from the system and affect any companies currently using it.
            </div>
          </div>
          <div className="modal-footer border-top-0">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirm}>
              Delete Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePlanModal;
