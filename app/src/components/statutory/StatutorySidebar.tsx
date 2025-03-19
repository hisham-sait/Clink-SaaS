import React from 'react';
import { NavLink } from 'react-router-dom';

interface StatutorySidebarProps {
  isExpanded?: boolean;
}

const StatutorySidebar: React.FC<StatutorySidebarProps> = ({ isExpanded = true }) => {
  const navItems = [
    {
      label: 'Dashboard',
      icon: 'bi-grid',
      route: '/statutory/dashboard'
    },
    {
      label: 'Directors & Secretaries',
      icon: 'bi-person-badge',
      route: '/statutory/directors'
    },
    {
      label: 'Members Register',
      icon: 'bi-people',
      route: '/statutory/shareholders'
    },
    {
      label: 'Share Register',
      icon: 'bi-journal-bookmark',
      route: '/statutory/shares'
    },
    {
      label: 'Beneficial Owners',
      icon: 'bi-person-check',
      route: '/statutory/beneficial-owners'
    },
    {
      label: 'Charges Register',
      icon: 'bi-bank',
      route: '/statutory/charges'
    },
    {
      label: 'Share Allotments',
      icon: 'bi-plus-circle',
      route: '/statutory/allotments'
    },
    {
      label: 'General Meetings',
      icon: 'bi-calendar-event',
      route: '/statutory/meetings'
    },
    {
      label: 'Board Minutes',
      icon: 'bi-file-text',
      route: '/statutory/board-minutes'
    }
  ];

  return (
    <div className="d-flex flex-column h-100">
      <div className="py-4">
        {isExpanded && (
          <div className="px-4 mb-2">
            <span className="text-uppercase small fw-semibold" style={{ color: 'var(--bs-gray-600)' }}>STATUTORY REGISTERS</span>
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
                end={item.route === '/statutory/dashboard'}
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

export default StatutorySidebar;
