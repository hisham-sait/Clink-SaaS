import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-help-sidebar',
  templateUrl: './help-sidebar.component.html',
  styleUrls: ['./help-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HelpSidebarComponent {
  navItems = [
    {
      path: '/help/documentation',
      icon: 'bi-book',
      label: 'Documentation'
    },
    {
      path: '/help/tutorials',
      icon: 'bi-play-circle',
      label: 'Tutorials'
    },
    {
      path: '/help/faqs',
      icon: 'bi-question-circle',
      label: 'FAQs'
    },
    {
      path: '/help/support',
      icon: 'bi-headset',
      label: 'Support'
    },
    {
      path: '/help/community',
      icon: 'bi-people',
      label: 'Community'
    },
    {
      path: '/help/updates',
      icon: 'bi-bell',
      label: 'Updates'
    }
  ];
}
