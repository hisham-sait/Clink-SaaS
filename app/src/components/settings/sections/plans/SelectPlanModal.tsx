import React, { useState, useEffect } from 'react';
import type { Plan, Company } from '../../../../services/settings/types';
import * as PlansService from '../../../../services/settings/plans';
import { handleApiError } from '../../../../services/settings';

interface SelectPlanModalProps {
  show: boolean;
  onHide: () => void;
  plan: Plan | null;
  currentPlan: Plan | null;
  currentBillingCompanyId?: string | null;
  onConfirm: (planId: string, billingCompanyId: string) => void;
}

const SelectPlanModal: React.FC<SelectPlanModalProps> = ({
  show,
  onHide,
  plan,
  currentPlan,
  currentBillingCompanyId,
  onConfirm
}) => {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [billingCompanies, setBillingCompanies] = useState<Company[]>([]);
  const [selectedBillingCompanyId, setSelectedBillingCompanyId] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    if (show) {
      loadBillingCompanies();
      if (currentBillingCompanyId) {
        setSelectedBillingCompanyId(currentBillingCompanyId);
        validateSelection(currentBillingCompanyId);
      }
    }
  }, [show, currentBillingCompanyId]);

  const loadBillingCompanies = async () => {
    try {
      setLoading(true);
      const companies = await PlansService.getAvailableBillingCompanies();
      setBillingCompanies(companies);
    } catch (err) {
      setValidationMessage(handleApiError(err));
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  const validateSelection = async (billingCompanyId: string) => {
    if (!plan || !billingCompanyId) {
      setValidationMessage('Please select a billing company');
      setIsValid(false);
      return;
    }

    try {
      setValidating(true);
      const result = await PlansService.validatePlanSelection(plan.id, billingCompanyId);
      setIsValid(result.valid);
      setValidationMessage(result.message || (result.valid ? 'Plan selection is valid' : 'Invalid plan selection'));
    } catch (err) {
      setValidationMessage(handleApiError(err));
      setIsValid(false);
    } finally {
      setValidating(false);
    }
  };

  const handleBillingCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const billingCompanyId = e.target.value;
    setSelectedBillingCompanyId(billingCompanyId);
    validateSelection(billingCompanyId);
  };

  const handleConfirm = () => {
    if (!plan || !selectedBillingCompanyId || !isValid) return;
    onConfirm(plan.id, selectedBillingCompanyId);
  };

  if (!show || !plan) return null;

  return (
    <div className="modal d-block">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Change Subscription Plan</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <p className="mb-4">Are you sure you want to change to the {plan.name} plan?</p>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h6 className="card-title mb-3">Plan Details</h6>
                
                {/* Price */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Price</span>
                  <span className="fw-bold">
                    {PlansService.formatPrice(plan.price, plan.billingCycle)}
                  </span>
                </div>

                {/* Features */}
                <h6 className="mb-2">Features</h6>
                <ul className="list-unstyled mb-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="mb-2">
                      <i className="bi bi-check2 text-success me-2"></i>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Limits */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Users</span>
                  <span>{PlansService.formatLimit(plan.maxUsers)}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Companies</span>
                  <span>{PlansService.formatLimit(plan.maxCompanies)}</span>
                </div>
              </div>
            </div>

            {/* Billing Company Selection */}
            <div className="mb-4">
              <label className="form-label">Select Billing Company</label>
              <select 
                className="form-select"
                value={selectedBillingCompanyId}
                onChange={handleBillingCompanyChange}
                disabled={loading || validating}
              >
                <option value="">Select a company</option>
                {billingCompanies.map(company => (
                  <option 
                    key={company.id} 
                    value={company.id}
                  >
                    {company.name}
                  </option>
                ))}
              </select>
              <small className="text-muted">
                Select the company that will be billed for this plan
              </small>
            </div>

            {/* Validation Message */}
            {validationMessage && (
              <div className={`alert ${isValid ? 'alert-success' : 'alert-danger'}`}>
                <i className={`bi ${isValid ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`}></i>
                {validationMessage}
              </div>
            )}

            <div className="alert alert-info mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Your subscription will be updated immediately. The selected company will be billed the new rate on the next billing cycle.
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={!isValid || !selectedBillingCompanyId || loading || validating}
            >
              {validating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Validating...
                </>
              ) : loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Loading...
                </>
              ) : (
                'Confirm Change'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectPlanModal;
