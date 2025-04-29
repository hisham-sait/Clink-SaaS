// Survey Question interface
export interface SurveyQuestion {
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

// Default properties for different question types
export const getTextFieldQuestionProperties = (): Partial<SurveyQuestion> => ({
  type: 'text',
  question: 'Text Question',
  required: false,
  description: ''
});

export const getTextAreaQuestionProperties = (): Partial<SurveyQuestion> => ({
  type: 'textarea',
  question: 'Long Answer Question',
  required: false,
  description: ''
});

export const getCheckboxQuestionProperties = (): Partial<SurveyQuestion> => ({
  type: 'checkbox',
  question: 'Multiple Choice Question',
  required: false,
  description: '',
  options: ['Option 1', 'Option 2', 'Option 3']
});

export const getRadioQuestionProperties = (): Partial<SurveyQuestion> => ({
  type: 'radio',
  question: 'Single Choice Question',
  required: false,
  description: '',
  options: ['Option 1', 'Option 2', 'Option 3']
});

export const getSelectQuestionProperties = (): Partial<SurveyQuestion> => ({
  type: 'select',
  question: 'Dropdown Question',
  required: false,
  description: '',
  options: ['Option 1', 'Option 2', 'Option 3']
});

export const getScaleQuestionProperties = (): Partial<SurveyQuestion> => ({
  type: 'scale',
  question: 'Rating Scale Question',
  required: false,
  description: '',
  scale: {
    min: 1,
    max: 5,
    minLabel: 'Poor',
    maxLabel: 'Excellent'
  }
});

export const getDateQuestionProperties = (): Partial<SurveyQuestion> => ({
  type: 'date',
  question: 'Date Question',
  required: false,
  description: ''
});

export const getFileUploadQuestionProperties = (): Partial<SurveyQuestion> => ({
  type: 'file',
  question: 'File Upload Question',
  required: false,
  description: 'Upload a file'
});

// Export all question property getters
export const questionProperties = {
  text: getTextFieldQuestionProperties,
  textarea: getTextAreaQuestionProperties,
  checkbox: getCheckboxQuestionProperties,
  radio: getRadioQuestionProperties,
  select: getSelectQuestionProperties,
  scale: getScaleQuestionProperties,
  date: getDateQuestionProperties,
  file: getFileUploadQuestionProperties
};

// Helper function to get default properties for a question type
export const getDefaultQuestionProperties = (type: string): Partial<SurveyQuestion> => {
  const getProperties = questionProperties[type as keyof typeof questionProperties];
  if (getProperties) {
    return getProperties();
  }
  return {
    type,
    question: 'Unknown Question',
    required: false
  };
};
