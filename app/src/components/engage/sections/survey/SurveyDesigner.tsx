import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Alert, Button, Spinner } from 'react-bootstrap';
import { FaSave, FaEye, FaArrowLeft } from 'react-icons/fa';
import { SurveysService } from '../../../../services/engage';

// Import panel components
import SurveyElementsPanel from './panels/SurveyElementsPanel';
import SurveyCanvas from './panels/SurveyCanvas';
import SurveyPropertiesPanel from './panels/SurveyPropertiesPanel';
import SurveyPreview from './panels/SurveyPreview';

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

const SurveyDesigner: React.FC = () => {
  const navigate = useNavigate();
  const { surveyId } = useParams<{ surveyId: string }>();
  const [surveyTitle, setSurveyTitle] = useState('New Survey');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    thankYouMessage: 'Thank you for completing the survey!',
    // Add missing properties required by SurveySettings interface
    showResetButton: false,
    resetButtonText: 'Reset',
    showSubmitButton: true,
    submitButtonText: 'Submit',
    redirectAfterSubmit: false,
    redirectUrl: '',
    allowSave: false
  });
  
  // Survey appearance state
  const [surveyAppearance, setSurveyAppearance] = useState({
    backgroundColor: '#ffffff',
    backgroundImage: '',
    fontFamily: 'Arial, sans-serif',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    textColor: '#212529',
    borderRadius: '10px',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
    headerAlignment: 'center',
    buttonStyle: 'default',
    sectionTitleColor: '#343a40',
    sectionDividerColor: '#dee2e6',
    questionSpacing: '20px',
    width: '800px'
  });

  // Load survey data if editing an existing survey
  useEffect(() => {
    if (surveyId && surveyId !== 'new') {
      const fetchSurveyData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const survey = await SurveysService.getSurveyById(surveyId);
          
          console.log('Loaded survey data:', JSON.stringify(survey, null, 2));
          
          setSurveyTitle(survey.title);
          
          // Handle sections if they exist in settings, otherwise use default
          if (survey.settings && survey.settings.sections) {
            console.log('Using sections from settings:', survey.settings.sections);
            setSections(survey.settings.sections);
          } else if (survey.settings && survey.settings.questions) {
            // If there are questions but no sections, create a default section with those questions
            console.log('Creating default section with questions from settings:', survey.settings.questions);
            setSections([
              {
                id: 'section-1',
                title: 'Default Section',
                description: 'This is the default section of your survey.',
                questions: survey.settings.questions || []
              }
            ]);
          } else {
            console.log('Using empty default section');
            setSections([
              {
                id: 'section-1',
                title: 'Default Section',
                description: 'This is the default section of your survey.',
                questions: []
              }
            ]);
          }
          setSurveySettings(survey.settings || {
            showProgressBar: true,
            allowAnonymousResponses: true,
            requireAllQuestions: false,
            allowMultipleResponses: false,
            showThankYouPage: true,
            thankYouMessage: 'Thank you for completing the survey!'
          });
          
          // Load appearance settings if they exist
          if (survey.appearance) {
            // Ensure width has default value if not present
            const appearance = {
              ...surveyAppearance,
              ...survey.appearance,
              width: survey.appearance.width || '800px'
            };
            setSurveyAppearance(appearance);
          }
          
          // Set the selected section to the first section
          if (survey.settings && survey.settings.sections && survey.settings.sections.length > 0) {
            setSelectedSection(survey.settings.sections[0]);
          } else if (sections.length > 0) {
            setSelectedSection(sections[0]);
          }
          
          setLoading(false);
        } catch (error) {
          console.error('Error loading survey:', error);
          setError('Failed to load survey data. Please try again.');
          setLoading(false);
        }
      };
      
      fetchSurveyData();
    }
  }, [surveyId]);

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

  const handleScaleChange = (field: string, value: string | number) => {
    if (!selectedQuestion || !selectedQuestion.scale) return;

    const updatedScale = {
      ...selectedQuestion.scale,
      [field]: field === 'min' || field === 'max' ? 
        (typeof value === 'string' ? parseInt(value) : value) : 
        value
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

  // New function to handle question movement by ID
  const handleMoveQuestionById = (questionId: string, direction: 'up' | 'down') => {
    // Find the section that contains the question
    const sectionWithQuestion = sections.find(section => 
      section.questions.some(q => q.id === questionId)
    );
    
    if (!sectionWithQuestion) return;
    
    const currentIndex = sectionWithQuestion.questions.findIndex(q => q.id === questionId);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === sectionWithQuestion.questions.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newQuestions = [...sectionWithQuestion.questions];
    const [removed] = newQuestions.splice(currentIndex, 1);
    newQuestions.splice(newIndex, 0, removed);

    const updatedSection = {
      ...sectionWithQuestion,
      questions: newQuestions
    };

    setSections(sections.map(section => 
      section.id === sectionWithQuestion.id ? updatedSection : section
    ));
    
    // Update selectedSection if it's the one being modified
    if (selectedSection.id === sectionWithQuestion.id) {
      setSelectedSection(updatedSection);
    }
  };

  // New function to handle section movement by ID
  const handleMoveSectionById = (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
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
    
    // Update selectedSection if it's the one being moved
    if (selectedSection.id === sectionId) {
      setSelectedSection(newSections[newIndex]);
    }
  };

  // New function to clone a question
  const handleCloneQuestion = (questionId: string) => {
    // Find the section that contains the question
    const sectionWithQuestion = sections.find(section => 
      section.questions.some(q => q.id === questionId)
    );
    
    if (!sectionWithQuestion) return;
    
    const questionToClone = sectionWithQuestion.questions.find(q => q.id === questionId);
    if (!questionToClone) return;

    // Create a deep copy of the question
    const clonedQuestion: SurveyQuestion = {
      ...JSON.parse(JSON.stringify(questionToClone)),
      id: `question-${Date.now()}`, // Generate new unique ID
      question: `${questionToClone.question} (Copy)` // Append (Copy) to the question text
    };

    // Find the index of the original question
    const questionIndex = sectionWithQuestion.questions.findIndex(q => q.id === questionId);
    
    // Insert the cloned question after the original
    const newQuestions = [...sectionWithQuestion.questions];
    newQuestions.splice(questionIndex + 1, 0, clonedQuestion);
    
    const updatedSection = {
      ...sectionWithQuestion,
      questions: newQuestions
    };

    setSections(sections.map(section => 
      section.id === sectionWithQuestion.id ? updatedSection : section
    ));
    
    // Update selectedSection if it's the one being modified
    if (selectedSection.id === sectionWithQuestion.id) {
      setSelectedSection(updatedSection);
    }
    
    // Select the new question
    setSelectedQuestion(clonedQuestion);
  };

  // New function to clone a section
  const handleCloneSection = (sectionId: string) => {
    const sectionToClone = sections.find(s => s.id === sectionId);
    if (!sectionToClone) return;

    // Create a deep copy of the section
    const clonedSection: SurveySection = {
      ...JSON.parse(JSON.stringify(sectionToClone)),
      id: `section-${Date.now()}`, // Generate new unique ID
      title: `${sectionToClone.title} (Copy)`, // Append (Copy) to the title
      questions: sectionToClone.questions.map(q => ({
        ...q,
        id: `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Generate new unique IDs for all questions
      }))
    };

    // Find the index of the original section
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    
    // Insert the cloned section after the original
    const newSections = [...sections];
    newSections.splice(sectionIndex + 1, 0, clonedSection);
    
    setSections(newSections);
    setSelectedSection(clonedSection); // Select the new section
    setSelectedQuestion(null);
  };

  // New function to delete a question by ID
  const handleDeleteQuestionById = (questionId: string) => {
    // Find the section that contains the question
    const sectionWithQuestion = sections.find(section => 
      section.questions.some(q => q.id === questionId)
    );
    
    if (!sectionWithQuestion) return;
    
    const updatedSection = {
      ...sectionWithQuestion,
      questions: sectionWithQuestion.questions.filter(q => q.id !== questionId)
    };

    setSections(sections.map(section => 
      section.id === sectionWithQuestion.id ? updatedSection : section
    ));
    
    // Update selectedSection if it's the one being modified
    if (selectedSection.id === sectionWithQuestion.id) {
      setSelectedSection(updatedSection);
    }
    
    // Clear selectedQuestion if it's the one being deleted
    if (selectedQuestion && selectedQuestion.id === questionId) {
      setSelectedQuestion(null);
    }
  };

  // New function to delete a section by ID
  const handleDeleteSectionById = (sectionId: string) => {
    if (sections.length <= 1) return; // Don't delete the last section

    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    const newSections = sections.filter(s => s.id !== sectionId);
    
    setSections(newSections);
    
    // Update selectedSection if it's the one being deleted
    if (selectedSection.id === sectionId) {
      setSelectedSection(newSections[Math.min(sectionIndex, newSections.length - 1)]);
      setSelectedQuestion(null);
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    setSurveySettings({
      ...surveySettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handler for appearance changes
  const handleAppearanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setSurveyAppearance({
      ...surveyAppearance,
      [name]: value
    });
  };

  const handleSaveSurvey = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Make sure sections data is properly structured
      const processedSections = sections.map(section => ({
        ...section,
        title: section.title || 'Untitled Section',
        description: section.description || '',
        questions: section.questions.map(q => ({
          ...q,
          question: q.question || 'Untitled Question',
          description: q.description || ''
        }))
      }));
      
      // Store sections in settings
      const updatedSettings = {
        ...surveySettings,
        sections: processedSections
      };
      
      // Convert sections format to questions format for backward compatibility
      // This is needed because the backend might expect 'questions' but we're using 'sections'
      const questions = processedSections.length === 1 
        ? processedSections[0].questions 
        : processedSections.flatMap(section => section.questions);
      
      const surveyData = {
        title: surveyTitle,
        questions: questions, // Include questions for backward compatibility
        sections: processedSections, // Keep sections for backward compatibility
        settings: updatedSettings,
        appearance: surveyAppearance // Include appearance settings
      };
      
      console.log('Saving survey data:', JSON.stringify(surveyData, null, 2));
      
      if (surveyId && surveyId !== 'new') {
        // Update existing survey
        await SurveysService.updateSurvey(surveyId, surveyData);
      } else {
        // Create new survey
        const newSurvey = await SurveysService.createSurvey(surveyData);
        // Optionally redirect to the edit page for the new survey
        navigate(`/engage/survey/designer/${newSurvey.id}`);
        return; // Return early to prevent the navigate below
      }
      
      setLoading(false);
      navigate('/engage/survey');
    } catch (error) {
      console.error('Error saving survey:', error);
      setError('Failed to save survey. Please try again.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/engage/survey');
  };

  // Function to render question preview for the canvas
  const renderQuestionPreview = (question: SurveyQuestion) => {
    switch (question.type) {
      case 'text':
        return (
          <div className="mb-3">
            <label className="form-label">{question.question}{question.required && <span className="text-danger">*</span>}</label>
            {question.description && <div className="form-text mb-1">{question.description}</div>}
            <input type="text" className="form-control" placeholder="Your answer" />
          </div>
        );
      case 'textarea':
        return (
          <div className="mb-3">
            <label className="form-label">{question.question}{question.required && <span className="text-danger">*</span>}</label>
            {question.description && <div className="form-text mb-1">{question.description}</div>}
            <textarea className="form-control" rows={3} placeholder="Your answer"></textarea>
          </div>
        );
      case 'checkbox':
        return (
          <div className="mb-3">
            <label className="form-label">{question.question}{question.required && <span className="text-danger">*</span>}</label>
            {question.description && <div className="form-text mb-1">{question.description}</div>}
            {question.options?.map((option, index) => (
              <div key={index} className="form-check">
                <input className="form-check-input" type="checkbox" id={`${question.id}-option-${index}`} />
                <label className="form-check-label" htmlFor={`${question.id}-option-${index}`}>{option}</label>
              </div>
            ))}
          </div>
        );
      case 'radio':
        return (
          <div className="mb-3">
            <label className="form-label">{question.question}{question.required && <span className="text-danger">*</span>}</label>
            {question.description && <div className="form-text mb-1">{question.description}</div>}
            {question.options?.map((option, index) => (
              <div key={index} className="form-check">
                <input className="form-check-input" type="radio" name={question.id} id={`${question.id}-option-${index}`} />
                <label className="form-check-label" htmlFor={`${question.id}-option-${index}`}>{option}</label>
              </div>
            ))}
          </div>
        );
      case 'select':
        return (
          <div className="mb-3">
            <label className="form-label">{question.question}{question.required && <span className="text-danger">*</span>}</label>
            {question.description && <div className="form-text mb-1">{question.description}</div>}
            <select className="form-select">
              <option value="">Select an option</option>
              {question.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      default:
        return (
          <div className="mb-3">
            <label className="form-label">{question.question}{question.required && <span className="text-danger">*</span>}</label>
            {question.description && <div className="form-text mb-1">{question.description}</div>}
            <p className="text-muted">[{question.type} question]</p>
          </div>
        );
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button 
            variant="outline-secondary" 
            className="me-3"
            onClick={handleBack}
            disabled={loading}
          >
            <FaArrowLeft className="me-2" />
            Back to Surveys
          </Button>
          <div>
            <h1 className="h3 mb-0">Survey Designer: {surveyTitle}</h1>
            <p className="text-muted mb-0">Design your survey by adding sections and questions</p>
          </div>
        </div>
        <div>
          <Button 
            variant={previewMode ? "outline-primary" : "outline-secondary"} 
            className="me-2"
            onClick={() => setPreviewMode(!previewMode)}
            disabled={loading}
          >
            <FaEye className="me-1" /> Preview
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveSurvey}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="me-1" /> Save Survey
              </>
            )}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <SurveyPreview 
          surveyTitle={surveyTitle}
          sections={sections}
          surveySettings={surveySettings}
          surveyAppearance={surveyAppearance}
        />
      ) : (
        <Row>
          {/* Left Panel - Elements */}
          <SurveyElementsPanel 
            sections={sections}
            selectedSection={selectedSection}
            selectedQuestion={selectedQuestion}
            onAddElement={handleAddQuestion}
            onSectionSelect={handleSectionSelect}
            onQuestionSelect={handleQuestionSelect}
            onMoveSection={handleMoveSectionById}
            onMoveQuestion={handleMoveQuestionById}
            onCloneSection={handleCloneSection}
            onCloneQuestion={handleCloneQuestion}
            onDeleteSection={handleDeleteSectionById}
            onDeleteQuestion={handleDeleteQuestionById}
          />

          {/* Main Content Area - Canvas */}
          <SurveyCanvas 
            sections={sections}
            selectedSection={selectedSection}
            selectedQuestion={selectedQuestion}
            surveyAppearance={surveyAppearance}
            onSectionSelect={handleSectionSelect}
            onQuestionSelect={handleQuestionSelect}
            onAddSection={handleAddSection}
            onAddQuestion={handleAddQuestion}
            renderQuestionPreview={renderQuestionPreview}
          />

          {/* Right Panel - Properties */}
          <SurveyPropertiesPanel 
            selectedQuestion={selectedQuestion}
            selectedSection={selectedSection}
            sections={sections}
            surveySettings={surveySettings}
            surveyAppearance={surveyAppearance}
            onQuestionUpdate={handleQuestionUpdate}
            onSectionUpdate={handleSectionUpdate}
            onSettingsChange={handleSettingsChange}
            onAppearanceChange={handleAppearanceChange}
            onOptionChange={handleOptionChange}
            onAddOption={handleAddOption}
            onRemoveOption={handleRemoveOption}
            onScaleChange={handleScaleChange}
            onDeleteQuestion={handleDeleteQuestion}
            onDeleteSection={handleDeleteSection}
            onMoveQuestion={handleMoveQuestion}
            onMoveSection={handleMoveSection}
            onAddSection={handleAddSection}
          />
        </Row>
      )}
    </div>
  );
};

export default SurveyDesigner;
