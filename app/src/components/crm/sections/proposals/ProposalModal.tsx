import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Table, Badge } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import 'bootstrap';

// Initialize Bootstrap Tab type
declare const bootstrap: {
  Tab: new (element: Element) => {
    show(): void;
  };
};
import { Proposal, Product, PlanType, Status, Contact } from '../../../crm/types';
import ProductPlanModal from './ProductPlanModal';
import * as crmService from '../../../../services/crm';

interface ProposalModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (proposal: Proposal) => void;
  proposal: Proposal | null;
}

interface ProductPlan {
  productId: string;
  planType: PlanType;
  quantity: number;
  price: number;
  features: string[];
}

interface ProposalFormData {
  id?: string;
  name: string;
  template?: string;
  content: any;
  variables?: any;
  status: Status;
  validUntil?: Date;
  dealId?: string;
  contactId?: string;
}

const ProposalModal: React.FC<ProposalModalProps> = ({
  show,
  onHide,
  onSave,
  proposal,
}) => {
  const [selectedProducts, setSelectedProducts] = useState<ProductPlan[]>(
    proposal?.products.map(p => ({
      productId: p.productId,
      planType: p.planType,
      quantity: p.quantity,
      price: p.price,
      features: p.features,
    })) || []
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize Bootstrap tabs
  useEffect(() => {
    if (show) {
      const tabElements = document.querySelectorAll('[data-bs-toggle="pill"]');
      tabElements.forEach(element => {
        const tab = new bootstrap.Tab(element);
        element.addEventListener('click', (e) => {
          e.preventDefault();
          tab.show();
        });
      });

      // Show the first tab by default
      const firstTab = document.querySelector('[data-bs-toggle="pill"]');
      if (firstTab) {
        new bootstrap.Tab(firstTab).show();
      }

      // Load data and reset selected products
      loadData();
      if (proposal) {
        setSelectedProducts(
          proposal.products.map(p => ({
            productId: p.productId,
            planType: p.planType,
            quantity: p.quantity,
            price: p.price,
            features: p.features,
          }))
        );
      } else {
        setSelectedProducts([]);
      }
    }
  }, [show, proposal]);

  const loadData = async () => {
    try {
      const [productsData, contactsData] = await Promise.all([
        crmService.getProducts(),
        crmService.getContacts(),
      ]);
      setProducts(productsData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProposalFormData>({
    defaultValues: proposal || {
      name: '',
      content: {},
      status: 'Active',
    },
  });

  const onSubmit = (data: ProposalFormData) => {
    const proposalData: Proposal = {
      ...data,
      id: data.id || crypto.randomUUID(),
      products: selectedProducts.map((p) => ({
        id: crypto.randomUUID(),
        proposalId: data.id || '',
        productId: p.productId,
        planType: p.planType,
        quantity: p.quantity,
        price: p.price,
        features: p.features,
        product: products.find(prod => prod.id === p.productId)!,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onSave(proposalData);
    reset();
  };

  const [showProductModal, setShowProductModal] = useState(false);

  const handleAddProduct = () => {
    setShowProductModal(true);
  };

  const handleProductSelect = (productPlan: ProductPlan) => {
    setSelectedProducts([...selectedProducts, productPlan]);
    setShowProductModal(false);
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : productId;
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{proposal ? 'Edit Proposal' : 'Create New Proposal'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <h6 className="text-muted mb-2">Fields marked with <span className="text-danger">*</span> are required</h6>

            <div className="modal-tabs-container">
              <div className="nav flex-column nav-pills modal-nav-pills">
                <div className="nav-link active d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#basic-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Basic Information
                </div>
                <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#products-plans">
                  <i className="bi bi-box me-2"></i>
                  Products & Plans
                </div>
                <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#additional-info">
                  <i className="bi bi-three-dots me-2"></i>
                  Additional Information
                </div>
              </div>

              <div className="tab-content modal-tab-content">
                {/* Basic Information Tab */}
                <div className="tab-pane fade show active" id="basic-info">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <i className="bi bi-tag me-2"></i>
                          Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          size="sm"
                          type="text"
                          {...register('name', { required: 'Name is required' })}
                          isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.name?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <i className="bi bi-calendar me-2"></i>
                          Valid Until
                        </Form.Label>
                        <Form.Control
                          size="sm"
                          type="date"
                          {...register('validUntil')}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <i className="bi bi-person me-2"></i>
                          Contact <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select 
                          size="sm"
                          {...register('contactId', { required: 'Contact is required' })} 
                          isInvalid={!!errors.contactId}
                        >
                          <option value="">Select a contact</option>
                          {contacts.map(contact => (
                            <option key={contact.id} value={contact.id}>
                              {contact.firstName} {contact.lastName}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.contactId?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <i className="bi bi-briefcase me-2"></i>
                          Deal
                        </Form.Label>
                        <Form.Control
                          size="sm"
                          type="text"
                          {...register('dealId')}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="bi bi-circle me-2"></i>
                      Status <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select size="sm" {...register('status')}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Archived">Archived</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                {/* Products & Plans Tab */}
                <div className="tab-pane fade" id="products-plans">

                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">Selected Products</h6>
                        <Button variant="outline-primary" size="sm" onClick={handleAddProduct}>
                          <i className="bi bi-plus-lg me-2"></i>
                          Add Product
                        </Button>
                      </div>

                      {selectedProducts.length === 0 ? (
                        <div className="text-center py-4">
                          <i className="bi bi-box-seam fs-1 text-muted"></i>
                          <p className="mt-2 mb-0">No products added yet</p>
                          <p className="text-muted small">Add products to include in this proposal</p>
                        </div>
                      ) : (
                        <Table responsive hover size="sm">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Plan Type</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedProducts.map((product, index) => (
                              <tr key={index}>
                                <td>{getProductName(product.productId)}</td>
                                <td>
                                  <Badge bg="info">{product.planType}</Badge>
                                </td>
                                <td>{product.quantity}</td>
                                <td>${product.price.toFixed(2)}</td>
                                <td>
                                  <Button
                                    variant="link"
                                    className="p-0 text-danger"
                                    onClick={() => {
                                      const newProducts = [...selectedProducts];
                                      newProducts.splice(index, 1);
                                      setSelectedProducts(newProducts);
                                    }}
                                    title="Remove Product"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}
                    </>
                  )}
                </div>

                {/* Additional Information Tab */}
                <div className="tab-pane fade" id="additional-info">
                  <p className="text-muted">Additional proposal details and settings can be added here in the future.</p>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <ProductPlanModal
        show={showProductModal}
        onHide={() => setShowProductModal(false)}
        onSelect={handleProductSelect}
        products={products}
      />
    </>
  );
};

export default ProposalModal;
