import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface MeetingDocument {
  id: string;
  type: string;
  title: string;
  description?: string;
  version: string;
  author: string;
  uploadDate: string;
  size: number;
  tags: string[];
  path: string;
  meetingId: string;
}

export interface DocumentVersion {
  version: string;
  uploadDate: string;
  author: string;
  size: number;
  changes: string;
  path: string;
}

export interface DocumentShare {
  id: string;
  date: string;
  sharedBy: string;
  recipients: {
    name?: string;
    email: string;
    permission: string;
  }[];
  expiration?: string;
  status: 'Active' | 'Expired' | 'Revoked';
}

export interface AccessLog {
  id: string;
  date: string;
  user: string;
  action: string;
  details?: string;
  ip?: string;
  userAgent?: string;
}

export interface UploadProgress {
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = '/api/documents';

  constructor(private http: HttpClient) {}

  // Document CRUD operations
  getDocument(id: string): Observable<MeetingDocument> {
    return this.http.get<MeetingDocument>(`${this.apiUrl}/${id}`);
  }

  getMeetingDocuments(meetingId: string): Observable<MeetingDocument[]> {
    return this.http.get<MeetingDocument[]>(`${this.apiUrl}/meeting/${meetingId}`);
  }

  uploadDocument(
    meetingId: string,
    file: File,
    metadata: Partial<MeetingDocument>
  ): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    return this.http.post(`${this.apiUrl}/meeting/${meetingId}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total 
              ? Math.round(100 * event.loaded / event.total)
              : 0;
            return {
              progress,
              status: 'uploading' as const
            };
          case HttpEventType.Response:
            return {
              progress: 100,
              status: 'completed' as const
            };
          default:
            return {
              progress: 0,
              status: 'pending' as const
            };
        }
      })
    );
  }

  updateDocument(id: string, document: Partial<MeetingDocument>): Observable<MeetingDocument> {
    return this.http.patch<MeetingDocument>(`${this.apiUrl}/${id}`, document);
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Version management
  getVersions(documentId: string): Observable<DocumentVersion[]> {
    return this.http.get<DocumentVersion[]>(`${this.apiUrl}/${documentId}/versions`);
  }

  uploadVersion(
    documentId: string,
    file: File,
    metadata: { version: string; changes: string }
  ): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    return this.http.post(`${this.apiUrl}/${documentId}/versions`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total 
              ? Math.round(100 * event.loaded / event.total)
              : 0;
            return {
              progress,
              status: 'uploading' as const
            };
          case HttpEventType.Response:
            return {
              progress: 100,
              status: 'completed' as const
            };
          default:
            return {
              progress: 0,
              status: 'pending' as const
            };
        }
      })
    );
  }

  // Sharing
  getShares(documentId: string): Observable<DocumentShare[]> {
    return this.http.get<DocumentShare[]>(`${this.apiUrl}/${documentId}/shares`);
  }

  shareDocument(
    documentId: string,
    recipients: { email: string; permission: string }[],
    expiration?: string
  ): Observable<DocumentShare> {
    return this.http.post<DocumentShare>(`${this.apiUrl}/${documentId}/shares`, {
      recipients,
      expiration
    });
  }

  revokeShare(documentId: string, shareId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${documentId}/shares/${shareId}`);
  }

  // Access logs
  getAccessLogs(documentId: string): Observable<AccessLog[]> {
    return this.http.get<AccessLog[]>(`${this.apiUrl}/${documentId}/logs`);
  }

  // Download operations
  downloadDocument(documentId: string, version?: string): Observable<Blob> {
    const url = version 
      ? `${this.apiUrl}/${documentId}/versions/${version}/download`
      : `${this.apiUrl}/${documentId}/download`;

    return this.http.get(url, {
      responseType: 'blob'
    });
  }

  // Preview operations
  getPreviewUrl(documentId: string, version?: string): string {
    return version 
      ? `${this.apiUrl}/${documentId}/versions/${version}/preview`
      : `${this.apiUrl}/${documentId}/preview`;
  }

  // Search and filter
  searchDocuments(query: string): Observable<MeetingDocument[]> {
    return this.http.get<MeetingDocument[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }

  filterDocuments(filters: {
    type?: string;
    author?: string;
    dateFrom?: string;
    dateTo?: string;
    tags?: string[];
  }): Observable<MeetingDocument[]> {
    return this.http.get<MeetingDocument[]>(`${this.apiUrl}/filter`, {
      params: filters as any
    });
  }

  // Utility functions
  generateThumbnail(documentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${documentId}/thumbnail`, {
      responseType: 'blob'
    });
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 10MB limit'
      };
    }

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload PDF, Word, Excel, or PowerPoint files.'
      };
    }

    return { valid: true };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
