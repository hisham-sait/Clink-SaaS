import React, { useState, useEffect } from 'react';
import { RolesService, handleApiError } from '../../../../services/settings';
import type { Role, Permission, RoleTemplate } from '../../../../services/settings/roles';

interface RoleModalProps {
  show: boolean;
  onHide: () => void;
  role?: Role;
  onSuccess: () => void;
}

const RoleModal: React.FC<RoleModalProps> = ({ show, onHide, role, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [roleStats, setRoleStats] = useState<{
    totalUsers: number;
    activeUsers: number;
    lastAssigned?: string;
  }>();

  // Form state
  const [creationMethod, setCreationMethod] = useState<'scratch' | 'template'>('scratch');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scope: 'Company' as Role['scope'],
    status: 'Active' as Role['status'],
    maxUsers: '',
    isCustom: true,
    permissions: {} as Record<string, boolean>
  });

  useEffect(() => {
    const loadData = async () => {
      if (show) {
        try {
          // Load permissions
          const permissions = await RolesService.getAllPermissions();
          setAllPermissions(permissions);

          // Initialize permissions state
          const permissionState: Record<string, boolean> = {};
          permissions.forEach(permission => {
            permissionState[permission.id] = false;
          });
          setFormData(prev => ({ ...prev, permissions: permissionState }));

          // Load templates if adding new role
          if (!role) {
            await loadTemplates();
          }

          // Load role data if editing
          if (role) {
            await loadRoleData(role);
          }
        } catch (err) {
          setError(handleApiError(err));
        }
      }
    };

    loadData();
  }, [show, role]);

  const loadTemplates = async () => {
    try {
      const templates = await RolesService.getRoleTemplates();
      setRoleTemplates(templates);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const loadRoleData = async (role: Role) => {
    try {
      // Load role stats
      const stats = await RolesService.getRoleStats(role.id);
      setRoleStats(stats);

      // Set form data
      const permissionState: Record<string, boolean> = {};
      allPermissions.forEach(permission => {
        permissionState[permission.id] = role.permissions.some(p => p.id === permission.id);
      });

      setFormData({
        name: role.name,
        description: role.description || '',
        scope: role.scope,
        status: role.status,
        maxUsers: role.metadata?.maxUsers?.toString() || '',
        isCustom: role.isCustom,
        permissions: permissionState
      });
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = roleTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        name: template.name,
        description: template.description || ''
      }));
    }
  };

  const getModules = (): string[] => {
    return [...new Set(allPermissions.map(p => p.module))];
  };

  const getModulePermissions = (module: string): Permission[] => {
    return allPermissions.filter(p => p.module === module);
  };

  const getSelectedPermissionCount = (module: string): number => {
    return getModulePermissions(module).filter(p => formData.permissions[p.id]).length;
  };

  const selectAllPermissions = () => {
    const newPermissions = { ...formData.permissions };
    allPermissions.forEach(permission => {
      newPermissions[permission.id] = true;
    });
    setFormData(prev => ({ ...prev, permissions: newPermissions }));
  };

  const clearAllPermissions = () => {
    const newPermissions = { ...formData.permissions };
    allPermissions.forEach(permission => {
      newPermissions[permission.id] = false;
    });
    setFormData(prev => ({ ...prev, permissions: newPermissions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (creationMethod === 'template' && !role) {
        // Create from template
        await RolesService.createRoleFromTemplate(selectedTemplate);
      } else {
        // Get selected permissions
        const selectedPermissions = allPermissions.filter(p => formData.permissions[p.id]);

        const roleData = {
          name: formData.name,
          description: formData.description,
          scope: formData.scope,
          status: formData.status,
          permissions: selectedPermissions.map(p => ({ id: p.id })),
          isCustom: formData.isCustom,
          metadata: {
            maxUsers: formData.maxUsers ? parseInt(formData.maxUsers) : undefined
          }
        };

        if (role) {
          await RolesService.updateRole(role.id, roleData);
        } else {
          await RolesService.createRole(roleData);
        }
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
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{role ? 'Edit Role' : 'Add Role'}</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger mb-3">
                  {error}
                </div>
              )}

              {/* Creation Method (only for new roles) */}
              {!role && (
                <div className="mb-4">
                  <div className="btn-group w-100" role="group">
                    <input
                      type="radio"
                      className="btn-check"
                      name="creationMethod"
                      id="fromScratch"
                      value="scratch"
                      checked={creationMethod === 'scratch'}
                      onChange={e => setCreationMethod(e.target.value as 'scratch' | 'template')}
                    />
                    <label className="btn btn-outline-primary" htmlFor="fromScratch">
                      <i className="bi bi-plus-circle me-2"></i>
                      Create from Scratch
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="creationMethod"
                      id="fromTemplate"
                      value="template"
                      checked={creationMethod === 'template'}
                      onChange={e => setCreationMethod(e.target.value as 'scratch' | 'template')}
                    />
                    <label className="btn btn-outline-primary" htmlFor="fromTemplate">
                      <i className="bi bi-file-earmark-text me-2"></i>
                      Use Template
                    </label>
                  </div>
                </div>
              )}

              {/* Template Selection */}
              {!role && creationMethod === 'template' && (
                <div className="mb-4">
                  <label className="form-label">Select Template</label>
                  <div className="list-group">
                    {roleTemplates.map(template => (
                      <button
                        key={template.id}
                        type="button"
                        className={`list-group-item list-group-item-action ${selectedTemplate === template.id ? 'active' : ''}`}
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{template.name}</h6>
                            <p className="mb-1 small text-muted">{template.description}</p>
                          </div>
                          {selectedTemplate === template.id && (
                            <i className="bi bi-check-lg"></i>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="mb-4">
                <h6 className="text-muted mb-3">Basic Information</h6>
                
                <div className="mb-3">
                  <label className="form-label">Role Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter role name"
                    required
                    readOnly={role?.isSystem}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter role description"
                    rows={3}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Scope</label>
                  <select
                    className="form-select"
                    value={formData.scope}
                    onChange={e => setFormData(prev => ({ ...prev, scope: e.target.value as Role['scope'] }))}
                    disabled={role?.isSystem}
                  >
                    <option value="Global">Global</option>
                    <option value="Company">Company</option>
                    <option value="Team">Team</option>
                  </select>
                </div>

                {role && (
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as Role['status'] }))}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Deprecated">Deprecated</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Permissions */}
              {(!role || creationMethod === 'scratch') && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="text-muted mb-0">Permissions</h6>
                    <div className="btn-group btn-group-sm">
                      <button type="button" className="btn btn-outline-primary" onClick={selectAllPermissions}>
                        Select All
                      </button>
                      <button type="button" className="btn btn-outline-primary" onClick={clearAllPermissions}>
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="accordion" id="permissionsAccordion">
                    {getModules().map(module => (
                      <div className="accordion-item" key={module}>
                        <h2 className="accordion-header">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#${module}Collapse`}
                          >
                            <div className="d-flex justify-content-between align-items-center w-100 me-3">
                              <span>{module.charAt(0).toUpperCase() + module.slice(1)} Permissions</span>
                              <small className="badge bg-primary">
                                {getSelectedPermissionCount(module)}/{getModulePermissions(module).length}
                              </small>
                            </div>
                          </button>
                        </h2>
                        <div
                          id={`${module}Collapse`}
                          className="accordion-collapse collapse"
                          data-bs-parent="#permissionsAccordion"
                        >
                          <div className="accordion-body">
                            <div className="list-group">
                              {getModulePermissions(module).map(permission => (
                                <div className="list-group-item" key={permission.id}>
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={permission.id}
                                      checked={formData.permissions[permission.id] || false}
                                      onChange={e => {
                                        const newPermissions = { ...formData.permissions };
                                        newPermissions[permission.id] = e.target.checked;
                                        setFormData(prev => ({ ...prev, permissions: newPermissions }));
                                      }}
                                      disabled={role?.isSystem}
                                    />
                                    <label className="form-check-label" htmlFor={permission.id}>
                                      <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                          <div>{permission.name}</div>
                                          <small className="text-muted">{permission.description}</small>
                                        </div>
                                        <span className={`badge bg-${RolesService.getAccessLevelBadgeColor(permission.accessLevel)}`}>
                                          {permission.accessLevel}
                                        </span>
                                      </div>
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Settings */}
              <div className="mb-4">
                <h6 className="text-muted mb-3">Additional Settings</h6>
                
                <div className="mb-3">
                  <label className="form-label">Maximum Users</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.maxUsers}
                    onChange={e => setFormData(prev => ({ ...prev, maxUsers: e.target.value }))}
                    placeholder="Enter maximum number of users"
                  />
                </div>

                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isCustom"
                    checked={formData.isCustom}
                    onChange={e => setFormData(prev => ({ ...prev, isCustom: e.target.checked }))}
                    disabled={role?.isSystem}
                  />
                  <label className="form-check-label" htmlFor="isCustom">
                    Custom Role
                  </label>
                </div>
              </div>

              {/* Usage Stats (only for editing) */}
              {role && roleStats && (
                <div className="mb-4">
                  <h6 className="text-muted mb-3">Usage Statistics</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="card border-0 bg-light">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <small className="text-muted">Total Users</small>
                              <h5 className="mb-0">{roleStats.totalUsers}</h5>
                            </div>
                            <i className="bi bi-people fs-4 text-primary"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-0 bg-light">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <small className="text-muted">Active Users</small>
                              <h5 className="mb-0">{roleStats.activeUsers}</h5>
                            </div>
                            <i className="bi bi-person-check fs-4 text-success"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                    {roleStats.lastAssigned && (
                      <div className="col-md-4">
                        <div className="card border-0 bg-light">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <small className="text-muted">Last Assigned</small>
                                <h5 className="mb-0">{new Date(roleStats.lastAssigned).toLocaleDateString()}</h5>
                              </div>
                              <i className="bi bi-calendar-check fs-4 text-primary"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || (role?.isSystem ?? false)}
              >
                {loading ? 'Saving...' : role ? 'Save Changes' : 'Create Role'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleModal;
