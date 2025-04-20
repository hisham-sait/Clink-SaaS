import React from 'react';
import { useParams } from 'react-router-dom';
import SurveyEmbed from '../engage/sections/survey/SurveyEmbed';

const SurveyEmbedPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();

  if (!surveyId) {
    return <div>Survey ID is required</div>;
  }

  return (
    <div className="container py-4">
      <SurveyEmbed surveyId={surveyId} />
    </div>
  );
};

export default SurveyEmbedPage;
