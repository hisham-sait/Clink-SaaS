import React, { useState } from 'react';
import { Modal, Button, Row, Col, Card, Form, ListGroup, Tabs, Tab, Accordion, Table } from 'react-bootstrap';
import { 
  FaSave, FaPlus, FaFont, FaCheck, FaList, FaCalendarAlt, FaImage, 
  FaGripLines, FaTrash, FaArrowUp, FaArrowDown, FaCog, FaEye, FaCode,
  FaRegStar, FaThumbsUp, FaSlidersH
} from 'react-icons/fa';

interface SurveyQuestion {
  id: string;
  type: string;
  question: string;
  description?: string;
  required: boolean;
  options?: string[];
  scale?: {
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
}

interface SurveySection {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
}

interface SurveyDesignerModalProps {
  show: boolean;
  onHide: () => void;
  surveyId: string | null;
  surveyTitle: string;
}

const SurveyDesignerModal: React.FC<SurveyDesignerModalProps> = ({
  show,
  onHide,
  surveyId,
  surveyTitle
}) => {
  const [activeTab, setActiveTab] = useState('questions');
  const [sections, setSections] = useState<SurveySection[]>([
    {
      id: 'section-1',
      title: 'Default Section',
      description: 'This is the default section of your survey.',
      questions: []
    }
  ]);
  const [selectedSection, setSelectedSection] = useState<SurveySection>(sections[0]);
  const [selectedQuestion, setSelectedQuestion] = useState<SurveyQuestion | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [surveySettings, setSurveySettings] = useState({
    showProgressBar: true,
    allowAnonymousResponses: true,
    requireAllQuestions: false,
    allowMultipleResponses: false,
    showThankYouPage: true,
    thankYouMessage: 'Thank you for completing the survey!'
  });

  // Question types that can be added to the survey
  const questionTypes = [
    { type: 'text', label: 'Short Text', icon: <FaFont /> },
    { type: 'textarea', label: 'Long Text', icon: <FaGripLines /> },
    { type: 'checkbox', label: 'Multiple Choice', icon: <FaCheck /> },
    { type: 'radio', label: 'Single Choice', icon: <FaList /> },
    { type: 'select', label: 'Dropdown', icon: <FaList /> },
    { type: 'scale', label: 'Rating Scale', icon: <FaRegStar /> },
    { type: 'likert', label: 'Likert Scale', icon: <FaThumbsUp /> },
    { type: 'date', label: 'Date', icon: <FaCalendarAlt /> },
    { type: 'file', label: 'File Upload', icon: <FaImage /> },
  ];

  const handleAddQuestion = (type: string) => {
    if (!selectedSection) return;

    const newQuestion: SurveyQuestion = {
      id: `question-${Date.now()}`,
      type,
      question: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Question`,
      required: false,
      options: type === 'radio' || type === 'select' || type === 'checkbox' || type === 'likert' ? 
        ['Option 1', 'Option 2', 'Option 3'] : undefined,
      scale: type === 'scale' ? { min: 1, max: 5, minLabel: 'Poor', maxLabel: 'Excellent' } : undefined
    };

    const updatedSection = {
      ...selectedSection,
      questions: [...selectedSection.questions, newQuestion]
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
    setSelectedQuestion(newQuestion);
    setActiveTab('properties');
  };

  const handleAddSection = () => {
    const newSection: SurveySection = {
      id: `section-${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      description: '',
      questions: []
    };

    setSections([...sections, newSection]);
    setSelectedSection(newSection);
    setSelectedQuestion(null);
  };

  const handleQuestionSelect = (question: SurveyQuestion) => {
    setSelectedQuestion(question);
    setActiveTab('properties');
  };

  const handleSectionSelect = (section: SurveySection) => {
    setSelectedSection(section);
    setSelectedQuestion(null);
  };

  const handleQuestionUpdate = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!selectedQuestion) return;

    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    const updatedQuestion = {
      ...selectedQuestion,
      [name]: type === 'checkbox' ? checked : value
    };

    setSelectedQuestion(updatedQuestion);
    
    const updatedSection = {
      ...selectedSection,
      questions: selectedSection.questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
  };

  const handleSectionUpdate = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedSection) return;

    const { name, value } = e.target;
    
