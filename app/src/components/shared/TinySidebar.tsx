import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type SectionType = 'statutory' | 'compliance' | 'tax' | 'crm' | 'settings' | 'help';

interface Section {
  id: SectionType;
  title: string;
  icon: string;
  route: string;
}

interface TinySidebarProps {
  isDarkMode: boolean;
  notificationCount: number;
  userAvatar: string;
  userName: string;
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  onThemeToggle: () => void;
  onNotificationsToggle: () => void;
  onUserMenuToggle: () => void;
}

const TinySidebar: React.FC<TinySidebarProps> = ({
  isDarkMode,
  notificationCount,
  userAvatar,
  userName,
  activeSection,
  onSectionChange,
  onThemeToggle,
  onNotificationsToggle,
  onUserMenuToggle
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const topSections: Section[] = [
    { id: 'statutory', title: 'Statutory', icon: 'bi bi-journal-bookmark', route: '/statutory/dashboard' },
    { id: 'compliance', title: 'Compliance', icon: 'bi bi-shield-check', route: '/compliance/dashboard' },
    { id: 'tax', title: 'Tax', icon: 'bi bi-calculator', route: '/tax/dashboard' },
    { id: 'crm', title: 'CRM', icon: 'bi bi-people', route: '/crm/contacts' }
  ];

  const bottomSections: Section[] = [
    { id: 'settings', title: 'Settings', icon: 'bi bi-gear', route: '/settings' },
    { id: 'help', title: 'Help', icon: 'bi bi-question-circle', route: '/help' }
  ];

  const navigateToUserDashboard = () => {
    if (user?.roles?.[0]) {
      navigate(`/dashboard/${user.roles[0].toLowerCase()}`);
    }
  };

  const selectSection = (section: SectionType) => {
    onSectionChange(section);
    
    switch(section) {
      case 'statutory':
      case 'compliance':
      case 'tax':
        navigate(`/${section}/dashboard`);
        break;
      case 'settings':
      case 'help':
        navigate(`/${section}`);
        break;
      case 'crm':
        navigate('/crm/contacts');
        break;
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="position-fixed start-0 top-0 bottom-0 bg-light border-end" style={{ width: '48px', zIndex: 1030 }}>
      <div className="d-flex flex-column h-100">
        <div className="p-2">
          <ul className="nav flex-column align-items-center m-0 p-0">
            <li className="nav-item mb-1">
              <button
                className="nav-link d-flex justify-content-center align-items-center rounded p-2"
                style={{ width: '40px', height: '40px', border: 'none', background: 'none' }}
                onClick={navigateToUserDashboard}
                title="Home"
              >
                <i className="bi bi-house fs-5"></i>
              </button>
            </li>
            {topSections.map((section) => (
              <li className="nav-item mb-1" key={section.id}>
                <button
                  className={`nav-link d-flex justify-content-center align-items-center rounded p-2 ${
                    activeSection === section.id ? 'active' : ''
                  }`}
                  style={{ width: '40px', height: '40px', border: 'none', background: 'none' }}
                  onClick={() => selectSection(section.id)}
                  title={section.title}
                >
                  <i className={`${section.icon} fs-5`}></i>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto p-2">
          <ul className="nav flex-column align-items-center m-0 p-0">
            <li className="nav-item mb-1">
              <button
                className="nav-link d-flex justify-content-center align-items-center rounded p-2"
                style={{ width: '40px', height: '40px', border: 'none', background: 'none' }}
                onClick={onThemeToggle}
                title="Toggle Theme"
              >
                <i className={`bi fs-5 ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
              </button>
            </li>
            <li className="nav-item mb-1 position-relative">
              <button
                className="nav-link d-flex justify-content-center align-items-center rounded p-2"
                style={{ width: '40px', height: '40px', border: 'none', background: 'none' }}
                onClick={onNotificationsToggle}
                title="Notifications"
              >
                <i className="bi bi-bell fs-5"></i>
                {notificationCount > 0 && (
                  <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">
                    {notificationCount}
                  </span>
                )}
              </button>
            </li>
            <li className="nav-item mb-1">
              <button
                className="nav-link d-flex justify-content-center align-items-center rounded p-2"
                style={{ width: '40px', height: '40px', border: 'none', background: 'none' }}
                onClick={onUserMenuToggle}
                title="Profile"
              >
                <i className={`${userAvatar || 'bi bi-person-circle'} fs-5`}></i>
              </button>
            </li>
            {bottomSections.map((section) => (
              <li className="nav-item mb-1" key={section.id}>
                <button
                  className={`nav-link d-flex justify-content-center align-items-center rounded p-2 ${
                    activeSection === section.id ? 'active' : ''
                  }`}
                  style={{ width: '40px', height: '40px', border: 'none', background: 'none' }}
                  onClick={() => selectSection(section.id)}
                  title={section.title}
                >
                  <i className={`${section.icon} fs-5`}></i>
                </button>
              </li>
            ))}
            <li className="nav-item">
              <button
                className="nav-link d-flex justify-content-center align-items-center rounded p-2"
                style={{ width: '40px', height: '40px', border: 'none', background: 'none' }}
                onClick={handleLogout}
                title="Logout"
              >
                <i className="bi bi-box-arrow-right fs-5"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default TinySidebar;
