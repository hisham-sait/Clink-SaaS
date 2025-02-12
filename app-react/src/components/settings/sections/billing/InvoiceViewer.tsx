import React from 'react';
import { Invoice } from './types';

interface InvoiceViewerProps {
  invoice: Invoice;
  onPay?: () => void;
  onClose: () => void;
}

const InvoiceViewer: React.FC<InvoiceViewerProps> = ({ invoice, onPay, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-success';
      case 'Pending':
        return 'bg-warning';
      case 'Overdue':
        return 'bg-danger';
      case 'Draft':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Invoice #{invoice.number}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Invoice Header */}
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h6 className="text-muted mb-1">Status</h6>
                <span className={`badge ${getStatusBadgeClass(invoice.status)}`}>
                  {invoice.status}
                </span>
              </div>
              <div className="text-end">
                <h6 className="text-muted mb-1">Amount</h6>
                <h4 className="mb-0">{formatCurrency(invoice.amount, invoice.currency)}</h4>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-muted mb-1">Invoice Date</h6>
                    <p className="mb-3">{formatDate(invoice.createdAt)}</p>

                    <h6 className="text-muted mb-1">Due Date</h6>
                    <p className="mb-0">{formatDate(invoice.dueDate)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted mb-1">Description</h6>
                    <p className="mb-0">{invoice.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {invoice.status === 'Paid' && (
              <div className="alert alert-success mb-0">
                <i className="bi bi-check-circle me-2"></i>
                Payment received on {formatDate(invoice.createdAt)}
              </div>
            )}
            {invoice.status === 'Overdue' && (
              <div className="alert alert-danger mb-0">
                <i className="bi bi-exclamation-circle me-2"></i>
                This invoice is overdue. Please make payment as soon as possible.
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-link" onClick={onClose}>
              Close
            </button>
            {invoice.status === 'Pending' && onPay && (
              <button type="button" className="btn btn-primary" onClick={onPay}>
                <i className="bi bi-credit-card me-2"></i>
                Pay Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewer;
