import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import {
  Directors,
  Shareholders,
  Shares,
  BeneficialOwners,
  Charges,
  Allotments,
  Meetings,
  BoardMinutes
} from './sections';

const Statutory: React.FC = () => {
  return (
    <div className="d-flex flex-column h-100">
      <div className="flex-grow-1">
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="directors" element={<Directors />} />
          <Route path="shareholders" element={<Shareholders />} />
          <Route path="shares" element={<Shares />} />
          <Route path="beneficial-owners" element={<BeneficialOwners />} />
          <Route path="charges" element={<Charges />} />
          <Route path="allotments" element={<Allotments />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="board-minutes" element={<BoardMinutes />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Statutory;
