import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { ProposalSection as ProposalSectionType } from './demoData';
import { ProposalProduct } from '../../../types';

interface ProposalSectionProps {
  section: ProposalSectionType;
  onEdit?: (sectionId: string) => void;
  onDelete?: (sectionId: string) => void;
  onMoveUp?: (sectionId: string) => void;
  onMoveDown?: (sectionId: string) => void;
  proposalProducts?: ProposalProduct[]; // Add proposalProducts prop
}

const ProposalSection: React.FC<ProposalSectionProps> = ({
  section,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  proposalProducts = [] // Default to empty array
}) => {
  // Function to generate pricing table HTML based on proposal products
  const generatePricingTableHtml = () => {
    if (!proposalProducts || proposalProducts.length === 0) {
      return `
        <div class="alert alert-info">
          No services added yet. Add services in the Services & Plans tab of the proposal properties.
        </div>
      `;
    }

    // Group products by productId
    const groupedProducts = proposalProducts.reduce((acc, product) => {
      if (!acc[product.productId]) {
        acc[product.productId] = {
          productId: product.productId,
          productName: product.product?.name || 'Unknown Product',
          tiers: {},
          quantity: product.quantity
        };
      }
      acc[product.productId].tiers[product.planType] = product;
      return acc;
    }, {} as Record<string, any>);

    // Convert to array
    const productGroups = Object.values(groupedProducts);

    // Generate table HTML
    let tableHtml = `
      <h2>Pricing Plans</h2>
      <p>We offer flexible pricing plans to meet your specific needs:</p>
      <div class="pricing-table-container">
        <table class="table table-bordered pricing-table">
          <thead class="bg-light">
            <tr>
              <th>Services</th>
              <th class="text-center">Basic</th>
              <th class="text-center">Standard</th>
              <th class="text-center">Premium</th>
            </tr>
          </thead>
          <tbody>
    `;

    // Add rows for each product
    productGroups.forEach(group => {
      tableHtml += `
        <tr>
          <td><strong>${group.productName}</strong></td>
          <td class="text-center">${group.tiers.BASIC ? '<i class="bi bi-check-square-fill text-success"></i>' : '<i class="bi bi-x-square-fill text-danger"></i>'}</td>
          <td class="text-center">${group.tiers.STANDARD ? '<i class="bi bi-check-square-fill text-success"></i>' : '<i class="bi bi-x-square-fill text-danger"></i>'}</td>
          <td class="text-center">${group.tiers.PREMIUM ? '<i class="bi bi-check-square-fill text-success"></i>' : '<i class="bi bi-x-square-fill text-danger"></i>'}</td>
        </tr>
      `;

      // Add features if available
      if (group.tiers.BASIC?.features?.length || group.tiers.STANDARD?.features?.length || group.tiers.PREMIUM?.features?.length) {
        // Get all unique features
        const allFeatures = new Set<string>();
        ['BASIC', 'STANDARD', 'PREMIUM'].forEach(tier => {
          if (group.tiers[tier]?.features) {
            group.tiers[tier].features.forEach((feature: string) => allFeatures.add(feature));
          }
        });

        // Add feature rows
        allFeatures.forEach(feature => {
          tableHtml += `
            <tr>
              <td class="ps-4">- ${feature}</td>
              <td class="text-center">${group.tiers.BASIC?.features?.includes(feature) ? '<i class="bi bi-check-square-fill text-success"></i>' : ''}</td>
              <td class="text-center">${group.tiers.STANDARD?.features?.includes(feature) ? '<i class="bi bi-check-square-fill text-success"></i>' : ''}</td>
              <td class="text-center">${group.tiers.PREMIUM?.features?.includes(feature) ? '<i class="bi bi-check-square-fill text-success"></i>' : ''}</td>
            </tr>
          `;
        });
      }
    });

    // Add pricing row
    tableHtml += `
      <tr class="fw-bold">
        <td>Monthly Fee (excluding VAT)</td>
        <td class="text-center">€${calculateTierTotal('BASIC').toFixed(2)}</td>
        <td class="text-center">€${calculateTierTotal('STANDARD').toFixed(2)}</td>
        <td class="text-center">€${calculateTierTotal('PREMIUM').toFixed(2)}</td>
      </tr>
    `;

    // Close table
    tableHtml += `
          </tbody>
        </table>
      </div>
      <p class="mt-4">All plans include unlimited email and phone support. We also offer custom packages tailored to your specific business needs.</p>
    `;

    return tableHtml;
  };

  // Calculate total for a specific tier
  const calculateTierTotal = (tier: 'BASIC' | 'STANDARD' | 'PREMIUM') => {
    return proposalProducts
      .filter(product => product.planType === tier)
      .reduce((sum, product) => sum + product.price, 0);
  };

  // Determine if this is a pricing section
  const isPricingSection = section.type === 'pricing';

  // Get the content to display
  const contentToDisplay = isPricingSection && proposalProducts 
    ? generatePricingTableHtml() 
    : section.content;
  return (
    <Card className="mb-4 proposal-section">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">{section.title}</h5>
          {section.isAIGenerated && (
            <span className="badge bg-primary ms-2">
              <i className="bi bi-robot me-1"></i>
              AI Generated
            </span>
          )}
        </div>
        <div className="section-controls">
          <Button 
            variant="light" 
            size="sm" 
            className="me-1" 
            onClick={() => onMoveUp && onMoveUp(section.id)}
            title="Move Up"
          >
            <i className="bi bi-arrow-up"></i>
          </Button>
          <Button 
            variant="light" 
            size="sm" 
            className="me-1" 
            onClick={() => onMoveDown && onMoveDown(section.id)}
            title="Move Down"
          >
            <i className="bi bi-arrow-down"></i>
          </Button>
          <Button 
            variant="light" 
            size="sm" 
            className="me-1" 
            onClick={() => onEdit && onEdit(section.id)}
            title="Edit Section"
          >
            <i className="bi bi-pencil"></i>
          </Button>
          <Button 
            variant="light" 
            size="sm" 
            className="text-danger" 
            onClick={() => onDelete && onDelete(section.id)}
            title="Delete Section"
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <div 
          className="section-content"
          dangerouslySetInnerHTML={{ __html: contentToDisplay }}
        />
        {section.isAIGenerated && section.aiPrompt && (
          <div className="mt-3 pt-3 border-top">
            <small className="text-muted">
              <i className="bi bi-chat-left-text me-1"></i>
              Generated from prompt: "{section.aiPrompt}"
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProposalSection;
