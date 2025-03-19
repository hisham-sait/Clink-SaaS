import React, { useState, useEffect, useMemo } from 'react';
import './proposals.css';
import { Modal, Form, Button, Row, Col, Table, Badge, Dropdown, InputGroup, FormControl, Card, ProgressBar } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaSearch, FaArrowRight, FaArrowLeft, FaInfoCircle, FaCog, FaEnvelope, FaClipboardCheck } from 'react-icons/fa';

import { Proposal, Product, PlanType, Status, Contact } from '../../types';
import * as crmService from '../../../../services/crm';

interface UnifiedProposalModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (proposal: Proposal) => void;
  proposal: Proposal | null;
  isBuilder?: boolean; // Flag to indicate if modal is opened from the builder
  onSaveAsTemplate?: () => void; // Optional callback for saving as template (used in builder)
  initialActiveStep?: number; // Optional initial active step
}

interface ServicePlan {
  productId: string;
  planType: PlanType;
  tierId?: string;
  quantity: number;
  price: number;
  features: string[];
  showIndividualPricing?: boolean;
}

interface SelectedService {
  service: Product;
  quantity: number;
  includedInTiers: {
    BASIC: boolean;
    STANDARD: boolean;
    PREMIUM: boolean;
  };
}

// Group services by product for display
interface GroupedService {
  product: Product;
  tiers: {
    BASIC?: ServicePlan;
    STANDARD?: ServicePlan;
    PREMIUM?: ServicePlan;
  };
  quantity: number;
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

const UnifiedProposalModal: React.FC<UnifiedProposalModalProps> = ({
  show,
  onHide,
  onSave,
  proposal,
  isBuilder = false,
  onSaveAsTemplate,
  initialActiveStep = 1
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Step state
  const [activeStep, setActiveStep] = useState(initialActiveStep);
  const totalSteps = 4; // Total number of steps in the wizard
  
  // Service plan state
  const [selectedServices, setSelectedServices] = useState<ServicePlan[]>(
    proposal?.products ? proposal.products.map(p => ({
      productId: p.productId,
      planType: p.planType,
      tierId: p.tierId,
      quantity: p.quantity,
      price: p.price,
      features: p.features || [],
      showIndividualPricing: p.showIndividualPricing,
    })) : []
  );
  
  // Service selection state
  const [tempSelectedServices, setTempSelectedServices] = useState<SelectedService[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredServices, setFilteredServices] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Other state
  const [products, setProducts] = useState<Product[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIndividualPricing, setShowIndividualPricing] = useState(true);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [pricingNotes, setPricingNotes] = useState('');
  
  // Email template and export format
  const [emailTemplate, setEmailTemplate] = useState('Default Template');
  const [exportFormat, setExportFormat] = useState('PDF Document');
  
  // Additional settings
  const [includeCompanyLogo, setIncludeCompanyLogo] = useState(true);
  const [includePricingTable, setIncludePricingTable] = useState(true);
  const [includeDigitalSignature, setIncludeDigitalSignature] = useState(true);
  
  // Step validation
  const [stepValidated, setStepValidated] = useState(false);
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  // Initialize the form first so reset is available
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger,
    getValues,
  } = useForm<ProposalFormData>({
    defaultValues: proposal || {
      name: '',
      content: {},
      status: 'Active',
    },
  });

  // Filter services based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredServices([]);
      return;
    }
    
