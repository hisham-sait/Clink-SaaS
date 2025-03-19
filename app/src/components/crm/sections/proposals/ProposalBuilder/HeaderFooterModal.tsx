import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col, Nav, Tab } from 'react-bootstrap';

interface HeaderFooterSettings {
  showHeader: boolean;
  showFooter: boolean;
  headerContent: string;
  footerContent: string;
  differentCoverPage: boolean;
  coverHeaderContent: string;
  coverFooterContent: string;
  pageNumbers: boolean;
  pageNumberPosition: 'footer' | 'header';
}

interface HeaderFooterModalProps {
  show: boolean;
  onHide: () => void;
  settings: HeaderFooterSettings;
  onSave: (settings: HeaderFooterSettings) => void;
}

const HeaderFooterModal: React.FC<HeaderFooterModalProps> = ({
  show,
  onHide,
  settings,
  onSave
}) => {
  const [localSettings, setLocalSettings] = useState<HeaderFooterSettings>(settings);
  const [activeTab, setActiveTab] = useState('general');

  const handleChange = (field: keyof HeaderFooterSettings, value: any) => {
    setLocalSettings({
      ...localSettings,
      [field]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Header & Footer Settings</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Tab.Container activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
            <Row>
              <Col sm={3}>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="general">General</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="header">Header</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="footer">Footer</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="cover">Cover Page</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col sm={9}>
                <Tab.Content>
                  <Tab.Pane eventKey="general">
                    <h5 className="mb-3">General Settings</h5>
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="checkbox" 
                        label="Show header" 
                        checked={localSettings.showHeader}
                        onChange={(e) => handleChange('showHeader', e.target.checked)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="checkbox" 
                        label="Show footer" 
                        checked={localSettings.showFooter}
                        onChange={(e) => handleChange('showFooter', e.target.checked)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="checkbox" 
                        label="Show page numbers" 
                        checked={localSettings.pageNumbers}
                        onChange={(e) => handleChange('pageNumbers', e.target.checked)}
                      />
                    </Form.Group>
                    {localSettings.pageNumbers && (
                      <Form.Group className="mb-3">
                        <Form.Label>Page number position</Form.Label>
                        <Form.Select
                          value={localSettings.pageNumberPosition}
                          onChange={(e) => handleChange('pageNumberPosition', e.target.value)}
                        >
                          <option value="footer">Footer</option>
                          <option value="header">Header</option>
                        </Form.Select>
                      </Form.Group>
                    )}
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="checkbox" 
                        label="Use different header/footer for cover page" 
                        checked={localSettings.differentCoverPage}
                        onChange={(e) => handleChange('differentCoverPage', e.target.checked)}
                      />
                    </Form.Group>
                  </Tab.Pane>
                  <Tab.Pane eventKey="header">
                    <h5 className="mb-3">Header Content</h5>
                    <p className="text-muted small mb-3">
                      You can use the following variables: {'{company_name}'}, {'{page_number}'}, {'{total_pages}'}, {'{date}'}, {'{proposal_name}'}
                    </p>
                    <Form.Group className="mb-3">
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Enter header content..."
                        value={localSettings.headerContent}
                        onChange={(e) => handleChange('headerContent', e.target.value)}
                      />
                    </Form.Group>
                    <div className="header-preview p-2 border rounded mb-3">
                      <h6>Preview:</h6>
                      <div className="proposal-header">
                        {localSettings.headerContent ? (
                          <div dangerouslySetInnerHTML={{ __html: localSettings.headerContent }} />
                        ) : (
                          <div className="header-footer-placeholder">No header content</div>
                        )}
                      </div>
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="footer">
                    <h5 className="mb-3">Footer Content</h5>
                    <p className="text-muted small mb-3">
                      You can use the following variables: {'{company_name}'}, {'{page_number}'}, {'{total_pages}'}, {'{date}'}, {'{proposal_name}'}
                    </p>
                    <Form.Group className="mb-3">
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Enter footer content..."
                        value={localSettings.footerContent}
                        onChange={(e) => handleChange('footerContent', e.target.value)}
                      />
                    </Form.Group>
                    <div className="footer-preview p-2 border rounded mb-3">
                      <h6>Preview:</h6>
                      <div className="proposal-footer">
                        {localSettings.footerContent ? (
                          <div dangerouslySetInnerHTML={{ __html: localSettings.footerContent }} />
                        ) : (
                          <div className="header-footer-placeholder">No footer content</div>
                        )}
                      </div>
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="cover">
                    <h5 className="mb-3">Cover Page Settings</h5>
                    {!localSettings.differentCoverPage ? (
                      <div className="alert alert-info">
                        Enable "Use different header/footer for cover page" in General settings to customize cover page header and footer.
                      </div>
                    ) : (
                      <>
                        <h6>Cover Page Header</h6>
                        <Form.Group className="mb-3">
                          <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Enter cover page header content..."
                            value={localSettings.coverHeaderContent}
                            onChange={(e) => handleChange('coverHeaderContent', e.target.value)}
                            disabled={!localSettings.differentCoverPage}
                          />
                        </Form.Group>
                        <div className="header-preview p-2 border rounded mb-3">
                          <h6>Preview:</h6>
                          <div className="proposal-header">
                            {localSettings.coverHeaderContent ? (
                              <div dangerouslySetInnerHTML={{ __html: localSettings.coverHeaderContent }} />
                            ) : (
                              <div className="header-footer-placeholder">No cover header content</div>
                            )}
                          </div>
                        </div>
                        
                        <h6>Cover Page Footer</h6>
                        <Form.Group className="mb-3">
                          <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Enter cover page footer content..."
                            value={localSettings.coverFooterContent}
                            onChange={(e) => handleChange('coverFooterContent', e.target.value)}
                            disabled={!localSettings.differentCoverPage}
                          />
                        </Form.Group>
                        <div className="footer-preview p-2 border rounded mb-3">
                          <h6>Preview:</h6>
                          <div className="proposal-footer">
                            {localSettings.coverFooterContent ? (
                              <div dangerouslySetInnerHTML={{ __html: localSettings.coverFooterContent }} />
                            ) : (
                              <div className="header-footer-placeholder">No cover footer content</div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default HeaderFooterModal;
