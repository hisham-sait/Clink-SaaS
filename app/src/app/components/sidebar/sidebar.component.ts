import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ComplianceSidebarComponent } from '../compliance/compliance-sidebar/compliance-sidebar.component';
import { BooksSidebarComponent } from '../books/books-sidebar/books-sidebar.component';
import { CrmSidebarComponent } from '../crm/crm-sidebar/crm-sidebar.component';
import { CarbonSidebarComponent } from '../carbon/carbon-sidebar/carbon-sidebar.component';
import { TaxSidebarComponent } from '../tax/tax-sidebar/tax-sidebar.component';
import { SettingsSidebarComponent } from '../settings/settings-sidebar/settings-sidebar.component';
import { HelpSidebarComponent } from '../help/help-sidebar/help-sidebar.component';
import { StatutorySidebarComponent } from '../statutory/statutory-sidebar/statutory-sidebar.component';

type SectionType = 'books' | 'crm' | 'compliance' | 'carbon' | 'tax' | 'statutory' | 'settings' | 'help';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ComplianceSidebarComponent,
    BooksSidebarComponent,
    CrmSidebarComponent,
    CarbonSidebarComponent,
    TaxSidebarComponent,
    SettingsSidebarComponent,
    HelpSidebarComponent,
    StatutorySidebarComponent
  ]
})
export class SidebarComponent {
  @Input() isExpanded = true;
  @Input() isMobile = false;
  @Input() activeSection: SectionType = 'books';

  @Output() toggleSidebar = new EventEmitter<void>();

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  getModuleIcon(): string {
    const icons = {
      books: 'bi-journal-text',
      crm: 'bi-people',
      compliance: 'bi-shield-check',
      carbon: 'bi-cloud',
      tax: 'bi-calculator',
      statutory: 'bi-journal-bookmark',
      settings: 'bi-gear',
      help: 'bi-question-circle'
    };
    return icons[this.activeSection] || 'bi-grid';
  }

  getModuleTitle(): string {
    const titles = {
      books: 'Books',
      crm: 'CRM',
      compliance: 'Compliance',
      carbon: 'Carbon',
      tax: 'Tax',
      statutory: 'Statutory',
      settings: 'Settings',
      help: 'Help'
    };
    return titles[this.activeSection] || '';
  }
}
