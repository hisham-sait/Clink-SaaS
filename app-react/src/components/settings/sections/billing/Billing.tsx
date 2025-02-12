import React, { useState, useEffect } from 'react';
import { BillingDetails, Company, Invoice, PaymentMethod } from './types';
import AddPaymentMethodModal from './AddPaymentMethodModal';
import EditBillingDetailsModal from './EditBillingDetailsModal';
import CreateInvoiceModal from './CreateInvoiceModal';
import InvoiceViewer from './InvoiceViewer';
import PaymentFlow from './PaymentFlow';
import { Button, Card, Row, Col, Badge, Table, Dropdown, ButtonGroup } from 'react-bootstrap';

const Billing: React.FC = () => {
  // Role flags (TODO: Get from auth context)
  const isPlatformAdmin = false;
  const isCompanyAdmin = true;

  // State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [showEditBillingDetails, setShowEditBillingDetails] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  // TODO: Replace with actual API calls
  useEffect(() => {
    // Simulated data
    setBillingDetails({
      taxId: '123456789',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      currency: 'USD',
      paymentTerms: 30,
      company: {
        id: '1',
        name: 'Acme Corp',
        legalName: 'Acme Corporation'
      }
    });

    setPaymentMethods([
      {
        id: '1',
        type: 'card',
        lastFour: '4242',
        expiryDate: '12/25',
        isDefault: true
      }
    ]);

    setInvoices([
      {
        id: '1',
        companyId: '1',
        number: 'INV-001',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 1000,
        currency: 'USD',
        status: 'Pending',
        description: 'Monthly subscription'
      }
    ]);
  }, []);

  const handleError = (error: any) => {
    console.error('Error:', error);
    setError(error.message || 'An unexpected error occurred');
    setTimeout(() => setError(null), 5000);
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

  const getStatusBadgeClass = (status: string): string => {
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
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Billing & Payments</h1>
          <p className="text-muted mb-0">Manage your billing information and view invoices</p>
        </div>
        <div className="d-flex">
          {isPlatformAdmin && (
            <Button variant="primary" className="me-2" onClick={() => setShowCreateInvoice(true)}>
              <i className="bi bi-plus-lg me-2"></i>
              Create Invoice
            </Button>
          )}
          {isCompanyAdmin && (
            <Button variant="outline-primary" onClick={() => setShowAddPaymentMethod(true)}>
              <i className="bi bi-credit-card me-2"></i>
              Add Payment Method
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Billing Details */}
      <Card className="mb-4">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0">Billing Details</h5>
          {isCompanyAdmin && (
            <Button
              variant="link"
              className="p-0"
              onClick={() => setShowEditBillingDetails(true)}
            >
              <i className="bi bi-pencil"></i>
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          {billingDetails && (
            <Row>
              <Col md={6}>
                <dl className="row">
                  <dt className="col-sm-4">Company Name</dt>
                  <dd className="col-sm-8">{billingDetails.company?.legalName}</dd>

                  <dt className="col-sm-4">Tax ID</dt>
                  <dd className="col-sm-8">{billingDetails.taxId}</dd>

                  <dt className="col-sm-4">Currency</dt>
                  <dd className="col-sm-8">{billingDetails.currency}</dd>

                  <dt className="col-sm-4">Payment Terms</dt>
                  <dd className="col-sm-8">{billingDetails.paymentTerms} days</dd>
                </dl>
              </Col>
              <Col md={6}>
                <dl className="row">
                  <dt className="col-sm-4">Address</dt>
                  <dd className="col-sm-8">
                    {billingDetails.address}<br />
                    {billingDetails.city}, {billingDetails.state}<br />
                    {billingDetails.country} {billingDetails.postalCode}
                  </dd>
                </dl>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Payment Methods */}
      {isCompanyAdmin && (
        <Card className="mb-4">
          <Card.Header className="bg-white py-3">
            <h5 className="mb-0">Payment Methods</h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              {paymentMethods.map(method => (
                <Col key={method.id} md={4}>
                  <Card className="h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <i className={`bi ${getPaymentIcon(method.type)}`}></i>
                          <span className="ms-2">•••• {method.lastFour}</span>
                        </div>
                        <Dropdown>
                          <Dropdown.Toggle variant="link" className="p-0">
                            <i className="bi bi-three-dots-vertical"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            {!method.isDefault && (
                              <Dropdown.Item>
                                <i className="bi bi-check-circle me-2"></i>
                                Set as Default
                              </Dropdown.Item>
                            )}
                            <Dropdown.Item className="text-danger">
                              <i className="bi bi-trash me-2"></i>
                              Remove
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          Expires {method.expiryDate}
                        </small>
                        {method.isDefault && (
                          <Badge bg="success">Default</Badge>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Invoices */}
      <Card>
        <Card.Header className="bg-white py-3">
          <h5 className="mb-0">Invoices</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="text-uppercase small fw-semibold text-secondary">Invoice #</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Date</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Due Date</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Amount</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Status</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td>{invoice.number}</td>
                    <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: invoice.currency
                      }).format(invoice.amount)}
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeClass(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td>
                      <ButtonGroup>
                        <Button
                          variant="link"
                          className="btn-sm text-body px-2"
                          onClick={() => setSelectedInvoice(invoice)}
                          title="View Invoice"
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        {isCompanyAdmin && invoice.status === 'Pending' && (
                          <Button
                            variant="link"
                            className="btn-sm text-success px-2"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowPaymentFlow(true);
                            }}
                            title="Pay Invoice"
                          >
                            <i className="bi bi-credit-card"></i>
                          </Button>
                        )}
                        {isPlatformAdmin && invoice.status === 'Draft' && (
                          <Button
                            variant="link"
                            className="btn-sm text-danger px-2"
                            title="Delete Invoice"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        )}
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modals */}
      {showAddPaymentMethod && (
        <AddPaymentMethodModal
          onSave={(data) => {
            console.log('Add payment method:', data);
            setShowAddPaymentMethod(false);
          }}
          onClose={() => setShowAddPaymentMethod(false)}
        />
      )}

      {showEditBillingDetails && billingDetails && (
        <EditBillingDetailsModal
          currentDetails={billingDetails}
          onSave={(data) => {
            console.log('Update billing details:', data);
            setShowEditBillingDetails(false);
          }}
          onClose={() => setShowEditBillingDetails(false)}
        />
      )}

      {showCreateInvoice && (
        <CreateInvoiceModal
          companies={companies}
          onSave={(data) => {
            console.log('Create invoice:', data);
            setShowCreateInvoice(false);
          }}
          onClose={() => setShowCreateInvoice(false)}
        />
      )}

      {selectedInvoice && !showPaymentFlow && (
        <InvoiceViewer
          invoice={selectedInvoice}
          onPay={() => setShowPaymentFlow(true)}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {selectedInvoice && showPaymentFlow && (
        <PaymentFlow
          invoice={selectedInvoice}
          paymentMethods={paymentMethods}
          onAddPaymentMethod={() => {
            setShowPaymentFlow(false);
            setShowAddPaymentMethod(true);
          }}
          onPay={(paymentMethodId) => {
            console.log('Process payment:', { invoiceId: selectedInvoice.id, paymentMethodId });
            setShowPaymentFlow(false);
            setSelectedInvoice(null);
          }}
          onClose={() => {
            setShowPaymentFlow(false);
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
};

export default Billing;
