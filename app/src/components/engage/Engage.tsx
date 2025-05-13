import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './sections/dashboard/Dashboard';
import Forms from './sections/forms/Forms';
import FormDesigner from './sections/forms/FormDesigner';
import FormAnalytics from './sections/forms/FormAnalytics';
import Pages from './sections/pages/Pages';
import PageDesigner from './sections/pages/PageDesigner';
import PageAnalytics from './sections/pages/PageAnalytics';
import Categories from './sections/categories/Categories';
import Data from './sections/data/Data';
import DatasetDetail from './sections/data/DatasetDetail';

const Engage: React.FC = () => {
  return (
    <div className="container-fluid p-0">
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="forms" element={<Forms />} />
        <Route path="forms/designer/:formId" element={<FormDesigner />} />
        <Route path="forms/analytics/:id" element={<FormAnalytics />} />
        <Route path="pages" element={<Pages />} />
        <Route path="pages/designer/:pageId" element={<PageDesigner />} />
        <Route path="pages/analytics/:id" element={<PageAnalytics />} />
        <Route path="categories" element={<Categories />} />
        <Route path="data" element={<Data />} />
        <Route path="data/:datasetId" element={<DatasetDetail />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default Engage;
