import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3">Welcome, {user?.name}</h1>
          <p className="text-muted">
            {user?.role} Dashboard
          </p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-body-secondary">Companies</h6>
              <h2 className="card-title mb-0">0</h2>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-body-secondary">Tasks</h6>
              <h2 className="card-title mb-0">0</h2>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-body-secondary">Notifications</h6>
              <h2 className="card-title mb-0">0</h2>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-body-secondary">Alerts</h6>
              <h2 className="card-title mb-0">0</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Recent Activity</h5>
              <div className="text-center text-muted py-4">
                <i className="bi bi-clock fs-2 mb-2 d-block"></i>
                <p>No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <div className="d-flex flex-column h-100">
      <div className="flex-grow-1">
        <Routes>
          <Route path="/:role?" element={<UserDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
