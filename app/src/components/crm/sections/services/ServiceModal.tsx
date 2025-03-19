import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Table, ProgressBar, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { FaArrowLeft, FaArrowRight, FaSave, FaCheck, FaTimes } from 'react-icons/fa';
import 'bootstrap';
import { Product, ProductType, Status, PlanType } from '../../../crm/types';

interface ProductTier {
  type: PlanType;
  price: number;
  features: string[];
  description?: string;
}

interface ServiceModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (service: Product) => void;
  service: Product | null;
}

// Step types
type Step = 'basic-info' | 'pricing-tiers' | 'additional-info';

const ServiceModal: React.FC<ServiceModalProps> = ({
  show,
  onHide,
  onSave,
  service,
}) => {
  // Step state
  const [currentStep, setCurrentStep] = useState<Step>('basic-info');
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [stepSaving, setStepSaving] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [stepSuccess, setStepSuccess] = useState<string | null>(null);
  
  // Default tiers configuration
  const defaultTiers: ProductTier[] = [
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
  ];

  // Service data state
  const [tiers, setTiers] = useState<ProductTier[]>(defaultTiers);
  const [newFeature, setNewFeature] = useState('');
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    type: 'SERVICE',
    category: '',
    unit: '',
    sku: '',
    status: 'Active',
  });

  // Update form data when service changes
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        type: service.type,
        category: service.category,
        unit: service.unit,
        sku: service.sku,
        status: service.status,
      });
      setTiers(service.tiers.map(tier => ({
        type: tier.type,
        price: tier.price,
        features: tier.features || [],
        description: tier.description || ''
      })));
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'SERVICE',
        category: '',
        unit: '',
        sku: '',
        status: 'Active',
      });
      setTiers(defaultTiers);
    }
  }, [service]);

  // Form validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
    getValues,
    setValue
  } = useForm<Partial<Product>>();

  // Initialize form data when service changes
  useEffect(() => {
    if (service) {
      // Set form values for each field
      setValue('name', service.name);
      setValue('description', service.description);
      setValue('category', service.category);
      setValue('status', service.status);
      setValue('unit', service.unit || '');
      setValue('sku', service.sku || '');
      setValue('type', 'SERVICE');
      
      // Set tiers data
      setTiers(service.tiers.map(tier => ({
        type: tier.type,
        price: tier.price,
        features: tier.features || [],
        description: tier.description || ''
      })));
      
      // Mark all steps as completed for editing
      setCompletedSteps(new Set(['basic-info', 'pricing-tiers', 'additional-info']));
    } else {
      // Reset form for new service
      reset({
        name: '',
        description: '',
        category: '',
        status: 'Active',
        unit: '',
        sku: '',
        type: 'SERVICE'
      });
      setTiers(defaultTiers);
      setCompletedSteps(new Set());
    }
    
    // Clear any previous messages
    setStepError(null);
    setStepSuccess(null);
    
    // Reset to first step when modal opens
    setCurrentStep('basic-info');
  }, [service, setValue, reset]);

  // Feature management
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

  // Step navigation
  const steps: Step[] = ['basic-info', 'pricing-tiers', 'additional-info'];
  
  const getStepNumber = (step: Step): number => {
    return steps.indexOf(step) + 1;
  };

  const getStepTitle = (step: Step): string => {
    switch (step) {
      case 'basic-info': return 'Basic Information';
      case 'pricing-tiers': return 'Pricing Tiers';
      case 'additional-info': return 'Additional Information';
    }
  };

  const getStepIcon = (step: Step): string => {
    switch (step) {
      case 'basic-info': return 'bi-info-circle';
      case 'pricing-tiers': return 'bi-currency-dollar';
      case 'additional-info': return 'bi-three-dots';
    }
  };

  const getNextStep = (): Step | null => {
    const currentIndex = steps.indexOf(currentStep);
    return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
  };

  const getPrevStep = (): Step | null => {
    const currentIndex = steps.indexOf(currentStep);
    return currentIndex > 0 ? steps[currentIndex - 1] : null;
  };

  // Step validation and saving
  const validateCurrentStep = async (): Promise<boolean> => {
    setStepError(null);
    
    try {
      switch (currentStep) {
        case 'basic-info':
          // Validate required fields in basic info step
          const isValid = await trigger(['name', 'description', 'category', 'status']);
          if (!isValid) {
            setStepError('Please fill in all required fields');
            return false;
          }
          break;
          
        case 'pricing-tiers':
          // Validate pricing tiers
          if (tiers.some(tier => tier.price < 0)) {
            setStepError('Price cannot be negative');
            return false;
          }
          break;
          
        case 'additional-info':
          // No validation needed for additional info yet
          break;
      }
      
      return true;
    } catch (error) {
      setStepError('Validation error occurred');
      return false;
    }
  };

  const saveCurrentStep = async (): Promise<boolean> => {
    setStepSaving(true);
    setStepError(null);
    setStepSuccess(null);
    
    try {
      // Validate the current step
      const isValid = await validateCurrentStep();
      if (!isValid) {
        setStepSaving(false);
        return false;
      }
      
      // Get current form values
      const currentValues = getValues();
      
      // Update form data with current values
      setFormData(prev => ({
        ...prev,
        ...currentValues,
      }));
      
      // Simulate API call to save current step
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mark step as completed
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      
      // Show success message
      setStepSuccess(`${getStepTitle(currentStep)} saved successfully`);
      
      setStepSaving(false);
      return true;
    } catch (error) {
      setStepError('Failed to save. Please try again.');
      setStepSaving(false);
      return false;
    }
  };

  const handleNext = async () => {
    // Save current step
    const saved = await saveCurrentStep();
    if (!saved) return;
    
    // Move to next step
    const nextStep = getNextStep();
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  };

  const handlePrev = () => {
    const prevStep = getPrevStep();
    if (prevStep) {
      setCurrentStep(prevStep);
    }
  };

  // Final submission
  const handleFinalSubmit = async () => {
    // Save the current step first
    const saved = await saveCurrentStep();
    if (!saved) return;
    
    try {
      // Validate all required fields
      const isValid = await trigger();
      if (!isValid) {
        setStepError('Please fill in all required fields');
        return;
      }
      
      // Get current form values
      const currentValues = getValues();
      
      // Prepare the final service data
      const serviceData = {
        ...currentValues,
        type: 'SERVICE' as ProductType,
        tiers: tiers.map(tier => ({
          ...tier,
          price: Number(tier.price),
          features: Array.isArray(tier.features) ? tier.features : [],
        })),
      } as Product;
      
      // Call the onSave callback
      onSave(serviceData);
      
      // Reset form and state
      reset();
      setTiers(defaultTiers);
      setCompletedSteps(new Set());
      setStepError(null);
      setStepSuccess(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      setStepError('Failed to save service. Please try again.');
    }
  };

  // Calculate progress percentage
  const calculateProgress = (): number => {
    return (completedSteps.size / steps.length) * 100;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{service ? 'Edit Service' : 'Add New Service'}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <h6 className="text-muted mb-2">Fields marked with <span className="text-danger">*</span> are required</h6>
        
        {/* Progress bar and step indicators */}
        <div className="mb-4">
          {/* Progress bar */}
          <ProgressBar 
            now={calculateProgress()} 
            label={`${Math.round(calculateProgress())}%`} 
            variant="primary" 
            className="mb-4"
            style={{ height: '8px' }}
          />
          
          {/* Step indicators */}
          <div className="d-flex justify-content-between position-relative" style={{ marginTop: '-35px' }}>
            {/* Step line (behind the dots) */}
            <div className="position-absolute" style={{ 
              top: '15px', 
              left: '15px', 
              right: '15px', 
              height: '2px', 
              backgroundColor: '#e9ecef', 
              zIndex: 0 
            }}></div>
            
            {/* Step dots */}
            {steps.map((step, index) => (
              <div 
                key={step} 
                className={`step-indicator d-flex flex-column align-items-center position-relative ${currentStep === step ? 'active' : ''} ${completedSteps.has(step) ? 'completed' : ''}`}
                style={{ width: `${100 / steps.length}%`, zIndex: 1 }}
              >
                <div 
                  className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                    completedSteps.has(step) 
                      ? 'bg-success text-white' 
                      : currentStep === step 
                        ? 'bg-primary text-white' 
                        : 'bg-white border'
                  }`}
                  style={{ 
                    width: '30px', 
                    height: '30px', 
                    cursor: completedSteps.has(step) ? 'pointer' : 'default',
                    border: completedSteps.has(step) || currentStep === step ? 'none' : '1px solid #dee2e6'
                  }}
                  onClick={() => completedSteps.has(step) && setCurrentStep(step)}
                >
                  {completedSteps.has(step) ? (
                    <FaCheck size={12} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span 
                  className={`small ${currentStep === step ? 'fw-bold' : ''} ${completedSteps.has(step) ? 'text-success' : ''}`}
                  style={{ fontSize: '0.75rem' }}
                >
                  {getStepTitle(step)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Status messages */}
        {stepError && (
          <Alert variant="danger" className="d-flex align-items-center py-2">
            <FaTimes className="me-2" />
            {stepError}
          </Alert>
        )}
        
        {stepSuccess && (
          <Alert variant="success" className="d-flex align-items-center py-2">
            <FaCheck className="me-2" />
            {stepSuccess}
          </Alert>
        )}
        
        <Form id="service-form">
          {/* Step 1: Basic Information */}
          {currentStep === 'basic-info' && (
            <div className="step-content">
              <h5 className="mb-3">
                <i className={`bi ${getStepIcon(currentStep)} me-2`}></i>
                {getStepTitle(currentStep)}
              </h5>
              
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
                <div className="col-md-6">
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
              </div>

              {/* Hidden type field - always SERVICE */}
              <input type="hidden" {...register('type')} value="SERVICE" />
            </div>
          )}
          
          {/* Step 2: Pricing Tiers */}
          {currentStep === 'pricing-tiers' && (
            <div className="step-content">
              <h5 className="mb-3">
                <i className={`bi ${getStepIcon(currentStep)} me-2`}></i>
                {getStepTitle(currentStep)}
              </h5>
              
              <div className="row mb-4">
                {tiers.map((tier, tierIndex) => (
                  <div key={tier.type} className="col-md-4">
                    <div className="card h-100 shadow-sm">
                      <div className={`card-header py-2 ${
                        tier.type === 'BASIC' ? 'bg-light' : 
                        tier.type === 'STANDARD' ? 'bg-info bg-opacity-10' : 
                        'bg-primary bg-opacity-10'
                      }`}>
                        <h6 className="mb-0 text-center">{tier.type}</h6>
                      </div>
                      <div className="card-body">
                        <Form.Group className="mb-3">
                          <Form.Label className="d-flex align-items-center">
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
                        
                        <Form.Group className="mb-3">
                          <Form.Label className="d-flex align-items-center">
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

                        <Form.Group className="mb-0">
                          <Form.Label className="d-flex align-items-center">
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
                          <div className="features-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <Table size="sm" className="mb-0">
                              <tbody>
                                {tier.features.map((feature, featureIndex) => (
                                  <tr key={featureIndex}>
                                    <td className="small">{feature}</td>
                                    <td className="text-end" style={{ width: '40px' }}>
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
                                {tier.features.length === 0 && (
                                  <tr>
                                    <td colSpan={2} className="text-center text-muted small py-2">
                                      No features added
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </Table>
                          </div>
                        </Form.Group>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 3: Additional Information */}
          {currentStep === 'additional-info' && (
            <div className="step-content">
              <h5 className="mb-3">
                <i className={`bi ${getStepIcon(currentStep)} me-2`}></i>
                {getStepTitle(currentStep)}
              </h5>
              
              <p className="text-muted">Additional service details and settings can be added here in the future.</p>
            </div>
          )}
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <div className="d-flex justify-content-between w-100">
          <div>
            {getPrevStep() && (
              <Button 
                variant="outline-secondary" 
                onClick={handlePrev}
                disabled={stepSaving}
              >
                <FaArrowLeft className="me-2" />
                Previous
              </Button>
            )}
          </div>
          
          <div>
            <Button variant="secondary" onClick={onHide} className="me-2" disabled={stepSaving}>
              Cancel
            </Button>
            
            {getNextStep() ? (
              <Button 
                variant="primary" 
                onClick={handleNext}
                disabled={stepSaving}
              >
                {stepSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    Next <FaArrowRight className="ms-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                variant="success" 
                onClick={handleFinalSubmit}
                disabled={stepSaving}
              >
                {stepSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    Save Service
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ServiceModal;
