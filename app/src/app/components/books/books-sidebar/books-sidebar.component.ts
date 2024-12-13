import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-books-sidebar',
  templateUrl: './books-sidebar.component.html',
  styleUrls: ['./books-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BooksSidebarComponent {
  navItems = [
    {
      path: '/books/dashboard',
      icon: 'bi-grid',
      label: 'Dashboard'
    },
    {
      path: '/books/accounting',
      icon: 'bi-journal-text',
      label: 'Accounting'
    },
    {
      path: '/books/banking',
      icon: 'bi-bank',
      label: 'Banking'
    },
    {
      path: '/books/invoicing',
      icon: 'bi-receipt',
      label: 'Invoicing'
    },
    {
      path: '/books/bills',
      icon: 'bi-cash-stack',
      label: 'Bills'
    },
    {
      path: '/books/expenses',
      icon: 'bi-wallet2',
      label: 'Expenses'
    },
    {
      path: '/books/payroll',
      icon: 'bi-people',
      label: 'Payroll'
    },
    {
      path: '/books/projects',
      icon: 'bi-kanban',
      label: 'Projects'
    },
    {
      path: '/books/reports',
      icon: 'bi-bar-chart',
      label: 'Reports'
    },
    {
      path: '/books/files',
      icon: 'bi-folder',
      label: 'Files'
    },
    {
      path: '/books/contacts',
      icon: 'bi-person-lines-fill',
      label: 'Contacts'
    }
  ];
}
