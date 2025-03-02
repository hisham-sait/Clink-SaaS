import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './sections/dashboard/Dashboard';
import Contacts from './sections/contacts/Contacts';
import ContactView from './sections/contacts/ContactView';
import Pipeline from './sections/pipeline/Pipeline';
import Clients from './sections/clients/Clients';
import Organisations from './sections/organisations/Organisations';
import Forms from './sections/forms/Forms';
import Products from './sections/products/Products';
import Proposals from './sections/proposals/Proposals';

const CRM: React.FC = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="contacts" element={<Contacts />} />
      <Route path="contacts/:id" element={<ContactView />} />
      <Route path="pipeline" element={<Pipeline />} />
      <Route path="clients" element={<Clients />} />
      <Route path="organisations" element={<Organisations />} />
      <Route path="forms" element={<Forms />} />
      <Route path="products" element={<Products />} />
      <Route path="proposals" element={<Proposals />} />
      <Route path="" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default CRM;
