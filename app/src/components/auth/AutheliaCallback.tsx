import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const AutheliaCallback: React.FC = () => {
  const { login, loginWithAuthelia } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Check for error in URL parameters
        const params = new URLSearchParams(location.search);
        const error = params.get('error');
        
        if (error) {
          setStatus('error');
          setErrorMessage(error);
          return;
        }
        
        // Check if Authelia is available
        try {
          await fetch('http://localhost:9091/api/state', { 
            method: 'GET',
            mode: 'no-cors' // This allows us to at least attempt the request
          });
        } catch (error) {
          // Authelia is not available
          setStatus('error');
          setErrorMessage('SSO service is not available. Please use standard login.');
          setTimeout(() => {
            navigate('/auth/login');
          }, 3000);
          return;
        }

        // Get JWT token from Authelia cookie or URL parameter
        const token = params.get('jwt') || getCookie('authelia_jwt');
        
        if (!token) {
          // If no token, try to use stored credentials
          const credentialsStr = sessionStorage.getItem('authelia_credentials');
          
          if (credentialsStr) {
            const credentials = JSON.parse(credentialsStr);
            
            // Use standard login with stored credentials
            await login(credentials.username, credentials.password);
            
            // Clear stored credentials
            sessionStorage.removeItem('authelia_credentials');
            
            setStatus('success');
            
            // Redirect to dashboard or original destination
            const from = (location.state as any)?.from?.pathname || '/dashboard';
            navigate(from);
            return;
          } else {
            throw new Error('No authentication token received');
          }
        }

        // Process the JWT token with the backend
        await loginWithAuthelia(token);
        setStatus('success');
      } catch (err: any) {
        console.error('Authentication callback error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Authentication failed');
        toast.error(err.message || 'Authentication failed');
      }
    };

    processCallback();
  }, [location, navigate, login]);

  // Helper function to get cookie value
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="card-body text-center">
          {status === 'loading' && (
            <>
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h2 className="fw-bold">Authenticating...</h2>
              <p className="text-muted">Please wait while we complete your authentication.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-success mb-3">
                <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem' }}></i>
              </div>
              <h2 className="fw-bold">Authentication Successful</h2>
              <p className="text-muted">You are being redirected to your dashboard.</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-danger mb-3">
                <i className="bi bi-x-circle-fill" style={{ fontSize: '3rem' }}></i>
              </div>
              <h2 className="fw-bold">Authentication Failed</h2>
              <p className="text-danger">{errorMessage}</p>
              <button 
                className="btn btn-primary mt-3"
                onClick={() => navigate('/auth/authelia-login')}
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutheliaCallback;
