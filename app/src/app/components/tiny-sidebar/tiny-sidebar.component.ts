import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

type SectionType = 'books' | 'crm' | 'compliance' | 'carbon' | 'tax' | 'statutory' | 'settings' | 'help';

@Component({
  selector: 'app-tiny-sidebar',
  templateUrl: './tiny-sidebar.component.html',
  styleUrls: ['./tiny-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class TinySidebarComponent {
  @Input() isDarkMode = false;
  @Input() notificationCount = 0;
  @Input() userAvatar = '';
  @Input() userName = '';
  @Input() activeSection: SectionType = 'books';

  @Output() sectionChange = new EventEmitter<SectionType>();
  @Output() themeToggle = new EventEmitter<void>();
  @Output() notificationsToggle = new EventEmitter<void>();
  @Output() userMenuToggle = new EventEmitter<void>();

  constructor(private router: Router) {}

  selectSection(section: SectionType) {
    this.sectionChange.emit(section);
    
    // Navigate to the main dashboard of each module
    switch(section) {
      case 'books':
      case 'crm':
      case 'compliance':
      case 'carbon':
      case 'tax':
      case 'statutory':
        this.router.navigate([`/${section}/dashboard`]);
        break;
      case 'settings':
      case 'help':
        this.router.navigate([`/${section}`]);
        break;
    }
  }

  toggleTheme() {
    this.themeToggle.emit();
  }

  toggleNotifications() {
    this.notificationsToggle.emit();
  }

  toggleUserMenu() {
    this.userMenuToggle.emit();
  }
}
