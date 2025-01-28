import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ComplianceSidebarComponent } from '../compliance/compliance-sidebar.component';
import { TaxSidebarComponent } from '../tax/tax-sidebar/tax-sidebar.component';
import { SettingsSidebarComponent } from '../settings/settings-sidebar.component';
import { HelpSidebarComponent } from '../help/help-sidebar/help-sidebar.component';
import { StatutorySidebarComponent } from '../statutory/statutory-sidebar.component';
import { AuthService } from '../../services/auth/auth.service';
import { CompanyService } from '../../services/settings/company.service';
import { firstValueFrom } from 'rxjs';

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
           'z-index': 'var(--z-index-fixed)'
         }">
      <!-- Header -->
      <div class="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
        <div class="d-flex align-items-center" *ngIf="isExpanded">
          <i [class]="'bi fs-5 me-2 ' + getModuleIcon()"></i>
          <span class="small">{{ companyName || getModuleTitle() }}</span>
        </div>
        <button class="btn btn-link btn-sm p-0 text-body-secondary" 
                [class.ms-auto]="!isExpanded"
                (click)="onToggleSidebar()">
          <i class="bi" [class.bi-chevron-left]="isExpanded" [class.bi-chevron-right]="!isExpanded"></i>
        </button>
      </div>

      <!-- Module-specific Sidebar -->
      <div class="h-100 overflow-auto" style="scrollbar-width: thin;">
        <ng-container [ngSwitch]="activeSection">
          <app-statutory-sidebar *ngSwitchCase="'statutory'" [isExpanded]="isExpanded"></app-statutory-sidebar>
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
export class SidebarComponent implements OnInit {
  @Input() isExpanded = true;
  @Input() isMobile = false;
  @Input() activeSection: SectionType = 'statutory';

  @Output() toggleSidebar = new EventEmitter<void>();

  companyName: string | null = null;

  private readonly moduleConfigs: Record<SectionType, ModuleConfig> = {
    statutory: { icon: 'bi-journal-bookmark', title: 'Statutory' },
    compliance: { icon: 'bi-shield-check', title: 'Compliance' },
    tax: { icon: 'bi-calculator', title: 'Tax' },
    settings: { icon: 'bi-gear', title: 'Settings' },
    help: { icon: 'bi-question-circle', title: 'Help' }
  };

  constructor(
    private authService: AuthService,
    private companyService: CompanyService
  ) {}

  async ngOnInit() {
    const user = this.authService.currentUserValue;
    if (user?.companyId) {
      try {
        const company = await firstValueFrom(this.companyService.getCompany(user.companyId));
        this.companyName = company.name;
      } catch (error) {
        console.error('Error loading company:', error);
      }
    }
  }

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
