import React from 'react';
import { NavLink } from 'react-router-dom';

interface SettingsSidebarProps {
  isExpanded: boolean;
}

const navItems = [
  {
    path: '/settings/dashboard',
    title: 'Dashboard',
    icon: 'bi-grid',
    description: 'Overview of your account and application settings'
  },
  {
    path: '/settings/profile',
    title: 'Profile',
    icon: 'bi-person',
    description: 'Manage your personal information and preferences'
  },
  {
    path: '/settings/companies',
    title: 'Companies',
    icon: 'bi-buildings',
    description: 'Manage companies and their relationships'
  },
  {
    path: '/settings/users',
    title: 'Users',
    icon: 'bi-people',
    description: 'Manage users and their access permissions'
  },
  {
    path: '/settings/roles',
    title: 'Roles',
    icon: 'bi-shield',
    description: 'Manage roles and their permissions'
  },
  {
    path: '/settings/plans',
    title: 'Plans',
    icon: 'bi-box',
    description: 'Manage subscription plans and pricing'
  },
  {
    path: '/settings/security',
    title: 'Security',
    icon: 'bi-shield-lock',
    description: 'Manage your password and security settings'
  },
  {
    path: '/settings/preferences',
    title: 'Preferences',
    icon: 'bi-gear',
    description: 'Customize your application experience'
  },
  {
    path: '/settings/integrations',
    title: 'Integrations',
    icon: 'bi-plug',
    description: 'Manage your app integrations'
  },
  {
    path: '/settings/billing',
    title: 'Billing',
    icon: 'bi-credit-card',
    description: 'Manage your subscription and payments'
  },
  {
    path: '/settings/notifications',
    title: 'Notifications',
    icon: 'bi-bell',
    description: 'Configure your notification preferences'
  }
];

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ isExpanded }) => {
  if (!isExpanded) return null;

  return (
    <div className="py-4">
      <div className="px-4 mb-2">
        <span className="text-uppercase small fw-semibold" style={{ color: 'var(--bs-gray-600)' }}>Settings</span>
      </div>
      <ul className="nav flex-column">
        {navItems.map((item) => (
          <li key={item.path} className="nav-item">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-4 ${
                  isActive ? 'active text-primary fw-medium' : ''
                }`
              }
              end={item.path === '/settings/dashboard'}
            >
              <i className={`bi fs-5 me-3 ${item.icon}`}></i>
              <span className="small">{item.title}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <style>
        {`
          .nav-link {
            color: var(--bs-gray-700);
            padding: 0.5rem 1rem;
          }
          .nav-link:hover {
            color: var(--bs-primary);
            background-color: var(--bs-gray-100);
          }
          .nav-link.active {
            color: var(--bs-primary);
            background-color: var(--bs-primary-bg-subtle);
          }
        `}
      </style>
    </div>
  );
};

export default SettingsSidebar;
