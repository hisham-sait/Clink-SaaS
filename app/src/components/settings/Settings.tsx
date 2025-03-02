import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import styles from './Settings.module.css';
import { UsersService, RolesService, CompaniesService, BillingService, PlansService, handleApiError } from '../../services/settings';

interface DashboardStats {
  totalSettings: number;
  updatedToday: number;
  pendingChanges: number;
  configScore: number;
}

interface DashboardData {
  users: {
    total: number;
    active: number;
    pending: number;
  };
  roles: {
    total: number;
    custom: number;
  };
  companies: {
    total: number;
    active: number;
  };
  billing: {
    pendingInvoices: number;
    activeSubscriptions: number;
  };
}

// Import settings components
import Users from './sections/users/Users';
import Roles from './sections/roles/Roles';
import Companies from './sections/companies/Companies';
import Profile from './sections/profile/Profile';
import Security from './sections/security/Security';
import Preferences from './sections/preferences/Preferences';
import Integrations from './sections/integrations/Integrations';
import Billing from './sections/billing/Billing';
import Notifications from './sections/notifications/Notifications';
import Plans from './sections/plans/Plans';

const SettingsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalSettings: 0,
    updatedToday: 0,
    pendingChanges: 0,
    configScore: 0
  });
  const [data, setData] = useState<DashboardData>({
    users: { total: 0, active: 0, pending: 0 },
    roles: { total: 0, custom: 0 },
    companies: { total: 0, active: 0 },
    billing: { pendingInvoices: 0, activeSubscriptions: 0 }
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load data from all services
        const [users, roles, companies, invoices, subscriptions] = await Promise.all([
          UsersService.getUsers(),
          RolesService.getRoles(),
          CompaniesService.getCompanies(),
          BillingService.getAllInvoices(),
          PlansService.getPlans()
        ]);

        // Calculate stats
        const activeUsers = users?.filter(u => u.status === 'Active')?.length || 0;
        const pendingUsers = users?.filter(u => u.status === 'Pending')?.length || 0;
        const customRoles = roles?.filter(r => r.isCustom)?.length || 0;
        const activeCompanies = companies?.filter(c => c.status === 'Active')?.length || 0;
        const pendingInvoices = invoices?.filter(i => i.status === 'Pending')?.length || 0;
        const activeSubscriptions = subscriptions?.filter(s => s.status === 'Active')?.length || 0;

        // Update data
        setData({
          users: {
            total: users?.length || 0,
            active: activeUsers,
            pending: pendingUsers
          },
          roles: {
            total: roles?.length || 0,
            custom: customRoles
          },
          companies: {
            total: companies?.length || 0,
            active: activeCompanies
          },
          billing: {
            pendingInvoices,
            activeSubscriptions
          }
        });

        // Calculate overall stats
        const totalSettings = (users?.length || 0) + (roles?.length || 0) + (companies?.length || 0);
        const updatedToday = [...(users || []), ...(roles || []), ...(companies || [])].filter(item => {
          const updatedAt = new Date(item.updatedAt);
          const today = new Date();
          return updatedAt.toDateString() === today.toDateString();
        }).length;
        const pendingChanges = pendingUsers + pendingInvoices;

        // Calculate configuration score
        const userScore = users?.length ? (activeUsers / users.length) * 100 : 0;
        const roleScore = (roles?.length || 0) > 0 ? 100 : 0;
        const companyScore = companies?.length ? (activeCompanies / companies.length) * 100 : 0;
        const configScore = Math.round((userScore + roleScore + companyScore) / 3);

        setStats({
          totalSettings,
          updatedToday,
          pendingChanges,
          configScore
        });

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {error && (
        <div className="alert alert-danger mb-4">
          {error}
          <button className="btn btn-link text-danger" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-2">Settings Dashboard</h1>
          <p className="text-muted mb-0">Overview of your account and application settings</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
            <i className="bi bi-download"></i>
            <span>Export Settings</span>
          </button>
          <button className="btn btn-primary d-inline-flex align-items-center gap-2">
            <i className="bi bi-gear"></i>
            <span>Configure</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Total Settings</span>
                <i className="bi bi-gear-fill fs-4 text-primary"></i>
              </div>
              <h3 className="mb-0">{stats.totalSettings}</h3>
              <small className="text-muted">Across all sections</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Updated Today</span>
                <i className="bi bi-clock-history fs-4 text-primary"></i>
              </div>
              <h3 className="mb-0">{stats.updatedToday}</h3>
              <small className="text-muted">Recent changes</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Pending Changes</span>
                <i className="bi bi-exclamation-circle fs-4 text-warning"></i>
              </div>
              <h3 className="mb-0">{stats.pendingChanges}</h3>
              <small className="text-muted">Require attention</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Configuration Score</span>
                <i className="bi bi-shield-check fs-4 text-success"></i>
              </div>
              <h3 className="mb-0">{stats.configScore}%</h3>
              <small className="text-success d-flex align-items-center gap-1">
                <i className="bi bi-arrow-up"></i>
                <span>5% this month</span>
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="row g-4">
        {/* Left Column */}
        <div className="col-lg-8">
          {/* Access Management Section */}
          <div className="mb-4">
            <h2 className={styles.sectionTitle}>Access Management</h2>
            <div className="row g-3">
              {/* Users */}
              <div className="col-md-6 col-lg-4">
                <div className={`card ${styles.card}`}>
                  <div className="card-body">
                    <div className={styles.cardTitle}>
                      <i className={`bi bi-people ${styles.cardIcon}`}></i>
                      <h5 className="mb-0">Users</h5>
                    </div>
                    <p className="card-text text-muted">Manage users and their access permissions</p>
                    <Link to="users" className="btn btn-outline-primary">
                      Manage Users
                    </Link>
                  </div>
                </div>
              </div>

              {/* Roles */}
              <div className="col-md-6 col-lg-4">
                <div className={`card ${styles.card}`}>
                  <div className="card-body">
                    <div className={styles.cardTitle}>
                      <i className={`bi bi-shield ${styles.cardIcon}`}></i>
                      <h5 className="mb-0">Roles</h5>
                    </div>
                    <p className="card-text text-muted">Manage roles and their permissions</p>
                    <Link to="roles" className="btn btn-outline-primary">
                      Manage Roles
                    </Link>
                  </div>
                </div>
              </div>

              {/* Companies */}
              <div className="col-md-6 col-lg-4">
                <div className={`card ${styles.card}`}>
                  <div className="card-body">
                    <div className={styles.cardTitle}>
                      <i className={`bi bi-buildings ${styles.cardIcon}`}></i>
                      <h5 className="mb-0">Companies</h5>
                    </div>
                    <p className="card-text text-muted">Manage companies and their relationships</p>
                    <Link to="companies" className="btn btn-outline-primary">
                      Manage Companies
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* General Settings Section */}
          <div className="mb-4">
            <h2 className={styles.sectionTitle}>General Settings</h2>
            <div className="row g-3">
              {/* Profile */}
              <div className="col-md-6 col-lg-4">
                <div className={`card ${styles.card}`}>
                  <div className="card-body">
                    <div className={styles.cardTitle}>
                      <i className={`bi bi-person ${styles.cardIcon}`}></i>
                      <h5 className="mb-0">Profile</h5>
                    </div>
                    <p className="card-text text-muted">Manage your personal information and preferences</p>
                    <Link to="profile" className="btn btn-outline-primary">
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="col-md-6 col-lg-4">
                <div className={`card ${styles.card}`}>
                  <div className="card-body">
                    <div className={styles.cardTitle}>
                      <i className={`bi bi-shield-lock ${styles.cardIcon}`}></i>
                      <h5 className="mb-0">Security</h5>
                    </div>
                    <p className="card-text text-muted">Manage your password and security settings</p>
                    <Link to="security" className="btn btn-outline-primary">
                      View Security
                    </Link>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="col-md-6 col-lg-4">
                <div className={`card ${styles.card}`}>
                  <div className="card-body">
                    <div className={styles.cardTitle}>
                      <i className={`bi bi-gear ${styles.cardIcon}`}></i>
                      <h5 className="mb-0">Preferences</h5>
                    </div>
                    <p className="card-text text-muted">Customize your application experience</p>
                    <Link to="preferences" className="btn btn-outline-primary">
                      View Preferences
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Settings Section */}
          <div className="mb-4">
            <h2 className={styles.sectionTitle}>System Settings</h2>
            <div className="row g-3">
              {/* Integrations */}
              <div className="col-md-6 col-lg-4">
                <div className={`card ${styles.card}`}>
                  <div className="card-body">
                    <div className={styles.cardTitle}>
                      <i className={`bi bi-plug ${styles.cardIcon}`}></i>
                      <h5 className="mb-0">Integrations</h5>
                    </div>
                    <p className="card-text text-muted">Manage your app integrations</p>
                    <Link to="integrations" className="btn btn-outline-primary">
                      View Integrations
                    </Link>
                  </div>
                </div>
              </div>

              {/* Billing */}
              <div className="col-md-6 col-lg-4">
                <div className={`card ${styles.card}`}>
                  <div className="card-body">
                    <div className={styles.cardTitle}>
                      <i className={`bi bi-credit-card ${styles.cardIcon}`}></i>
                      <h5 className="mb-0">Billing</h5>
                    </div>
                    <p className="card-text text-muted">Manage your subscription and payments</p>
                    <Link to="billing" className="btn btn-outline-primary">
                      View Billing
                    </Link>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="col-md-6 col-lg-4">
                <div className={`card ${styles.card}`}>
                  <div className="card-body">
                    <div className={styles.cardTitle}>
                      <i className={`bi bi-bell ${styles.cardIcon}`}></i>
                      <h5 className="mb-0">Notifications</h5>
                    </div>
                    <p className="card-text text-muted">Configure your notification preferences</p>
                    <Link to="notifications" className="btn btn-outline-primary">
                      View Notifications
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Right Column - Sidebar */}
        <div className="col-lg-4">
          {/* Configuration Progress */}
          <div className="card mb-4">
            <div className="card-body">
              <h6 className="card-subtitle mb-3 text-muted">Configuration Progress</h6>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small">User Management</span>
                  <span className="small">{data.users.total ? Math.round((data.users.active / data.users.total) * 100) : 0}%</span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: `${data.users.total ? (data.users.active / data.users.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small">Company Setup</span>
                  <span className="small">{data.companies.total ? Math.round((data.companies.active / data.companies.total) * 100) : 0}%</span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar bg-info" 
                    role="progressbar" 
                    style={{ width: `${data.companies.total ? (data.companies.active / data.companies.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small">Billing Status</span>
                  <span className="small">
                    {(data.billing.activeSubscriptions + data.billing.pendingInvoices) > 0 
                      ? Math.round((data.billing.activeSubscriptions / (data.billing.activeSubscriptions + data.billing.pendingInvoices)) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    role="progressbar" 
                    style={{ 
                      width: `${(data.billing.activeSubscriptions + data.billing.pendingInvoices) > 0 
                        ? (data.billing.activeSubscriptions / (data.billing.activeSubscriptions + data.billing.pendingInvoices)) * 100
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Changes */}
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-3 text-muted">Recent Changes</h6>
              {data.users.pending > 0 && (
                <div className="list-group-item px-0">
                  <div className="d-flex align-items-start gap-3">
                    <div className="bg-warning bg-opacity-10 rounded p-2">
                      <i className="bi bi-person-plus text-warning"></i>
                    </div>
                    <div>
                      <p className="mb-1">{data.users.pending} pending user invitations</p>
                      <div className="d-flex align-items-center gap-2 small">
                        <span className="text-muted">Users</span>
                        <span className="text-muted">•</span>
                        <span className="text-muted">Requires action</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {data.billing.pendingInvoices > 0 && (
                <div className="list-group-item px-0">
                  <div className="d-flex align-items-start gap-3">
                    <div className="bg-danger bg-opacity-10 rounded p-2">
                      <i className="bi bi-credit-card text-danger"></i>
                    </div>
                    <div>
                      <p className="mb-1">{data.billing.pendingInvoices} pending invoices</p>
                      <div className="d-flex align-items-center gap-2 small">
                        <span className="text-muted">Billing</span>
                        <span className="text-muted">•</span>
                        <span className="text-muted">Requires payment</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {data.users.pending === 0 && data.billing.pendingInvoices === 0 && (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-check-circle fs-2 mb-2 d-block"></i>
                  <p>All settings are up to date</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Settings: React.FC = () => {
  return (
    <div className="d-flex flex-column h-100">
      <div className="flex-grow-1">
        <Routes>
          <Route path="dashboard" element={<SettingsDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<Roles />} />
          <Route path="companies" element={<Companies />} />
          <Route path="profile" element={<Profile />} />
          <Route path="security" element={<Security />} />
          <Route path="preferences" element={<Preferences />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="billing" element={<Billing />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="plans" element={<Plans />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Settings;
