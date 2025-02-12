import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import * as PlansService from '../../../../services/settings/plans';
import { handleApiError } from '../../../../services/settings';
import type { Plan, Company } from '../../../../services/settings/types';
import PlanModal from './PlanModal';
import DeletePlanModal from './DeletePlanModal';
import SelectPlanModal from './SelectPlanModal';
import { Button, Card, Row, Col, Badge, Table, Form, Dropdown, ButtonGroup } from 'react-bootstrap';

const Plans: React.FC = () => {
  const { user } = useAuth();
  const userRoles = user?.roles || [];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [billingCompany, setBillingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCycle, setFilterCycle] = useState('');

  // Modal states
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);

  const canManagePlans = PlansService.canManagePlans(userRoles);
  const canViewPlans = PlansService.canViewPlans(userRoles);
  const canChangePlan = PlansService.canChangePlan(userRoles);

  useEffect(() => {
    if (canViewPlans) {
      loadPlans();
      loadCurrentPlan();
    }
  }, [canViewPlans]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await PlansService.getPlans();
      setPlans(data);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentPlan = async () => {
    try {
      const data = await PlansService.getCurrentUserPlan();
      setCurrentPlan(data.plan);
      setBillingCompany(data.billingCompany);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        setError(handleApiError(error));
      }
    }
  };

  const handleAddPlan = async (plan: Partial<Plan>) => {
    try {
      await PlansService.createPlan(plan);
      loadPlans();
      setShowAddModal(false);
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleEditPlan = async (id: string, plan: Partial<Plan>) => {
    try {
      await PlansService.updatePlan(id, plan);
      loadPlans();
      setShowEditModal(false);
      setSelectedPlan(null);
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleDeletePlan = async (plan: Plan) => {
    try {
      await PlansService.deletePlan(plan.id);
      loadPlans();
      setShowDeleteModal(false);
      setSelectedPlan(null);
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const handleSelectPlan = async (planId: string, billingCompanyId: string) => {
    try {
      await PlansService.selectPlan(planId, billingCompanyId);
      loadCurrentPlan();
      setShowSelectModal(false);
      setSelectedPlan(null);
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  const getActivePlansCount = () => plans.filter(p => p.status === 'Active').length;
  const getCustomPlansCount = () => plans.filter(p => p.isCustom).length;
  const getStandardPlansCount = () => plans.filter(p => !p.isCustom).length;

  const getFilteredPlans = () => {
    return plans.filter(plan => {
      const matchesSearch = !searchTerm || 
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !filterStatus || plan.status === filterStatus;
      const matchesCycle = !filterCycle || plan.billingCycle === filterCycle;

      return matchesSearch && matchesStatus && matchesCycle;
    });
  };

  const getActivePlans = () => plans.filter(plan => plan.status === 'Active');

  const isCurrentPlan = (plan: Plan) => currentPlan?.id === plan.id;

  const canSelectPlan = (plan: Plan) => {
    return plan.status === 'Active' && !isCurrentPlan(plan) && canChangePlan;
  };

  if (!canViewPlans) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          You do not have permission to view plans.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">Plans</h1>
              <p className="text-muted mb-0">Manage subscription plans and pricing</p>
            </div>
            {canManagePlans && (
              <Button 
                variant="primary"
                className="d-inline-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
              >
                <i className="bi bi-plus-lg"></i>
                <span>Add Plan</span>
              </Button>
            )}
          </div>

          {/* Metrics */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted mb-1">Total Plans</div>
                      <h3 className="mb-0">{plans.length}</h3>
                      <small className="text-muted">All plans</small>
                    </div>
                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                      <i className="bi bi-box text-primary" style={{ fontSize: '24px' }}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted mb-1">Active Plans</div>
                      <h3 className="mb-0">{getActivePlansCount()}</h3>
                      <small className="text-muted">Currently active plans</small>
                    </div>
                    <div className="bg-success bg-opacity-10 p-3 rounded">
                      <i className="bi bi-check-circle text-success" style={{ fontSize: '24px' }}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted mb-1">Custom Plans</div>
                      <h3 className="mb-0">{getCustomPlansCount()}</h3>
                      <small className="text-muted">Custom pricing plans</small>
                    </div>
                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                      <i className="bi bi-gear text-primary" style={{ fontSize: '24px' }}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted mb-1">Standard Plans</div>
                      <h3 className="mb-0">{getStandardPlansCount()}</h3>
                      <small className="text-muted">Standard pricing plans</small>
                    </div>
                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                      <i className="bi bi-box-seam text-primary" style={{ fontSize: '24px' }}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Plans Table (Admin View) */}
          {canManagePlans && (
            <Card className="mb-4">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
                <h5 className="mb-0">Manage Plans</h5>
                <div className="d-flex gap-2">
                  <div className="input-group">
                    <span className="input-group-text border-end-0 bg-white">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <Form.Control
                      type="text"
                      className="border-start-0"
                      placeholder="Search plans..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Form.Select
                    className="w-auto"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Deprecated">Deprecated</option>
                  </Form.Select>
                  <Form.Select
                    className="w-auto"
                    value={filterCycle}
                    onChange={e => setFilterCycle(e.target.value)}
                  >
                    <option value="">All Cycles</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Quarterly">Quarterly</option>
                  </Form.Select>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th className="text-uppercase small fw-semibold text-secondary">Plan</th>
                        <th className="text-uppercase small fw-semibold text-secondary">Price</th>
                        <th className="text-uppercase small fw-semibold text-secondary">Billing Cycle</th>
                        <th className="text-uppercase small fw-semibold text-secondary">Users</th>
                        <th className="text-uppercase small fw-semibold text-secondary">Companies</th>
                        <th className="text-uppercase small fw-semibold text-secondary">Status</th>
                        <th className="text-uppercase small fw-semibold text-secondary">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredPlans().map(plan => (
                        <tr key={plan.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <i className={`bi ${plan.isCustom ? 'bi-gear' : 'bi-box-seam'}`}></i>
                              <div>
                                <span className="fw-medium">{plan.name}</span>
                                <small className="d-block text-muted">{plan.description}</small>
                              </div>
                            </div>
                          </td>
                          <td>{PlansService.formatPrice(plan.price, plan.billingCycle)}</td>
                          <td>{plan.billingCycle}</td>
                          <td>{PlansService.formatLimit(plan.maxUsers)}</td>
                          <td>{PlansService.formatLimit(plan.maxCompanies)}</td>
                          <td>
                            <Badge bg={PlansService.getStatusBadgeColor(plan.status)}>
                              {plan.status}
                            </Badge>
                          </td>
                          <td className="text-end">
                            <ButtonGroup>
                              <Button
                                variant="link"
                                className="btn-sm text-body px-2"
                                onClick={() => {
                                  setSelectedPlan(plan);
                                  setShowEditModal(true);
                                }}
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                              <Button
                                variant="link"
                                className="btn-sm text-danger px-2"
                                onClick={() => {
                                  setSelectedPlan(plan);
                                  setShowDeleteModal(true);
                                }}
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                              <Dropdown as={ButtonGroup}>
                                <Dropdown.Toggle split variant="link" className="btn-sm text-body px-2">
                                  <i className="bi bi-three-dots-vertical"></i>
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end">
                                  <Dropdown.Item onClick={() => {
                                    setSelectedPlan(plan);
                                    setShowEditModal(true);
                                  }}>
                                    <i className="bi bi-pencil me-2"></i>
                                    Edit Plan
                                  </Dropdown.Item>
                                  <Dropdown.Item 
                                    onClick={() => {
                                      setSelectedPlan(plan);
                                      setShowDeleteModal(true);
                                    }}
                                    className="text-danger"
                                  >
                                    <i className="bi bi-trash me-2"></i>
                                    Delete Plan
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </ButtonGroup>
                          </td>
                        </tr>
                      ))}
                      {getFilteredPlans().length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-5">
                            <div className="d-flex flex-column align-items-center">
                              <div className="bg-light p-4 rounded-circle mb-3">
                                <i className="bi bi-box-seam text-muted" style={{ fontSize: '32px' }}></i>
                              </div>
                              <h5 className="text-muted mb-2">No Plans Found</h5>
                              <p className="text-muted mb-4">Get started by adding your first plan</p>
                              <div>
                                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                                  <i className="bi bi-plus-lg me-2"></i> Add Plan
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Current Plan Banner */}
          {currentPlan && (
            <Card className="mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">Current Plan: {currentPlan.name}</h5>
                    <p className="text-muted mb-0">
                      {PlansService.formatPrice(currentPlan.price, currentPlan.billingCycle)}
                    </p>
                  </div>
                  <Badge bg={PlansService.getStatusBadgeColor(currentPlan.status)}>
                    {currentPlan.status}
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Plans Grid (Customer View) */}
          <Card>
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0">Available Plans</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-4">
                {getActivePlans().map(plan => (
                  <Col key={plan.id} md={3}>
                    <Card className={`h-100 ${isCurrentPlan(plan) ? 'border-primary' : ''}`}>
                      <Card.Header className="bg-transparent border-0 pt-4 pb-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">{plan.name}</h5>
                          <i className={`bi ${plan.isCustom ? 'bi-gear' : 'bi-box-seam'}`}></i>
                        </div>
                      </Card.Header>

                      <Card.Body>
                        <div className="mb-3">
                          <h3 className="mb-0">
                            ${plan.price}
                            <small className="text-muted fs-6">/{plan.billingCycle.toLowerCase()}</small>
                          </h3>
                        </div>
                        
                        <p className="text-muted mb-4">{plan.description}</p>

                        <ul className="list-unstyled mb-4">
                          {PlansService.getAllowedFeatures(plan, userRoles).map((feature, index) => (
                            <li key={index} className="mb-2">
                              <i className="bi bi-check2 text-success me-2"></i>
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <div className="d-flex justify-content-between text-muted mb-2">
                          <span>Users</span>
                          <span>{PlansService.formatLimit(plan.maxUsers)}</span>
                        </div>
                        <div className="d-flex justify-content-between text-muted">
                          <span>Companies</span>
                          <span>{PlansService.formatLimit(plan.maxCompanies)}</span>
                        </div>
                      </Card.Body>

                      <Card.Footer className="bg-transparent border-0 pt-0 pb-4">
                        <div className="d-grid">
                          <Button
                            variant={isCurrentPlan(plan) ? 'primary' : 'outline-primary'}
                            disabled={!canSelectPlan(plan)}
                            onClick={() => {
                              setSelectedPlan(plan);
                              setShowSelectModal(true);
                            }}
                          >
                            {isCurrentPlan(plan) ? 'Current Plan' : 'Select Plan'}
                          </Button>
                        </div>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </>
      )}

      {/* Modals */}
      <PlanModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSubmit={handleAddPlan}
      />

      <PlanModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        onSubmit={(plan) => handleEditPlan(selectedPlan!.id, plan)}
      />

      <DeletePlanModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        onConfirm={() => handleDeletePlan(selectedPlan!)}
      />

      <SelectPlanModal
        show={showSelectModal}
        onHide={() => {
          setShowSelectModal(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        currentPlan={currentPlan}
        currentBillingCompanyId={billingCompany?.id}
        onConfirm={handleSelectPlan}
      />
    </div>
  );
};

export default Plans;
