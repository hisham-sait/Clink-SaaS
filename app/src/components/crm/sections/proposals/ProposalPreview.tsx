import React, { useState } from 'react';
import './proposals.css';
import { Modal, Row, Col, Card, Button, Table, Badge, Spinner, Form } from 'react-bootstrap';
import { Proposal, PlanType } from '../../../crm/types';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../../../contexts/AuthContext';
import * as crmService from '../../../../services/crm';

interface ProposalPreviewProps {
  show: boolean;
  onHide: () => void;
  proposal: Proposal;
}

const ProposalPreview: React.FC<ProposalPreviewProps> = ({
  show,
  onHide,
  proposal,
}) => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [showIndividualPricing, setShowIndividualPricing] = useState(true);

  // Log the proposal data to verify it's being passed correctly
  React.useEffect(() => {
    if (show && proposal) {
      console.log('Proposal data in preview:', proposal);
      
      // Validate the proposal data structure
      if (!proposal.products || !Array.isArray(proposal.products)) {
        console.error('Invalid proposal products data:', proposal.products);
      } else {
        // Check if products have the necessary data
        proposal.products.forEach((product, index) => {
          if (!product.product) {
            console.error(`Product at index ${index} is missing product data:`, product);
          } else if (!product.product.tiers || !Array.isArray(product.product.tiers)) {
            console.error(`Product at index ${index} is missing tiers data:`, product.product);
          }
        });
      }
    }
  }, [show, proposal]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getPlanTypeLabel = (planType: PlanType) => {
    switch (planType) {
      case 'BASIC':
        return { text: 'Basic', color: 'secondary' };
      case 'STANDARD':
        return { text: 'Standard', color: 'primary' };
      case 'PREMIUM':
        return { text: 'Premium', color: 'success' };
    }
  };

  const getProductsByPlan = (planType: PlanType) => {
    if (!proposal.products || !Array.isArray(proposal.products)) {
      console.error('Cannot filter products by plan: products is not an array');
      return [];
    }
    return proposal.products.filter(p => p.planType === planType);
  };

  const getTierByType = (product: typeof proposal.products[0]['product'], type: PlanType) => {
    if (!product || !product.tiers || !Array.isArray(product.tiers)) {
      console.error('Cannot get tier by type: product or tiers is invalid', product);
      return undefined;
    }
    return product.tiers.find(t => t.type === type);
  };

  const calculateRegularPrice = (products: typeof proposal.products) => {
    if (!products || !Array.isArray(products)) {
      console.error('Cannot calculate regular price: products is not an array');
      return 0;
    }
    return products.reduce((sum, p) => {
      if (!p || !p.product) {
        console.error('Cannot calculate regular price: product is invalid', p);
        return sum;
      }
      const standardTier = getTierByType(p.product, 'STANDARD');
      return sum + (standardTier?.price || 0) * (p.quantity || 1);
    }, 0);
  };

  const calculateActualPrice = (products: typeof proposal.products) => {
    if (!products || !Array.isArray(products)) {
      console.error('Cannot calculate actual price: products is not an array');
      return 0;
    }
    return products.reduce((sum, p) => {
      if (!p || typeof p.price !== 'number') {
        console.error('Cannot calculate actual price: product price is invalid', p);
        return sum;
      }
      return sum + p.price * (p.quantity || 1);
    }, 0);
  };

  const calculateSavings = (regularPrice: number, actualPrice: number) => {
    const savingsAmount = regularPrice - actualPrice;
    const savingsPercentage = regularPrice > 0 ? ((regularPrice - actualPrice) / regularPrice * 100) : 0;
    return { savingsAmount, savingsPercentage };
  };

  const calculateTotalFeatures = (products: typeof proposal.products) => {
    if (!products || !Array.isArray(products)) {
      console.error('Cannot calculate total features: products is not an array');
      return 0;
    }
    return products.reduce((sum, p) => {
      if (!p || !p.features || !Array.isArray(p.features)) {
        console.error('Cannot calculate total features: product features is invalid', p);
        return sum;
      }
      return sum + p.features.length;
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const renderFeatureCheck = (hasFeature: boolean) => {
    return hasFeature ? <span className="text-success">✓</span> : null;
  };

  const renderSavingsBadge = (amount: number, isPercentage = false) => {
    if (amount <= 0) return null;
    
    const text = isPercentage 
      ? `Save ${formatPercentage(amount)}`
      : `Save ${formatCurrency(amount)}`;

    return (
      <Badge bg="success" className={isPercentage ? "ms-2" : "mt-1"}>
        {text}
      </Badge>
    );
  };

  const renderLoadingSpinner = (text: string) => {
    return (
      <>
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
          className="me-2"
        />
        {text}
      </>
    );
  };

  const getFeatureFromTiers = (product: typeof proposal.products[0]['product'], featureIndex: number) => {
    if (!product || !product.tiers || product.tiers.length === 0) {
      return null;
    }
    const feature = product.tiers.map(tier => tier.features && tier.features[featureIndex]).filter(Boolean)[0];
    return feature || null;
  };

  const renderPlanButton = (planType: PlanType) => {
    const { text, color } = getPlanTypeLabel(planType);
    return (
      <Button 
        variant={color}
        onClick={() => {
          // TODO: Implement plan selection
          toast.success(`Selected ${text} Plan`);
        }}
      >
        Select {text} Plan
      </Button>
    );
  };

  const getTotalPrice = (planType: PlanType) => {
    const products = getProductsByPlan(planType);
    return formatCurrency(calculateActualPrice(products));
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      
      if (!proposal.id || !user?.companyId) {
        toast.error('Cannot export unsaved proposal');
        return;
      }
      
      const pdfBlob = await crmService.exportProposalToPdf(user.companyId, proposal.id);
      
      // Create a download link
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${proposal.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Proposal exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const renderHeader = () => {
    return (
      <div className="mb-4">
        <h2>{proposal.name}</h2>
        {proposal.validUntil && (
          <p className="text-muted">
            Valid until: {formatDate(proposal.validUntil)}
          </p>
        )}
        {proposal.contact && (
          <p>
            Prepared for: {proposal.contact.firstName} {proposal.contact.lastName}
          </p>
        )}
      </div>
    );
  };

  const renderPriceSummary = () => {
    const regularPrice = calculateRegularPrice(proposal.products);
    const actualPrice = calculateActualPrice(proposal.products);
    const { savingsAmount, savingsPercentage } = calculateSavings(regularPrice, actualPrice);

    return (
      <div className="mt-4 mb-4">
        <Card className="bg-light">
          <Card.Body>
            <Row>
              <Col md={3}>
                <h6>Total Products</h6>
                <h3>{proposal.products.length}</h3>
              </Col>
              <Col md={3}>
                <h6>Total Features</h6>
                <h3>
                  {calculateTotalFeatures(proposal.products)}
                </h3>
              </Col>
              <Col md={3}>
                <h6>Regular Price</h6>
                <h3 className="text-decoration-line-through text-muted">
                  {formatCurrency(regularPrice)}
                </h3>
                {renderSavingsBadge(savingsPercentage, true)}
              </Col>
              <Col md={3}>
                <h6>Your Price</h6>
                <h3 className="text-success">
                  {formatCurrency(actualPrice)}
                </h3>
                {renderSavingsBadge(savingsAmount)}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    );
  };

  const renderFeatureComparison = () => {
    // Check if products have tiers with features before rendering
    const hasFeatures = proposal.products.some(p => 
      p.product && p.product.tiers && p.product.tiers.length > 0 && 
      p.product.tiers[0].features && p.product.tiers[0].features.length > 0
    );

    if (!hasFeatures) {
      return null;
    }

    return (
      <div className="mt-4">
        <h5>Plan Comparison</h5>
        <Table responsive bordered>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Basic</th>
              <th>Standard</th>
              <th>Premium</th>
            </tr>
          </thead>
          <tbody>
            {proposal.products.map((p) => {
              // Skip products without proper tier data
              if (!p.product || !p.product.tiers || p.product.tiers.length === 0) {
                return null;
              }
              
              return (
                <React.Fragment key={p.id}>
                  <tr>
                    <td colSpan={4} className="bg-light">
                      <strong>{p.product.name}</strong>
                    </td>
                  </tr>
                  {p.product.tiers[0].features && p.product.tiers[0].features.map((_, featureIndex) => {
                    const feature = getFeatureFromTiers(p.product, featureIndex);
                    if (!feature) return null;
                    return (
                      <tr key={`${p.id}-${featureIndex}`}>
                        <td>{feature}</td>
                        <td className="text-center">
                          {renderFeatureCheck(!!getTierByType(p.product, 'BASIC')?.features?.[featureIndex])}
                        </td>
                        <td className="text-center">
                          {renderFeatureCheck(!!getTierByType(p.product, 'STANDARD')?.features?.[featureIndex])}
                        </td>
                        <td className="text-center">
                          {renderFeatureCheck(!!getTierByType(p.product, 'PREMIUM')?.features?.[featureIndex])}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  };

  const renderPlanCards = () => {
    return (
      <Row className="g-4">
        <Col md={4}>
          {renderPlanCard('BASIC')}
        </Col>
        <Col md={4}>
          {renderPlanCard('STANDARD')}
        </Col>
        <Col md={4}>
          {renderPlanCard('PREMIUM')}
        </Col>
      </Row>
    );
  };

  const renderPlanCard = (planType: PlanType) => {
    const products = getProductsByPlan(planType);
    const { text, color } = getPlanTypeLabel(planType);

    return (
      <Card className="h-100">
        <Card.Header className={`bg-${color} text-white`}>
          <h5 className="mb-0">{text} Plan</h5>
        </Card.Header>
        <Card.Body>
          <h3 className="text-center mb-4">{getTotalPrice(planType)}</h3>
          <div className="mb-4">
            {products.map((p) => {
              if (!p.product) {
                return null; // Skip products without product data
              }
              const tier = getTierByType(p.product, planType);
              // Check if this product should show individual pricing
              const shouldShowPrice = p.showIndividualPricing !== undefined 
                ? p.showIndividualPricing 
                : showIndividualPricing;
              
              return (
                <div key={p.id} className="mb-4">
                  <h6>{p.product.name}</h6>
                  {tier?.description && (
                    <p className="text-muted small mb-2">{tier.description}</p>
                  )}
                  {shouldShowPrice && (
                    <div className="d-flex align-items-center mb-2">
                      <span className="me-2">Quantity:</span>
                      <Badge bg="info">{p.quantity}</Badge>
                      <span className="ms-3 me-2">Price:</span>
                      <Badge bg="success">{formatCurrency(p.price * p.quantity)}</Badge>
                    </div>
                  )}
                  <div className="border-top pt-2 mt-2">
                    <h6 className="small mb-2">Features:</h6>
                    <ul className="small">
                      {p.features && p.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </Card.Body>
        <Card.Footer className="text-center">
          {renderPlanButton(planType)}
        </Card.Footer>
      </Card>
    );
  };

  const renderFooter = () => {
    return (
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button 
          variant="primary" 
          onClick={handleExportPDF} 
          disabled={isExporting}
        >
          {isExporting ? renderLoadingSpinner('Exporting...') : 'Export as PDF'}
        </Button>
      </Modal.Footer>
    );
  };

  // If there's no proposal data or no products, show a message
  if (!proposal || !proposal.products || proposal.products.length === 0) {
    return (
      <Modal show={show} onHide={onHide} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Proposal Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-exclamation-circle text-warning" style={{ fontSize: '3rem' }}></i>
          </div>
          <h4>No proposal data available</h4>
          <p className="text-muted">This proposal doesn't have any products or data to display.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Proposal Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          {renderHeader()}
          <Form.Check
            type="switch"
            id="pricing-display-toggle"
            label={showIndividualPricing ? "Show Individual Pricing" : "Show Total Pricing Only"}
            checked={showIndividualPricing}
            onChange={() => setShowIndividualPricing(!showIndividualPricing)}
            className="mb-0"
          />
        </div>
        {renderPlanCards()}
        {renderPriceSummary()}
        {renderFeatureComparison()}
      </Modal.Body>
      {renderFooter()}
    </Modal>
  );
};

export default ProposalPreview;
