import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cms-hub',
  templateUrl: './cms.component.html',
  styleUrls: ['./cms.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CmsHubComponent {
  cmsMetrics = [
    {
      title: 'Total Pages',
      value: '156',
      trend: 'up',
      change: '+12',
      icon: 'bi bi-window'
    },
    {
      title: 'Blog Posts',
      value: '285',
      trend: 'up',
      change: '+24',
      icon: 'bi bi-pencil-square'
    },
    {
      title: 'Monthly Traffic',
      value: '45.2K',
      trend: 'up',
      change: '+15.8%',
      icon: 'bi bi-graph-up'
    },
    {
      title: 'Conversion Rate',
      value: '3.8%',
      trend: 'up',
      change: '+0.5%',
      icon: 'bi bi-arrow-down-up'
    }
  ];

  recentPages = [
    {
      title: 'Product Features',
      type: 'Landing Page',
      status: 'Published',
      views: 2500,
      conversions: 125,
      lastUpdated: '2024-01-15T10:30:00'
    },
    {
      title: 'About Us',
      type: 'Website Page',
      status: 'Published',
      views: 1850,
      conversions: 0,
      lastUpdated: '2024-01-14T15:45:00'
    },
    {
      title: 'Spring Sale Campaign',
      type: 'Landing Page',
      status: 'Draft',
      views: 0,
      conversions: 0,
      lastUpdated: '2024-01-14T09:15:00'
    },
    {
      title: 'Contact Us',
      type: 'Website Page',
      status: 'Published',
      views: 950,
      conversions: 45,
      lastUpdated: '2024-01-13T16:20:00'
    }
  ];

  recentPosts = [
    {
      title: '10 Tips for Better Productivity',
      author: 'Sarah Johnson',
      status: 'Published',
      views: 1250,
      comments: 24,
      publishDate: '2024-01-15'
    },
    {
      title: 'Industry Trends 2024',
      author: 'John Smith',
      status: 'Draft',
      views: 0,
      comments: 0,
      publishDate: null
    },
    {
      title: 'Customer Success Story: ABC Corp',
      author: 'Mike Brown',
      status: 'Published',
      views: 850,
      comments: 12,
      publishDate: '2024-01-14'
    },
    {
      title: 'New Feature Announcement',
      author: 'Emily Davis',
      status: 'Scheduled',
      views: 0,
      comments: 0,
      publishDate: '2024-01-16'
    }
  ];

  cmsTools = [
    {
      title: 'Page Builder',
      description: 'Create and edit website pages',
      icon: 'bi bi-window',
      route: '/crm/cms/pages',
      stats: {
        label: 'Active Pages',
        value: '156'
      }
    },
    {
      title: 'Blog',
      description: 'Manage your blog content',
      icon: 'bi bi-pencil-square',
      route: '/crm/cms/blog',
      stats: {
        label: 'Published Posts',
        value: '285'
      }
    },
    {
      title: 'Themes',
      description: 'Customize website appearance',
      icon: 'bi bi-palette',
      route: '/crm/cms/themes',
      stats: {
        label: 'Active Theme',
        value: 'Modern'
      }
    },
    {
      title: 'Forms',
      description: 'Create and manage forms',
      icon: 'bi bi-ui-checks',
      route: '/crm/cms/forms',
      stats: {
        label: 'Total Forms',
        value: '24'
      }
    }
  ];

  recentActivity = [
    {
      type: 'page',
      description: 'Product Features page updated',
      time: '2 hours ago',
      user: 'Sarah Johnson'
    },
    {
      type: 'post',
      description: 'New blog post published: Industry Trends 2024',
      time: '4 hours ago',
      user: 'John Smith'
    },
    {
      type: 'theme',
      description: 'Website theme customization saved',
      time: '1 day ago',
      user: 'Mike Brown'
    },
    {
      type: 'form',
      description: 'Contact form updated with new fields',
      time: '1 day ago',
      user: 'Emily Davis'
    }
  ];

  getStatusClass(status: string): string {
    const classes = {
      'Published': 'published',
      'Draft': 'draft',
      'Scheduled': 'scheduled'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getActivityIcon(type: string): string {
    const icons = {
      'page': 'bi bi-window',
      'post': 'bi bi-pencil-square',
      'theme': 'bi bi-palette',
      'form': 'bi bi-ui-checks'
    };
    return icons[type as keyof typeof icons] || 'bi bi-circle';
  }
}
