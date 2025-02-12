import React, { useState } from 'react';
import { PaymentMethodFormData } from './types';

interface AddPaymentMethodModalProps {
  onSave: (data: PaymentMethodFormData) => void;
  onClose: () => void;
}

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState<PaymentMethodFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    setDefault: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardNumber.match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    if (!formData.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }

    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    if (!formData.nameOnCard.trim()) {
      newErrors.nameOnCard = 'Name on card is required';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Payment Method</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  className={`form-control ${errors.cardNumber ? 'is-invalid' : ''}`}
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                />
                {errors.cardNumber && (
                  <div className="invalid-feedback">{errors.cardNumber}</div>
                )}
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="text"
                    className={`form-control ${errors.expiryDate ? 'is-invalid' : ''}`}
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    placeholder="MM/YY"
                  />
                  {errors.expiryDate && (
                    <div className="invalid-feedback">{errors.expiryDate}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">CVV</label>
                  <input
                    type="text"
                    className={`form-control ${errors.cvv ? 'is-invalid' : ''}`}
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="123"
                  />
                  {errors.cvv && (
                    <div className="invalid-feedback">{errors.cvv}</div>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Name on Card</label>
                <input
                  type="text"
                  className={`form-control ${errors.nameOnCard ? 'is-invalid' : ''}`}
                  name="nameOnCard"
                  value={formData.nameOnCard}
                  onChange={handleChange}
                />
                {errors.nameOnCard && (
                  <div className="invalid-feedback">{errors.nameOnCard}</div>
                )}
              </div>
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="setDefault"
                  id="setDefault"
                  checked={formData.setDefault}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="setDefault">
                  Set as default payment method
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-link" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.nameOnCard}
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentMethodModal;
