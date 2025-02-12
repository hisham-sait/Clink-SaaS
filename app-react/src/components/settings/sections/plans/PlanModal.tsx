import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import type { Plan } from '../../../../services/settings/types';

interface PlanModalProps {
  show: boolean;
  onHide: () => void;
  plan?: Plan | null;
  onSubmit: (data: Partial<Plan>) => void;
}

interface PlanFormData {
  name: string;
  description: string;
  price: number;
  billingCycle: 'Monthly' | 'Yearly' | 'Quarterly';
  features: { value: string }[];
  maxUsers: number;
  maxCompanies: number;
  status: 'Active' | 'Inactive' | 'Deprecated';
  isCustom: boolean;
}

const PlanModal: React.FC<PlanModalProps> = ({ show, onHide, plan, onSubmit }) => {
  const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PlanFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      billingCycle: 'Monthly',
      features: [],
      maxUsers: 0,
      maxCompanies: 0,
      status: 'Active',
      isCustom: false
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features'
  });

  React.useEffect(() => {
    if (show && plan) {
      reset({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        billingCycle: plan.billingCycle,
        features: plan.features.map(feature => ({ value: feature })),
        maxUsers: plan.maxUsers,
        maxCompanies: plan.maxCompanies,
        status: plan.status,
        isCustom: plan.isCustom
      });
    } else if (show) {
      reset({
        name: '',
        description: '',
        price: 0,
        billingCycle: 'Monthly',
        features: [],
        maxUsers: 0,
        maxCompanies: 0,
        status: 'Active',
        isCustom: false
      });
    }
  }, [show, plan, reset]);

  const handleFormSubmit = (data: PlanFormData) => {
    onSubmit({
      ...data,
      features: data.features.map(f => f.value)
    });
  };

  if (!show) return null;

  return (
    <div className="modal d-block">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{plan ? 'Edit Plan' : 'Create New Plan'}</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Enter plan name"
                  {...register('name', { required: 'Plan name is required' })}
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name.message}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  rows={3}
                  placeholder="Enter plan description"
                  {...register('description', { required: 'Description is required' })}
                />
                {errors.description && (
                  <div className="invalid-feedback">{errors.description.message}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Price</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                    min={0}
                    step={0.01}
                    {...register('price', {
                      required: 'Price is required',
                      min: { value: 0, message: 'Price must be 0 or greater' }
                    })}
                  />
                </div>
                {errors.price && (
                  <div className="invalid-feedback d-block">{errors.price.message}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Billing Cycle</label>
                <select
                  className="form-select"
                  {...register('billingCycle')}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Features</label>
                <div className="mb-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter feature"
                        {...register(`features.${index}.value`)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => remove(index)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => append({ value: '' })}
                >
                  <i className="bi bi-plus-lg me-2"></i>Add Feature
                </button>
              </div>

              <div className="mb-3">
                <label className="form-label">Max Users</label>
                <input
                  type="number"
                  className="form-control"
                  min={-1}
                  {...register('maxUsers', { required: true })}
                />
                <small className="text-muted">Use -1 for unlimited</small>
              </div>

              <div className="mb-3">
                <label className="form-label">Max Companies</label>
                <input
                  type="number"
                  className="form-control"
                  min={-1}
                  {...register('maxCompanies', { required: true })}
                />
                <small className="text-muted">Use -1 for unlimited</small>
              </div>

              <div className="mb-3">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  {...register('status')}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Deprecated">Deprecated</option>
                </select>
              </div>

              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isCustom"
                    {...register('isCustom')}
                  />
                  <label className="form-check-label" htmlFor="isCustom">
                    Custom Plan
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlanModal;
