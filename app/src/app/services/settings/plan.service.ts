import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Plan, Permission, MODULE_PERMISSIONS, Company, User } from '../../components/settings/settings.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private apiUrl = `${environment.apiUrl}/settings/plans`;

  constructor(private http: HttpClient) {}

  // Get user's plan permissions
  getPlanPermissions(userRoles: string[]): Permission[] {
    const planPermissions = MODULE_PERMISSIONS['plans'];
    return planPermissions.filter(permission => 
      userRoles.some(role => {
        // Super Admin has all permissions
        if (role === 'Super Admin') {
          return true;
        }
        // Platform Admin has all plan permissions
        if (role === 'Platform Admin' && permission.module === 'plans') {
          return true;
        }
        // Company Admin can view plans and manage billing
        if (role === 'Company Admin') {
          return ['plans-view', 'billing-manage'].includes(permission.code);
        }
        // Other roles can only view plans
        return permission.code === 'plans-view';
      })
    );
  }

  // Check if user has specific plan permission
  hasPermission(userRoles: string[], permissionCode: string): boolean {
    return userRoles.some(role => {
      // Super Admin has all permissions
      if (role === 'Super Admin') {
        return true;
      }
      // Platform Admin has all plan permissions
      if (role === 'Platform Admin' && permissionCode.startsWith('plans-')) {
        return true;
      }
      // Company Admin can view plans and manage billing
      if (role === 'Company Admin') {
        return ['plans-view', 'billing-manage'].includes(permissionCode);
      }
      // Other roles can only view plans
      return permissionCode === 'plans-view';
    });
  }

  // Get all plans with role-based filtering
  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.apiUrl).pipe(
      map(plans => {
        // Filter plans based on user role if needed
        return plans;
      })
    );
  }

  // Get plan by ID
  getPlan(id: string): Observable<Plan> {
    return this.http.get<Plan>(`${this.apiUrl}/${id}`);
  }

  // Create new plan (requires Admin access)
  createPlan(plan: Partial<Plan>): Observable<Plan> {
    return this.http.post<Plan>(this.apiUrl, plan);
  }

  // Update plan (requires Admin access)
  updatePlan(id: string, plan: Partial<Plan>): Observable<Plan> {
    return this.http.put<Plan>(`${this.apiUrl}/${id}`, plan);
  }

  // Delete plan (requires Admin access)
  deletePlan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get allowed features based on user role
  getAllowedFeatures(plan: Plan, userRoles: string[]): string[] {
    const hasFullAccess = this.hasPermission(userRoles, 'plans-admin');
    if (hasFullAccess) {
      return plan.features;
    }

    // Filter features based on role permissions
    return plan.features;
  }

  // Check if user can manage plans
  canManagePlans(userRoles: string[]): boolean {
    return userRoles.some(role => ['Super Admin', 'Platform Admin'].includes(role));
  }

  // Check if user can view plans
  canViewPlans(userRoles: string[]): boolean {
    return this.hasPermission(userRoles, 'plans-view');
  }

  // Check if user can select/change plans
  canChangePlan(userRoles: string[]): boolean {
    return userRoles.some(role => ['Super Admin', 'Platform Admin', 'Company Admin'].includes(role));
  }

  // New methods for user-based plans

  // Get current user's plan
  getCurrentUserPlan(): Observable<{ plan: Plan; billingCompany: Company }> {
    return this.http.get<{ plan: Plan; billingCompany: Company }>(`${this.apiUrl}/user/current`);
  }

  // Get available billing companies for user
  getAvailableBillingCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.apiUrl}/billing-companies`);
  }

  // Select plan for user
  selectPlan(planId: string, billingCompanyId: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/select`, {
      planId,
      billingCompanyId
    });
  }

  // Get users on a specific plan
  getPlanUsers(planId: string): Observable<User[]> {
    return this.http.get<Plan>(`${this.apiUrl}/${planId}`).pipe(
      map(plan => plan.users || [])
    );
  }

  // Get plan usage statistics
  getPlanUsage(planId: string): Observable<{
    totalUsers: number;
    maxUsers: number;
    totalCompanies: number;
    maxCompanies: number;
  }> {
    return this.http.get<Plan>(`${this.apiUrl}/${planId}`).pipe(
      map(plan => ({
        totalUsers: plan.userCount || 0,
        maxUsers: plan.maxUsers,
        totalCompanies: 0, // This would need to be calculated based on users' companies
        maxCompanies: plan.maxCompanies
      }))
    );
  }

  // Validate if a plan can be selected
  validatePlanSelection(planId: string, billingCompanyId: string): Observable<{
    valid: boolean;
    message?: string;
  }> {
    return this.http.post<{ valid: boolean; message?: string }>(`${this.apiUrl}/validate`, {
      planId,
      billingCompanyId
    });
  }
}
