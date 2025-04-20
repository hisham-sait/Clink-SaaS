import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './sections/dashboard/Dashboard';
import Forms from './sections/forms/Forms';
import FormDesigner from './sections/forms/FormDesigner';
import Survey from './sections/survey/Survey';
import SurveyDesigner from './sections/survey/SurveyDesigner';
import Data from './sections/data/Data';
import DatasetDetail from './sections/data/DatasetDetail';

const Engage: React.FC = () => {
  return (
    <div className="container-fluid p-0">
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="forms" element={<Forms />} />
        <Route path="forms/designer/:formId" element={<FormDesigner />} />
        <Route path="survey" element={<Survey />} />
        <Route path="survey/designer/:surveyId" element={<SurveyDesigner />} />
        <Route path="data" element={<Data />} />
        <Route path="data/:datasetId" element={<DatasetDetail />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default Engage;
