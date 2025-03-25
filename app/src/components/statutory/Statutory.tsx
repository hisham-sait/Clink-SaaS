import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Directors from './sections/directors/Directors';
import DirectorView from './sections/directors/DirectorView';
import Shareholders from './sections/shareholders/Shareholders';
import ShareholderView from './sections/shareholders/ShareholderView';
import Shares from './sections/shares/Shares';
import ShareView from './sections/shares/ShareView';
import BeneficialOwners from './sections/beneficial-owners/BeneficialOwners';
import BeneficialOwnerView from './sections/beneficial-owners/BeneficialOwnerView';
import Charges from './sections/charges/Charges';
import ChargeView from './sections/charges/ChargeView';
import Allotments from './sections/allotments/Allotments';
import AllotmentView from './sections/allotments/AllotmentView';
import Meetings from './sections/meetings/Meetings';
import MeetingView from './sections/meetings/MeetingView';
import BoardMinutes from './sections/board-minutes/BoardMinutes';
import BoardMinuteView from './sections/board-minutes/BoardMinuteView';

const Statutory: React.FC = () => {
  return (
    <div className="d-flex flex-column h-100">
      <div className="flex-grow-1">
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="directors" element={<Directors />} />
          <Route path="directors/:id" element={<DirectorView />} />
          
          <Route path="shareholders" element={<Shareholders />} />
          <Route path="shareholders/:id" element={<ShareholderView />} />
          
          <Route path="shares" element={<Shares />} />
          <Route path="shares/:id" element={<ShareView />} />
          
          <Route path="beneficial-owners" element={<BeneficialOwners />} />
          <Route path="beneficial-owners/:id" element={<BeneficialOwnerView />} />
          
          <Route path="charges" element={<Charges />} />
          <Route path="charges/:id" element={<ChargeView />} />
          
          <Route path="allotments" element={<Allotments />} />
          <Route path="allotments/:id" element={<AllotmentView />} />
          
          <Route path="meetings" element={<Meetings />} />
          <Route path="meetings/:id" element={<MeetingView />} />
          
          <Route path="board-minutes" element={<BoardMinutes />} />
          <Route path="board-minutes/:id" element={<BoardMinuteView />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Statutory;
