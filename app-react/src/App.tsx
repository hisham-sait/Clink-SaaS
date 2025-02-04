import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import TinySidebar from './components/shared/TinySidebar';
import Sidebar from './components/shared/Sidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Lazy load components
const Auth = lazy(() => import('./components/auth/Auth'));
const Dashboard = lazy(() => import('./components/dashboards/Dashboard'));
const Settings = lazy(() => import('./components/settings/Settings'));
const Statutory = lazy(() => import('./components/statutory/Statutory'));
const Compliance = lazy(() => import('./components/compliance/Compliance'));
const Tax = lazy(() => import('./components/tax/Tax'));
const Help = lazy(() => import('./components/help/Help'));

type SectionType = 'statutory' | 'compliance' | 'tax' | 'settings' | 'help';

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith('/auth');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationCount] = useState(0);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionType>('statutory');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && isSidebarExpanded) {
        setIsSidebarExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarExpanded]);

  // Set active section based on route
  useEffect(() => {
    const path = location.pathname.split('/')[1];
    if (path && path !== 'auth' && path !== 'dashboard') {
      setActiveSection(path as SectionType);
    }
  }, [location]);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleNotificationsToggle = () => {
    // Implement notifications toggle
  };

  const handleUserMenuToggle = () => {
    // Implement user menu toggle
  };

  const handleSectionChange = (section: SectionType) => {
    setActiveSection(section);
  };

  if (isAuthPage) {
    return (
      <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
        <Routes>
          <Route path="/auth/*" element={<Auth />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="app-container">
      <TinySidebar
        isDarkMode={isDarkMode}
        notificationCount={notificationCount}
        userAvatar="bi-person-circle"
        userName=""
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onThemeToggle={handleThemeToggle}
        onNotificationsToggle={handleNotificationsToggle}
        onUserMenuToggle={handleUserMenuToggle}
      />
      <Sidebar
        isExpanded={isSidebarExpanded}
        isMobile={isMobile}
        activeSection={activeSection}
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />
      <main className="main-content" style={{ marginLeft: isSidebarExpanded ? '268px' : '88px' }}>
        <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
          <Routes>
            {/* Protected routes */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/*"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/statutory/*"
              element={
                <ProtectedRoute>
                  <Statutory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compliance/*"
              element={
                <ProtectedRoute>
                  <Compliance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tax/*"
              element={
                <ProtectedRoute>
                  <Tax />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help/*"
              element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
