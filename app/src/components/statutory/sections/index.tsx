import React from 'react';
import Directors from './directors/Directors';

const PlaceholderSection: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="container-fluid py-4">
      <h1 className="h3 mb-4">{title}</h1>
      <div className="alert alert-info">
        {title} section coming soon.
      </div>
    </div>
  );
};

export { Directors };
export const Shareholders: React.FC = () => <PlaceholderSection title="Members Register" />;
export const Shares: React.FC = () => <PlaceholderSection title="Share Register" />;
export const BeneficialOwners: React.FC = () => <PlaceholderSection title="Beneficial Owners" />;
export const Charges: React.FC = () => <PlaceholderSection title="Charges Register" />;
export const Allotments: React.FC = () => <PlaceholderSection title="Share Allotments" />;
export const Meetings: React.FC = () => <PlaceholderSection title="General Meetings" />;
export const BoardMinutes: React.FC = () => <PlaceholderSection title="Board Minutes" />;
