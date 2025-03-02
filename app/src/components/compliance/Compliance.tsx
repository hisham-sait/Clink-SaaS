import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const ComplianceDashboard: React.FC = () => {
  return (
    <div className="container-fluid py-4">
      <h1 className="h3 mb-4">Compliance Dashboard</h1>
      <div className="alert alert-info">Coming Soon</div>
    </div>
  );
};

const Compliance: React.FC = () => {
  return (
    <div className="d-flex flex-column h-100">
      <div className="flex-grow-1">
        <Routes>
          <Route path="dashboard" element={<ComplianceDashboard />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Compliance;
