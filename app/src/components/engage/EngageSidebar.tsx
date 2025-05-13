import React from 'react';
import { NavLink } from 'react-router-dom';

interface EngageSidebarProps {
  isExpanded?: boolean;
}

const EngageSidebar: React.FC<EngageSidebarProps> = ({ isExpanded = true }) => {
  const navItems = [
    {
      label: 'Dashboard',
      icon: 'bi-grid',
      route: '/engage/dashboard'
    },
    {
      label: 'Pages',
      icon: 'bi-file-earmark',
      route: '/engage/pages'
    },
    {
      label: 'Forms',
      icon: 'bi-file-earmark-text',
      route: '/engage/forms'
    },
    {
      label: 'AI Chat',
      icon: 'bi-chat-dots',
      route: '/engage/ai-chat',
      comingSoon: true
    },
    {
      label: 'AI Vision',
      icon: 'bi-eye',
      route: '/engage/ai-vision',
      comingSoon: true
    },
    {
      label: 'AI Voice',
      icon: 'bi-mic',
      route: '/engage/ai-voice',
      comingSoon: true
    },
    {
      label: 'Data',
      icon: 'bi-database',
      route: '/engage/data'
    },
    {
      label: 'Categories',
      icon: 'bi-folder',
      route: '/engage/categories'
    }
  ];

  return (
    <div className="d-flex flex-column h-100">
      <div className="py-4">
        {isExpanded && (
          <div className="px-4 mb-2">
            <span className="text-uppercase small fw-semibold" style={{ color: 'var(--bs-gray-600)' }}>Engage</span>
          </div>
        )}
        <ul className="nav flex-column">
          {navItems.map((item) => (
            <li className="nav-item" key={item.route}>
              <NavLink
                to={item.comingSoon ? '#' : item.route}
                className={({ isActive }) => `
                  nav-link d-flex align-items-center py-2
                  ${isExpanded ? 'px-4' : 'px-2'}
                  ${isActive && !item.comingSoon ? 'active fw-medium' : ''}
                  ${isActive && !item.comingSoon ? 'text-primary' : ''}
                  ${item.comingSoon ? 'disabled text-muted' : 'hover-primary'}
                `}
                end={item.route === '/engage/dashboard'}
                onClick={item.comingSoon ? (e) => e.preventDefault() : undefined}
              >
                <i className={`bi fs-5 ${isExpanded ? 'me-3' : ''} ${item.icon}`}></i>
                {isExpanded && (
                  <div className="d-flex align-items-center">
                    <span className="small">{item.label}</span>
                    {item.comingSoon && (
                      <span className="ms-2 badge bg-secondary rounded-pill px-2 py-1" style={{ fontSize: '0.65rem' }}>
                        Soon
                      </span>
                    )}
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

export default EngageSidebar;
