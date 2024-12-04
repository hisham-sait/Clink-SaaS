import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class FilesComponent {
  fileMetrics = [
    {
      title: 'Total Files',
      value: '458',
      trend: 'up',
      change: '+24',
      icon: 'bi bi-files'
    },
    {
      title: 'Storage Used',
      value: '2.8 GB',
      trend: 'up',
      change: '+0.3 GB',
      icon: 'bi bi-hdd'
    },
    {
      title: 'Shared Files',
      value: '85',
      trend: 'up',
      change: '+12',
      icon: 'bi bi-share'
    },
    {
      title: 'Recent Activity',
      value: '24',
      trend: 'neutral',
      icon: 'bi bi-clock-history'
    }
  ];

  recentFiles = [
    {
      name: 'Q4 Financial Report.pdf',
      type: 'PDF',
      size: '2.5 MB',
      modified: '2024-01-15',
      modifiedBy: 'John Smith',
      category: 'Financial'
    },
    {
      name: 'Employee Handbook 2024.docx',
      type: 'Word',
      size: '1.8 MB',
      modified: '2024-01-14',
      modifiedBy: 'Sarah Johnson',
      category: 'HR'
    },
    {
      name: 'Marketing Plan 2024.pptx',
      type: 'PowerPoint',
      size: '4.2 MB',
      modified: '2024-01-13',
      modifiedBy: 'Mike Brown',
      category: 'Marketing'
    },
    {
      name: 'Client Contracts.zip',
      type: 'Archive',
      size: '8.5 MB',
      modified: '2024-01-12',
      modifiedBy: 'Emily Davis',
      category: 'Legal'
    }
  ];

  folders = [
    {
      name: 'Financial Documents',
      files: 125,
      size: '450 MB',
      lastModified: '2024-01-15',
      shared: true
    },
    {
      name: 'HR Documents',
      files: 85,
      size: '280 MB',
      lastModified: '2024-01-14',
      shared: true
    },
    {
      name: 'Marketing Materials',
      files: 95,
      size: '850 MB',
      lastModified: '2024-01-13',
      shared: false
    },
    {
      name: 'Legal Documents',
      files: 45,
      size: '180 MB',
      lastModified: '2024-01-12',
      shared: true
    }
  ];

  recentActivity = [
    {
      type: 'upload',
      description: 'Uploaded Q4 Financial Report.pdf',
      user: 'John Smith',
      time: '2 hours ago'
    },
    {
      type: 'share',
      description: 'Shared Employee Handbook with HR team',
      user: 'Sarah Johnson',
      time: '4 hours ago'
    },
    {
      type: 'edit',
      description: 'Modified Marketing Plan 2024.pptx',
      user: 'Mike Brown',
      time: '1 day ago'
    },
    {
      type: 'delete',
      description: 'Deleted outdated contracts',
      user: 'Emily Davis',
      time: '1 day ago'
    }
  ];

  quickActions = [
    {
      title: 'Upload Files',
      icon: 'bi bi-cloud-upload',
      action: 'upload'
    },
    {
      title: 'New Folder',
      icon: 'bi bi-folder-plus',
      action: 'folder'
    },
    {
      title: 'Share Files',
      icon: 'bi bi-share',
      action: 'share'
    },
    {
      title: 'Scan Document',
      icon: 'bi bi-camera',
      action: 'scan'
    }
  ];

  getFileIcon(type: string): string {
    const icons = {
      'PDF': 'bi bi-file-pdf',
      'Word': 'bi bi-file-word',
      'PowerPoint': 'bi bi-file-ppt',
      'Excel': 'bi bi-file-excel',
      'Archive': 'bi bi-file-zip',
      'Image': 'bi bi-file-image'
    };
    return icons[type as keyof typeof icons] || 'bi bi-file-text';
  }

  getActivityIcon(type: string): string {
    const icons = {
      'upload': 'bi bi-cloud-upload',
      'share': 'bi bi-share',
      'edit': 'bi bi-pencil',
      'delete': 'bi bi-trash'
    };
    return icons[type as keyof typeof icons] || 'bi bi-circle';
  }
}