    const services = products.filter(product => product.type === 'SERVICE');
    const filtered = services.filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredServices(filtered);
  }, [searchTerm, products]);
  
  // Group services by product for display
  const groupedServices = useMemo(() => {
    const grouped: GroupedService[] = [];
    
    // First pass: create groups by product
    selectedServices.forEach(service => {
      const product = products.find(p => p.id === service.productId);
      if (!product) return;
      
      let group = grouped.find(g => g.product.id === service.productId);
      
      if (!group) {
        group = {
          product,
          tiers: {},
          quantity: service.quantity
        };
        grouped.push(group);
      } else if (service.quantity !== group.quantity) {
        // Update quantity if different
        group.quantity = service.quantity;
      }
      
      // Add the tier
      group.tiers[service.planType] = service;
    });
    
    return grouped;
  }, [selectedServices, products]);

  // Calculate total for a specific tier across all services
  const getTierTotal = (tier: PlanType) => {
    return selectedServices
      .filter(service => service.planType === tier)
      .reduce((sum, service) => sum + service.price, 0);
  };

  // Get subtotal for all tiers
  const getSubtotal = () => {
    return selectedServices.reduce((sum, service) => sum + service.price, 0);
  };

  // Calculate discount for a specific tier
  const getTierDiscountAmount = (tierTotal: number) => {
    if (discountPercentage > 0) {
      return tierTotal * (discountPercentage / 100);
    }
    // For fixed amount discount, distribute proportionally across tiers
    const subtotal = getSubtotal();
    if (subtotal > 0) {
      return discountAmount * (tierTotal / subtotal);
    }
    return 0;
  };

  // Calculate tax for a specific tier
  const getTierTaxAmount = (tierTotal: number, tierDiscount: number) => {
    return (tierTotal - tierDiscount) * (taxPercentage / 100);
  };

  // Calculate total for a specific tier including discount and tax
  const getTierFinalTotal = (tier: PlanType) => {
    const tierTotal = getTierTotal(tier);
    const tierDiscount = getTierDiscountAmount(tierTotal);
    const tierTax = getTierTaxAmount(tierTotal, tierDiscount);
    return tierTotal - tierDiscount + tierTax;
  };

  // Get final total for all tiers
  const getFinalTotal = () => {
    return getTierFinalTotal('BASIC') + getTierFinalTotal('STANDARD') + getTierFinalTotal('PREMIUM');
  };

  const loadData = async () => {
    try {
      // Get the current user's company ID
      const companyId = user?.companyId;
      if (!companyId) {
        console.error('No company ID found');
        return;
      }

      const [productsData, contactsData, dealsData] = await Promise.all([
        crmService.getProducts(companyId),
        crmService.getContacts(companyId),
        crmService.getDeals(companyId),
      ]);
      
      setProducts(productsData);
      setContacts(contactsData);
      setDeals(dealsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debug: Log the proposal data when it changes
    console.log('Proposal data in useEffect:', proposal);
    
    if (show) {
      // Load data and reset selected services
      loadData();
      
      // IMPORTANT: Reset the form with the new proposal data when it changes
      if (proposal && proposal.products) {
        console.log('Resetting form with proposal data:', proposal);
        
        // Reset the form with the proposal data
        reset(proposal);
        
        // Manually set each field to ensure they're updated
        setValue('name', proposal.name);
        setValue('status', proposal.status);
        
        if (proposal.contactId) {
          setValue('contactId', proposal.contactId);
        }
        
        if (proposal.dealId) {
          setValue('dealId', proposal.dealId);
        }
        
        if (proposal.validUntil) {
          // Format date as YYYY-MM-DD for the date input
          const date = new Date(proposal.validUntil);
          const formattedDate = date.toISOString().split('T')[0];
          setValue('validUntil', formattedDate as any);
        }
        
        setSelectedServices(
          proposal.products.map(p => ({
            productId: p.productId,
            planType: p.planType,
            tierId: p.tierId, // Include tierId when loading existing products
            quantity: p.quantity,
            price: p.price,
            features: p.features || [],
            showIndividualPricing: p.showIndividualPricing, // Include pricing display preference
          }))
        );
        
        // Debug: Log the form values after reset
        console.log('Form values after manual setValue:', {
          name: watch('name'),
          contactId: watch('contactId'),
          dealId: watch('dealId'),
          status: watch('status'),
          validUntil: watch('validUntil')
        });
      } else {
        console.log('No proposal data, resetting to defaults');
        setSelectedServices([]);
        reset({
          name: '',
          content: {},
          status: 'Active',
        });
      }
    }
  }, [show, proposal, reset, watch, setValue]);

  const onSubmit = async (data: ProposalFormData) => {
    try {
      const companyId = user?.companyId;
      if (!companyId) {
        console.error('No company ID found');
        return;
      }

      // Prepare the proposal data with required fields
      const proposalProducts = selectedServices.map((p) => ({
        id: p.productId + Date.now(), // Generate a unique ID
        proposalId: data.id || '',
        productId: p.productId,
        planType: p.planType,
        tierId: p.tierId || p.planType, // Ensure tierId is set
        quantity: p.quantity,
        price: p.price,
        features: p.features,
        showIndividualPricing: p.showIndividualPricing, // Include pricing display preference
        product: products.find(prod => prod.id === p.productId)!,
      }));

      // Check if the proposal has a content object with sections
      const proposalContent = proposal?.content || { sections: [] };
      
      // Check if there's already a pricing section
      const hasPricingSection = proposalContent.sections && 
        proposalContent.sections.some((section: any) => section.type === 'pricing');
      
      // If there's no pricing section and we have products, add one
      if (!hasPricingSection && proposalProducts.length > 0) {
        if (!proposalContent.sections) {
          proposalContent.sections = [];
        }
        
        // Add a pricing section
        proposalContent.sections.push({
          id: `section-pricing-${Date.now()}`,
          title: 'Services & Pricing',
          type: 'pricing',
          content: '', // This will be dynamically generated
          isAIGenerated: false,
          order: proposalContent.sections.length + 1
        });
      }

      // Create a copy of the data without validUntil and dealId
      const { validUntil, dealId, ...restData } = data;
      
      // Create the proposal data with the correct date format
      const proposalData = {
        ...restData,
        // If validUntil exists, keep it as a Date object for TypeScript
        // The backend will handle the conversion to ISO format
        validUntil: validUntil ? new Date(validUntil) : undefined,
        // Only include dealId if it's not empty
        ...(dealId ? { dealId } : {}),
        content: proposalContent,
        products: proposalProducts,
      };
      
      let savedProposal;
      
      if (proposal?.id) {
        // Update existing proposal
        savedProposal = await crmService.updateProposal(companyId, proposal.id, proposalData);
      } else {
        // Create new proposal
        savedProposal = await crmService.createProposal(companyId, proposalData);
      }
      
      // Call the onSave callback
      onSave(savedProposal);
      reset();
      
      // Redirect to the proposal builder if not already in builder and it's a new proposal
      if (!isBuilder && !proposal) {
        navigate(`/crm/proposals/builder/${savedProposal.id}`);
      }
    } catch (error) {
      console.error('Error saving proposal:', error);
    }
  };

  // Service selection functions
  const handleAddService = (service: Product) => {
    // Check if service is already in temp selected services
    if (tempSelectedServices.some(s => s.service.id === service.id)) {
      return;
    }
    
    setTempSelectedServices([
      ...tempSelectedServices,
      {
        service,
        quantity: 1,
        includedInTiers: {
          BASIC: false,
          STANDARD: true, // Default to STANDARD
          PREMIUM: true,  // Default to PREMIUM as well
        },
      },
    ]);
    
    // Clear search
    setSearchTerm('');
    setFilteredServices([]);
    setShowDropdown(false);
    
    // Add service to the proposal immediately
    addServiceToProposal(service);
  };
  
  const addServiceToProposal = (service: Product) => {
    // Add service with default tiers (STANDARD and PREMIUM)
    const newServices: ServicePlan[] = [];
    
    // Add STANDARD tier
    const standardTier = service.tiers.find(t => t.type === 'STANDARD');
    if (standardTier) {
      newServices.push({
        productId: service.id,
        planType: 'STANDARD',
        tierId: standardTier.id || 'STANDARD',
        quantity: 1,
        price: standardTier.price,
        features: standardTier.features,
        showIndividualPricing,
      });
    }
    
    // Add PREMIUM tier
    const premiumTier = service.tiers.find(t => t.type === 'PREMIUM');
    if (premiumTier) {
      newServices.push({
        productId: service.id,
        planType: 'PREMIUM',
        tierId: premiumTier.id || 'PREMIUM',
        quantity: 1,
        price: premiumTier.price,
        features: premiumTier.features,
        showIndividualPricing,
      });
    }
    
    setSelectedServices([...selectedServices, ...newServices]);
  };
  
  const handleRemoveService = (productId: string) => {
    // Remove from temp selected services
    setTempSelectedServices(tempSelectedServices.filter(s => s.service.id !== productId));
    
    // Remove from selected services
    setSelectedServices(selectedServices.filter(s => s.productId !== productId));
  };
  
  const handleQuantityChange = (productId: string, quantity: number) => {
    // Update quantity in temp selected services
    setTempSelectedServices(tempSelectedServices.map(s => 
      s.service.id === productId ? { ...s, quantity } : s
    ));
    
    // Update quantity in selected services
    setSelectedServices(selectedServices.map(s => 
      s.productId === productId ? { ...s, quantity, price: getTierPrice(s.productId, s.planType) * quantity } : s
    ));
  };
  
  const handleTierToggle = (productId: string, tier: PlanType) => {
    console.log(`Toggling tier ${tier} for product ${productId}`);
    
    // Find the service in products
    const service = products.find(p => p.id === productId);
    if (!service) {
      console.error(`Product not found: ${productId}`);
      return;
    }
    
    // Find the tier object
    const tierObj = service.tiers.find(t => t.type === tier);
    if (!tierObj) {
      console.error(`Tier ${tier} not found for product ${productId}`);
      return;
    }
    
    // Get the current quantity from grouped services
    const group = groupedServices.find(g => g.product.id === productId);
    const quantity = group ? group.quantity : 1;
    
    // Check if this tier already exists in selected services
    const existingTier = selectedServices.find(s => s.productId === productId && s.planType === tier);
    
    // Get the current state of all tiers for this product
    const currentTiers = {
      BASIC: !!selectedServices.find(s => s.productId === productId && s.planType === 'BASIC'),
      STANDARD: !!selectedServices.find(s => s.productId === productId && s.planType === 'STANDARD'),
      PREMIUM: !!selectedServices.find(s => s.productId === productId && s.planType === 'PREMIUM')
    };
    
    // Toggle only the specific tier
    const newTierState = !existingTier;
    
    if (existingTier) {
      // Remove only this specific tier if it exists
      console.log(`Removing tier ${tier} for product ${productId}`);
      setSelectedServices(selectedServices.filter(s => !(s.productId === productId && s.planType === tier)));
    } else {
      // Add only this specific tier if it doesn't exist
      console.log(`Adding tier ${tier} for product ${productId}`);
      setSelectedServices([
        ...selectedServices,
        {
          productId,
          planType: tier,
          tierId: tierObj.id || tier,
          quantity: quantity,
          price: tierObj.price * quantity,
          features: tierObj.features,
          showIndividualPricing,
        },
      ]);
    }
    
    // Update tempSelectedServices to reflect the new state
    const tempService = tempSelectedServices.find(s => s.service.id === productId);
    
    if (tempService) {
      // Update existing tempService
      setTempSelectedServices(tempSelectedServices.map(s => 
        s.service.id === productId 
          ? { 
              ...s, 
              includedInTiers: {
                ...currentTiers, // Keep other tiers as they are
                [tier]: newTierState // Only update the toggled tier
              } 
            } 
          : s
      ));
    } else {
      // Create a new tempService with the current state of all tiers
      setTempSelectedServices([
        ...tempSelectedServices,
        {
          service,
          quantity: quantity,
          includedInTiers: {
            ...currentTiers, // Keep other tiers as they are
            [tier]: newTierState // Only update the toggled tier
          },
        },
      ]);
    }
  };
  
  const getTierPrice = (productId: string, tier: PlanType) => {
    const service = products.find(p => p.id === productId);
    if (!service) return 0;
    
    const tierObj = service.tiers.find(t => t.type === tier);
    return tierObj ? tierObj.price : 0;
  };

  const getServiceName = (productId: string) => {
    const service = products.find(p => p.id === productId);
    return service ? service.name : productId;
  };

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : 'N/A';
  };

  const getDealName = (dealId: string) => {
    const deal = deals.find(d => d.id === dealId);
    return deal ? deal.name : 'N/A';
  };

  // Step navigation functions
  const goToNextStep = async () => {
    // Validate current step
    let isValid = true;
    const newErrors: string[] = [];
    
    // Step-specific validation
    if (activeStep === 1) {
      // Validate basic info
      const result = await trigger(['name', 'contactId', 'status']);
      if (!result) {
        isValid = false;
        if (errors.name) newErrors.push('Name is required');
        if (errors.contactId) newErrors.push('Contact is required');
        if (errors.status) newErrors.push('Status is required');
      }
    } else if (activeStep === 2) {
      // Validate services & plans
      if (selectedServices.length === 0) {
        isValid = false;
        newErrors.push('At least one service must be added');
      }
    }
    
    setStepErrors(newErrors);
    
    if (isValid) {
      setActiveStep(Math.min(activeStep + 1, totalSteps));
    }
  };
  
  const goToPreviousStep = () => {
    setActiveStep(Math.max(activeStep - 1, 1));
  };
  
  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <FaInfoCircle />;
      case 2: return <FaCog />;
      case 3: return <FaEnvelope />;
      case 4: return <FaClipboardCheck />;
      default: return <FaInfoCircle />;
    }
  };
  
  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Basic Information';
      case 2: return 'Services & Plans';
      case 3: return 'Delivery Options';
      case 4: return 'Review & Confirm';
      default: return 'Step';
    }
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderServicesPlansStep();
      case 3:
        return renderDeliveryOptionsStep();
      case 4:
        return renderReviewStep();
      default:
        return renderBasicInfoStep();
    }
  };
  
  // Step 1: Basic Information
  const renderBasicInfoStep = () => {
    return (
      <div>
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
                Contact {!isBuilder && <span className="text-danger">*</span>}
              </Form.Label>
              {isBuilder ? (
                <Form.Control
                  size="sm"
                  type="text"
                  value={proposal?.contact ? `${proposal.contact.firstName} ${proposal.contact.lastName}` : 'N/A'}
                  disabled
                />
              ) : (
                <>
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
                </>
              )}
              {isBuilder && (
                <Form.Text className="text-muted">
                  To change the client, create a new proposal
                </Form.Text>
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-briefcase me-2"></i>
                Deal
              </Form.Label>
              {isBuilder ? (
                <Form.Control
                  size="sm"
                  type="text"
                  value={proposal?.deal?.name || 'N/A'}
                  disabled
                />
              ) : (
                <Form.Select 
                  size="sm"
                  {...register('dealId')}
                >
                  <option value="">No deal selected</option>
                  {deals.map(deal => (
                    <option key={deal.id} value={deal.id}>
                      {deal.name} (${deal.amount?.toFixed(2) || '0.00'})
                    </option>
                  ))}
                </Form.Select>
              )}
              <Form.Text className="text-muted">
                {!isBuilder && 'Optional: Link this proposal to a deal'}
              </Form.Text>
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
    );
  };
  
  // Step 2: Services & Plans
  const renderServicesPlansStep = () => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }
    
    return (
      <div>
        {/* Service Search with Autocomplete */}
        <div className="mb-2 position-relative">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="d-flex align-items-center">
              <FaSearch className="text-muted me-1" size={12} />
              <small className="text-muted">Search Services</small>
            </div>
            <Form.Check
              type="switch"
              id="pricing-toggle"
              label={<small>{showIndividualPricing ? "Show Pricing" : "Hide Pricing"}</small>}
              checked={showIndividualPricing}
              onChange={() => setShowIndividualPricing(!showIndividualPricing)}
              className="mb-0"
            />
          </div>
          <InputGroup size="sm">
            <FormControl
              placeholder="Search for services..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
            <Button 
              variant="outline-secondary"
              onClick={() => {
                setSearchTerm('');
                setFilteredServices([]);
              }}
            >
              <FaTimes size={12} />
            </Button>
          </InputGroup>
          
          {showDropdown && filteredServices.length > 0 && (
            <Card className="position-absolute w-100 z-index-dropdown shadow-sm">
              <Card.Body className="p-0">
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {filteredServices.map(service => (
                    <div 
                      key={service.id} 
                      className="p-1 border-bottom hover-bg-light cursor-pointer"
                      onClick={() => handleAddService(service)}
                    >
                      <div className="fw-bold small">{service.name}</div>
                      <div className="small text-muted">{service.description.substring(0, 40)}...</div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Services Table */}
        <div className="mb-2">
          {selectedServices.length === 0 ? (
            <div className="text-center py-2 border rounded">
              <i className="bi bi-gear text-muted"></i>
              <p className="mt-1 mb-0 small">No services added yet</p>
              <p className="text-muted small">Search for services above</p>
            </div>
          ) : (
            <div className="mb-3">
              <Row className="mb-2 align-items-center">
                <Col xs={6}>
                  <div className="d-flex align-items-center">
                    <small className="text-muted me-2">Discount:</small>
                    <InputGroup size="sm" className="me-2" style={{ width: '120px' }}>
                      <FormControl
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercentage}
                        onChange={(e) => {
                          setDiscountPercentage(parseFloat(e.target.value) || 0);
                          setDiscountAmount(0);
                        }}
                        placeholder="%"
                        style={{ height: '28px' }}
                      />
                      <InputGroup.Text style={{ padding: '0 8px', height: '28px' }}>%</InputGroup.Text>
                    </InputGroup>
                    <small className="text-muted me-1">or</small>
                    <InputGroup size="sm" style={{ width: '120px' }}>
                      <InputGroup.Text style={{ padding: '0 8px', height: '28px' }}>$</InputGroup.Text>
                      <FormControl
                        type="number"
                        min="0"
                        value={discountAmount}
                        onChange={(e) => {
                          setDiscountAmount(parseFloat(e.target.value) || 0);
                          setDiscountPercentage(0);
                        }}
                        placeholder="Amount"
                        style={{ height: '28px' }}
                      />
                    </InputGroup>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="d-flex align-items-center">
                    <small className="text-muted me-2">VAT/Tax:</small>
                    <InputGroup size="sm" style={{ width: '120px' }}>
                      <FormControl
                        type="number"
                        min="0"
                        max="100"
                        value={taxPercentage}
                        onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                        placeholder="%"
                        style={{ height: '28px' }}
                      />
                      <InputGroup.Text style={{ padding: '0 8px', height: '28px' }}>%</InputGroup.Text>
                    </InputGroup>
                  </div>
                </Col>
              </Row>
              
              <Table responsive bordered hover size="sm" className="align-middle" style={{ fontSize: '0.85rem' }}>
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: '35%', padding: '0.4rem' }}>Services</th>
                    <th style={{ width: '8%', padding: '0.4rem' }}>Units</th>
                    <th style={{ width: '15%', padding: '0.4rem' }} className="text-center">Basic</th>
                    <th style={{ width: '15%', padding: '0.4rem' }} className="text-center">Standard</th>
                    <th style={{ width: '15%', padding: '0.4rem' }} className="text-center">Premium</th>
                    <th style={{ width: '5%', padding: '0.4rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {groupedServices.map((group, index) => {
                    // Determine tier inclusion state directly from selectedServices
                    const includedInTiers = {
                      BASIC: !!selectedServices.find(s => s.productId === group.product.id && s.planType === 'BASIC'),
                      STANDARD: !!selectedServices.find(s => s.productId === group.product.id && s.planType === 'STANDARD'),
                      PREMIUM: !!selectedServices.find(s => s.productId === group.product.id && s.planType === 'PREMIUM')
                    };
                    
                    return (
                      <tr key={index}>
                        <td style={{ padding: '0.4rem' }}>
                          <div className="fw-bold small">{group.product.name}</div>
                          <div className="small text-muted text-truncate" style={{ fontSize: '0.75rem' }}>{group.product.description.substring(0, 40)}</div>
                        </td>
                        <td style={{ padding: '0.4rem' }}>
                          <Form.Control
                            type="number"
                            min="1"
                            value={group.quantity}
                            onChange={(e) => handleQuantityChange(group.product.id, parseInt(e.target.value) || 1)}
                            size="sm"
                            style={{ height: '28px', padding: '0.2rem 0.5rem' }}
                          />
                        </td>
                        <td onClick={() => handleTierToggle(group.product.id, 'BASIC')} className="cursor-pointer text-center" style={{ padding: '0.4rem' }}>
                          {includedInTiers.BASIC ? (
                            <>
                              <div className="text-success"><FaCheck size={11} /></div>
                              {showIndividualPricing && (
                                <div className="text-center small" style={{ fontSize: '0.75rem' }}>${getTierPrice(group.product.id, 'BASIC')}</div>
                              )}
                            </>
                          ) : (
                            <div className="text-danger"><FaTimes size={11} /></div>
                          )}
                        </td>
                        <td onClick={() => handleTierToggle(group.product.id, 'STANDARD')} className="cursor-pointer text-center" style={{ padding: '0.4rem' }}>
                          {includedInTiers.STANDARD ? (
                            <>
                              <div className="text-success"><FaCheck size={11} /></div>
                              {showIndividualPricing && (
                                <div className="text-center small" style={{ fontSize: '0.75rem' }}>${getTierPrice(group.product.id, 'STANDARD')}</div>
                              )}
                            </>
                          ) : (
                            <div className="text-danger"><FaTimes size={11} /></div>
                          )}
                        </td>
                        <td onClick={() => handleTierToggle(group.product.id, 'PREMIUM')} className="cursor-pointer text-center" style={{ padding: '0.4rem' }}>
                          {includedInTiers.PREMIUM ? (
                            <>
                              <div className="text-success"><FaCheck size={11} /></div>
                              {showIndividualPricing && (
                                <div className="text-center small" style={{ fontSize: '0.75rem' }}>${getTierPrice(group.product.id, 'PREMIUM')}</div>
                              )}
                            </>
                          ) : (
                            <div className="text-danger"><FaTimes size={11} /></div>
                          )}
                        </td>
                        <td className="text-center" style={{ padding: '0.4rem' }}>
                          <Button
                            variant="link"
                            className="p-0 text-danger"
                            onClick={() => handleRemoveService(group.product.id)}
                          >
                            <FaTrash size={11} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Summary Rows */}
                  <tr className="bg-light">
                    <td colSpan={2} className="text-end fw-bold" style={{ padding: '0.4rem' }}>Subtotal:</td>
                    <td className="text-center fw-bold" style={{ padding: '0.4rem' }}>${getTierTotal('BASIC').toFixed(2)}</td>
                    <td className="text-center fw-bold" style={{ padding: '0.4rem' }}>${getTierTotal('STANDARD').toFixed(2)}</td>
                    <td className="text-center fw-bold" style={{ padding: '0.4rem' }}>${getTierTotal('PREMIUM').toFixed(2)}</td>
                    <td style={{ padding: '0.4rem' }}></td>
                  </tr>
                  
                  {(discountPercentage > 0 || discountAmount > 0) && (
                    <tr>
                      <td colSpan={2} className="text-end fw-bold" style={{ padding: '0.4rem' }}>Discount:</td>
                      <td className="text-center fw-bold text-danger" style={{ padding: '0.4rem' }}>
                        -${getTierDiscountAmount(getTierTotal('BASIC')).toFixed(2)}
                      </td>
                      <td className="text-center fw-bold text-danger" style={{ padding: '0.4rem' }}>
                        -${getTierDiscountAmount(getTierTotal('STANDARD')).toFixed(2)}
                      </td>
                      <td className="text-center fw-bold text-danger" style={{ padding: '0.4rem' }}>
                        -${getTierDiscountAmount(getTierTotal('PREMIUM')).toFixed(2)}
                      </td>
                      <td style={{ padding: '0.4rem' }}></td>
                    </tr>
                  )}
                  
                  {taxPercentage > 0 && (
                    <tr>
                      <td colSpan={2} className="text-end fw-bold" style={{ padding: '0.4rem' }}>VAT/Tax ({taxPercentage}%):</td>
                      <td className="text-center fw-bold" style={{ padding: '0.4rem' }}>
                        ${getTierTaxAmount(getTierTotal('BASIC'), getTierDiscountAmount(getTierTotal('BASIC'))).toFixed(2)}
                      </td>
                      <td className="text-center fw-bold" style={{ padding: '0.4rem' }}>
                        ${getTierTaxAmount(getTierTotal('STANDARD'), getTierDiscountAmount(getTierTotal('STANDARD'))).toFixed(2)}
                      </td>
                      <td className="text-center fw-bold" style={{ padding: '0.4rem' }}>
                        ${getTierTaxAmount(getTierTotal('PREMIUM'), getTierDiscountAmount(getTierTotal('PREMIUM'))).toFixed(2)}
                      </td>
                      <td style={{ padding: '0.4rem' }}></td>
                    </tr>
                  )}
                  
                  {/* Total Row */}
                  <tr className="bg-light">
                    <td colSpan={2} className="text-end fw-bold" style={{ padding: '0.4rem' }}>Total:</td>
                    <td className="text-center fw-bold" style={{ padding: '0.4rem' }}>${getTierFinalTotal('BASIC').toFixed(2)}</td>
                    <td className="text-center fw-bold" style={{ padding: '0.4rem' }}>${getTierFinalTotal('STANDARD').toFixed(2)}</td>
                    <td className="text-center fw-bold" style={{ padding: '0.4rem' }}>${getTierFinalTotal('PREMIUM').toFixed(2)}</td>
                    <td style={{ padding: '0.4rem' }}></td>
                  </tr>
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Step 3: Delivery Options
  const renderDeliveryOptionsStep = () => {
    return (
      <div>
        <h5 className="mb-3">Delivery Options</h5>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email Template</Form.Label>
              <Form.Select 
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
              >
                <option>Default Template</option>
                <option>Professional Template</option>
                <option>Casual Template</option>
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Export Format</Form.Label>
              <Form.Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option>PDF Document</option>
                <option>Word Document</option>
                <option>HTML Page</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <h5 className="mb-3">Additional Settings</h5>
        <Form.Group className="mb-3">
          <Form.Check 
            type="checkbox" 
            label="Include company logo" 
            checked={includeCompanyLogo}
            onChange={(e) => setIncludeCompanyLogo(e.target.checked)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check 
            type="checkbox" 
            label="Include pricing table" 
            checked={includePricingTable}
            onChange={(e) => setIncludePricingTable(e.target.checked)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check 
            type="checkbox" 
            label="Include digital signature option" 
            checked={includeDigitalSignature}
            onChange={(e) => setIncludeDigitalSignature(e.target.checked)}
          />
        </Form.Group>
        
        <div className="mb-3">
          <Form.Label>
            <i className="bi bi-pencil me-2"></i>
            Pricing Notes
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={pricingNotes}
            onChange={(e) => setPricingNotes(e.target.value)}
            placeholder="Add any additional notes about pricing, discounts, or terms..."
            size="sm"
          />
        </div>
      </div>
    );
  };

  // Step 4: Review & Confirm
  const renderReviewStep = () => {
    const formValues = getValues();
    
    return (
      <div>
        <h5 className="mb-3">Review Your Proposal</h5>
        
        <Card className="mb-3">
          <Card.Header className="bg-light">
            <h6 className="mb-0">Basic Information</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p className="mb-1"><strong>Name:</strong> {formValues.name}</p>
                <p className="mb-1"><strong>Status:</strong> {formValues.status}</p>
              </Col>
              <Col md={6}>
                <p className="mb-1"><strong>Contact:</strong> {formValues.contactId ? getContactName(formValues.contactId) : 'N/A'}</p>
                <p className="mb-1"><strong>Deal:</strong> {formValues.dealId ? getDealName(formValues.dealId) : 'N/A'}</p>
                <p className="mb-1"><strong>Valid Until:</strong> {formValues.validUntil ? new Date(formValues.validUntil).toLocaleDateString() : 'N/A'}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        <Card className="mb-3">
          <Card.Header className="bg-light">
            <h6 className="mb-0">Services & Plans</h6>
          </Card.Header>
          <Card.Body>
            {selectedServices.length === 0 ? (
              <p className="text-muted">No services added</p>
            ) : (
              <>
                <p className="mb-1"><strong>Number of Services:</strong> {groupedServices.length}</p>
                <p className="mb-1"><strong>Basic Tier Total:</strong> ${getTierFinalTotal('BASIC').toFixed(2)}</p>
                <p className="mb-1"><strong>Standard Tier Total:</strong> ${getTierFinalTotal('STANDARD').toFixed(2)}</p>
                <p className="mb-1"><strong>Premium Tier Total:</strong> ${getTierFinalTotal('PREMIUM').toFixed(2)}</p>
                {(discountPercentage > 0 || discountAmount > 0) && (
                  <p className="mb-1"><strong>Discount:</strong> {discountPercentage > 0 ? `${discountPercentage}%` : `$${discountAmount}`}</p>
                )}
                {taxPercentage > 0 && (
                  <p className="mb-1"><strong>Tax:</strong> {taxPercentage}%</p>
                )}
              </>
            )}
          </Card.Body>
        </Card>
        
        <Card className="mb-3">
          <Card.Header className="bg-light">
            <h6 className="mb-0">Delivery Options</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p className="mb-1"><strong>Email Template:</strong> {emailTemplate}</p>
                <p className="mb-1"><strong>Export Format:</strong> {exportFormat}</p>
              </Col>
              <Col md={6}>
                <p className="mb-1"><strong>Include Company Logo:</strong> {includeCompanyLogo ? 'Yes' : 'No'}</p>
                <p className="mb-1"><strong>Include Pricing Table:</strong> {includePricingTable ? 'Yes' : 'No'}</p>
                <p className="mb-1"><strong>Include Digital Signature:</strong> {includeDigitalSignature ? 'Yes' : 'No'}</p>
              </Col>
            </Row>
            {pricingNotes && (
              <>
                <h6 className="mt-3 mb-2">Pricing Notes:</h6>
                <p className="mb-0 text-muted">{pricingNotes}</p>
              </>
            )}
          </Card.Body>
        </Card>
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          {isBuilder ? 'Proposal Properties' : (proposal ? 'Edit Proposal' : 'Create New Proposal')}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {/* Progress Steps */}
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              {Array.from({ length: totalSteps }).map((_, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === activeStep;
                const isCompleted = stepNumber < activeStep;
                
                return (
                  <div 
                    key={stepNumber}
                    className={`step-indicator d-flex flex-column align-items-center ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    style={{ flex: 1, cursor: isCompleted ? 'pointer' : 'default' }}
                    onClick={() => isCompleted && setActiveStep(stepNumber)}
                  >
                    <div className={`rounded-circle d-flex align-items-center justify-content-center mb-1 ${isActive || isCompleted ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ width: '32px', height: '32px' }}>
                      {getStepIcon(stepNumber)}
                    </div>
                    <div className="text-center small">
                      {getStepTitle(stepNumber)}
                    </div>
                  </div>
                );
              })}
            </div>
            <ProgressBar now={(activeStep / totalSteps) * 100} className="mt-2" />
          </div>
          
          {/* Step Errors */}
          {stepErrors.length > 0 && (
            <div className="alert alert-danger mb-3">
              <ul className="mb-0 ps-3">
                {stepErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Step Content */}
          {renderStepContent()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          
          {activeStep > 1 && (
            <Button variant="outline-primary" onClick={goToPreviousStep}>
              <FaArrowLeft className="me-1" /> Previous
            </Button>
          )}
          
          {activeStep < totalSteps && (
            <Button variant="primary" onClick={goToNextStep}>
              Next <FaArrowRight className="ms-1" />
            </Button>
          )}
          
          {activeStep === totalSteps && (
            <>
              {isBuilder && onSaveAsTemplate && (
                <Button 
                  variant="outline-success" 
                  className="me-2"
                  onClick={() => {
                    onSaveAsTemplate();
                    onHide();
                  }}
                >
                  Save as Template
                </Button>
              )}
              <Button variant="success" type="submit">
                <FaCheck className="me-1" /> Save Proposal
              </Button>
            </>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UnifiedProposalModal;