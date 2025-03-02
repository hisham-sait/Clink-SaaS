import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col, Card } from 'react-bootstrap';
import { Product, PlanType } from '../../types';

interface ProductPlanModalProps {
  show: boolean;
  onHide: () => void;
  onSelect: (productPlan: {
    productId: string;
    planType: PlanType;
    quantity: number;
    price: number;
    features: string[];
  }) => void;
  products: Product[];
}

const ProductPlanModal: React.FC<ProductPlanModalProps> = ({
  show,
  onHide,
  onSelect,
  products,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [planType, setPlanType] = useState<PlanType>('STANDARD');
  const [quantity, setQuantity] = useState(1);

  const handleSelect = () => {
    if (!selectedProduct) return;

    const selectedTier = selectedProduct.tiers.find(t => t.type === planType);
    if (!selectedTier) return;

    // Calculate total price based on quantity
    const totalPrice = selectedTier.price * quantity;

    onSelect({
      productId: selectedProduct.id,
      planType,
      quantity,
      price: totalPrice,
      features: selectedTier.features,
    });
  };

  const getTierPrice = (product: Product, type: PlanType) => {
    const tier = product.tiers.find(t => t.type === type);
    return tier ? tier.price : 0;
  };

  const getTierFeatures = (product: Product, type: PlanType) => {
    const tier = product.tiers.find(t => t.type === type);
    return tier ? tier.features : [];
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add Product to Proposal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6 className="text-muted mb-2">Select a product and plan to add to your proposal</h6>
        <Form>
          <Form.Group className="mb-4">
            <Form.Label>
              <i className="bi bi-box me-2"></i>
              Select Product
            </Form.Label>
            <Row xs={1} md={3} className="g-4">
              {products.map((product) => (
                <Col key={product.id}>
                  <Card
                    className={`h-100 ${
                      selectedProduct?.id === product.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedProduct(product)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Body>
                      <Card.Title>
                        <i className="bi bi-box me-2"></i>
                        {product.name}
                      </Card.Title>
                      <Card.Text className="small text-muted">{product.description}</Card.Text>
                      <Card.Text className="text-muted">
                        <div>Basic: ${getTierPrice(product, 'BASIC')}</div>
                        <div>Standard: ${getTierPrice(product, 'STANDARD')}</div>
                        <div>Premium: ${getTierPrice(product, 'PREMIUM')}</div>
                      </Card.Text>
                      <Card.Text className="small">
                        Features: {getTierFeatures(product, 'BASIC').length}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Form.Group>

          {selectedProduct && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-layers me-2"></i>
                  Plan Type
                </Form.Label>
                <Row xs={1} md={3} className="g-3">
                  <Col>
                    <Card
                      className={`h-100 ${
                        planType === 'BASIC' ? 'border-primary' : ''
                      }`}
                      onClick={() => setPlanType('BASIC')}
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Body>
                        <Card.Title>
                          <i className="bi bi-star me-2"></i>
                          Basic
                        </Card.Title>
                        <Card.Text className="small text-muted">Essential features</Card.Text>
                        <Card.Text className="text-muted">
                          ${selectedProduct && getTierPrice(selectedProduct, 'BASIC')}
                        </Card.Text>
                        <Card.Text className="small">
                          {selectedProduct && getTierFeatures(selectedProduct, 'BASIC').length} features
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card
                      className={`h-100 ${
                        planType === 'STANDARD' ? 'border-primary' : ''
                      }`}
                      onClick={() => setPlanType('STANDARD')}
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Body>
                        <Card.Title>
                          <i className="bi bi-stars me-2"></i>
                          Standard
                        </Card.Title>
                        <Card.Text className="small text-muted">Popular features</Card.Text>
                        <Card.Text className="text-muted">
                          ${selectedProduct && getTierPrice(selectedProduct, 'STANDARD')}
                        </Card.Text>
                        <Card.Text className="small">
                          {selectedProduct && getTierFeatures(selectedProduct, 'STANDARD').length} features
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card
                      className={`h-100 ${
                        planType === 'PREMIUM' ? 'border-primary' : ''
                      }`}
                      onClick={() => setPlanType('PREMIUM')}
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Body>
                        <Card.Title>
                          <i className="bi bi-gem me-2"></i>
                          Premium
                        </Card.Title>
                        <Card.Text className="small text-muted">All features included</Card.Text>
                        <Card.Text className="text-muted">
                          ${selectedProduct && getTierPrice(selectedProduct, 'PREMIUM')}
                        </Card.Text>
                        <Card.Text className="small">
                          {selectedProduct && getTierFeatures(selectedProduct, 'PREMIUM').length} features
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Form.Group>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      <i className="bi bi-123 me-2"></i>
                      Quantity
                    </Form.Label>
                    <Form.Control
                      size="sm"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      <i className="bi bi-currency-dollar me-2"></i>
                      Total Price
                    </Form.Label>
                    <h4 className="mt-2">
                      ${(getTierPrice(selectedProduct, planType) * quantity).toFixed(2)}
                    </h4>
                  </Form.Group>
                </Col>
              </Row>

              <div className="mt-4">
                <h6>
                  <i className="bi bi-list-check me-2"></i>
                  Selected Features:
                </h6>
                <ul className="small">
                  {getTierFeatures(selectedProduct, planType).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSelect}
          disabled={!selectedProduct}
        >
          Add to Proposal
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductPlanModal;
