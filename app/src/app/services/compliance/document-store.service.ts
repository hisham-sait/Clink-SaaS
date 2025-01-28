import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentService, MeetingDocument, DocumentShare, DocumentVersion, AccessLog } from './document.service';

interface DocumentState {
  documents: { [id: string]: MeetingDocument };
  versions: { [documentId: string]: DocumentVersion[] };
  shares: { [documentId: string]: DocumentShare[] };
  logs: { [documentId: string]: AccessLog[] };
  loading: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  documents: {},
  versions: {},
  shares: {},
  logs: {},
  loading: false,
  error: null
};

@Injectable({
  providedIn: 'root'
})
export class DocumentStoreService {
  private state = new BehaviorSubject<DocumentState>(initialState);
  private meetingDocuments = new BehaviorSubject<{ [meetingId: string]: string[] }>({});

  constructor(private documentService: DocumentService) {}

  // State Selectors
  getState(): Observable<DocumentState> {
    return this.state.asObservable();
  }

  getDocument(id: string): Observable<MeetingDocument | undefined> {
    return this.state.pipe(
      map(state => state.documents[id])
    );
  }

  getMeetingDocuments(meetingId: string): Observable<MeetingDocument[]> {
    return combineLatest([
      this.state,
      this.meetingDocuments
    ]).pipe(
      map(([state, meetingDocs]) => {
        const documentIds = meetingDocs[meetingId] || [];
        return documentIds.map(id => state.documents[id]).filter(Boolean);
      })
    );
  }

  getVersions(documentId: string): Observable<DocumentVersion[]> {
    return this.state.pipe(
      map(state => state.versions[documentId] || [])
    );
  }

  getShares(documentId: string): Observable<DocumentShare[]> {
    return this.state.pipe(
      map(state => state.shares[documentId] || [])
    );
  }

  getLogs(documentId: string): Observable<AccessLog[]> {
    return this.state.pipe(
      map(state => state.logs[documentId] || [])
    );
  }

  isLoading(): Observable<boolean> {
    return this.state.pipe(
      map(state => state.loading)
    );
  }

  getError(): Observable<string | null> {
    return this.state.pipe(
      map(state => state.error)
    );
  }

  // State Updates
  private updateState(newState: Partial<DocumentState>): void {
    this.state.next({
      ...this.state.value,
      ...newState
    });
  }

  private updateDocument(document: MeetingDocument): void {
    this.updateState({
      documents: {
        ...this.state.value.documents,
        [document.id]: document
      }
    });

    // Update meeting documents mapping
    const currentMeetingDocs = this.meetingDocuments.value;
    if (!currentMeetingDocs[document.meetingId]) {
      currentMeetingDocs[document.meetingId] = [];
    }
    if (!currentMeetingDocs[document.meetingId].includes(document.id)) {
      currentMeetingDocs[document.meetingId].push(document.id);
      this.meetingDocuments.next(currentMeetingDocs);
    }
  }

  private updateVersions(documentId: string, versions: DocumentVersion[]): void {
    this.updateState({
      versions: {
        ...this.state.value.versions,
        [documentId]: versions
      }
    });
  }

  private updateShares(documentId: string, shares: DocumentShare[]): void {
    this.updateState({
      shares: {
        ...this.state.value.shares,
        [documentId]: shares
      }
    });
  }

  private updateLogs(documentId: string, logs: AccessLog[]): void {
    this.updateState({
      logs: {
        ...this.state.value.logs,
        [documentId]: logs
      }
    });
  }

  // API Actions
  loadMeetingDocuments(meetingId: string): void {
    this.updateState({ loading: true, error: null });

    this.documentService.getMeetingDocuments(meetingId).subscribe({
      next: (documents) => {
        const documentsMap: { [id: string]: MeetingDocument } = {};
        documents.forEach(doc => documentsMap[doc.id] = doc);
        
        this.updateState({
          documents: {
            ...this.state.value.documents,
            ...documentsMap
          },
          loading: false
        });

        // Update meeting documents mapping
        this.meetingDocuments.next({
          ...this.meetingDocuments.value,
          [meetingId]: documents.map(doc => doc.id)
        });
      },
      error: (error) => {
        this.updateState({
          loading: false,
          error: error.message
        });
      }
    });
  }

