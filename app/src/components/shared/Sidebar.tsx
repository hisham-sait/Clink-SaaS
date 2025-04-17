import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SettingsSidebar from '../settings/SettingsSidebar';
import HelpSidebar from '../help/HelpSidebar';
import CRMSidebar from '../crm/CRMSidebar';
import ProductsSidebar from '../products/ProductsSidebar';
import LinksSidebar from '../links/LinksSidebar';

type SectionType = 'crm' | 'products' | 'links' | 'settings' | 'help';

interface ModuleConfig {
  icon: string;
  title: string;
}

interface SidebarProps {
  isExpanded: boolean;
  isMobile: boolean;
  activeSection: SectionType;
  onToggleSidebar: () => void;
}

const moduleConfigs: Record<SectionType, ModuleConfig> = {
  settings: { icon: 'bi-gear', title: 'Settings' },
  help: { icon: 'bi-question-circle', title: 'Help' },
  crm: { icon: 'bi-people', title: 'CRM' },
  products: { icon: 'bi-box', title: 'Products' },
  links: { icon: 'bi-link-45deg', title: 'Links' }
};

const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  isMobile,
  activeSection,
  onToggleSidebar
}) => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (user?.companyId) {
        try {
          const response = await fetch(`http://localhost:3000/api/settings/companies/${user.companyId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const company = await response.json();
            setCompanyName(company.name);
          }
        } catch (error) {
          console.error('Error loading company:', error);
        }
      }
    };

    fetchCompanyDetails();
  }, [user?.companyId]);

  const getModuleIcon = (): string => {
    return moduleConfigs[activeSection]?.icon || 'bi-grid';
  };

  const getModuleTitle = (): string => {
    return moduleConfigs[activeSection]?.title || '';
  };

  const renderSidebar = () => {
    switch (activeSection) {
      case 'settings':
        return <SettingsSidebar isExpanded={isExpanded} />;
      case 'help':
        return <HelpSidebar isExpanded={isExpanded} />;
      case 'crm':
        return <CRMSidebar isExpanded={isExpanded} />;
      case 'products':
        return <ProductsSidebar isExpanded={isExpanded} />;
      case 'links':
        return <LinksSidebar isExpanded={isExpanded} />;
      default:
        return <div className="p-4">Coming Soon</div>;
    }
  };

  return (
    <div
      className="position-fixed h-100 border-end overflow-hidden"
      style={{
        left: '48px',
        width: isExpanded ? '220px' : '40px',
        transition: 'width 0.3s ease, transform 0.3s ease',
        zIndex: 1020,
        transform: !isExpanded && isMobile ? 'translateX(-50%)' : 'none',
        backgroundColor: 'var(--bs-gray-100)'
      }}
    >
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
        {isExpanded && (
          <div className="d-flex align-items-center">
            <i className={`bi fs-5 me-2 ${getModuleIcon()}`}></i>
            <span className="small">{companyName || getModuleTitle()}</span>
          </div>
        )}
        <button
          className={`btn btn-link btn-sm p-0 ${!isExpanded ? 'ms-auto' : ''}`}
          style={{ color: 'var(--bs-gray-600)' }}
          onClick={onToggleSidebar}
        >
          <i className={`bi ${isExpanded ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
        </button>
      </div>

      {/* Module-specific Sidebar */}
      <div className="h-100 overflow-auto" style={{ scrollbarWidth: 'thin' }}>
        {renderSidebar()}
      </div>

      <style>
        {`
          .overflow-auto::-webkit-scrollbar {
            width: 4px;
          }

          .overflow-auto::-webkit-scrollbar-track {
            background: var(--bs-gray-100);
          }

          .overflow-auto::-webkit-scrollbar-thumb {
            background: var(--bs-gray-300);
            border-radius: 2px;
          }

          .overflow-auto::-webkit-scrollbar-thumb:hover {
            background: var(--bs-gray-400);
          }

          @media (max-width: 768px) {
            .sidebar {
              left: 40px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Sidebar;
