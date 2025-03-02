import React from 'react';
import { NavLink } from 'react-router-dom';

interface HelpSidebarProps {
  isExpanded?: boolean;
}

const HelpSidebar: React.FC<HelpSidebarProps> = ({ isExpanded = true }) => {
  const navItems = [
    {
      label: 'Overview',
      icon: 'bi-grid',
      route: '/help'
    },
    {
      label: 'Documentation',
      icon: 'bi-book',
      route: '/help/docs'
    },
    {
      label: 'FAQs',
      icon: 'bi-question-circle',
      route: '/help/faqs'
    },
    {
      label: 'Support',
      icon: 'bi-headset',
      route: '/help/support'
    },
    {
      label: 'Tutorials',
      icon: 'bi-play-circle',
      route: '/help/tutorials'
    }
  ];

  return (
    <div className="d-flex flex-column h-100">
      <div className="py-4">
        {isExpanded && (
          <div className="px-4 mb-2">
            <span className="text-uppercase small fw-semibold text-secondary">HELP CENTER</span>
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
                  ${isActive ? 'active bg-primary-subtle text-primary fw-medium' : ''}
                  hover-primary
                `}
                end={item.route === '/help'}
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

export default HelpSidebar;