    const updatedSection = {
      ...selectedSection,
      [name]: value
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!selectedQuestion || !selectedQuestion.options) return;

    const newOptions = [...selectedQuestion.options];
    newOptions[index] = value;

    const updatedQuestion = {
      ...selectedQuestion,
      options: newOptions
    };

    setSelectedQuestion(updatedQuestion);
    
    const updatedSection = {
      ...selectedSection,
      questions: selectedSection.questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
  };

  const handleAddOption = () => {
    if (!selectedQuestion || !selectedQuestion.options) return;

    const updatedQuestion = {
      ...selectedQuestion,
      options: [...selectedQuestion.options, `Option ${selectedQuestion.options.length + 1}`]
    };

    setSelectedQuestion(updatedQuestion);
    
    const updatedSection = {
      ...selectedSection,
      questions: selectedSection.questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
  };

  const handleRemoveOption = (index: number) => {
    if (!selectedQuestion || !selectedQuestion.options) return;

    const newOptions = [...selectedQuestion.options];
    newOptions.splice(index, 1);

    const updatedQuestion = {
      ...selectedQuestion,
      options: newOptions
    };

    setSelectedQuestion(updatedQuestion);
    
    const updatedSection = {
      ...selectedSection,
      questions: selectedSection.questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
  };

  const handleScaleChange = (field: string, value: string) => {
    if (!selectedQuestion || !selectedQuestion.scale) return;

    const updatedScale = {
      ...selectedQuestion.scale,
      [field]: field === 'min' || field === 'max' ? parseInt(value) : value
    };

    const updatedQuestion = {
      ...selectedQuestion,
      scale: updatedScale
    };

    setSelectedQuestion(updatedQuestion);
    
    const updatedSection = {
      ...selectedSection,
      questions: selectedSection.questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
  };

  const handleDeleteQuestion = () => {
    if (!selectedQuestion) return;

    const updatedSection = {
      ...selectedSection,
      questions: selectedSection.questions.filter(q => q.id !== selectedQuestion.id)
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
    setSelectedQuestion(null);
  };

  const handleDeleteSection = () => {
    if (sections.length <= 1) return; // Don't delete the last section

    const sectionIndex = sections.findIndex(s => s.id === selectedSection.id);
    const newSections = sections.filter(s => s.id !== selectedSection.id);
    
    setSections(newSections);
    setSelectedSection(newSections[Math.min(sectionIndex, newSections.length - 1)]);
    setSelectedQuestion(null);
  };

  const handleMoveQuestion = (direction: 'up' | 'down') => {
    if (!selectedQuestion) return;

    const currentIndex = selectedSection.questions.findIndex(q => q.id === selectedQuestion.id);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === selectedSection.questions.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newQuestions = [...selectedSection.questions];
    const [removed] = newQuestions.splice(currentIndex, 1);
    newQuestions.splice(newIndex, 0, removed);

    const updatedSection = {
      ...selectedSection,
      questions: newQuestions
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
  };

  const handleMoveSection = (direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === selectedSection.id);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === sections.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newSections = [...sections];
    const [removed] = newSections.splice(currentIndex, 1);
    newSections.splice(newIndex, 0, removed);

    setSections(newSections);
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setSurveySettings({
      ...surveySettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSaveSurvey = () => {
    // In a real app, this would save the survey design to the backend
    console.log('Saving survey design:', { 
      surveyId, 
      surveyTitle, 
      sections,
      settings: surveySettings 
    });
    onHide();
  };

  const renderQuestionPreview = (question: SurveyQuestion) => {
    switch (question.type) {
      case 'text':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            <Form.Control type="text" placeholder="Your answer" />
          </Form.Group>
        );
      case 'textarea':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            <Form.Control as="textarea" rows={3} placeholder="Your answer" />
          </Form.Group>
        );
      case 'checkbox':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            {question.options?.map((option, index) => (
              <Form.Check 
                key={index}
                type="checkbox"
                id={`${question.id}-option-${index}`}
                label={option}
              />
            ))}
          </Form.Group>
        );
      case 'radio':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            {question.options?.map((option, index) => (
              <Form.Check 
                key={index}
                type="radio"
                name={question.id}
                id={`${question.id}-option-${index}`}
                label={option}
              />
            ))}
          </Form.Group>
        );
      case 'select':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            <Form.Select>
              <option value="">Select an option</option>
              {question.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </Form.Select>
          </Form.Group>
        );
      case 'scale':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted">{question.scale?.minLabel || question.scale?.min}</span>
              <span className="text-muted">{question.scale?.maxLabel || question.scale?.max}</span>
            </div>
            <div className="d-flex justify-content-between">
              {Array.from({ length: (question.scale?.max || 5) - (question.scale?.min || 1) + 1 }).map((_, i) => (
                <div key={i} className="text-center" style={{ width: '40px' }}>
                  <Form.Check
                    type="radio"
                    name={question.id}
                    id={`${question.id}-scale-${i}`}
                    className="position-relative mx-auto"
                    style={{ height: '20px' }}
                  />
                  <div className="mt-1">{(question.scale?.min || 1) + i}</div>
                </div>
              ))}
            </div>
          </Form.Group>
        );
      case 'likert':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            <Table bordered hover size="sm" className="mt-2">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}></th>
                  {question.options?.map((option, i) => (
                    <th key={i} className="text-center">{option}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Your response</td>
                  {question.options?.map((_, i) => (
                    <td key={i} className="text-center">
                      <Form.Check
                        type="radio"
                        name={question.id}
                        id={`${question.id}-likert-${i}`}
                        className="d-inline-block"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </Table>
          </Form.Group>
        );
      case 'date':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            <Form.Control type="date" />
          </Form.Group>
        );
      case 'file':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            <Form.Control type="file" />
          </Form.Group>
        );
      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="survey-designer-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          Survey Designer: {surveyTitle}
          <div className="ms-3 d-inline-block">
            <Button 
              variant={previewMode ? "outline-primary" : "outline-secondary"} 
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="me-2"
            >
              <FaEye className="me-1" /> Preview
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveSurvey}>
              <FaSave className="me-1" /> Save Survey
            </Button>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {previewMode ? (
          <Card className="p-4">
            <h3>{surveyTitle}</h3>
            <Form>
              {sections.map((section) => (
                <div key={section.id} className="mb-4">
                  <h4>{section.title}</h4>
                  {section.description && <p className="text-muted">{section.description}</p>}
                  <hr />
                  {section.questions.map(question => (
                    <div key={question.id}>
                      {renderQuestionPreview(question)}
                    </div>
                  ))}
                </div>
              ))}
              <div className="mt-4">
                <Button variant="primary">Submit</Button>
              </div>
            </Form>
          </Card>
        ) : (
          <Row>
            <Col md={3}>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => k && setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="questions" title={<span><FaPlus className="me-1" /> Questions</span>}>
                  <Card className="border-0">
                    <Card.Body className="p-0">
                      <ListGroup variant="flush">
                        {questionTypes.map((questionType) => (
                          <ListGroup.Item 
                            key={questionType.type}
                            action
                            onClick={() => handleAddQuestion(questionType.type)}
                            className="d-flex align-items-center"
                          >
                            <div className="me-2">{questionType.icon}</div>
                            {questionType.label}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Tab>
                <Tab eventKey="properties" title={<span><FaCog className="me-1" /> Properties</span>}>
                  {selectedQuestion ? (
                    <Card className="border-0">
                      <Card.Body>
                        <Form>
                          <Form.Group className="mb-3">
                            <Form.Label>Question</Form.Label>
                            <Form.Control 
                              type="text" 
                              name="question"
                              value={selectedQuestion.question}
                              onChange={handleQuestionUpdate}
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control 
                              as="textarea"
                              rows={2}
                              name="description"
                              value={selectedQuestion.description || ''}
                              onChange={handleQuestionUpdate}
                              placeholder="Optional description or instructions"
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Check 
                              type="checkbox"
                              id="question-required"
                              label="Required question"
                              name="required"
                              checked={selectedQuestion.required}
                              onChange={handleQuestionUpdate}
                            />
                          </Form.Group>
                          
                          {(selectedQuestion.type === 'radio' || selectedQuestion.type === 'select' || selectedQuestion.type === 'checkbox' || selectedQuestion.type === 'likert') && (
                            <Accordion defaultActiveKey="0" className="mb-3">
                              <Accordion.Item eventKey="0">
                                <Accordion.Header>Options</Accordion.Header>
                                <Accordion.Body>
                                  {selectedQuestion.options?.map((option, index) => (
                                    <div key={index} className="d-flex mb-2">
                                      <Form.Control 
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        className="me-2"
                                      />
                                      <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => handleRemoveOption(index)}
                                        disabled={selectedQuestion.options?.length === 1}
                                      >
                                        <FaTrash />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    onClick={handleAddOption}
                                    className="mt-2"
                                  >
                                    <FaPlus className="me-1" /> Add Option
                                  </Button>
                                </Accordion.Body>
                              </Accordion.Item>
                            </Accordion>
                          )}
                          
                          {selectedQuestion.type === 'scale' && (
                            <Accordion defaultActiveKey="0" className="mb-3">
                              <Accordion.Item eventKey="0">
                                <Accordion.Header>Scale Settings</Accordion.Header>
                                <Accordion.Body>
                                  <Row className="mb-3">
                                    <Col>
                                      <Form.Group>
                                        <Form.Label>Min Value</Form.Label>
                                        <Form.Control 
                                          type="number"
                                          value={selectedQuestion.scale?.min}
                                          onChange={(e) => handleScaleChange('min', e.target.value)}
                                        />
                                      </Form.Group>
                                    </Col>
                                    <Col>
                                      <Form.Group>
                                        <Form.Label>Max Value</Form.Label>
                                        <Form.Control 
                                          type="number"
                                          value={selectedQuestion.scale?.max}
                                          onChange={(e) => handleScaleChange('max', e.target.value)}
                                        />
                                      </Form.Group>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Col>
                                      <Form.Group>
                                        <Form.Label>Min Label</Form.Label>
                                        <Form.Control 
                                          type="text"
                                          value={selectedQuestion.scale?.minLabel || ''}
                                          onChange={(e) => handleScaleChange('minLabel', e.target.value)}
                                          placeholder="e.g., Poor"
                                        />
                                      </Form.Group>
                                    </Col>
                                    <Col>
                                      <Form.Group>
                                        <Form.Label>Max Label</Form.Label>
                                        <Form.Control 
                                          type="text"
                                          value={selectedQuestion.scale?.maxLabel || ''}
                                          onChange={(e) => handleScaleChange('maxLabel', e.target.value)}
                                          placeholder="e.g., Excellent"
                                        />
                                      </Form.Group>
                                    </Col>
                                  </Row>
                                </Accordion.Body>
                              </Accordion.Item>
                            </Accordion>
                          )}
                          
                          <div className="d-flex justify-content-between mt-4">
                            <div>
                              <Button 
                                variant="outline-danger" 
                                onClick={handleDeleteQuestion}
                              >
                                <FaTrash className="me-1" /> Delete
                              </Button>
                            </div>
                            <div>
                              <Button 
                                variant="outline-secondary" 
                                className="me-2"
                                onClick={() => handleMoveQuestion('up')}
                                disabled={selectedSection.questions.indexOf(selectedQuestion) === 0}
                              >
                                <FaArrowUp />
                              </Button>
                              <Button 
                                variant="outline-secondary"
                                onClick={() => handleMoveQuestion('down')}
                                disabled={selectedSection.questions.indexOf(selectedQuestion) === selectedSection.questions.length - 1}
                              >
                                <FaArrowDown />
                              </Button>
                            </div>
                          </div>
                        </Form>
                      </Card.Body>
                    </Card>
                  ) : selectedSection ? (
                    <Card className="border-0">
                      <Card.Body>
                        <Form>
                          <Form.Group className="mb-3">
                            <Form.Label>Section Title</Form.Label>
                            <Form.Control 
                              type="text" 
                              name="title"
                              value={selectedSection.title}
                              onChange={handleSectionUpdate}
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Section Description</Form.Label>
                            <Form.Control 
                              as="textarea"
                              rows={3}
                              name="description"
                              value={selectedSection.description || ''}
                              onChange={handleSectionUpdate}
                              placeholder="Optional section description"
                            />
                          </Form.Group>
                          
                          <div className="d-flex justify-content-between mt-4">
                            <div>
                              <Button 
                                variant="outline-danger" 
                                onClick={handleDeleteSection}
                                disabled={sections.length <= 1}
                              >
                                <FaTrash className="me-1" /> Delete Section
                              </Button>
                            </div>
                            <div>
                              <Button 
                                variant="outline-secondary" 
                                className="me-2"
                                onClick={() => handleMoveSection('up')}
                                disabled={sections.indexOf(selectedSection) === 0}
                              >
                                <FaArrowUp />
                              </Button>
                              <Button 
                                variant="outline-secondary"
                                onClick={() => handleMoveSection('down')}
                                disabled={sections.indexOf(selectedSection) === sections.length - 1}
                              >
                                <FaArrowDown />
                              </Button>
                            </div>
                          </div>
                        </Form>
                      </Card.Body>
                    </Card>
                  ) : (
                    <div className="text-center p-4 text-muted">
                      <p>Select a question or section to edit its properties</p>
                    </div>
                  )}
                </Tab>
                <Tab eventKey="settings" title={<span><FaSlidersH className="me-1" /> Settings</span>}>
                  <Card className="border-0">
                    <Card.Body>
                      <Form>
                        <Form.Group className="mb-3">
                        <Form.Check 
                            type="checkbox"
                            id="requireAllQuestions"
                            label="Require all questions by default"
                            name="requireAllQuestions"
                            checked={surveySettings.requireAllQuestions}
                            onChange={handleSettingsChange}
                          />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="checkbox"
                            id="allowMultipleResponses"
                            label="Allow multiple responses from same user"
                            name="allowMultipleResponses"
                            checked={surveySettings.allowMultipleResponses}
                            onChange={handleSettingsChange}
                          />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="checkbox"
                            id="showThankYouPage"
                            label="Show thank you page after submission"
                            name="showThankYouPage"
                            checked={surveySettings.showThankYouPage}
                            onChange={handleSettingsChange}
                          />
                        </Form.Group>
                        
                        {surveySettings.showThankYouPage && (
                          <Form.Group className="mb-3">
                            <Form.Label>Thank You Message</Form.Label>
                            <Form.Control 
                              as="textarea"
                              rows={2}
                              name="thankYouMessage"
                              value={surveySettings.thankYouMessage}
                              onChange={handleSettingsChange}
                              placeholder="Message to show after survey completion"
                            />
                          </Form.Group>
                        )}
                        
                        <div className="mt-4">
                          <Button 
                            variant="outline-primary" 
                            onClick={handleAddSection}
                          >
                            <FaPlus className="me-1" /> Add Section
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                </Tab>
              </Tabs>
            </Col>
            <Col md={9}>
              <Card className="form-canvas">
                <Card.Header className="bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Survey Layout</h5>
                    <div>
                      <Button variant="link" className="p-0 text-decoration-none me-3">
                        <FaCode className="me-1" /> View Code
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={handleAddSection}
                      >
                        <FaPlus className="me-1" /> Add Section
                      </Button>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="p-4">
                  {sections.length === 0 ? (
                    <div className="text-center p-5 border rounded bg-light">
                      <p className="mb-0">Add a section to start building your survey</p>
                    </div>
                  ) : (
                    <div>
                      {sections.map((section) => (
                        <Card 
                          key={section.id} 
                          className={`mb-4 ${selectedSection.id === section.id ? 'border-primary' : ''}`}
                          onClick={() => handleSectionSelect(section)}
                        >
                          <Card.Header className="bg-light">
                            <div className="d-flex justify-content-between align-items-center">
                              <h5 className="mb-0">{section.title}</h5>
                              <div>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSectionSelect(section);
                                    handleAddQuestion('text');
                                  }}
                                >
                                  <FaPlus className="me-1" /> Add Question
                                </Button>
                              </div>
                            </div>
                          </Card.Header>
                          <Card.Body>
                            {section.description && <p className="text-muted">{section.description}</p>}
                            
                            {section.questions.length === 0 ? (
                              <div className="text-center p-4 border rounded bg-light">
                                <p className="mb-0">No questions yet. Click "Add Question" to start building your survey.</p>
                              </div>
                            ) : (
                              <div>
                                {section.questions.map((question) => (
                                  <div 
                                    key={question.id} 
                                    className={`p-3 mb-3 border rounded ${selectedQuestion?.id === question.id ? 'border-primary' : 'border-light'}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuestionSelect(question);
                                    }}
                                  >
                                    {renderQuestionPreview(question)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveSurvey}>
          <FaSave className="me-1" /> Save Survey
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SurveyDesignerModal;