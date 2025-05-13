import React from 'react';
import { NavLink } from 'react-router-dom';

interface InsightsSidebarProps {
  isExpanded?: boolean;
}

const InsightsSidebar: React.FC<InsightsSidebarProps> = ({ isExpanded = true }) => {
  const navItems = [
    {
      label: 'Reports',
      icon: 'bi-file-earmark-bar-graph',
      route: '/insights/reports'
    }
  ];

  return (
    <div className="d-flex flex-column h-100">
      <div className="py-4">
        {isExpanded && (
          <div className="px-4 mb-2">
            <span className="text-uppercase small fw-semibold" style={{ color: 'var(--bs-gray-600)' }}>Insights</span>
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
                end={item.route === '/insights/reports'}
              >
                <i className={`bi fs-5 ${isExpanded ? 'me-3' : ''} ${item.icon}`}></i>
                {isExpanded && (
                  <div className="d-flex align-items-center">
                    <span className="small">{item.label}</span>
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InsightsSidebar;
