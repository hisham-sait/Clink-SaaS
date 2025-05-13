import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Reports from './sections/reports/Reports';
import ReportViewer from './sections/reports/ReportViewer';

const Insights: React.FC = () => {
  return (
    <div className="container-fluid p-0">
      <Routes>
        <Route path="/" element={<Navigate to="reports" replace />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/view/:reportId" element={<ReportViewer />} />
        <Route path="*" element={<Navigate to="reports" replace />} />
      </Routes>
    </div>
  );
};

export default Insights;
