import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div className="container-fluid py-4">
      <h1 className="h3 mb-4">Statutory Dashboard</h1>
      
      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Quick Actions</h5>
              <div className="d-flex gap-2">
                <Link to="/statutory/directors" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Director
                </Link>
                <Link to="/statutory/shareholders" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Shareholder
                </Link>
                <Link to="/statutory/allotments" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  New Share Allotment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-body-secondary">Directors</h6>
              <h2 className="card-title mb-0">0</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-body-secondary">Shareholders</h6>
              <h2 className="card-title mb-0">0</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-body-secondary">Share Capital</h6>
              <h2 className="card-title mb-0">€0</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-body-secondary">Charges</h6>
              <h2 className="card-title mb-0">0</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
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

      {/* Upcoming Tasks */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Upcoming Tasks</h5>
              <div className="text-center text-muted py-4">
                <i className="bi bi-calendar fs-2 mb-2 d-block"></i>
                <p>No upcoming tasks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
