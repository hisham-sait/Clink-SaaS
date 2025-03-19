import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './sections/dashboard/Dashboard';
import Contacts from './sections/contacts/Contacts';
import ContactView from './sections/contacts/ContactView';
import Clients from './sections/clients/Clients';
import Organisations from './sections/organisations/Organisations';
import Products from './sections/products/Products';
import Services from './sections/services/Services';
import Proposals from './sections/proposals/Proposals';
import ProposalBuilder from './sections/proposals/ProposalBuilder/ProposalBuilder';

const CRM: React.FC = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="contacts" element={<Contacts />} />
      <Route path="contacts/:id" element={<ContactView />} />
      <Route path="clients" element={<Clients />} />
      <Route path="organisations" element={<Organisations />} />
      <Route path="products" element={<Products />} />
      <Route path="services" element={<Services />} />
      <Route path="proposals" element={<Proposals />} />
      <Route path="proposals/builder/:id" element={<ProposalBuilder />} />
      <Route path="" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default CRM;
