import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Button, Form } from 'react-bootstrap';
import * as CompaniesService from '../../../../services/settings/companies';
import { handleApiError } from '../../../../services/settings';
import type { Company, CompanyType, CompanyTag } from '../../../../services/settings/companies';
import type { Currency } from '../../../../services/settings/types';
import type { Address } from '../../../../services/settings/types';

interface CompanyModalProps {
  show: boolean;
  onHide: () => void;
  company?: Company;
  onSuccess: () => void;
}

interface CompanyFormData {
  name: string;
  legalName: string;
  registrationNumber: string;
  vatNumber?: string;
  email: string;
  phone: string;
  website?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  industry?: string;
  size?: string;
  type?: CompanyType;
  currency?: Currency;
  fiscalYearEnd?: string;
  isPrimaryOrg: boolean;
  isMyOrg: boolean;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactRole?: string;
  notes?: string;
}

interface PrimaryContactData {
  name: string;
  email: string;
  phone: string;
  role: string;
}

const CompanyModal: React.FC<CompanyModalProps> = ({ show, onHide, company, onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, trigger } = useForm<CompanyFormData>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      name: '',
      legalName: '',
      registrationNumber: '',
      vatNumber: '',
      email: '',
      phone: '',
      website: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      industry: '',
      size: '',
      type: 'Other' as CompanyType,
      currency: 'USD' as Currency,
      fiscalYearEnd: '',
      isPrimaryOrg: false,
      isMyOrg: false,
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      contactRole: '',
      notes: ''
    }
  });

  const resetForm = React.useCallback(() => {
    reset({
      name: '',
      legalName: '',
      registrationNumber: '',
      vatNumber: '',
      email: '',
      phone: '',
      website: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      industry: '',
      size: '',
      type: 'Other' as CompanyType,
      currency: 'USD' as Currency,
      fiscalYearEnd: '',
      isPrimaryOrg: false,
      isMyOrg: false,
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      contactRole: '',
      notes: ''
    });
  }, [reset]);

  React.useEffect(() => {
    if (!show) {
      resetForm();
      return;
    }
    
    trigger(); // Validate form when modal is shown

    if (company) {
      // Parse address if it exists
      let address: Address = {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      };
      try {
        if (company.address) {
          const parsedAddress = typeof company.address === 'string' 
            ? JSON.parse(company.address)
            : company.address;
          
          address = {
            street: parsedAddress.street || '',
            city: parsedAddress.city || '',
            state: parsedAddress.state || '',
            postalCode: parsedAddress.postalCode || '',
            country: parsedAddress.country || ''
          };
        }
      } catch (e) {
        console.error('Error parsing company address:', e);
      }

      // Set basic company info
      setValue('name', company.name);
      setValue('legalName', company.legalName || '');
      setValue('registrationNumber', company.registrationNumber || '');
      setValue('vatNumber', company.vatNumber || '');
      setValue('email', company.email || '');
      setValue('phone', company.phone || '');
      setValue('website', company.website || '');

      // Set address fields
      setValue('street', address?.street || '');
      setValue('city', address?.city || '');
      setValue('state', address?.state || '');
      setValue('postalCode', address?.postalCode || '');
      setValue('country', address?.country || '');
      // Set business details
      setValue('industry', company.industry || '');
      setValue('size', company.size || '');
      setValue('type', company.type || '');
      setValue('currency', company.currency || '');
      setValue('fiscalYearEnd', company.fiscalYearEnd || '');

      // Set organization flags
      setValue('isPrimaryOrg', company.tags?.includes('Primary Organization') || false);
      setValue('isMyOrg', company.tags?.includes('My Organization') || false);

      // Set primary contact info
      setValue('contactName', company.primaryContact?.name || '');
      setValue('contactEmail', company.primaryContact?.email || '');
      setValue('contactPhone', company.primaryContact?.phone || '');
      setValue('contactRole', company.primaryContact?.role || '');

      // Set notes
      setValue('notes', company.notes || '');
    } else {
      resetForm();
    }
  }, [show, company, setValue, resetForm, trigger]);

  const handleClose = React.useCallback(() => {
    if (isSubmitting) return;
    resetForm();
    onHide();
  }, [resetForm, onHide, isSubmitting]);

  const onSubmit = React.useCallback(async (data: CompanyFormData) => {
    if (!show) return;
    try {
      // Prepare tags array
      const tags: CompanyTag[] = [];
      if (data.isPrimaryOrg) tags.push('Primary Organization');
      if (data.isMyOrg) tags.push('My Organization');

      // Prepare address object
      const address = {
        street: data.street || '',
        city: data.city || '',
        state: data.state || '',
        postalCode: data.postalCode || '',
        country: data.country || ''
      };

      // Check primary contact details
      const contactName = data.contactName?.trim();
      const contactEmail = data.contactEmail?.trim();
      const hasPrimaryContact = contactName && contactEmail;

      // Create company data object
      const companyData: CompaniesService.CreateCompanyDto = {
        name: data.name,
        legalName: data.legalName,
        registrationNumber: data.registrationNumber,
        vatNumber: data.vatNumber || undefined,
        email: data.email,
        phone: data.phone,
        website: data.website || undefined,
        address: JSON.stringify(address),
        industry: data.industry || '',
        size: data.size || '',
        type: (data.type as CompanyType) || 'Other',
        tags,
        fiscalYearEnd: data.fiscalYearEnd || '',
        currency: (data.currency as Currency) || 'USD',
        notes: data.notes || undefined,
        status: company?.status || 'Active',
        isPrimary: data.isPrimaryOrg,
        isMyOrg: data.isMyOrg,
        primaryContact: hasPrimaryContact ? {
          name: contactName,
          email: contactEmail,
          phone: data.contactPhone || '',
          role: data.contactRole || ''
        } : undefined
      };

      if (hasPrimaryContact) {
        const primaryContactData: PrimaryContactData = {
          name: contactName,
          email: contactEmail,
          phone: data.contactPhone || '',
          role: data.contactRole || ''
        };

        if (company) {
          // Update existing company
          const updatedCompany = await CompaniesService.updateCompany(company.id, companyData);
          await CompaniesService.updatePrimaryContact(company.id, primaryContactData);
          onSuccess();
        } else {
          // Create new company
          const createdCompany = await CompaniesService.createCompany(companyData);
          await CompaniesService.updatePrimaryContact(createdCompany.id, primaryContactData);
          onSuccess();
        }
      } else {
        if (company) {
          await CompaniesService.updateCompany(company.id, companyData);
        } else {
          await CompaniesService.createCompany(companyData);
        }
        onSuccess();
      }

      onHide();
    } catch (err) {
      console.error('Error saving company:', err);
      alert(handleApiError(err));
    }
  }, [company, onSuccess, onHide, show, isSubmitting]);

  if (!show) return null;

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="lg" 
      backdrop="static"
      keyboard={false}
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="needs-validation">
        <Modal.Header closeButton>
          <Modal.Title>{company ? 'Edit Company' : 'Add Company'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
              <div className="text-muted small mb-3">Fields marked with an asterisk (*) are required</div>
              <div className="row g-3">
                {/* Basic Information */}
                <div className="col-12">
                  <h6 className="text-muted mb-3">Basic Information</h6>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="name">
                    <Form.Label>Company Name *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter company name"
                      isInvalid={!!errors.name}
                      {...register('name', { required: 'Company name is required' })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="legalName">
                    <Form.Label>Legal Name *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter legal name"
                      isInvalid={!!errors.legalName}
                      {...register('legalName', { required: 'Legal name is required' })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.legalName?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="registrationNumber">
                    <Form.Label>Registration Number *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter registration number"
                      isInvalid={!!errors.registrationNumber}
                      {...register('registrationNumber', { required: 'Registration number is required' })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.registrationNumber?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="vatNumber">
                    <Form.Label>VAT Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter VAT number"
                      {...register('vatNumber')}
                    />
                  </Form.Group>
                </div>

                {/* Contact Information */}
                <div className="col-12">
                  <h6 className="text-muted mb-3 mt-2">Contact Information</h6>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="email">
                    <Form.Label>Email Address *</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email address"
                      isInvalid={!!errors.email}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="phone">
                    <Form.Label>Phone Number *</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="Enter phone number"
                      isInvalid={!!errors.phone}
                      {...register('phone', { required: 'Phone number is required' })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phone?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>

                <div className="col-12">
                  <Form.Group controlId="website">
                    <Form.Label>Website</Form.Label>
                    <Form.Control
                      type="url"
                      placeholder="Enter website URL"
                      {...register('website')}
                    />
                  </Form.Group>
                </div>

                {/* Address */}
                <div className="col-12">
                  <h6 className="text-muted mb-3 mt-2">Address</h6>
                </div>

                <div className="col-12">
                  <Form.Group controlId="street">
                    <Form.Label>Street Address</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter street address"
                      {...register('street')}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="city">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter city"
                      {...register('city')}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="state">
                    <Form.Label>State/Province</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter state/province"
                      {...register('state')}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="postalCode">
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter postal code"
                      {...register('postalCode')}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="country">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter country"
                      {...register('country')}
                    />
                  </Form.Group>
                </div>

                {/* Business Details */}
                <div className="col-12">
                  <h6 className="text-muted mb-3 mt-2">Business Details</h6>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="industry">
                    <Form.Label>Industry</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter industry"
                      {...register('industry')}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="size">
                    <Form.Label>Company Size</Form.Label>
                    <Form.Select {...register('size')}>
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1001+">1001+ employees</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="type">
                    <Form.Label>Company Type</Form.Label>
                    <Form.Select {...register('type')}>
                      <option value="">Select type</option>
                      <option value="Primary">Primary</option>
                      <option value="Client">Client</option>
                      <option value="Subsidiary">Subsidiary</option>
                      <option value="Partner">Partner</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="currency">
                    <Form.Label>Currency</Form.Label>
                    <Form.Select {...register('currency')}>
                      <option value="">Select currency</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="INR">INR - Indian Rupee</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="fiscalYearEnd">
                    <Form.Label>Fiscal Year End</Form.Label>
                    <Form.Control
                      type="date"
                      {...register('fiscalYearEnd')}
                    />
                  </Form.Group>
                </div>

                {/* Tags */}
                <div className="col-12">
                  <h6 className="text-muted mb-3 mt-2">Tags</h6>
                </div>

                <div className="col-12">
                  <Form.Check
                    type="checkbox"
                    id="isPrimaryOrg"
                    label="Set as Primary Organization"
                    {...register('isPrimaryOrg')}
                  />
                  <Form.Check
                    type="checkbox"
                    id="isMyOrg"
                    label="Set as My Organization"
                    {...register('isMyOrg')}
                  />
                </div>

                {/* Primary Contact */}
                <div className="col-12">
                  <h6 className="text-muted mb-3 mt-2">Primary Contact</h6>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="contactName">
                    <Form.Label>Contact Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter contact name"
                      {...register('contactName')}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="contactEmail">
                    <Form.Label>Contact Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter contact email"
                      {...register('contactEmail')}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="contactPhone">
                    <Form.Label>Contact Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="Enter contact phone"
                      {...register('contactPhone')}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="contactRole">
                    <Form.Label>Contact Role</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter contact role"
                      {...register('contactRole')}
                    />
                  </Form.Group>
                </div>

                {/* Notes */}
                <div className="col-12">
                  <Form.Group controlId="notes">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter any additional notes"
                      {...register('notes')}
                    />
                  </Form.Group>
                </div>
              </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="link" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : company ? 'Save Changes' : 'Add Company'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CompanyModal;