  loadDocumentDetails(documentId: string): void {
    this.updateState({ loading: true, error: null });

    // Load document versions
    this.documentService.getVersions(documentId).subscribe({
      next: (versions) => this.updateVersions(documentId, versions),
      error: (error) => console.error('Error loading versions:', error)
    });

    // Load document shares
    this.documentService.getShares(documentId).subscribe({
      next: (shares) => this.updateShares(documentId, shares),
      error: (error) => console.error('Error loading shares:', error)
    });

    // Load access logs
    this.documentService.getAccessLogs(documentId).subscribe({
      next: (logs) => {
        this.updateLogs(documentId, logs);
        this.updateState({ loading: false });
      },
      error: (error) => {
        console.error('Error loading logs:', error);
        this.updateState({ loading: false });
      }
    });
  }

  uploadDocument(meetingId: string, file: File, metadata: Partial<MeetingDocument>): Observable<number> {
    this.updateState({ loading: true, error: null });

    return new Observable<number>(observer => {
      this.documentService.uploadDocument(meetingId, file, metadata).subscribe({
        next: (progress) => {
          if (progress.status === 'uploading') {
            observer.next(progress.progress);
          } else if (progress.status === 'completed') {
            observer.next(100);
            observer.complete();
            this.loadMeetingDocuments(meetingId);
          }
        },
        error: (error) => {
          this.updateState({
            loading: false,
            error: error.message
          });
          observer.error(error);
        }
      });
    });
  }

  updateDocumentMetadata(id: string, document: Partial<MeetingDocument>): void {
    this.updateState({ loading: true, error: null });

    this.documentService.updateDocument(id, document).subscribe({
      next: (updatedDoc) => {
        this.updateDocument(updatedDoc);
        this.updateState({ loading: false });
      },
      error: (error) => {
        this.updateState({
          loading: false,
          error: error.message
        });
      }
    });
  }

  deleteDocument(id: string, meetingId: string): void {
    this.updateState({ loading: true, error: null });

    this.documentService.deleteDocument(id).subscribe({
      next: () => {
        // Remove document from state
        const { [id]: removed, ...remainingDocs } = this.state.value.documents;
        
        // Remove document from versions, shares, and logs
        const { [id]: removedVersions, ...remainingVersions } = this.state.value.versions;
        const { [id]: removedShares, ...remainingShares } = this.state.value.shares;
        const { [id]: removedLogs, ...remainingLogs } = this.state.value.logs;

        // Remove document from meeting documents mapping
        const currentMeetingDocs = this.meetingDocuments.value;
        currentMeetingDocs[meetingId] = currentMeetingDocs[meetingId].filter(docId => docId !== id);

        this.updateState({
          documents: remainingDocs,
          versions: remainingVersions,
          shares: remainingShares,
          logs: remainingLogs,
          loading: false
        });

        this.meetingDocuments.next(currentMeetingDocs);
      },
      error: (error) => {
        this.updateState({
          loading: false,
          error: error.message
        });
      }
    });
  }

  shareDocument(documentId: string, recipients: { email: string; permission: string }[], expiration?: string): void {
    this.documentService.shareDocument(documentId, recipients, expiration).subscribe({
      next: (share) => {
        const currentShares = this.state.value.shares[documentId] || [];
        this.updateShares(documentId, [...currentShares, share]);
      },
      error: (error) => {
        this.updateState({
          error: error.message
        });
      }
    });
  }

  revokeShare(documentId: string, shareId: string): void {
    this.documentService.revokeShare(documentId, shareId).subscribe({
      next: () => {
        const currentShares = this.state.value.shares[documentId] || [];
        const updatedShares = currentShares.map(share => 
          share.id === shareId ? { ...share, status: 'Revoked' as const } : share
        );
        this.updateShares(documentId, updatedShares);
      },
      error: (error) => {
        this.updateState({
          error: error.message
        });
      }
    });
  }
}
