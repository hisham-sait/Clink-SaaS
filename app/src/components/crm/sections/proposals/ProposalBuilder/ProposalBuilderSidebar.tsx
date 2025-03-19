import React, { useState, useEffect } from 'react';
import { Card, Form, Button, InputGroup, Accordion } from 'react-bootstrap';
import { ProposalSectionTemplate } from './demoData';
import CustomSectionModal from './CustomSectionModal';
import { useAuth } from '../../../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import * as crmService from '../../../../../services/crm';
import { SectionTemplate } from '../../../../crm/types';


interface ProposalBuilderSidebarProps {
  templates: ProposalSectionTemplate[];
  onAddSection: (templateId: string) => void;
  onGenerateAISection: (prompt: string) => void;
  onAddCustomSection?: (section: { title: string; content: string }) => void;
}

const ProposalBuilderSidebar: React.FC<ProposalBuilderSidebarProps> = ({
  templates,
  onAddSection,
  onGenerateAISection,
  onAddCustomSection
}) => {
  const { user } = useAuth();
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomSectionModal, setShowCustomSectionModal] = useState(false);
  const [userTemplates, setUserTemplates] = useState<SectionTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    if (user?.companyId) {
      loadUserTemplates();
    }
  }, [user?.companyId]);

  const loadUserTemplates = async () => {
    if (!user?.companyId) return;
    
    setLoadingTemplates(true);
    try {
      const templates = await crmService.getSectionTemplates(user.companyId);
      setUserTemplates(templates);
    } catch (error) {
      console.error('Error loading user section templates:', error);
      toast.error('Failed to load section templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleGenerateSection = () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => {
      onGenerateAISection(aiPrompt);
      setAiPrompt('');
      setIsGenerating(false);
    }, 1500);
  };

  const handleAddUserTemplate = (template: SectionTemplate) => {
    // Create a section from the user template
    const section = {
      title: template.name,
      content: template.content
    };
    
    if (onAddCustomSection) {
      onAddCustomSection(section);
    }
  };

  return (
    <div className="proposal-builder-sidebar">
      <h5 className="mb-3">Section Templates</h5>
      
      {/* AI Section Generator */}
      <Card className="mb-4 border-primary">
        <Card.Header className="bg-primary text-white">
          <i className="bi bi-robot me-2"></i>
          AI Section Generator
        </Card.Header>
        <Card.Body>
          <p className="small text-muted mb-3">
            Describe what you want to include in your proposal and our AI will generate content for you.
          </p>
          <Form.Group className="mb-3">
            <Form.Label>Your prompt</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="E.g., Write a project scope section for a website development project"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
          </Form.Group>
          <Button 
            variant="primary" 
            className="w-100"
            disabled={!aiPrompt.trim() || isGenerating}
            onClick={handleGenerateSection}
          >
            {isGenerating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Generating...
              </>
            ) : (
              <>
                <i className="bi bi-magic me-2"></i>
                Generate Section
              </>
            )}
          </Button>
        </Card.Body>
      </Card>
      
      {/* User Section Templates */}
      <Accordion className="mb-4">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <div className="d-flex align-items-center">
              <i className="bi bi-bookmark-star me-2"></i>
              <span>My Section Templates</span>
              {userTemplates.length > 0 && (
                <span className="badge bg-primary ms-2">{userTemplates.length}</span>
              )}
            </div>
          </Accordion.Header>
          <Accordion.Body className="p-2">
            {loadingTemplates ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="small mt-2 mb-0">Loading templates...</p>
              </div>
            ) : userTemplates.length === 0 ? (
              <div className="text-center py-3">
                <p className="small mb-0">No custom templates found</p>
                <p className="text-muted small">Create templates in the Section Templates manager</p>
              </div>
            ) : (
              userTemplates.map((template) => (
                <Card key={template.id} className="mb-2 template-card">
                  <Card.Body className="p-2">
                    <div className="d-flex align-items-center mb-2">
                      <div className="template-icon me-2">
                        <i className={`bi ${template.icon || 'bi-file-earmark-text'} fs-5`}></i>
                      </div>
                      <div>
                        <h6 className="mb-0 small">{template.name}</h6>
                        <p className="text-muted small mb-0">{template.description}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="w-100 mt-1"
                      onClick={() => handleAddUserTemplate(template)}
                    >
                      <i className="bi bi-plus-lg me-1"></i>
                      Add to Proposal
                    </Button>
                  </Card.Body>
                </Card>
              ))
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {/* Pricing Section Template */}
      <Card className="mb-3 template-card">
        <Card.Body>
          <div className="d-flex align-items-center mb-2">
            <div className="template-icon me-3">
              <i className="bi bi-currency-euro fs-4"></i>
            </div>
            <div>
              <h6 className="mb-0">Pricing Section</h6>
              <p className="text-muted small mb-0">Displays the services and pricing from the service plan</p>
            </div>
          </div>
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="w-100 mt-2"
            onClick={() => {
              if (onAddCustomSection) {
                onAddCustomSection({
                  title: "Services & Pricing",
                  content: `<div class="pricing-section">
  <h2>Services & Pricing</h2>
  <p>Below is a breakdown of the services included in this proposal:</p>
  
  <div class="table-responsive">
    <table class="table table-bordered">
      <thead class="bg-light">
        <tr>
          <th style="width: 40%">Service</th>
          <th style="width: 15%">Plan</th>
          <th style="width: 15%">Quantity</th>
          <th style="width: 15%">Unit Price</th>
          <th style="width: 15%">Total</th>
        </tr>
      </thead>
      <tbody id="pricing-services-tbody">
        <!-- This section will be automatically populated with the services from the proposal -->
        <tr>
          <td colspan="5" class="text-center py-3">
            <p class="mb-0">No services added yet.</p>
            <p class="text-muted small">Add services in the Services & Plans tab of the proposal properties.</p>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="bg-light">
          <td colspan="4" class="text-end fw-bold">Subtotal:</td>
          <td id="pricing-subtotal">€0.00</td>
        </tr>
        <tr>
          <td colspan="4" class="text-end fw-bold">Discount:</td>
          <td id="pricing-discount">€0.00</td>
        </tr>
        <tr>
          <td colspan="4" class="text-end fw-bold">VAT (23%):</td>
          <td id="pricing-vat">€0.00</td>
        </tr>
        <tr class="bg-light">
          <td colspan="4" class="text-end fw-bold fs-5">Total:</td>
          <td id="pricing-total" class="fw-bold fs-5">€0.00</td>
        </tr>
      </tfoot>
    </table>
  </div>
  
  <div class="pricing-notes mt-4">
    <h5>Pricing Notes</h5>
    <ul>
      <li>All prices are in Euro (€) and exclusive of VAT unless otherwise stated.</li>
      <li>Payment terms: 50% upfront, 50% upon completion.</li>
      <li>This pricing is valid for 30 days from the date of this proposal.</li>
    </ul>
  </div>
  
  <script>
    // This script will run when the section is added to the proposal
    // It will find the proposal's products and populate the pricing table
    document.addEventListener('DOMContentLoaded', function() {
      // Function to update the pricing table with the proposal's products
      function updatePricingTable() {
        // Find the proposal object in the window
        const proposal = window.currentProposal;
        if (!proposal || !proposal.products || proposal.products.length === 0) {
          return; // No products to display
        }
        
        // Get the table body
        const tbody = document.getElementById('pricing-services-tbody');
        if (!tbody) return;
        
        // Clear the table body
        tbody.innerHTML = '';
        
        // Calculate totals
        let subtotal = 0;
        
        // Add a row for each product
        proposal.products.forEach(product => {
          const row = document.createElement('tr');
          
          // Service name and description
          const serviceCell = document.createElement('td');
          const serviceName = document.createElement('strong');
          serviceName.textContent = product.product.name;
          const serviceDesc = document.createElement('div');
          serviceDesc.className = 'text-muted small';
          serviceDesc.textContent = product.product.description;
          serviceCell.appendChild(serviceName);
          serviceCell.appendChild(serviceDesc);
          
          // Plan type
          const planCell = document.createElement('td');
          const planBadge = document.createElement('span');
          planBadge.className = 'badge ' + 
            (product.planType === 'PREMIUM' ? 'bg-success' : 
             product.planType === 'STANDARD' ? 'bg-primary' : 'bg-secondary');
          planBadge.textContent = product.planType;
          planCell.appendChild(planBadge);
          
          // Quantity
          const quantityCell = document.createElement('td');
          quantityCell.textContent = product.quantity.toString();
          
          // Unit price
          const unitPriceCell = document.createElement('td');
          const unitPrice = product.price / product.quantity;
          unitPriceCell.textContent = '€' + unitPrice.toFixed(2);
          
          // Total price
          const totalCell = document.createElement('td');
          totalCell.textContent = '€' + product.price.toFixed(2);
          
          // Add cells to row
          row.appendChild(serviceCell);
          row.appendChild(planCell);
          row.appendChild(quantityCell);
          row.appendChild(unitPriceCell);
          row.appendChild(totalCell);
          
          // Add row to table
          tbody.appendChild(row);
          
          // Add to subtotal
          subtotal += product.price;
        });
        
        // Update totals
        const discount = subtotal * 0.1; // 10% discount
        const discountedTotal = subtotal - discount;
        const vat = discountedTotal * 0.23; // 23% VAT
        const total = discountedTotal + vat;
        
        document.getElementById('pricing-subtotal').textContent = '€' + subtotal.toFixed(2);
        document.getElementById('pricing-discount').textContent = '-€' + discount.toFixed(2);
        document.getElementById('pricing-vat').textContent = '€' + vat.toFixed(2);
        document.getElementById('pricing-total').textContent = '€' + total.toFixed(2);
      }
      
      // Call the function to update the pricing table
      updatePricingTable();
      
      // Add event listener to update the pricing table when the proposal changes
      document.addEventListener('proposalUpdated', updatePricingTable);
    });
  </script>
</div>`
                });
              }
            }}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Add to Proposal
          </Button>
        </Card.Body>
      </Card>

      {/* Create Custom Section Card */}
      <Card className="mb-3 template-card">
        <Card.Body>
          <div className="d-flex align-items-center mb-2">
            <div className="template-icon me-3">
              <i className="bi bi-plus-circle fs-4"></i>
            </div>
            <div>
              <h6 className="mb-0">Custom Section</h6>
              <p className="text-muted small mb-0">Create your own custom content</p>
            </div>
          </div>
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="w-100 mt-2"
            onClick={() => setShowCustomSectionModal(true)}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Create Custom Section
          </Button>
        </Card.Body>
      </Card>
      
      {/* Hidden Divider */}
      <div className="mt-4 pt-3 border-top d-none">
        <Button 
          variant="outline-primary" 
          className="w-100"
          onClick={() => setShowCustomSectionModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Create Custom Section
        </Button>
        <p className="text-muted small mt-2 text-center">
          Need a specific section? Create your own custom content.
        </p>
      </div>
      
      {/* Custom Section Modal */}
      <CustomSectionModal
        show={showCustomSectionModal}
        onHide={() => setShowCustomSectionModal(false)}
        onSave={(section) => {
          if (onAddCustomSection) {
            onAddCustomSection(section);
          }
          setShowCustomSectionModal(false);
        }}
      />
    </div>
  );
};

export default ProposalBuilderSidebar;
