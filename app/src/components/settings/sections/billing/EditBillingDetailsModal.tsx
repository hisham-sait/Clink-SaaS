import React, { useState } from 'react';
import { BillingDetails } from './types';

interface EditBillingDetailsModalProps {
  currentDetails: BillingDetails;
  onSave: (data: Omit<BillingDetails, 'company'>) => void;
  onClose: () => void;
}

const EditBillingDetailsModal: React.FC<EditBillingDetailsModalProps> = ({
  currentDetails,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<Omit<BillingDetails, 'company'>>({
    taxId: currentDetails.taxId || '',
    address: currentDetails.address || '',
    city: currentDetails.city || '',
    state: currentDetails.state || '',
    country: currentDetails.country || '',
    postalCode: currentDetails.postalCode || '',
    currency: currentDetails.currency || 'EUR',
    paymentTerms: currentDetails.paymentTerms || 30
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.taxId.trim()) {
      newErrors.taxId = 'Tax ID is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }
    if (formData.paymentTerms < 0) {
      newErrors.paymentTerms = 'Payment terms must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Billing Details</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Tax ID</label>
                <input
                  type="text"
                  className={`form-control ${errors.taxId ? 'is-invalid' : ''}`}
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                />
                {errors.taxId && (
                  <div className="invalid-feedback">{errors.taxId}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && (
                  <div className="invalid-feedback">{errors.address}</div>
                )}
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  {errors.city && (
                    <div className="invalid-feedback">{errors.city}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                  {errors.state && (
                    <div className="invalid-feedback">{errors.state}</div>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                  {errors.country && (
                    <div className="invalid-feedback">{errors.country}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`}
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                  />
                  {errors.postalCode && (
                    <div className="invalid-feedback">{errors.postalCode}</div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Currency</label>
                <select
                  className="form-select"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Payment Terms (Days)</label>
                <input
                  type="number"
                  className={`form-control ${errors.paymentTerms ? 'is-invalid' : ''}`}
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  min="0"
                />
                {errors.paymentTerms && (
                  <div className="invalid-feedback">{errors.paymentTerms}</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-link" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBillingDetailsModal;
