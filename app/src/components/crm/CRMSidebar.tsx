import React from 'react';
import { NavLink } from 'react-router-dom';

interface CRMSidebarProps {
  isExpanded?: boolean;
}

const CRMSidebar: React.FC<CRMSidebarProps> = ({ isExpanded = true }) => {
  const navItems = [
    {
      label: 'Dashboard',
      icon: 'bi-grid',
      route: '/crm/dashboard'
    },
    {
      label: 'Contacts',
      icon: 'bi-person-lines-fill',
      route: '/crm/contacts'
    },
    {
      label: 'Clients',
      icon: 'bi-building',
      route: '/crm/clients'
    },
    {
      label: 'Organisations',
      icon: 'bi-buildings',
      route: '/crm/organisations'
    },
    {
      label: 'Services',
      icon: 'bi-gear-fill',
      route: '/crm/services'
    },
    {
      label: 'Proposals',
      icon: 'bi-file-earmark-text-fill',
      route: '/crm/proposals'
    }
  ];

  return (
    <div className="d-flex flex-column h-100">
      <div className="py-4">
        {isExpanded && (
          <div className="px-4 mb-2">
            <span className="text-uppercase small fw-semibold" style={{ color: 'var(--bs-gray-600)' }}>CRM</span>
          </div>
        )}
        <ul className="nav flex-column">
          {navItems.map((item) => (
            <li className="nav-item" key={item.route}>
              <NavLink
                to={item.route}
                className={({ isActive }) => `
                  nav-link d-flex align-items-center py-2
                  ${isExpanded ? 'px-4' : 'px-2'}
                  ${isActive ? 'active fw-medium' : ''}
                  ${isActive ? 'text-primary' : ''}
                  ${isActive ? '' : ''}
                  hover-primary
                `}
                end={item.route === '/crm/dashboard'}
              >
                <i className={`bi fs-5 ${isExpanded ? 'me-3' : ''} ${item.icon}`}></i>
                {isExpanded && <span className="small">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CRMSidebar;
