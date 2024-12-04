import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

type SectionType = 'books' | 'crm' | 'settings' | 'help';

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
  @Input() activeSection: SectionType = 'books';
  @Output() toggleSidebar = new EventEmitter<void>();

  get showSidebar(): boolean {
    return this.isExpanded && !!this.activeSection;
  }

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
    this.toggleSidebar.emit();
  }

  openDocumentation(event: Event) {
    event.preventDefault();
    window.open('https://docs.example.com', '_blank');
  }

  openSupport(event: Event) {
    event.preventDefault();
    window.open('https://support.example.com', '_blank');
  }

  openFeedback(event: Event) {
    event.preventDefault();
    window.open('https://feedback.example.com', '_blank');
  }
}
