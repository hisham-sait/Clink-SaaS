import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const AuthentikLogin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from);
    }
  }, [user, navigate, location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First check if Authentik is available
      try {
        const response = await fetch('http://localhost:9000/api/v3/core/applications/', { 
          method: 'GET',
          mode: 'no-cors' // This allows us to at least attempt the request
        });
        
        // If we get here, Authentik might be available
        // Redirect to Authentik login endpoint
        const authentikUrl = new URL('http://localhost:9000/application/o/authorize/');
        
        // Add OAuth parameters - Get client_id from backend to avoid hardcoding
        const clientId = 'clink-app'; // Changed from 'clink-superset' to 'clink-app'
        authentikUrl.searchParams.append('client_id', clientId);
        authentikUrl.searchParams.append('redirect_uri', `${window.location.origin}/auth/callback`);
        authentikUrl.searchParams.append('response_type', 'code');
        authentikUrl.searchParams.append('scope', 'openid email profile');
        authentikUrl.searchParams.append('state', btoa(JSON.stringify({
          returnTo: (location.state as any)?.from?.pathname || '/dashboard'
        })));
        
        // Store credentials in session storage for the callback
        sessionStorage.setItem('authentik_credentials', JSON.stringify({
          username: formData.username,
          password: formData.password
        }));
        
        // Redirect to Authentik
        window.location.href = authentikUrl.toString();
      } catch (error) {
        // Authentik is not available, fall back to regular login
        toast.error('SSO service is not available. Please use standard login.');
        navigate('/auth/login');
      }
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || 'Failed to login');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="card-body">
          <div className="text-center mb-4">
            <img 
              src="/logo/logo.svg" 
              alt="Logo" 
              className="auth-logo mb-3" 
              style={{ height: '40px' }} 
            />
            <h2 className="fw-bold">Login with Authentik</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control form-control-lg"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100 btn-lg mb-4"
              disabled={loading}
            >
              {loading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </span>
              ) : (
                'Login with SSO'
              )}
            </button>
            
            <div className="auth-links mb-4">
              <Link to="/auth/forgot-password" className="text-decoration-none d-block mb-3">
                Forgot Password?
              </Link>
              <span>
                Don't have an account?{' '}
                <Link to="/auth/register" className="text-decoration-none">
                  Register
                </Link>
              </span>
            </div>
          </form>

          <div className="auth-divider"></div>
          <div className="mt-3 text-center">
            <Link to="/auth/login" className="btn btn-outline-secondary">
              Use Standard Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthentikLogin;
