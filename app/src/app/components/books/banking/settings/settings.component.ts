import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ConnectedBank {
  id: string;
  name: string;
  logo: string;
  lastSync: string;
  status: 'Connected' | 'Error' | 'Syncing';
  accounts: number;
}

@Component({
  selector: 'app-bank-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class BankSettingsComponent {
  settings = {
    defaultAccount: 'Main Business Checking',
    defaultCurrency: 'USD ($)',
    autoCategorize: true,
    customCategories: true,
    syncFrequency: 'Every Hour',
    dataRetention: '1 Year',
    autoSync: true,
    syncAttachments: true,
    twoFactor: true,
    requireApproval: true,
    transactionAlerts: true,
    largeTransactionThreshold: 10000,
    notifications: {
      syncCompletion: true,
      connectionError: true,
      largeTransaction: true,
      balanceAlerts: true
    },
    api: {
      enabled: true,
      thirdPartyAccess: false,
      key: '****************************'
    }
  };

  connectedBanks: ConnectedBank[] = [
    {
      id: '1',
      name: 'Bank of America',
      logo: 'bi bi-bank',
      lastSync: '2024-01-15T14:30:00',
      status: 'Connected',
      accounts: 2
    },
    {
      id: '2',
      name: 'Chase',
      logo: 'bi bi-bank',
      lastSync: '2024-01-15T12:15:00',
      status: 'Connected',
      accounts: 1
    },
    {
      id: '3',
      name: 'Wells Fargo',
      logo: 'bi bi-bank',
      lastSync: '2024-01-15T10:45:00',
      status: 'Error',
      accounts: 1
    }
  ];

  saveSettings(): void {
    alert('Settings saved successfully!');
  }

  regenerateApiKey(): void {
    alert('API key regeneration feature coming soon!');
  }

  syncBank(bank: ConnectedBank): void {
    alert(`Syncing ${bank.name}... Feature coming soon!`);
  }

  editBank(bank: ConnectedBank): void {
    alert(`Editing ${bank.name} settings... Feature coming soon!`);
  }

  disconnectBank(bank: ConnectedBank): void {
    alert(`Disconnecting ${bank.name}... Feature coming soon!`);
  }

  configureTwoFactor(): void {
    alert('Two-factor authentication configuration... Feature coming soon!');
  }

  viewDataPrivacy(): void {
    alert('Data privacy settings... Feature coming soon!');
  }

  revokeAccess(): void {
    alert('Revoking all bank access... Feature coming soon!');
  }
}
