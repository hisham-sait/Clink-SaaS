import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BankIntegrationService, BankConnection } from '../../../../services/bank-integration.service';
import { ConnectBankModalComponent } from './connect-bank-modal/connect-bank-modal.component';
import { take } from 'rxjs/operators';

interface ConnectedBank {
  id: string;
  name: string;
  logo: string;
  connectionType: 'Direct' | 'OAuth' | 'Manual';
  lastSynced: string;
  accounts: string;
  status: 'Connected' | 'Syncing' | 'Error';
}

@Component({
  selector: 'app-connect-bank',
  templateUrl: './connect.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule, NgbModule, ConnectBankModalComponent]
})
export class ConnectBankComponent implements OnInit {
  connectedBanks = 0;
  banksChange = '';
  activeConnections = 0;
  connectionsTrend = '';
  connectionsChange = '';
  lastSync = new Date();
  syncStatus = 'Loading...';
  loading = true;
  error: string | null = null;
  connectedBanksList: ConnectedBank[] = [];
  private bankConnectionsMap = new Map<string, BankConnection>();

  constructor(
    private modalService: NgbModal,
    private bankService: BankIntegrationService
  ) {}

  ngOnInit(): void {
    this.loadBankConnections();
  }

  private loadBankConnections(): void {
    this.loading = true;
    this.error = null;

    this.bankService.getConnectedBanks()
      .pipe(take(1))
      .subscribe({
        next: (banks) => {
          // Store bank connections for reference
          this.bankConnectionsMap.clear();
          banks.forEach(bank => this.bankConnectionsMap.set(bank.institutionName, bank));

          // Convert BankConnection[] to ConnectedBank[]
          this.connectedBanksList = banks.map(bank => ({
            id: bank.id,
            name: bank.institutionName,
            logo: bank.logo || this.getDefaultLogo(bank.institutionName),
            connectionType: bank.provider === 'plaid' ? 'OAuth' : 'Direct',
            lastSynced: bank.lastSynced?.toISOString() || new Date().toISOString(),
            accounts: `${bank.accounts.length} account${bank.accounts.length !== 1 ? 's' : ''}`,
            status: this.mapBankStatus(bank.status)
          }));

          this.updateMetrics(banks);
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load bank connections';
          console.error('Error loading bank connections:', error);
          this.loading = false;
        }
      });
  }

  private getDefaultLogo(bankName: string): string {
    // Convert bank name to lowercase and remove spaces
    const safeName = bankName.toLowerCase().replace(/\s+/g, '-');
    return `assets/banks/${safeName}.png`;
  }

  private mapBankStatus(status: string): 'Connected' | 'Syncing' | 'Error' {
    switch (status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Syncing';
      case 'error': return 'Error';
      default: return 'Error';
    }
  }

  private updateMetrics(banks: BankConnection[]): void {
    this.connectedBanks = banks.length;
    this.activeConnections = banks.filter(b => b.status === 'connected').length;
    
    // Find the most recent sync
    if (banks.length > 0) {
      const lastSyncDate = banks.reduce((latest, bank) => {
        return bank.lastSynced && bank.lastSynced > latest ? bank.lastSynced : latest;
      }, new Date(0));
      this.lastSync = lastSyncDate;
    }

    // Calculate changes from last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const activeLastMonth = banks.length; // Simplified for now since we don't have historical data
    const change = this.activeConnections - activeLastMonth;
    this.connectionsChange = `${change >= 0 ? '+' : ''}${change} from last month`;
    this.connectionsTrend = change >= 0 ? 'up' : 'down';

    // Update sync status
    const hasErrors = banks.some(b => b.status === 'error');
    const hasSyncing = banks.some(b => b.status === 'connecting');
    if (hasErrors) {
      this.syncStatus = 'Some connections have errors';
    } else if (hasSyncing) {
      this.syncStatus = 'Syncing in progress';
    } else {
      this.syncStatus = 'All systems operational';
    }
  }

  syncBank(bank: ConnectedBank, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.bankService.syncBank(bank.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadBankConnections();
        },
        error: (error) => {
          console.error('Error syncing bank:', error);
          this.error = 'Failed to sync bank connection';
        }
      });
  }

  editConnection(bank: ConnectedBank, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    const bankConnection = this.bankConnectionsMap.get(bank.name);
    if (bankConnection) {
      const modalRef = this.modalService.open(ConnectBankModalComponent, {
        size: 'lg',
        centered: true
      });
      modalRef.componentInstance.editMode = true;
      modalRef.componentInstance.existingConnection = bankConnection;

      modalRef.closed.subscribe(result => {
        if (result === 'success') {
          this.loadBankConnections();
        }
      });
    }
  }

  disconnectBank(bank: ConnectedBank, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (confirm(`Are you sure you want to disconnect ${bank.name}?`)) {
      this.bankService.disconnectBank(bank.id)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.loadBankConnections();
          },
          error: (error) => {
            console.error('Error disconnecting bank:', error);
            this.error = 'Failed to disconnect bank';
          }
        });
    }
  }

  syncAll(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.bankService.syncAllBanks()
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadBankConnections();
        },
        error: (error) => {
          console.error('Error syncing all banks:', error);
          this.error = 'Failed to sync all banks';
        }
      });
  }

  manageConnections(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    const modalRef = this.modalService.open(ConnectBankModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false,
      animation: true
    });

    modalRef.closed.subscribe(result => {
      if (result === 'success') {
        this.loadBankConnections();
      }
    });
  }

  viewLogs(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    // TODO: Implement logs viewer
    alert('Connection logs feature coming soon!');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Connected': return 'text-success';
      case 'Syncing': return 'text-warning';
      case 'Error': return 'text-danger';
      default: return 'text-muted';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Connected': return 'bi-check-circle-fill';
      case 'Syncing': return 'bi-arrow-repeat';
      case 'Error': return 'bi-exclamation-circle-fill';
      default: return 'bi-question-circle-fill';
    }
  }
}
