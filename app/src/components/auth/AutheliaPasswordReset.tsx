import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.css';

const AutheliaPasswordReset: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [formData, setFormData] = useState({
    username: '',
    token: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Check if we have a token in the URL
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      setFormData(prev => ({ ...prev, token }));
      setStep('reset');
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Redirect to Authelia password reset endpoint
      const autheliaUrl = new URL('http://localhost:9091/api/reset-password');
      
      // Add return URL as a parameter
      const returnUrl = new URL(window.location.origin);
      returnUrl.pathname = '/auth/reset-password';
      autheliaUrl.searchParams.append('rd', returnUrl.toString());
      
      // Redirect to Authelia
      window.location.href = autheliaUrl.toString();
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || 'Failed to request password reset');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);

    try {
      // Construct the reset URL with token
      const autheliaUrl = new URL('http://localhost:9091/api/reset-password');
      autheliaUrl.searchParams.append('token', formData.token);
      
      // Add return URL as a parameter
      const returnUrl = new URL(window.location.origin);
      returnUrl.pathname = '/auth/login';
      autheliaUrl.searchParams.append('rd', returnUrl.toString());
      
      // Redirect to Authelia
      window.location.href = autheliaUrl.toString();
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || 'Failed to reset password');
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
            <h2 className="fw-bold">
              {step === 'request' ? 'Reset Password' : 'Set New Password'}
            </h2>
          </div>
          
          {step === 'request' ? (
            <form onSubmit={handleRequestSubmit} className="auth-form">
              <div className="mb-4">
                <p className="text-muted mb-4">
                  Enter your username and we'll send you instructions to reset your password.
                </p>
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
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
                    Processing...
                  </span>
                ) : (
                  'Request Password Reset'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="auth-form">
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control form-control-lg"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-control form-control-lg"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
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
                    Resetting Password...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
          
          <div className="auth-links">
            <Link to="/auth/login" className="text-decoration-none">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutheliaPasswordReset;
