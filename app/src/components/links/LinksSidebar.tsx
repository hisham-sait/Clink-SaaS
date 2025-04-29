import React from 'react';
import { NavLink } from 'react-router-dom';

interface LinksSidebarProps {
  isExpanded?: boolean;
}

const LinksSidebar: React.FC<LinksSidebarProps> = ({ isExpanded = true }) => {
  const navItems = [
    {
      label: 'Dashboard',
      icon: 'bi-grid',
      route: '/links/dashboard'
    },
    {
      label: 'Short Links',
      icon: 'bi-link',
      route: '/links/shortlinks'
    },
    {
      label: 'Digital Links',
      icon: 'bi-upc-scan',
      route: '/links/digitallinks'
    },
    {
      label: 'Categories',
      icon: 'bi-folder',
      route: '/links/categories'
    }
  ];

  return (
    <div className="d-flex flex-column h-100">
      <div className="py-4">
        {isExpanded && (
          <div className="px-4 mb-2">
            <span className="text-uppercase small fw-semibold" style={{ color: 'var(--bs-gray-600)' }}>Links</span>
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
                  hover-primary
                `}
                end={item.route === '/links/dashboard'}
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

export default LinksSidebar;
