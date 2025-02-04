import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const SettingsDashboard: React.FC = () => {
  return (
    <div className="container-fluid py-4">
      <h1 className="h3 mb-4">Settings</h1>
      <div className="row g-4">
        <div className="col-md-6 col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-building me-2"></i>
                Company Settings
              </h5>
              <p className="card-text text-muted">Manage your company details, branding, and preferences.</p>
              <button className="btn btn-primary">
                Manage Company
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-people me-2"></i>
                User Management
              </h5>
              <p className="card-text text-muted">Add, remove, and manage user access and permissions.</p>
              <button className="btn btn-primary">
                Manage Users
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-shield-check me-2"></i>
                Security
              </h5>
              <p className="card-text text-muted">Configure security settings and authentication options.</p>
              <button className="btn btn-primary">
                Security Settings
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-credit-card me-2"></i>
                Billing & Plans
              </h5>
              <p className="card-text text-muted">View and manage your subscription and billing details.</p>
              <button className="btn btn-primary">
                Billing Settings
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-bell me-2"></i>
                Notifications
              </h5>
              <p className="card-text text-muted">Configure email and system notification preferences.</p>
              <button className="btn btn-primary">
                Notification Settings
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Integrations
              </h5>
              <p className="card-text text-muted">Connect and manage third-party integrations.</p>
              <button className="btn btn-primary">
                Manage Integrations
              </button>
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
          <Route path="/" element={<SettingsDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Settings;
