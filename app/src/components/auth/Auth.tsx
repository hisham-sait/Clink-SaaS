import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

interface QuickLoginUser {
  email: string;
  password: string;
  role: string;
  icon: string;
}

const quickLoginUsers: QuickLoginUser[] = [
  { email: 'superadmin@clink.com', password: 'superadmin123', role: 'Super Admin', icon: 'bi-shield-lock' },
  { email: 'platformadmin@clink.com', password: 'platformadmin123', role: 'Platform Admin', icon: 'bi-gear' },
  { email: 'companyadmin@clink.com', password: 'companyadmin123', role: 'Company Admin', icon: 'bi-building' },
  { email: 'manager@clink.com', password: 'manager123', role: 'Company Manager', icon: 'bi-person-workspace' },
  { email: 'viewer@clink.com', password: 'viewer123', role: 'Viewer', icon: 'bi-eye' },
  { email: 'consultant@clink.com', password: 'consultant123', role: 'Consultant', icon: 'bi-briefcase' }
];

const Login = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from);
    } catch (err: any) {
      toast.error(err.message || 'Failed to login');
    }
  };

  const handleQuickLogin = async (user: QuickLoginUser) => {
    try {
      await login(user.email, user.password);
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from);
    } catch (err: any) {
      toast.error(err.message || 'Failed to login');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="card-body">
          <h2 className="text-center mb-4 fw-bold">Login</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
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
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 btn-lg mb-4">
              Login
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
          <div className="quick-login-grid">
            {quickLoginUsers.map((user) => (
              <button
                key={user.email}
                className="quick-login-btn"
                onClick={() => handleQuickLogin(user)}
                type="button"
              >
                <i className={`bi ${user.icon}`}></i>
                {user.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('Registration successful! Please log in.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to register');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="card-body">
          <h2 className="text-center mb-4 fw-bold">Register</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                className="form-control form-control-lg"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
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
                autoComplete="new-password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 btn-lg mb-4">
              Register
            </button>
            <div className="auth-links">
              <span>
                Already have an account?{' '}
                <Link to="/auth/login" className="text-decoration-none">
                  Login
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      toast.success('Password reset instructions have been sent to your email.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="card-body">
          <h2 className="text-center mb-4 fw-bold">Forgot Password</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="mb-4">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 btn-lg mb-4">
              Reset Password
            </button>
            <div className="auth-links">
              <Link to="/auth/login" className="text-decoration-none">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Auth: React.FC = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
};

export default Auth;
