import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

type SectionType = 'statutory' | 'compliance' | 'tax' | 'settings' | 'help';

interface Section {
  id: SectionType;
  title: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-tiny-sidebar',
  template: `
    <!-- Tiny Nav Panel -->
    <aside class="position-fixed start-0 top-0 bottom-0 bg-light border-end" style="width: 48px;">
      <!-- Top Section -->
      <div class="d-flex flex-column h-100">
        <div class="p-2">
          <ul class="nav flex-column align-items-center m-0 p-0">
            <!-- Home Button -->
            <li class="nav-item mb-1">
              <a class="nav-link d-flex justify-content-center align-items-center rounded p-2" 
                 style="width: 40px; height: 40px;"
                 (click)="navigateToUserDashboard()"
                 title="Home">
                <i class="bi bi-house fs-5"></i>
              </a>
            </li>
            <li class="nav-item mb-1" *ngFor="let section of topSections">
              <a class="nav-link d-flex justify-content-center align-items-center rounded p-2" 
                 style="width: 40px; height: 40px;"
                 [class.active]="activeSection === section.id"
                 (click)="selectSection(section.id)"
                 [routerLink]="[section.route]"
                 routerLinkActive="active"
                 [title]="section.title">
                <i [class]="section.icon + ' fs-5'"></i>
              </a>
            </li>
          </ul>
        </div>

        <!-- Bottom Section -->
        <div class="mt-auto p-2">
          <ul class="nav flex-column align-items-center m-0 p-0">
            <li class="nav-item mb-1">
              <a class="nav-link d-flex justify-content-center align-items-center rounded p-2"
                 style="width: 40px; height: 40px;"
                 (click)="toggleTheme()"
                 title="Toggle Theme">
                <i class="bi fs-5" [class.bi-moon-fill]="!isDarkMode" [class.bi-sun-fill]="isDarkMode"></i>
              </a>
            </li>
            <li class="nav-item mb-1 position-relative">
              <a class="nav-link d-flex justify-content-center align-items-center rounded p-2"
                 style="width: 40px; height: 40px;"
                 (click)="toggleNotifications()"
                 title="Notifications">
                <i class="bi bi-bell fs-5"></i>
                <span class="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger" *ngIf="notificationCount > 0">
                  {{ notificationCount }}
                </span>
              </a>
            </li>
            <li class="nav-item mb-1">
              <a class="nav-link d-flex justify-content-center align-items-center rounded p-2"
                 style="width: 40px; height: 40px;"
                 (click)="toggleUserMenu()"
                 title="Profile">
                <i [class]="userAvatar + ' fs-5'"></i>
              </a>
            </li>
            <li class="nav-item mb-1" *ngFor="let section of bottomSections">
              <a class="nav-link d-flex justify-content-center align-items-center rounded p-2"
                 style="width: 40px; height: 40px;"
                 [class.active]="activeSection === section.id"
                 (click)="selectSection(section.id)"
                 [routerLink]="[section.route]"
                 routerLinkActive="active"
                 [title]="section.title">
                <i [class]="section.icon + ' fs-5'"></i>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link d-flex justify-content-center align-items-center rounded p-2"
                 style="width: 40px; height: 40px;"
                 (click)="onLogout()"
                 title="Logout">
                <i class="bi bi-box-arrow-right fs-5"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      z-index: 1030;
    }

    .nav-link {
      color: var(--bs-secondary);
      transition: all 0.2s;
    }

    .nav-link:hover,
    .nav-link.active {
      color: var(--bs-primary);
      background-color: rgba(var(--bs-primary-rgb), 0.1);
    }

    @media (max-width: 768px) {
      .nav-link {
        width: 32px !important;
        height: 32px !important;
      }
      .nav-link i {
        font-size: 1rem !important;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class TinySidebarComponent implements OnInit {
  @Input() isDarkMode = false;
  @Input() notificationCount = 0;
  @Input() userAvatar = '';
  @Input() userName = '';
  @Input() activeSection: SectionType = 'statutory';

  @Output() sectionChange = new EventEmitter<SectionType>();
  @Output() themeToggle = new EventEmitter<void>();
  @Output() notificationsToggle = new EventEmitter<void>();
  @Output() userMenuToggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  topSections: Section[] = [
    { id: 'statutory', title: 'Statutory', icon: 'bi bi-journal-bookmark', route: '/statutory/dashboard' },
    { id: 'compliance', title: 'Compliance', icon: 'bi bi-shield-check', route: '/compliance/dashboard' },
    { id: 'tax', title: 'Tax', icon: 'bi bi-calculator', route: '/tax/dashboard' }
  ];

  bottomSections: Section[] = [
    { id: 'settings', title: 'Settings', icon: 'bi bi-gear', route: '/settings' },
    { id: 'help', title: 'Help', icon: 'bi bi-question-circle', route: '/help' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  navigateToUserDashboard() {
    const userRole = this.authService.getUserRole();
    if (userRole) {
      this.router.navigate([`/dashboard/${userRole}`]);
    }
  }

  selectSection(section: SectionType) {
    this.sectionChange.emit(section);
    
    // Navigate to the main dashboard of each module
    switch(section) {
      case 'statutory':
      case 'compliance':
      case 'tax':
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

  onLogout() {
    this.logout.emit();
  }
}
