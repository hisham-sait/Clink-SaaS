import React from 'react';
import { UsersService } from '../../../../services/settings';
import type { User } from '../../../../services/settings/types';

interface ViewUserModalProps {
  show: boolean;
  onHide: () => void;
  user?: User;
  onEdit: () => void;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ show, onHide, user, onEdit }) => {
  if (!user) return null;

  const getFullName = () => {
    return [user.title, user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ');
  };

  const getStatusClass = () => {
    switch (user.status) {
      case 'Active':
        return 'text-bg-success';
      case 'Pending':
        return 'text-bg-warning';
      case 'Suspended':
        return 'text-bg-danger';
      default:
        return 'text-bg-secondary';
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleString();
  };

  return (
    <div className={`modal ${show ? 'd-block' : ''}`} tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">User Details</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <div className="text-center mb-4">
              <div 
                className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mb-2"
                style={{ width: '80px', height: '80px' }}
              >
                <i className="bi bi-person-circle fs-1 text-secondary"></i>
              </div>
              <h5 className="mb-1">{getFullName()}</h5>
              <p className="text-muted mb-0">{user.roles.length > 0 ? user.roles[0].name : 'No Role'}</p>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-3 text-muted">Personal Information</h6>
                    
                    <div className="mb-2">
                      <small className="text-muted d-block">Title</small>
                      <span>{user.title || 'Not specified'}</span>
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted d-block">Email</small>
                      <span>{user.email}</span>
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted d-block">Phone</small>
                      <span>{user.phone || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-3 text-muted">Work Information</h6>
                    
                    <div className="mb-2">
                      <small className="text-muted d-block">Department</small>
                      <span>{user.department || 'Not specified'}</span>
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted d-block">Job Title</small>
                      <span>{user.jobTitle || 'Not specified'}</span>
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted d-block">Status</small>
                      <span className={`badge ${getStatusClass()}`}>{user.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-3 text-muted">Account Information</h6>
                    
                    <div className="mb-2">
                      <small className="text-muted d-block">Last Login</small>
                      <span>{formatDate(user.lastLogin) || 'Never'}</span>
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted d-block">Invited By</small>
                      <span>{user.invitedBy || 'Not available'}</span>
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted d-block">Joined</small>
                      <span>{formatDate(user.joinedAt) || 'Not joined yet'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={onEdit}>
              Edit User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;
