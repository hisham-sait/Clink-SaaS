import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const AuthentikCallback: React.FC = () => {
  const { login, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Parse the URL parameters
        const params = new URLSearchParams(location.search);
        const error = params.get('error');
        const code = params.get('code');
        const state = params.get('state');
        
        if (error) {
          setStatus('error');
          setErrorMessage(error);
          return;
        }
        
        // Check if Authentik is available
        try {
          await fetch('http://localhost:9000/api/v3/core/applications/', { 
            method: 'GET',
            mode: 'no-cors' // This allows us to at least attempt the request
          });
        } catch (error) {
          // Authentik is not available
          setStatus('error');
          setErrorMessage('SSO service is not available. Please use standard login.');
          setTimeout(() => {
            navigate('/auth/login');
          }, 3000);
          return;
        }

        if (!code) {
          // If no code, try to use stored credentials
          const credentialsStr = sessionStorage.getItem('authentik_credentials');
          
          if (credentialsStr) {
            const credentials = JSON.parse(credentialsStr);
            
            // Use standard login with stored credentials
            await login(credentials.username, credentials.password);
            
            // Clear stored credentials
            sessionStorage.removeItem('authentik_credentials');
            
            setStatus('success');
            
            // Redirect to dashboard or original destination
            let returnTo = '/dashboard';
            
            // Try to parse the state parameter to get the return URL
            if (state) {
              try {
                const stateObj = JSON.parse(atob(state));
                if (stateObj.returnTo) {
                  returnTo = stateObj.returnTo;
                }
              } catch (e) {
                console.error('Failed to parse state parameter:', e);
              }
            }
            
            navigate(returnTo);
            return;
          } else {
            throw new Error('No authentication code received');
          }
        }

        // Exchange the code for a token
        const tokenResponse = await fetch('/api/auth/authentik-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          console.error('Token exchange error:', errorData);
          throw new Error(errorData.error || 'Failed to exchange code for token');
        }

        const tokenData = await tokenResponse.json();
        
        // Login with the token
        await loginWithToken(tokenData.access_token);
        
        setStatus('success');
        
        // Redirect to dashboard or original destination
        let returnTo = '/dashboard';
        
        // Try to parse the state parameter to get the return URL
        if (state) {
          try {
            const stateObj = JSON.parse(atob(state));
            if (stateObj.returnTo) {
              returnTo = stateObj.returnTo;
            }
          } catch (e) {
            console.error('Failed to parse state parameter:', e);
          }
        }
        
        navigate(returnTo);
      } catch (err: any) {
        console.error('Authentication callback error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Authentication failed');
        toast.error(err.message || 'Authentication failed');
      }
    };

    processCallback();
  }, [location, navigate, login, loginWithToken]);

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
                onClick={() => navigate('/auth/login')}
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

export default AuthentikCallback;
