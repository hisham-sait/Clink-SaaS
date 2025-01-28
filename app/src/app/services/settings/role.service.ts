import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Role, 
  Permission,
  RoleTemplate,
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
    // Instead of using hardcoded templates, fetch from API and transform into templates
    return this.getRoles().pipe(
      map(roles => roles
        .filter(role => role.isSystem) // Only use system roles as templates
        .map(role => ({
          id: role.id,
          name: role.name,
          description: role.description,
          isDefault: false, // Default value since it's not in metadata
          permissions: role.permissions
        }))
      )
    );
  }

  createRoleFromTemplate(templateId: string): Observable<Role> {
    // Get the template role and create a new role based on it
    return this.getRole(templateId).pipe(
      map(template => ({
        name: template.name,
        description: template.description,
        permissions: template.permissions,
        scope: 'Company',
        status: 'Active',
        isCustom: true,
        isSystem: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Role))
    );
  }

  // Permission Management
  getAllPermissions(): Permission[] {
    return Object.values(MODULE_PERMISSIONS).flat();
  }

  getModulePermissions(module: string): Permission[] {
    return MODULE_PERMISSIONS[module] || [];
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
