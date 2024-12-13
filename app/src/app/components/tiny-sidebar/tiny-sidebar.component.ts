import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

type SectionType = 'books' | 'crm' | 'compliance' | 'carbon' | 'tax' | 'settings' | 'help';

@Component({
  selector: 'app-tiny-sidebar',
  templateUrl: './tiny-sidebar.component.html',
  styleUrls: ['./tiny-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule]
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

  selectSection(section: SectionType) {
    this.sectionChange.emit(section);
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
