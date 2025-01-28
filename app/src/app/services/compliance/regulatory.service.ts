import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RegulatoryRequirement,
  Obligation,
  Control,
  RegulatoryDocument,
  Assessment,
  Finding,
  Activity,
  BulkActionResult,
  ImportResult,
  Status
} from '../../components/compliance/compliance.types';

@Injectable({
  providedIn: 'root'
})
export class RegulatoryService {
  private apiUrl = `${environment.apiUrl}/regulatory`;

  constructor(private http: HttpClient) {}

  // Requirements
  getRequirements(companyId: string): Observable<RegulatoryRequirement[]> {
    return this.http.get<RegulatoryRequirement[]>(`${this.apiUrl}/requirements`, {
      params: { companyId }
    });
  }

  getRequirement(id: string): Observable<RegulatoryRequirement> {
    return this.http.get<RegulatoryRequirement>(`${this.apiUrl}/requirements/${id}`);
  }

  createRequirement(requirement: Partial<RegulatoryRequirement>): Observable<RegulatoryRequirement> {
    return this.http.post<RegulatoryRequirement>(`${this.apiUrl}/requirements`, requirement);
  }

  updateRequirement(id: string, requirement: Partial<RegulatoryRequirement>): Observable<RegulatoryRequirement> {
    return this.http.put<RegulatoryRequirement>(`${this.apiUrl}/requirements/${id}`, requirement);
  }

  deleteRequirement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/requirements/${id}`);
  }

  // Obligations
  getObligations(requirementId: string): Observable<Obligation[]> {
    return this.http.get<Obligation[]>(`${this.apiUrl}/requirements/${requirementId}/obligations`);
  }

  createObligation(requirementId: string, obligation: Partial<Obligation>): Observable<Obligation> {
    return this.http.post<Obligation>(`${this.apiUrl}/requirements/${requirementId}/obligations`, obligation);
  }

  updateObligation(requirementId: string, id: string, obligation: Partial<Obligation>): Observable<Obligation> {
    return this.http.put<Obligation>(`${this.apiUrl}/requirements/${requirementId}/obligations/${id}`, obligation);
  }

  deleteObligation(requirementId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/requirements/${requirementId}/obligations/${id}`);
  }

  // Controls
  getControls(requirementId: string): Observable<Control[]> {
    return this.http.get<Control[]>(`${this.apiUrl}/requirements/${requirementId}/controls`);
  }

  createControl(requirementId: string, control: Partial<Control>): Observable<Control> {
    return this.http.post<Control>(`${this.apiUrl}/requirements/${requirementId}/controls`, control);
  }

  updateControl(requirementId: string, id: string, control: Partial<Control>): Observable<Control> {
    return this.http.put<Control>(`${this.apiUrl}/requirements/${requirementId}/controls/${id}`, control);
  }

  deleteControl(requirementId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/requirements/${requirementId}/controls/${id}`);
  }

  // Documents
  getDocuments(requirementId: string): Observable<RegulatoryDocument[]> {
    return this.http.get<RegulatoryDocument[]>(`${this.apiUrl}/requirements/${requirementId}/documents`);
  }

  uploadDocument(requirementId: string, document: Partial<RegulatoryDocument>, file: File): Observable<RegulatoryDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document', JSON.stringify(document));
    
    return this.http.post<RegulatoryDocument>(`${this.apiUrl}/requirements/${requirementId}/documents`, formData);
  }

  updateDocument(requirementId: string, id: string, document: Partial<RegulatoryDocument>, file?: File): Observable<RegulatoryDocument> {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document', JSON.stringify(document));
      return this.http.put<RegulatoryDocument>(`${this.apiUrl}/requirements/${requirementId}/documents/${id}`, formData);
    }
    return this.http.put<RegulatoryDocument>(`${this.apiUrl}/requirements/${requirementId}/documents/${id}`, document);
  }

  deleteDocument(requirementId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/requirements/${requirementId}/documents/${id}`);
  }

  downloadDocument(requirementId: string, id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/requirements/${requirementId}/documents/${id}/download`, {
      responseType: 'blob'
    });
  }

  // Assessments
  getAssessments(requirementId: string): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${this.apiUrl}/requirements/${requirementId}/assessments`);
  }

  createAssessment(requirementId: string, assessment: Partial<Assessment>): Observable<Assessment> {
    return this.http.post<Assessment>(`${this.apiUrl}/requirements/${requirementId}/assessments`, assessment);
  }

  updateAssessment(requirementId: string, id: string, assessment: Partial<Assessment>): Observable<Assessment> {
    return this.http.put<Assessment>(`${this.apiUrl}/requirements/${requirementId}/assessments/${id}`, assessment);
  }

  deleteAssessment(requirementId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/requirements/${requirementId}/assessments/${id}`);
  }

  // Findings
  getFindings(assessmentId: string): Observable<Finding[]> {
    return this.http.get<Finding[]>(`${this.apiUrl}/assessments/${assessmentId}/findings`);
  }

  createFinding(assessmentId: string, finding: Partial<Finding>): Observable<Finding> {
    return this.http.post<Finding>(`${this.apiUrl}/assessments/${assessmentId}/findings`, finding);
  }

  updateFinding(assessmentId: string, id: string, finding: Partial<Finding>): Observable<Finding> {
    return this.http.put<Finding>(`${this.apiUrl}/assessments/${assessmentId}/findings/${id}`, finding);
  }

  deleteFinding(assessmentId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/assessments/${assessmentId}/findings/${id}`);
  }

  // Activity
  getActivities(companyId: string, params?: {
    entityType?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/activities`, {
      params: { companyId, ...params }
    });
  }

  // Dashboard Data
  getDashboardStats(companyId: string): Observable<{
    totalRequirements: number;
    activeRequirements: number;
    complianceRate: number;
    riskLevels: { [key: string]: number };
    upcomingDeadlines: any[];
    recentActivities: Activity[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`, {
      params: { companyId }
    });
  }

  // Bulk Operations
  bulkUpdateStatus(requirementIds: string[], status: Status): Observable<BulkActionResult> {
    return this.http.put<BulkActionResult>(`${this.apiUrl}/requirements/bulk/status`, { requirementIds, status });
  }

  bulkAssignOwner(requirementIds: string[], owner: string): Observable<BulkActionResult> {
    return this.http.put<BulkActionResult>(`${this.apiUrl}/requirements/bulk/owner`, { requirementIds, owner });
  }

  // Export
  exportRequirements(companyId: string, format: 'csv' | 'xlsx' = 'xlsx'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/requirements/export`, {
      params: { companyId, format },
      responseType: 'blob'
    });
  }

  // Import
  importRequirements(companyId: string, file: File): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyId', companyId);

    return this.http.post<ImportResult>(`${this.apiUrl}/requirements/import`, formData);
  }
}
