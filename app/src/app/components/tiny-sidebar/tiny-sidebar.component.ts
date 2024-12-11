import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

type SectionType = 'books' | 'crm' | 'carbon' | 'settings' | 'help';

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
  @Output() sectionHover = new EventEmitter<SectionType>();
  @Output() sectionLeave = new EventEmitter<void>();
  @Output() themeToggle = new EventEmitter<void>();
  @Output() notificationsToggle = new EventEmitter<void>();
  @Output() userMenuToggle = new EventEmitter<void>();

  onSectionHover(section: SectionType) {
    this.sectionHover.emit(section);
  }

  onSectionLeave() {
    this.sectionLeave.emit();
  }

  selectSection(section: SectionType) {
    this.activeSection = section;
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
