import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Table } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import 'bootstrap';

// Initialize Bootstrap Tab type
declare const bootstrap: {
  Tab: new (element: Element) => {
    show(): void;
  };
};
import { Product, ProductType, Status, PlanType } from '../../../crm/types';

interface ProductTier {
  type: PlanType;
  price: number;
  features: string[];
  description?: string;
}

interface ProductModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (product: Product) => void;
  product: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({
  show,
  onHide,
  onSave,
  product,
}) => {
  const [tiers, setTiers] = useState<ProductTier[]>(
    product?.tiers || [
      {
        type: 'BASIC',
        price: 0,
        features: [],
        description: 'Basic tier with essential features',
      },
      {
        type: 'STANDARD',
        price: 0,
        features: [],
        description: 'Standard tier with popular features',
      },
      {
        type: 'PREMIUM',
        price: 0,
        features: [],
        description: 'Premium tier with all features',
      },
    ]
  );

  const [newFeature, setNewFeature] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Product>({
    defaultValues: product || {
      name: '',
      description: '',
      type: 'PHYSICAL',
      category: '',
      unit: '',
      sku: '',
      status: 'Active',
    },
  });

  const handleAddFeature = (tierIndex: number) => {
    if (!newFeature.trim()) return;
    const updatedTiers = [...tiers];
    updatedTiers[tierIndex].features.push(newFeature);
    setTiers(updatedTiers);
    setNewFeature('');
  };

  const handleRemoveFeature = (tierIndex: number, featureIndex: number) => {
    const updatedTiers = [...tiers];
    updatedTiers[tierIndex].features.splice(featureIndex, 1);
    setTiers(updatedTiers);
  };

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
    }
  }, [show]);

  const onSubmit = (data: Product) => {
    const productData = {
      ...data,
      tiers: tiers.map(tier => ({
        ...tier,
        price: Number(tier.price),
      })),
    };
    onSave(productData);
    reset();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{product ? 'Edit Product' : 'Add New Product'}</Modal.Title>
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
              <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#pricing-tiers">
                <i className="bi bi-currency-dollar me-2"></i>
                Pricing Tiers
              </div>
              <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#additional-info">
                <i className="bi bi-three-dots me-2"></i>
                Additional Information
              </div>
            </div>

            <div className="tab-content modal-tab-content">
              {/* Basic Information Tab */}
              <div className="tab-pane fade show active" id="basic-info">
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

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-card-text me-2"></i>
                    Description <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    as="textarea"
                    rows={3}
                    {...register('description', { required: 'Description is required' })}
                    isInvalid={!!errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-box me-2"></i>
                        Type <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select size="sm" {...register('type')}>
                        <option value="PHYSICAL">Physical Product</option>
                        <option value="DIGITAL">Digital Product</option>
                        <option value="SERVICE">Service</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-folder me-2"></i>
                        Category <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        {...register('category', { required: 'Category is required' })}
                        isInvalid={!!errors.category}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.category?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-rulers me-2"></i>
                        Unit
                      </Form.Label>
                      <Form.Control size="sm" type="text" {...register('unit')} />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <i className="bi bi-upc me-2"></i>
                        SKU
                      </Form.Label>
                      <Form.Control size="sm" type="text" {...register('sku')} />
                    </Form.Group>
                  </div>
                </div>

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

              {/* Pricing Tiers Tab */}
              <div className="tab-pane fade" id="pricing-tiers">
                {tiers.map((tier, tierIndex) => (
                  <div key={tier.type} className="card mb-3">
                    <div className="card-header bg-light py-2">
                      <h6 className="mb-0">{tier.type}</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <i className="bi bi-currency-dollar me-2"></i>
                              Price
                            </Form.Label>
                            <Form.Control
                              size="sm"
                              type="number"
                              step="0.01"
                              value={tier.price}
                              onChange={(e) => {
                                const updatedTiers = [...tiers];
                                updatedTiers[tierIndex].price = parseFloat(e.target.value) || 0;
                                setTiers(updatedTiers);
                              }}
                            />
                          </Form.Group>
                        </div>
                        <div className="col-md-6">
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <i className="bi bi-card-text me-2"></i>
                              Description
                            </Form.Label>
                            <Form.Control
                              size="sm"
                              type="text"
                              value={tier.description || ''}
                              onChange={(e) => {
                                const updatedTiers = [...tiers];
                                updatedTiers[tierIndex].description = e.target.value;
                                setTiers(updatedTiers);
                              }}
                            />
                          </Form.Group>
                        </div>
                      </div>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          <i className="bi bi-list-check me-2"></i>
                          Features
                        </Form.Label>
                        <div className="d-flex mb-2">
                          <Form.Control
                            size="sm"
                            type="text"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            placeholder="Add a feature"
                            className="me-2"
                          />
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleAddFeature(tierIndex)}
                          >
                            <i className="bi bi-plus-lg"></i>
                          </Button>
                        </div>
                        <Table size="sm">
                          <tbody>
                            {tier.features.map((feature, featureIndex) => (
                              <tr key={featureIndex}>
                                <td>{feature}</td>
                                <td className="text-end">
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="text-danger p-0"
                                    onClick={() => handleRemoveFeature(tierIndex, featureIndex)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Form.Group>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Information Tab */}
              <div className="tab-pane fade" id="additional-info">
                <p className="text-muted">Additional product details and settings can be added here in the future.</p>
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
  );
};

export default ProductModal;
