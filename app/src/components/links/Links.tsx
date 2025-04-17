import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './sections/dashboard/Dashboard';
import Shortlinks from './sections/shortlinks/Shortlinks';
import Digitallinks from './sections/digitallinks/Digitallinks';
import Categories from './sections/categories/Categories';

const Links: React.FC = () => {
  return (
    <div className="container-fluid p-0">
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="shortlinks" element={<Shortlinks />} />
        <Route path="digitallinks" element={<Digitallinks />} />
        <Route path="categories" element={<Categories />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default Links;
