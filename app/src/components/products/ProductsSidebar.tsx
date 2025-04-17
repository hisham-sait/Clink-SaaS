import React from 'react';
import { NavLink } from 'react-router-dom';

interface ProductsSidebarProps {
  isExpanded?: boolean;
}

const ProductsSidebar: React.FC<ProductsSidebarProps> = ({ isExpanded = true }) => {
  const navItems = [
    {
      label: 'Dashboard',
      icon: 'bi-grid',
      route: '/products/dashboard'
    },
    {
      label: 'Catalog',
      icon: 'bi-grid-3x3-gap',
      route: '/products/catalog'
    },
    {
      label: 'Categories',
      icon: 'bi-diagram-3',
      route: '/products/categories'
    },
    {
      label: 'Sections',
      icon: 'bi-layers',
      route: '/products/sections'
    },
    {
      label: 'Attributes',
      icon: 'bi-tag',
      route: '/products/attributes'
    },
    {
      label: 'Families',
      icon: 'bi-collection',
      route: '/products/families'
    },
    {
      label: 'Import/Export',
      icon: 'bi-arrow-down-up',
      route: '/products/import-export'
    }
  ];

  return (
    <div className="d-flex flex-column h-100">
      <div className="py-4">
        {isExpanded && (
          <div className="px-4 mb-2">
            <span className="text-uppercase small fw-semibold" style={{ color: 'var(--bs-gray-600)' }}>Products</span>
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
                end={item.route === '/products/dashboard'}
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

export default ProductsSidebar;
