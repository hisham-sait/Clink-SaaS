import React, { useState, useEffect } from 'react';
import 'bootstrap';

// Initialize Bootstrap Tab type
declare const bootstrap: {
  Tab: new (element: Element) => {
    show(): void;
  };
};
import { Container, Row, Col, Button, Card, Navbar, Nav, ButtonGroup, Dropdown, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave, FaEye, FaCog, FaFileExport, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import '../proposals.css';
import ProposalSection from './ProposalSection';
import ProposalBuilderSidebar from './ProposalBuilderSidebar';
import UnifiedProposalModal from '../ProposalModal';
import SaveTemplateModal from './SaveTemplateModal';
import PageBreakSection from './PageBreakSection';
import HeaderFooterModal from './HeaderFooterModal';
import SectionEditorModal from './SectionEditorModal';
import { sectionTemplates, ProposalSection as ProposalSectionType } from './demoData';
import { useAuth } from '../../../../../contexts/AuthContext';
import * as crmService from '../../../../../services/crm';
import { Proposal } from '../../../types';

// Default empty proposal
const emptyProposal: Proposal = {
  id: '',
  name: 'New Proposal',
  content: { sections: [] },
  status: 'Active',
  products: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

const ProposalBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [proposal, setProposal] = useState<Proposal>(emptyProposal);
  const [sections, setSections] = useState<ProposalSectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showHeaderFooterModal, setShowHeaderFooterModal] = useState(false);
  const [showSectionEditorModal, setShowSectionEditorModal] = useState(false);
  const [currentEditingSection, setCurrentEditingSection] = useState<ProposalSectionType | null>(null);
  const [headerFooterSettings, setHeaderFooterSettings] = useState({
    showHeader: false,
    showFooter: false,
    headerContent: '<div class="d-flex justify-content-between align-items-center"><div>{company_name}</div><div>{proposal_name}</div></div>',
    footerContent: '<div class="d-flex justify-content-between align-items-center"><div>Confidential</div><div>Page {page_number} of {total_pages}</div></div>',
    differentCoverPage: true,
    coverHeaderContent: '',
    coverFooterContent: '',
    pageNumbers: true,
    pageNumberPosition: 'footer' as 'footer' | 'header'
  });

  useEffect(() => {
    const loadProposal = async () => {
      if (!id || !user?.companyId) {
        setLoading(false);
        return;
      }

      try {
        const loadedProposal = await crmService.getProposal(user.companyId, id);
        setProposal(loadedProposal);
        
        // Make the proposal available to the window object for scripts
        (window as any).currentProposal = loadedProposal;
        
        // Extract sections from the proposal content
        if (loadedProposal.content && loadedProposal.content.sections) {
          setSections(loadedProposal.content.sections);
        }
        
        // Extract header/footer settings if they exist
        if (loadedProposal.content && loadedProposal.content.headerFooter) {
          setHeaderFooterSettings(loadedProposal.content.headerFooter);
        }
      } catch (error: any) { // Type assertion for error
        console.error('Error loading proposal:', error);
        toast.error(`Failed to load proposal: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadProposal();
    
    // Cleanup function to remove the proposal from the window object
    return () => {
      delete (window as any).currentProposal;
    };
  }, [id, user?.companyId]);

  const handleAddSection = (templateId: string) => {
    const template = sectionTemplates.find(t => t.id === templateId);
    if (!template) return;

    const newSection: ProposalSectionType = {
      id: `section-${Date.now()}`,
      title: template.title,
      type: template.type,
      content: template.content,
      isAIGenerated: false,
      order: sections.length + 1
    };

    setSections([...sections, newSection]);
    toast.success(`Added ${template.title} section`);
  };

  const handleGenerateAISection = (prompt: string) => {
    // In a real implementation, this would call an AI service
    // For now, we'll simulate AI generation with a template
    const aiTemplate = sectionTemplates.find(t => t.id === 'template-ai');
    if (!aiTemplate) return;

    const newSection: ProposalSectionType = {
      id: `section-${Date.now()}`,
      title: 'AI Generated Section',
      type: 'ai-generated',
      content: `
        <h2>AI Generated Content</h2>
        <p>This content was generated based on your prompt:</p>
        <blockquote class="blockquote">
          <p class="mb-0">${prompt}</p>
        </blockquote>
        <p>In a real implementation, this would be generated by an AI service based on your prompt and the context of your proposal.</p>
      `,
      isAIGenerated: true,
      aiPrompt: prompt,
      order: sections.length + 1
    };

    setSections([...sections, newSection]);
    toast.success('AI section generated successfully');
  };

  const handleEditSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setCurrentEditingSection(section);
      setShowSectionEditorModal(true);
    }
  };
  
  const handleUpdateSection = (sectionId: string, title: string, content: string) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          title,
          content
        };
      }
      return section;
    });
    
    setSections(updatedSections);
    toast.success('Section updated successfully');
  };

  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = sections.filter(s => s.id !== sectionId);
    setSections(updatedSections);
    toast.success('Section removed');
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    if (direction === 'up' && sectionIndex === 0) return;
    if (direction === 'down' && sectionIndex === sections.length - 1) return;

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
    
    // Swap sections
    [newSections[sectionIndex], newSections[targetIndex]] = 
    [newSections[targetIndex], newSections[sectionIndex]];
    
    // Update order
    newSections.forEach((section, index) => {
      section.order = index + 1;
    });
    
    setSections(newSections);
  };

  const handleSaveProposal = async () => {
    if (!user?.companyId) {
      toast.error('Company ID not found');
      return;
    }

    setSaving(true);
    
    try {
      // Update the proposal with the latest sections and header/footer settings
      // Make sure to include all required fields and handle the products correctly
      
      // First, log the current products to see what we're working with
      console.log('Current products before processing:', JSON.stringify(proposal.products, null, 2));
      
      // Process products to ensure all required fields are present
      const processedProducts = proposal.products.map(product => {
        // Get the tier object from the product if available
        const productObj = product.product;
        const tierObj = productObj?.tiers?.find(t => t.type === product.planType);
        
        // Log each product's processing
        console.log(`Processing product ${product.productId}:`, {
          planType: product.planType,
          currentTierId: product.tierId,
          foundTierObj: tierObj ? `id: ${tierObj.id}, type: ${tierObj.type}` : 'none',
        });
        
        // Create a clean product object with only the necessary fields
        return {
          id: product.id,
          proposalId: product.proposalId,
          productId: product.productId,
          planType: product.planType,
          // Ensure tierId is set
          tierId: product.tierId || (tierObj?.id) || product.planType || 'STANDARD',
          // Ensure other required fields have defaults
          quantity: product.quantity || 1,
          price: product.price || 0,
          features: product.features || [],
        };
      });
      
      // Create a clean proposal object with only the necessary fields
      const updatedProposal = {
        id: proposal.id,
        name: proposal.name,
        template: proposal.template,
        content: {
          ...proposal.content,
          sections,
          headerFooter: headerFooterSettings
        },
        variables: proposal.variables,
        status: proposal.status,
        validUntil: proposal.validUntil,
        dealId: proposal.dealId,
        contactId: proposal.contactId,
        companyId: proposal.companyId,
        products: processedProducts
      };
      
      // Log the final proposal data being sent
      console.log('Sending proposal data:', JSON.stringify(updatedProposal, null, 2));
      
      let savedProposal;
      
      if (proposal.id) {
        // Update existing proposal
        savedProposal = await crmService.updateProposal(user.companyId, proposal.id, updatedProposal);
      } else {
        // Create new proposal
        savedProposal = await crmService.createProposal(user.companyId, updatedProposal);
      }
      
      setProposal(savedProposal);
      toast.success('Proposal saved successfully');
    } catch (error: any) { // Type assertion for error
      console.error('Error saving proposal:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to save proposal: ${error.response?.data?.error || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewProposal = () => {
    setShowPreviewModal(true);
  };
  
  const handleExportProposal = async () => {
    if (!proposal.id || !user?.companyId) {
      toast.error('Cannot export unsaved proposal');
      return;
    }

    setExporting(true);
    
    try {
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
    } catch (error: any) { // Type assertion for error
      console.error('Error exporting proposal:', error);
      toast.error(`Failed to export proposal: ${error.message || 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };
  
  const handleSendProposal = () => {
    toast.success('Send functionality will be implemented in the future');
  };
  
  const handleSaveAsTemplate = () => {
    setShowSaveTemplateModal(true);
  };
  
  const handleHeaderFooterSettings = () => {
    setShowHeaderFooterModal(true);
  };
  
  const handleUpdateProperties = (updatedProposal: Proposal) => {
    setProposal(updatedProposal);
    
    // Make the updated proposal available to the window object for scripts
    (window as any).currentProposal = updatedProposal;
    
    // Dispatch an event to notify that the proposal has been updated
    document.dispatchEvent(new CustomEvent('proposalUpdated'));
    
    toast.success('Proposal properties updated successfully');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading proposal builder...</p>
      </div>
    );
  }

  return (
    <div className="proposal-builder">
      {/* Header */}
      <Navbar bg="white" className="border-bottom mb-4 py-2">
        <Container fluid>
          <Button 
            variant="light" 
            className="me-3 border" 
            onClick={() => navigate('/crm/proposals')}
          >
            <FaArrowLeft className="me-1" />
            Back
          </Button>
          <Navbar.Brand>
            <h4 className="mb-0">{proposal.name}</h4>
          </Navbar.Brand>
          <Nav className="ms-auto">
            <ButtonGroup className="me-2">
              <Button 
                variant="outline-primary"
                onClick={() => setShowPropertiesModal(true)}
              >
                <FaCog className="me-2" />
                Properties
              </Button>
              
            <Button 
              variant="outline-primary"
              onClick={handlePreviewProposal}
            >
              <FaEye className="me-2" />
              Preview
            </Button>
            
            <Button 
              variant="outline-primary"
              onClick={handleHeaderFooterSettings}
            >
              <i className="bi bi-layout-text-window me-2"></i>
              Header & Footer
            </Button>
            </ButtonGroup>
            
            <ButtonGroup className="me-2">
              <Dropdown as={ButtonGroup}>
                <Button 
                  variant="outline-success"
                  onClick={handleExportProposal}
                  disabled={exporting || !proposal.id}
                >
                  {exporting ? (
                    <>
                      <FaSpinner className="me-2 fa-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FaFileExport className="me-2" />
                      Export PDF
                    </>
                  )}
                </Button>
                <Dropdown.Toggle split variant="outline-success" disabled={exporting || !proposal.id} />
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleExportProposal}>Export as PDF</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              
              <Button 
                variant="outline-info"
                onClick={handleSendProposal}
                disabled={!proposal.id}
              >
                <FaPaperPlane className="me-2" />
                Send
              </Button>
            </ButtonGroup>
            
            <Button 
              variant="primary"
              onClick={handleSaveProposal}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Save
                </>
              )}
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Container fluid>
        <Row>
          {/* Main Content Area */}
          <Col md={8} lg={9} className="proposal-content-area">
            {/* Header */}
            {headerFooterSettings.showHeader && (
              <div className="proposal-header mb-4">
                {headerFooterSettings.headerContent ? (
                  <div dangerouslySetInnerHTML={{ __html: headerFooterSettings.headerContent }} />
                ) : (
                  <div className="header-footer-placeholder">Header content will appear here</div>
                )}
              </div>
            )}
            
            {/* Proposal Metadata - Slim Version */}
            <div className="proposal-info-slim d-flex align-items-center p-2 bg-light rounded mb-3">
              <div className="d-flex flex-grow-1 flex-wrap">
                <div className="me-3 mb-0">
                  <small className="text-muted me-1">Client:</small>
                  <span className="fw-medium">{proposal.contact?.firstName} {proposal.contact?.lastName}</span>
                </div>
                <div className="me-3 mb-0">
                  <small className="text-muted me-1">Valid Until:</small>
                  <span>{proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="me-3 mb-0">
                  <small className="text-muted me-1">Deal:</small>
                  <span>{proposal.deal?.name || 'N/A'}</span>
                </div>
                {proposal.deal?.amount && (
                  <div className="mb-0">
                    <small className="text-muted me-1">Amount:</small>
                    <span className="text-success fw-medium">${proposal.deal.amount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 text-muted" 
                onClick={() => setShowPropertiesModal(true)}
                title="Edit Information"
              >
                <i className="bi bi-pencil-square"></i>
              </Button>
            </div>
            
            {/* Proposal Content */}
            <Card className="mb-4">
              <Card.Body>
                <div className="proposal-document">
                  {sections.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-file-earmark-text fs-1 text-muted"></i>
                      <p className="mt-3 mb-0">No sections added yet</p>
                      <p className="text-muted">Add sections from the templates panel on the right</p>
                    </div>
                  ) : (
                    sections.map(section => {
                      if (section.type === 'page-break') {
                        return (
                          <PageBreakSection
                            key={section.id}
                            id={section.id}
                            onDelete={handleDeleteSection}
                            onMoveUp={(id) => handleMoveSection(id, 'up')}
                            onMoveDown={(id) => handleMoveSection(id, 'down')}
                          />
                        );
                      }
                      
                      return (
                        <ProposalSection
                          key={section.id}
                          section={section}
                          onEdit={handleEditSection}
                          onDelete={handleDeleteSection}
                          onMoveUp={(id) => handleMoveSection(id, 'up')}
                          onMoveDown={(id) => handleMoveSection(id, 'down')}
                          proposalProducts={proposal.products} // Pass proposal products
                        />
                      );
                    })
                  )}
                </div>
              </Card.Body>
            </Card>
            
            {/* Footer */}
            {headerFooterSettings.showFooter && (
              <div className="proposal-footer mt-4">
                {headerFooterSettings.footerContent ? (
                  <div dangerouslySetInnerHTML={{ __html: headerFooterSettings.footerContent }} />
                ) : (
                  <div className="header-footer-placeholder">Footer content will appear here</div>
                )}
              </div>
            )}
          </Col>

          {/* Sidebar */}
          <Col md={4} lg={3} className="proposal-sidebar">
            <ProposalBuilderSidebar
              templates={[]} // Removed standard predefined templates
              onAddSection={handleAddSection}
              onGenerateAISection={handleGenerateAISection}
              onAddCustomSection={(section) => {
                const newSection: ProposalSectionType = {
                  id: `section-${Date.now()}`,
                  title: section.title,
                  type: 'custom',
                  content: section.content,
                  isAIGenerated: false,
                  order: sections.length + 1
                };
                
                setSections([...sections, newSection]);
                toast.success(`Added custom section: ${section.title}`);
              }}
            />
          </Col>
        </Row>
      </Container>
      
      {/* Properties Modal */}
      <UnifiedProposalModal
        show={showPropertiesModal}
        onHide={() => setShowPropertiesModal(false)}
        proposal={proposal}
        onSave={handleUpdateProperties}
        isBuilder={true}
        onSaveAsTemplate={() => setShowSaveTemplateModal(true)}
        initialActiveStep={2}
      />
      
      {/* Save as Template Modal */}
      <SaveTemplateModal
        show={showSaveTemplateModal}
        onHide={() => setShowSaveTemplateModal(false)}
        proposal={proposal}
        onSave={async (templateName, templateDescription) => {
          if (!user?.companyId) {
            toast.error('Company ID not found');
            return;
          }
          
          try {
            // In a real implementation, this would save the template to the API
            // For now, we'll just simulate a delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Create a template from the current proposal
            const template = {
              name: templateName,
              description: templateDescription,
              content: {
                sections,
                headerFooter: headerFooterSettings
              },
              isDefault: false
            };
            
            // In a real implementation, we would call the API
            // For example:
            // await crmService.createProposalTemplate(user.companyId, template);
            
            toast.success(`Saved "${templateName}" as a template`);
            setShowSaveTemplateModal(false);
          } catch (error: any) { // Type assertion for error
            console.error('Error saving template:', error);
            toast.error(`Failed to save template: ${error.message || 'Unknown error'}`);
          }
        }}
      />
      
      {/* Header & Footer Modal */}
      <HeaderFooterModal
        show={showHeaderFooterModal}
        onHide={() => setShowHeaderFooterModal(false)}
        settings={headerFooterSettings}
        onSave={(settings) => {
          setHeaderFooterSettings(settings);
          toast.success('Header & footer settings updated');
        }}
      />
      
      {/* Section Editor Modal */}
      {currentEditingSection && (
        <SectionEditorModal
          show={showSectionEditorModal}
          onHide={() => setShowSectionEditorModal(false)}
          section={currentEditingSection}
          onSave={handleUpdateSection}
        />
      )}
      
      {/* Preview Modal */}
      <Modal 
        show={showPreviewModal} 
        onHide={() => setShowPreviewModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Proposal Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="proposal-preview">
            {/* Header */}
            {headerFooterSettings.showHeader && (
              <div className="proposal-header p-3">
                <div dangerouslySetInnerHTML={{ __html: headerFooterSettings.headerContent }} />
              </div>
            )}
            
            {/* Content */}
            <div className="proposal-content p-4">
              {sections.map((section, index) => (
                <div key={index} className="mb-4">
                  {section.type !== 'page-break' && (
                    <div dangerouslySetInnerHTML={{ __html: section.content }} />
                  )}
                  {section.type === 'page-break' && (
                    <hr className="page-break-preview" />
                  )}
                </div>
              ))}
            </div>
            
            {/* Footer */}
            {headerFooterSettings.showFooter && (
              <div className="proposal-footer p-3">
                <div dangerouslySetInnerHTML={{ __html: headerFooterSettings.footerContent }} />
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={handleExportProposal}
            disabled={exporting || !proposal.id}
          >
            {exporting ? 'Exporting...' : 'Export as PDF'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProposalBuilder;
