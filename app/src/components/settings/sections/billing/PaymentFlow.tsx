import React, { useState } from 'react';
import { Invoice, PaymentMethod } from './types';

interface PaymentFlowProps {
  invoice: Invoice;
  paymentMethods: PaymentMethod[];
  onAddPaymentMethod: () => void;
  onPay: (paymentMethodId: string) => void;
  onClose: () => void;
}

const PaymentFlow: React.FC<PaymentFlowProps> = ({
  invoice,
  paymentMethods,
  onAddPaymentMethod,
  onPay,
  onClose
}) => {
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    paymentMethods.find(m => m.isDefault)?.id || ''
  );

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getPaymentIcon = (type: string): string => {
    switch (type) {
      case 'card':
        return 'bi-credit-card';
      case 'bank':
        return 'bi-bank';
      default:
        return 'bi-credit-card';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMethodId) {
      onPay(selectedMethodId);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Pay Invoice #{invoice.number}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Amount Summary */}
              <div className="text-center mb-4">
                <h6 className="text-muted mb-1">Amount Due</h6>
                <h3 className="mb-0">{formatCurrency(invoice.amount, invoice.currency)}</h3>
              </div>

              {/* Payment Methods */}
              {paymentMethods.length > 0 ? (
                <div className="mb-4">
                  <h6 className="mb-3">Select Payment Method</h6>
                  <div className="list-group">
                    {paymentMethods.map(method => (
                      <label
                        key={method.id}
                        className={`list-group-item list-group-item-action ${
                          selectedMethodId === method.id ? 'active' : ''
                        }`}
                      >
                        <div className="d-flex align-items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            className="form-check-input me-3"
                            value={method.id}
                            checked={selectedMethodId === method.id}
                            onChange={(e) => setSelectedMethodId(e.target.value)}
                          />
                          <div className="d-flex align-items-center flex-grow-1">
                            <i className={`bi ${getPaymentIcon(method.type)} me-2`}></i>
                            <div>
                              <div>•••• {method.lastFour}</div>
                              <small className="text-muted">
                                Expires {method.expiryDate}
                                {method.isDefault && (
                                  <span className="badge bg-primary ms-2">Default</span>
                                )}
                              </small>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center mb-4">
                  <p className="mb-3">No payment methods available</p>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={onAddPaymentMethod}
                  >
                    <i className="bi bi-plus-lg me-2"></i>
                    Add Payment Method
                  </button>
                </div>
              )}

              {/* Add New Method Button */}
              {paymentMethods.length > 0 && (
                <button
                  type="button"
                  className="btn btn-link w-100"
                  onClick={onAddPaymentMethod}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Add New Payment Method
                </button>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-link" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!selectedMethodId || paymentMethods.length === 0}
              >
                Pay {formatCurrency(invoice.amount, invoice.currency)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentFlow;
