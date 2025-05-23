import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './sections/dashboard/Dashboard';
import Catalog from './sections/catalog/Catalog';
import Categories from './sections/categories/Categories';
import Sections from './sections/sections/Sections';
import Attributes from './sections/attributes/Attributes';
import Families from './sections/families/Families';
import ImportExport from './sections/import-export/ImportExport';
import ProductView from './sections/detail/ProductView';

const Products: React.FC = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="catalog" element={<Catalog />} />
      <Route path="categories" element={<Categories />} />
      <Route path="sections" element={<Sections />} />
      <Route path="attributes" element={<Attributes />} />
      <Route path="families" element={<Families />} />
      <Route path="import-export" element={<ImportExport />} />
      <Route path="view/:id" element={<ProductView />} />
      <Route path="" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default Products;
