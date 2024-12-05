import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface JournalEntry {
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  status: 'Posted' | 'Draft' | 'Pending';
}

@Component({
  selector: 'app-journal-entries',
  templateUrl: './journal-entries.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class JournalEntriesComponent {
  totalEntries = 156;
  newEntriesThisMonth = 12;
  totalDebits = 458920.00;
  totalCredits = 458920.00;

  journalEntries: JournalEntry[] = [
    {
      date: '2024-01-15',
      reference: 'JE-2024-001',
      description: 'Sales Revenue Recording',
      debit: 15000.00,
      credit: 15000.00,
      status: 'Posted'
    },
    {
      date: '2024-01-14',
      reference: 'JE-2024-002',
      description: 'Office Supplies Purchase',
      debit: 500.00,
      credit: 500.00,
      status: 'Posted'
    },
    {
      date: '2024-01-13',
      reference: 'JE-2024-003',
      description: 'Utility Bill Payment',
      debit: 750.00,
      credit: 750.00,
      status: 'Posted'
    },
    {
      date: '2024-01-12',
      reference: 'JE-2024-004',
      description: 'Client Payment Receipt',
      debit: 5000.00,
      credit: 5000.00,
      status: 'Pending'
    },
    {
      date: '2024-01-11',
      reference: 'JE-2024-005',
      description: 'Equipment Purchase',
      debit: 2500.00,
      credit: 2500.00,
      status: 'Draft'
    }
  ];

  viewEntry(entry: JournalEntry): void {
    alert(`Viewing entry ${entry.reference}... Feature coming soon!`);
  }

  editEntry(entry: JournalEntry): void {
    alert(`Editing entry ${entry.reference}... Feature coming soon!`);
  }

  deleteEntry(entry: JournalEntry): void {
    alert(`Deleting entry ${entry.reference}... Feature coming soon!`);
  }
}
