import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ComplianceSidebarComponent } from '../compliance/compliance-sidebar/compliance-sidebar.component';
import { TaxSidebarComponent } from '../tax/tax-sidebar/tax-sidebar.component';
import { SettingsSidebarComponent } from '../settings/settings-sidebar.component';
import { HelpSidebarComponent } from '../help/help-sidebar/help-sidebar.component';
import { StatutorySidebarComponent } from '../statutory/statutory-sidebar.component';

type SectionType = 'statutory' | 'compliance' | 'tax' | 'settings' | 'help';

interface ModuleConfig {
  icon: string;
  title: string;
}

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="position-fixed h-100 bg-light border-end overflow-hidden"
         [class.translate-middle-x]="!isExpanded && isMobile"
         [ngStyle]="{
           'left': '48px',
           'width': isExpanded ? '220px' : '40px',
           'transition': 'width 0.3s ease, transform 0.3s ease',
           'z-index': 1000
         }">
      <!-- Header with toggle -->
      <div class="d-flex align-items-center justify-content-between border-bottom px-2" style="height: 48px;">
        <div class="d-flex align-items-center gap-3 overflow-hidden">
          <i [class]="'bi ' + getModuleIcon() + ' fs-5 text-secondary'" style="min-width: 24px;"></i>
          <span class="fw-medium text-body" *ngIf="isExpanded" style="font-size: 14px; white-space: nowrap;">
            {{ getModuleTitle() }}
          </span>
        </div>
        <button class="btn btn-link btn-sm p-1 text-secondary border-0"
                style="width: 24px; height: 24px;"
                (click)="onToggleSidebar()">
          <i class="bi" [class.bi-chevron-left]="isExpanded" [class.bi-chevron-right]="!isExpanded"></i>
        </button>
      </div>

      <!-- Module-specific Sidebar -->
      <div class="h-100 overflow-auto" style="scrollbar-width: thin;">
        <ng-container [ngSwitch]="activeSection">
          <app-statutory-sidebar *ngSwitchCase="'statutory'"></app-statutory-sidebar>
          <app-compliance-sidebar *ngSwitchCase="'compliance'"></app-compliance-sidebar>
          <app-tax-sidebar *ngSwitchCase="'tax'"></app-tax-sidebar>
          <app-settings-sidebar *ngSwitchCase="'settings'"></app-settings-sidebar>
          <app-help-sidebar *ngSwitchCase="'help'"></app-help-sidebar>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .overflow-auto::-webkit-scrollbar {
      width: 4px;
    }

    .overflow-auto::-webkit-scrollbar-track {
      background: var(--bs-gray-100);
    }

    .overflow-auto::-webkit-scrollbar-thumb {
      background: var(--bs-gray-300);
      border-radius: 2px;
    }

    .overflow-auto::-webkit-scrollbar-thumb:hover {
      background: var(--bs-gray-400);
    }

    @media (max-width: 768px) {
      :host {
        left: 40px;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatutorySidebarComponent,
    ComplianceSidebarComponent,
    TaxSidebarComponent,
    SettingsSidebarComponent,
    HelpSidebarComponent
  ]
})
export class SidebarComponent {
  @Input() isExpanded = true;
  @Input() isMobile = false;
  @Input() activeSection: SectionType = 'statutory';

  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly moduleConfigs: Record<SectionType, ModuleConfig> = {
    statutory: { icon: 'bi-journal-bookmark', title: 'Statutory' },
    compliance: { icon: 'bi-shield-check', title: 'Compliance' },
    tax: { icon: 'bi-calculator', title: 'Tax' },
    settings: { icon: 'bi-gear', title: 'Settings' },
    help: { icon: 'bi-question-circle', title: 'Help' }
  };

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  getModuleIcon(): string {
    return this.moduleConfigs[this.activeSection]?.icon || 'bi-grid';
  }

  getModuleTitle(): string {
    return this.moduleConfigs[this.activeSection]?.title || '';
  }
}
