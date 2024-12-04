import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Input() isExpanded = true;
  @Input() isMobile = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  toggleExpanded(): void {
    this.toggleSidebar.emit();
  }

  onHelpClick(event: Event): void {
    event.preventDefault();
    // Navigate to help section in settings
    window.location.href = '/settings#help';
  }
}
