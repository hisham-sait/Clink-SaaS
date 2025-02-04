import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const HelpDashboard: React.FC = () => {
  return (
    <div className="container-fluid py-4">
      <h1 className="h3 mb-4">Help Center</h1>
      
      <div className="row g-4">
        <div className="col-md-6 col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-book me-2"></i>
                Documentation
              </h5>
              <p className="card-text text-muted">Browse our comprehensive documentation and guides.</p>
              <button className="btn btn-primary">
                View Documentation
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-question-circle me-2"></i>
                FAQs
              </h5>
              <p className="card-text text-muted">Find answers to commonly asked questions.</p>
              <button className="btn btn-primary">
                Browse FAQs
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-headset me-2"></i>
                Support
              </h5>
              <p className="card-text text-muted">Get in touch with our support team.</p>
              <button className="btn btn-primary">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Quick Start Guide</h5>
              <div className="list-group">
                <a href="#" className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">Getting Started</h6>
                    <small>5 min read</small>
                  </div>
                  <p className="mb-1">Learn the basics of setting up your account and workspace.</p>
                </a>
                <a href="#" className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">Managing Companies</h6>
                    <small>8 min read</small>
                  </div>
                  <p className="mb-1">How to add and manage companies in the system.</p>
                </a>
                <a href="#" className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">User Management</h6>
                    <small>10 min read</small>
                  </div>
                  <p className="mb-1">Learn about user roles and permissions.</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Documentation: React.FC = () => (
  <div className="container-fluid py-4">
    <h1 className="h3 mb-4">Documentation</h1>
    <div className="alert alert-info">Documentation section coming soon.</div>
  </div>
);

const FAQs: React.FC = () => (
  <div className="container-fluid py-4">
    <h1 className="h3 mb-4">Frequently Asked Questions</h1>
    <div className="alert alert-info">FAQs section coming soon.</div>
  </div>
);

const Support: React.FC = () => (
  <div className="container-fluid py-4">
    <h1 className="h3 mb-4">Support</h1>
    <div className="alert alert-info">Support section coming soon.</div>
  </div>
);

const Tutorials: React.FC = () => (
  <div className="container-fluid py-4">
    <h1 className="h3 mb-4">Tutorials</h1>
    <div className="alert alert-info">Tutorials section coming soon.</div>
  </div>
);

const Help: React.FC = () => {
  return (
    <div className="d-flex flex-column h-100">
      <div className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HelpDashboard />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/support" element={<Support />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="*" element={<Navigate to="/help" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Help;
