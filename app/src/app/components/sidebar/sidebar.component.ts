import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SidebarComponent {
  menuItems = [
    { icon: 'bi bi-speedometer2', title: 'Dashboard', route: '/dashboard' },
    { icon: 'bi bi-journal-text', title: 'Accounting', route: '/accounting' },
    { icon: 'bi bi-kanban', title: 'Projects', route: '/projects' },
    { icon: 'bi bi-people', title: 'Payroll', route: '/payroll' },
    { icon: 'bi bi-receipt', title: 'Expenses', route: '/expenses' },
    { icon: 'bi bi-graph-up', title: 'Analytics & Reports', route: '/reports' },
    { icon: 'bi bi-bank', title: 'Bank Connections', route: '/banking' },
    { icon: 'bi bi-file-earmark-text', title: 'Invoicing', route: '/invoicing' },
    { icon: 'bi bi-cart', title: 'Bills & Purchases', route: '/bills' },
    { icon: 'bi bi-folder', title: 'Files & Documents', route: '/files' },
    { icon: 'bi bi-person-rolodex', title: 'Contacts', route: '/contacts' }
  ];

  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
