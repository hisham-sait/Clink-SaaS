import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TinySidebarComponent } from './components/tiny-sidebar/tiny-sidebar.component';
import { CompanySelectorComponent } from './components/shared/company-selector/company-selector.component';
import { AuthService } from './services/auth/auth.service';
import { Subscription } from 'rxjs';

type SectionType = 'statutory' | 'compliance' | 'tax' | 'settings' | 'help';

interface User {
  name: string;
  email: string;
  avatar: string;
}

@Component({
  selector: 'app-root',
  template: `
    <div [class]="isAuthRoute ? 'min-vh-100 bg-primary bg-gradient d-flex align-items-center justify-content-center py-5' : ''">
      <!-- Auth Container -->
      <div *ngIf="isAuthRoute" class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div class="card border-0 shadow-lg">
              <div class="card-body p-4 p-sm-5">
                <router-outlet></router-outlet>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main App Container -->
      <div *ngIf="!isAuthRoute" class="d-flex min-vh-100">
        <!-- Tiny Sidebar -->
        <app-tiny-sidebar
          *ngIf="isLoggedIn && !isAuthRoute"
          [isDarkMode]="isDarkMode"
          [notificationCount]="notificationCount"
          [userAvatar]="userAvatar"
          [userName]="userName"
          [activeSection]="activeSection"
          (sectionChange)="onSectionChange($event)"
          (themeToggle)="toggleTheme()"
          (notificationsToggle)="toggleNotifications()"
          (userMenuToggle)="toggleUserMenu()"
          (logout)="onLogout()">
        </app-tiny-sidebar>

        <!-- Main Sidebar -->
        <app-sidebar
          *ngIf="isLoggedIn && !isAuthRoute"
          [isExpanded]="isSidebarExpanded"
          [isMobile]="isMobile"
          [activeSection]="activeSection"
          (toggleSidebar)="toggleSidebar()">
        </app-sidebar>

        <!-- Main Content -->
        <div class="flex-grow-1 position-relative" [ngStyle]="{
          'margin-left': isLoggedIn ? (isSidebarExpanded ? '268px' : '88px') : '0',
          'transition': 'margin-left 0.3s ease'
        }">
          <router-outlet></router-outlet>
        </div>

        <!-- User Menu Dropdown -->
        <div *ngIf="isLoggedIn && !isAuthRoute && isUserMenuOpen" 
             class="dropdown-menu show position-fixed" 
             style="top: 1rem; left: 4rem; z-index: 1040;">
          <div class="px-3 py-2 d-flex align-items-center">
            <i [class]="userAvatar + ' fs-4 me-2'"></i>
            <div>
              <div class="fw-medium">{{ userName }}</div>
              <small class="text-muted">{{ user.email }}</small>
            </div>
          </div>
          <hr class="dropdown-divider">
          <a routerLink="/settings" class="dropdown-item" (click)="toggleUserMenu()">
            <i class="bi bi-gear me-2"></i>
            Settings
          </a>
          <a href="javascript:void(0)" class="dropdown-item" (click)="onLogout()">
            <i class="bi bi-box-arrow-right me-2"></i>
            Sign Out
          </a>
        </div>

        <!-- Notifications Panel -->
        <div *ngIf="isLoggedIn && !isAuthRoute && isNotificationsPanelOpen" 
             class="card position-fixed shadow" 
             style="top: 1rem; left: 4rem; width: 320px; z-index: 1040;">
          <div class="card-header d-flex justify-content-between align-items-center py-2">
            <h6 class="mb-0">Notifications</h6>
            <button class="btn btn-sm btn-link p-0" (click)="toggleNotifications()">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="card-body">
            <div *ngIf="!notificationCount" class="text-center text-muted py-4">
              <i class="bi bi-bell-slash fs-4 mb-2"></i>
              <p class="mb-0">No new notifications</p>
            </div>
          </div>
        </div>

        <!-- Company Selector -->
        <app-company-selector *ngIf="isLoggedIn && !isAuthRoute"></app-company-selector>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .dropdown-menu {
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 768px) {
      :host ::ng-deep .main-content {
        margin-left: 40px !important;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgbModule, SidebarComponent, TinySidebarComponent, CompanySelectorComponent]
})
export class AppComponent implements OnInit, OnDestroy {
  // Layout state
  isSidebarExpanded = true;
  isMobile = window.innerWidth <= 768;
  activeSection: SectionType = 'statutory';
  isLoggedIn = false;

  // Theme
  isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // User
  user: User = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'bi bi-person-circle'
  };

  // Notifications
  notificationCount = 3;

  // Dropdowns
  isUserMenuOpen = false;
  isNotificationsPanelOpen = false;

  // Subscriptions
  private authSubscription: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Subscribe to auth changes
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      if (user) {
        this.isLoggedIn = true;
        this.user = {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          avatar: 'bi bi-person-circle'
        };
      } else {
        this.isLoggedIn = false;
        this.user = {
          name: 'Guest',
          email: '',
          avatar: 'bi bi-person-circle'
        };
        // Redirect to login if not on an auth route
        if (!this.isAuthRoute) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isSidebarExpanded = true;
    }
  }

  ngOnInit() {
    this.isSidebarExpanded = !this.isMobile;
    this.initTheme();
    
    // Check if user is already logged in
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Check if current route is an auth route
  get isAuthRoute(): boolean {
    const url = this.router.url;
    // If it's a dashboard route, it's not an auth route
    if (url.includes('/dashboard')) {
      return false;
    }
    // Check for auth-specific routes
    return url.includes('/login') || 
           url.includes('/register') || 
           url.includes('/forgot-password');
  }

  // Getters
  get userName(): string {
    return this.user.name;
  }

  get userAvatar(): string {
    return this.user.avatar;
  }

  // Section handling
  onSectionChange(section: SectionType) {
    this.activeSection = section;
  }

  // Toggle functions
  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark-mode', this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    if (this.isUserMenuOpen) {
      this.isNotificationsPanelOpen = false;
    }
  }

  toggleNotifications() {
    this.isNotificationsPanelOpen = !this.isNotificationsPanelOpen;
    if (this.isNotificationsPanelOpen) {
      this.isUserMenuOpen = false;
    }
  }

  // Auth functions
  onLogout() {
    this.authService.logout();
    if (this.isUserMenuOpen) {
      this.toggleUserMenu();
    }
  }

  // Theme initialization
  private initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    }
    document.documentElement.classList.toggle('dark-mode', this.isDarkMode);
  }

  // Click outside handlers
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Close user menu if clicking outside
    if (!target.closest('.user-menu') && this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }

    // Close notifications panel if clicking outside
    if (!target.closest('.notifications-panel') && 
        !target.closest('[data-notifications]') && 
        this.isNotificationsPanelOpen) {
      this.isNotificationsPanelOpen = false;
    }
  }
}
