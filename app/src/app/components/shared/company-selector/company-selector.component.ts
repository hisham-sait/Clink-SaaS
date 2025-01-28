import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { CompanyService } from '../../../services/settings/company.service';
import { Company } from '../../../components/settings/settings.types';

@Component({
  selector: 'app-company-selector',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 9999;
    }

    .company-selector {
      background: var(--bs-primary);
      color: white;
      border-radius: 2rem;
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      transition: transform 0.2s;
      min-width: 200px;
      position: relative;
    }

    .company-selector:hover {
      transform: scale(1.05);
    }

    .company-selector-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .company-selector i {
      font-size: 1.25rem;
    }

    .company-name {
      font-size: 0.9rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 150px;
    }

    .company-menu {
      position: absolute;
      bottom: 4.5rem;
      right: 0;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      min-width: 200px;
      max-width: 300px;
      display: none;
      z-index: 9999;
    }

    .company-menu.show {
      display: block;
    }

    .company-menu-header {
      padding: 1rem;
      border-bottom: 1px solid var(--bs-border-color);
    }

    .company-menu-body {
      max-height: 300px;
      overflow-y: auto;
    }

    .company-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .company-item:hover {
      background: var(--bs-light);
    }

    .company-item.active {
      background: var(--bs-primary-bg-subtle);
      color: var(--bs-primary);
    }

    .company-item i {
      font-size: 1rem;
    }

    .loading-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 1rem;
      height: 1rem;
      border: 2px solid #fff;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: translate(-50%, -50%) rotate(360deg);
      }
    }
  `],
  template: `
    <div class="company-selector" (click)="toggleMenu()" *ngIf="companies.length > 0">
      <div class="company-selector-content" [style.opacity]="loading ? '0.5' : '1'">
        <i class="bi bi-building"></i>
        <span class="company-name">{{ currentCompanyName }}</span>
      </div>
      <div class="loading-spinner" *ngIf="loading"></div>
    </div>

    <div class="company-menu" [class.show]="isMenuOpen">
      <div class="company-menu-header">
        <h6 class="mb-0">Select Company</h6>
      </div>
      <div class="company-menu-body">
        <div *ngFor="let company of companies" 
             class="company-item" 
             [class.active]="company.id === selectedCompanyId"
             (click)="selectCompany(company)">
          <i class="bi" [class.bi-check-circle-fill]="company.id === selectedCompanyId" 
             [class.bi-circle]="company.id !== selectedCompanyId"></i>
          <span>{{ company.name }}</span>
        </div>
      </div>
    </div>
  `
})
export class CompanySelectorComponent implements OnInit, OnDestroy {
  companies: Company[] = [];
  selectedCompanyId: string | null = null;
  isMenuOpen = false;
  loading = false;
  private clickListener: ((event: MouseEvent) => void) | null = null;

  constructor(
    private authService: AuthService,
    private companyService: CompanyService
  ) {}

  ngOnInit() {
    // Get current user's company ID
    const user = this.authService.currentUserValue;
    this.selectedCompanyId = user?.companyId || null;

    // Load user's companies
    this.loadCompanies();

    // Close menu when clicking outside
    this.clickListener = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('app-company-selector')) {
        this.isMenuOpen = false;
      }
    };
    document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy() {
    // Clean up click listener
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
    }
  }

  get currentCompanyName(): string {
    const currentCompany = this.companies.find(c => c.id === this.selectedCompanyId);
    return currentCompany?.name || 'Select Company';
  }

  async loadCompanies() {
    try {
      const companies = await firstValueFrom(this.companyService.getAccessibleCompanies());
      this.companies = companies;
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  }

  toggleMenu() {
    if (!this.loading) {
      this.isMenuOpen = !this.isMenuOpen;
    }
  }

  async selectCompany(company: Company) {
    if (this.loading || company.id === this.selectedCompanyId) {
      return;
    }

    try {
      this.loading = true;
      // Update user's company ID
      await this.authService.updateUserCompany(company.id);
      this.selectedCompanyId = company.id;
      this.isMenuOpen = false;

      // Reload the page to refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error selecting company:', error);
      this.loading = false;
    }
  }
}
