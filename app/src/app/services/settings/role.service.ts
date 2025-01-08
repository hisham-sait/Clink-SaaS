import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Role, 
  Permission, 
  RoleTemplate, 
  ROLE_TEMPLATES, 
  MODULE_PERMISSIONS 
} from '../../components/settings/settings.types';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/settings/roles`;

  constructor(private http: HttpClient) {}

  // Role Management
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getRole(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/create`, role);
  }

  updateRole(id: string, role: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Role Templates
  getRoleTemplates(): Observable<RoleTemplate[]> {
    // In a real app, this would fetch from the server
    // For now, return predefined templates
    return of(ROLE_TEMPLATES).pipe(
      map(templates => {
        // Populate permissions for each template
        return templates.map(template => {
          switch (template.id) {
            case 'super-admin':
              template.permissions = this.getAllPermissions();
              break;
            case 'admin':
              template.permissions = this.getAdminPermissions();
              break;
            case 'billing-admin':
              template.permissions = this.getBillingAdminPermissions();
              break;
            case 'compliance-manager':
              template.permissions = this.getComplianceManagerPermissions();
              break;
            case 'accountant':
              template.permissions = this.getAccountantPermissions();
              break;
            case 'tax-specialist':
              template.permissions = this.getTaxSpecialistPermissions();
              break;
            case 'team-manager':
              template.permissions = this.getTeamManagerPermissions();
              break;
            case 'user-manager':
              template.permissions = this.getUserManagerPermissions();
              break;
            case 'report-viewer':
              template.permissions = this.getReportViewerPermissions();
              break;
            case 'basic-user':
              template.permissions = this.getBasicUserPermissions();
              break;
          }
          return template;
        });
      })
    );
  }

  createRoleFromTemplate(templateId: string): Observable<Role> {
    return this.getRoleTemplates().pipe(
      map(templates => {
        const template = templates.find(t => t.id === templateId);
        if (!template) {
          throw new Error('Template not found');
        }
        return {
          name: template.name,
          description: template.description,
          permissions: template.permissions,
          scope: 'Company',
          status: 'Active',
          isCustom: false,
          isSystem: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Role;
      })
    );
  }

  // Permission Management
  getAllPermissions(): Permission[] {
    return Object.values(MODULE_PERMISSIONS).flat();
  }

  getModulePermissions(module: string): Permission[] {
    return MODULE_PERMISSIONS[module] || [];
  }

  // Helper methods to get permissions for different role templates
  private getAdminPermissions(): Permission[] {
    return this.getAllPermissions().filter(p => 
      p.module !== 'billing' || p.accessLevel !== 'Admin'
    );
  }

  private getBillingAdminPermissions(): Permission[] {
    return [
      ...MODULE_PERMISSIONS['billing'],
      ...this.getReadPermissions(['users', 'companies'])
    ];
  }

  private getComplianceManagerPermissions(): Permission[] {
    return [
      ...this.getReadPermissions(['users', 'companies', 'roles']),
      ...this.getWritePermissions(['settings'])
    ];
  }

  private getAccountantPermissions(): Permission[] {
    return [
      ...this.getReadPermissions(['users', 'companies']),
      ...MODULE_PERMISSIONS['billing'].filter(p => p.accessLevel !== 'Admin')
    ];
  }

  private getTaxSpecialistPermissions(): Permission[] {
    return [
      ...this.getReadPermissions(['users', 'companies']),
      ...MODULE_PERMISSIONS['billing'].filter(p => p.accessLevel === 'Read')
    ];
  }

  private getTeamManagerPermissions(): Permission[] {
    return [
      ...this.getWritePermissions(['users']),
      ...this.getReadPermissions(['companies', 'roles'])
    ];
  }

  private getUserManagerPermissions(): Permission[] {
    return [
      ...MODULE_PERMISSIONS['users'],
      ...this.getReadPermissions(['roles', 'companies'])
    ];
  }

  private getReportViewerPermissions(): Permission[] {
    return this.getReadPermissions([
      'users',
      'companies',
      'billing'
    ]);
  }

  private getBasicUserPermissions(): Permission[] {
    return this.getReadPermissions([
      'users',
      'companies'
    ]);
  }

  // Helper methods for permission filtering
  private getReadPermissions(modules: string[]): Permission[] {
    return modules.flatMap(module => 
      MODULE_PERMISSIONS[module]?.filter(p => p.accessLevel === 'Read') || []
    );
  }

  private getWritePermissions(modules: string[]): Permission[] {
    return modules.flatMap(module => 
      MODULE_PERMISSIONS[module]?.filter(p => 
        p.accessLevel === 'Read' || p.accessLevel === 'Write'
      ) || []
    );
  }

  // Role Assignment
  assignRoleToUser(userId: string, roleId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/assign`, { userId, roleId });
  }

  removeRoleFromUser(userId: string, roleId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/assign/${userId}/${roleId}`);
  }

  // Role Validation
  validatePermissions(roleId: string, permissions: string[]): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/${roleId}/validate`, { permissions });
  }

  // Role Analytics
  getRoleUsageStats(roleId: string): Observable<{
    totalUsers: number;
    activeUsers: number;
    lastAssigned: string;
  }> {
    return this.http.get<{
      totalUsers: number;
      activeUsers: number;
      lastAssigned: string;
    }>(`${this.apiUrl}/${roleId}/stats`);
  }
}
