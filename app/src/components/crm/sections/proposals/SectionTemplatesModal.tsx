import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Tab, Tabs, ListGroup, Badge, InputGroup, FormControl } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../contexts/AuthContext';
import * as crmService from '../../../../services/crm';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { SectionTemplate } from '../../../crm/types';

interface SectionTemplatesModalProps {
  show: boolean;
  onHide: () => void;
}

const SectionTemplatesModal: React.FC<SectionTemplatesModalProps> = ({ show, onHide }) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<SectionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  
  // Form state
  const [currentTemplate, setCurrentTemplate] = useState<SectionTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [templateIcon, setTemplateIcon] = useState('bi-file-earmark-text');
  const [validated, setValidated] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show && user?.companyId) {
      loadTemplates();
    }
  }, [show, user?.companyId]);

  const loadTemplates = async () => {
    if (!user?.companyId) return;
    
    setLoading(true);
    try {
      const templates = await crmService.getSectionTemplates(user.companyId);
      setTemplates(templates);
    } catch (error) {
      console.error('Error loading section templates:', error);
      toast.error('Failed to load section templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentTemplate(null);
    setTemplateName('');
    setTemplateDescription('');
    setTemplateContent('<h2>New Section</h2><p>Enter your content here...</p>');
    setTemplateIcon('bi-file-earmark-text');
    setValidated(false);
    setActiveTab('edit');
  };

  const handleEdit = (template: SectionTemplate) => {
    setCurrentTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription(template.description);
    setTemplateContent(template.content);
    setTemplateIcon(template.icon || 'bi-file-earmark-text');
    setValidated(false);
    setActiveTab('edit');
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    if (!user?.companyId) {
      toast.error('Company ID not found');
      return;
    }
    
    try {
      await crmService.deleteSectionTemplate(user.companyId, templateId);
      
      // Remove from local state
      setTemplates(templates.filter(t => t.id !== templateId));
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    if (!user?.companyId) {
      toast.error('Company ID not found');
      return;
    }
    
    setSaving(true);
    
    try {
      const templateData = {
        name: templateName,
        description: templateDescription,
        content: templateContent,
        type: 'section',
        icon: templateIcon,
        isDefault: false
      };
      
      let savedTemplate: SectionTemplate;
      
      if (currentTemplate) {
        // Update existing template
        savedTemplate = await crmService.updateSectionTemplate(
          user.companyId, 
          currentTemplate.id, 
          templateData
        );
        
        // Update in local state
        setTemplates(templates.map(t => t.id === currentTemplate.id ? savedTemplate : t));
        toast.success('Template updated successfully');
      } else {
        // Create new template
        savedTemplate = await crmService.createSectionTemplate(
          user.companyId,
          templateData
        );
        
        // Add to local state
        setTemplates([...templates, savedTemplate]);
        toast.success('Template created successfully');
      }
      
      // Reset form and go back to list
      setActiveTab('list');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Section Templates</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => k && setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="list" title="Templates">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <InputGroup className="w-50">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Button variant="primary" onClick={handleCreateNew}>
                <FaPlus className="me-2" />
                Create New Template
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading templates...</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-file-earmark-text fs-1 text-muted"></i>
                <p className="mt-2 mb-0">No templates found</p>
                <p className="text-muted small">
                  {searchTerm ? 'Try a different search term' : 'Create your first template to get started'}
                </p>
              </div>
            ) : (
              <ListGroup>
                {filteredTemplates.map((template) => (
                  <ListGroup.Item 
                    key={template.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div className="d-flex align-items-center">
                        <i className={`bi ${template.icon} me-2 fs-5`}></i>
                        <h6 className="mb-0">{template.name}</h6>
                      </div>
                      <p className="text-muted small mb-0">{template.description}</p>
                    </div>
                    <div>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleEdit(template)}
                      >
                        <FaEdit className="me-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        <FaTrash className="me-1" />
                        Delete
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Tab>
          <Tab eventKey="edit" title={currentTemplate ? 'Edit Template' : 'New Template'}>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Template Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Introduction, Services Overview, etc."
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a template name.
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Brief description of this template"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a description.
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Icon</Form.Label>
                <Form.Select
                  value={templateIcon}
                  onChange={(e) => setTemplateIcon(e.target.value)}
                >
                  <option value="bi-file-earmark-text">Document</option>
                  <option value="bi-gear">Services</option>
                  <option value="bi-graph-up">Chart</option>
                  <option value="bi-people">Team</option>
                  <option value="bi-calendar">Timeline</option>
                  <option value="bi-chat-quote">Testimonial</option>
                  <option value="bi-currency-euro">Pricing</option>
                  <option value="bi-check-circle">Conclusion</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Content</Form.Label>
                <div className="editor-container border rounded">
                  <CKEditor
                    editor={ClassicEditor}
                    data={templateContent}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setTemplateContent(data);
                    }}
                    config={{
                      toolbar: [
                        'heading',
                        '|',
                        'bold',
                        'italic',
                        'link',
                        'bulletedList',
                        'numberedList',
                        '|',
                        'outdent',
                        'indent',
                        '|',
                        'blockQuote',
                        'insertTable',
                        'mediaEmbed',
                        'undo',
                        'redo'
                      ]
                    }}
                  />
                </div>
                <Form.Text className="text-muted">
                  Use the editor to format your content. You can add headings, lists, tables, and more.
                </Form.Text>
              </Form.Group>
              
              <div className="d-flex justify-content-between mt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => setActiveTab('list')}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
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
                      Save Template
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default SectionTemplatesModal;
