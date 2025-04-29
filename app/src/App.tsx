import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useState, useEffect, useCallback } from 'react';
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
const CRM = lazy(() => import('./components/crm/CRM'));
const Products = lazy(() => import('./components/products/Products'));
const Links = lazy(() => import('./components/links/Links'));
const Engage = lazy(() => import('./components/engage/Engage'));
const Help = lazy(() => import('./components/help/Help'));
const FormEmbedPage = lazy(() => import('./components/forms/FormEmbedPage'));
const SurveyEmbedPage = lazy(() => import('./components/surveys/SurveyEmbedPage'));

type SectionType = 'crm' | 'products' | 'links' | 'engage' | 'settings' | 'help';
type ThemeType = 'light' | 'dark' | 'system';

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith('/auth');
  const [theme, setTheme] = useState<ThemeType>(() => {
    // Get theme from localStorage or default to 'light'
    return (localStorage.getItem('theme') as ThemeType) || 'light';
  });
  const [notificationCount] = useState(0);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionType>('products');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Apply theme to document
  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
    
    // Remove all theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    
    if (theme === 'system') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    } else {
      // Apply selected theme
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.remove('theme-light', 'theme-dark');
        document.documentElement.classList.add(e.matches ? 'theme-dark' : 'theme-light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

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

  const handleThemeToggle = useCallback((newTheme?: ThemeType) => {
    if (newTheme) {
      setTheme(newTheme);
    } else {
      // Cycle through themes if no specific theme is provided
      setTheme(prevTheme => {
        switch (prevTheme) {
          case 'light': return 'dark';
          case 'dark': return 'system';
          case 'system': return 'light';
          default: return 'light';
        }
      });
    }
  }, []);

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
        theme={theme}
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
              path="/crm/*"
              element={
                <ProtectedRoute>
                  <CRM />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/*"
              element={
                <ProtectedRoute>
                  <Products />
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
            <Route
              path="/links/*"
              element={
                <ProtectedRoute>
                  <Links />
                </ProtectedRoute>
              }
            />
            <Route
              path="/engage/*"
              element={
                <ProtectedRoute>
                  <Engage />
                </ProtectedRoute>
              }
            />

            {/* Form embed route - for internal use */}
            <Route path="/embed/form/:formId" element={<FormEmbedPage />} />
            
            {/* Public form and survey routes are handled by the backend */}

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* Exclude shortlink, digital link, form, and survey routes from catch-all */}
            <Route path="/s/*" element={null} />
            <Route path="/r/*" element={null} />
            <Route path="/d/*" element={null} />
            <Route path="/f/*" element={null} />
            <Route path="/y/*" element={null} />
            <Route path="/p/*" element={null} />
            {/* Redirect old form and survey URLs to new format */}
            <Route path="/forms/:formId" element={
              <Navigate to={`/f/${window.location.pathname.split('/').pop()}`} replace />
            } />
            <Route path="/surveys/:surveyId" element={
              <Navigate to={`/y/${window.location.pathname.split('/').pop()}`} replace />
            } />
            <Route path="/pages/:pageId" element={
              <Navigate to={`/p/${window.location.pathname.split('/').pop()}`} replace />
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

function App() {
  // Get theme from localStorage for ToastContainer
  const savedTheme = localStorage.getItem('theme') as ThemeType || 'light';
  const toastTheme = savedTheme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : savedTheme;

  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          pauseOnHover
          theme={toastTheme}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
