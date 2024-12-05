import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  type: 'Standard' | 'Professional' | 'Custom';
  lastUsed?: string;
  timesUsed: number;
  status: 'Active' | 'Draft' | 'Archived';
}

@Component({
  selector: 'app-invoice-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class InvoiceTemplatesComponent {
  templates: InvoiceTemplate[] = [
    {
      id: '1',
      name: 'Basic Invoice',
      description: 'Simple and clean invoice layout',
      type: 'Standard',
      lastUsed: '2024-01-15',
      timesUsed: 45,
      status: 'Active'
    },
    {
      id: '2',
      name: 'Professional Services',
      description: 'Detailed template for service-based businesses',
      type: 'Professional',
      lastUsed: '2024-01-10',
      timesUsed: 28,
      status: 'Active'
    },
    {
      id: '3',
      name: 'Custom Branded',
      description: 'Fully customized with company branding',
      type: 'Custom',
      lastUsed: '2024-01-05',
      timesUsed: 12,
      status: 'Active'
    },
    {
      id: '4',
      name: 'Minimal Design',
      description: 'Clean and minimalistic layout',
      type: 'Standard',
      lastUsed: '2023-12-20',
      timesUsed: 8,
      status: 'Draft'
    },
    {
      id: '5',
      name: 'Legacy Template',
      description: 'Old company template',
      type: 'Standard',
      lastUsed: '2023-11-15',
      timesUsed: 156,
      status: 'Archived'
    }
  ];

  previewTemplate(template: InvoiceTemplate): void {
    alert(`Previewing template: ${template.name}... Feature coming soon!`);
  }

  duplicateTemplate(template: InvoiceTemplate): void {
    alert(`Duplicating template: ${template.name}... Feature coming soon!`);
  }

  archiveTemplate(template: InvoiceTemplate): void {
    alert(`Archiving template: ${template.name}... Feature coming soon!`);
  }
}
