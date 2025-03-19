import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type SectionType = 'statutory' | 'compliance' | 'tax' | 'crm' | 'settings' | 'help';
type ThemeType = 'light' | 'dark' | 'system';

interface Section {
  id: SectionType;
  title: string;
  icon: string;
  route: string;
}

interface TinySidebarProps {
  theme: ThemeType;
  notificationCount: number;
  userAvatar: string;
  userName: string;
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  onThemeToggle: (theme?: ThemeType) => void;
  onNotificationsToggle: () => void;
  onUserMenuToggle: () => void;
}

const TinySidebar: React.FC<TinySidebarProps> = ({
  theme,
  notificationCount,
  userAvatar,
  userName,
  activeSection,
  onSectionChange,
  onThemeToggle,
  onNotificationsToggle,
  onUserMenuToggle
}) => {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLLIElement>(null);
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

  // Close theme menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return 'bi-sun-fill';
      case 'dark': return 'bi-moon-fill';
      case 'system': return 'bi-display';
      default: return 'bi-sun-fill';
    }
  };

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
    <aside className="position-fixed start-0 top-0 bottom-0 border-end" 
           style={{ width: '48px', zIndex: 1030, backgroundColor: 'var(--bs-gray-100)' }}>
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
            <li className="nav-item mb-1 position-relative" ref={themeMenuRef}>
              <button
                className="nav-link d-flex justify-content-center align-items-center rounded p-2"
                style={{ width: '40px', height: '40px', border: 'none', background: 'none' }}
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                title="Theme Settings"
              >
                <i className={`bi fs-5 ${getThemeIcon()}`}></i>
              </button>
              
              {themeMenuOpen && (
                <div className="position-absolute start-100 shadow rounded py-2 ms-2" 
                     style={{ width: '150px', zIndex: 1040, backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)' }}>
                  <button 
                    className={`d-flex align-items-center w-100 border-0 bg-transparent px-3 py-2 ${theme === 'light' ? 'text-primary' : ''}`}
                    onClick={() => { onThemeToggle('light'); setThemeMenuOpen(false); }}
                  >
                    <i className="bi bi-sun-fill me-2"></i>
                    <span className="small">Light</span>
                    {theme === 'light' && <i className="bi bi-check-lg ms-auto"></i>}
                  </button>
                  <button 
                    className={`d-flex align-items-center w-100 border-0 bg-transparent px-3 py-2 ${theme === 'dark' ? 'text-primary' : ''}`}
                    onClick={() => { onThemeToggle('dark'); setThemeMenuOpen(false); }}
                  >
                    <i className="bi bi-moon-fill me-2"></i>
                    <span className="small">Dark</span>
                    {theme === 'dark' && <i className="bi bi-check-lg ms-auto"></i>}
                  </button>
                  <button 
                    className={`d-flex align-items-center w-100 border-0 bg-transparent px-3 py-2 ${theme === 'system' ? 'text-primary' : ''}`}
                    onClick={() => { onThemeToggle('system'); setThemeMenuOpen(false); }}
                  >
                    <i className="bi bi-display me-2"></i>
                    <span className="small">System</span>
                    {theme === 'system' && <i className="bi bi-check-lg ms-auto"></i>}
                  </button>
                </div>
              )}
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
