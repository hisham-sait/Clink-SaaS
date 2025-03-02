import React, { useState, useEffect } from 'react';
import { UsersService, RolesService, handleApiError } from '../../../../services/settings';
import type { User } from '../../../../services/settings/types';
import type { RolesTypes } from '../../../../services/settings';

interface UserModalProps {
  show: boolean;
  onHide: () => void;
  user?: User;
  onSuccess: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ show, onHide, user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<RolesTypes.Role[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    title: '',
    department: '',
    jobTitle: '',
    phone: '',
    roles: [] as string[],
    password: '',
    confirmPassword: '',
    status: 'Active' as User['status']
  });

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await RolesService.getRoles();
        setRoles(data.filter(role => role.status === 'Active'));
      } catch (err) {
        setError(handleApiError(err));
      }
    };

    if (show) {
      loadRoles();
      if (user) {
        setFormData({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          title: user.title || '',
          department: user.department || '',
          jobTitle: user.jobTitle || '',
          phone: user.phone || '',
          roles: user.roles.map(role => role.id),
          password: '',
          confirmPassword: '',
          status: user.status
        });
      } else {
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          title: '',
          department: '',
          jobTitle: '',
          phone: '',
          roles: [],
          password: '',
          confirmPassword: '',
          status: 'Active'
        });
      }
    }
  }, [show, user]);

  const validateForm = () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.firstName) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName) {
      setError('Last name is required');
      return false;
    }
    if (!user && !formData.password) {
      setError('Password is required for new users');
      return false;
    }
    if (!user && formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (!user && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.roles.length === 0) {
      setError('Please select at least one role');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const userData = {
        ...formData,
        roles: formData.roles.map(id => ({ id }))
      };
      delete (userData as any).confirmPassword;

      if (user) {
        await UsersService.updateUser(user.id, userData);
      } else {
        await UsersService.createUser(userData);
      }

      onSuccess();
      onHide();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal ${show ? 'd-block' : ''}`} tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{user ? 'Edit User' : 'Add User'}</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger mb-3">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Mr., Ms., Dr."
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.firstName}
                    onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.lastName}
                    onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Role</label>
                  <select
                    multiple
                    className="form-select"
                    value={formData.roles}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      roles: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    required
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.department}
                    onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Enter department"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.jobTitle}
                    onChange={e => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="Enter job title"
                  />
                </div>

                {!user && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.password}
                        onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter password"
                        required={!user}
                        minLength={8}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.confirmPassword}
                        onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm password"
                        required={!user}
                      />
                    </div>
                  </>
                )}

                {user && (
                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        status: e.target.value as User['status']
                      }))}
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : (user ? 'Save Changes' : 'Add User')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
