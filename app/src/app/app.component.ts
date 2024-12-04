import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from './components/sidebar/sidebar.component';

interface User {
  name: string;
  email: string;
  avatar: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent]
})
export class AppComponent implements OnInit {
  // Layout state
  isSidebarExpanded = true;
  isMobile = window.innerWidth <= 768;

  // Search
  searchQuery = '';
  isSearchActive = false;

  // Theme
  isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // User
  user: User = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'assets/images/avatar.png'
  };

  // Notifications
  notificationCount = 3;

  // Dropdowns
  isUserMenuOpen = false;
  isNotificationsPanelOpen = false;

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
  }

  // Getters
  get userName(): string {
    return this.user.name;
  }

  get userAvatar(): string {
    return this.user.avatar;
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

  // Search functions
  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    console.log('Searching for:', value);
    // Implement search functionality
  }

  clearSearch() {
    this.searchQuery = '';
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
