import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router, RouterModule } from '@angular/router';
import { CreateShareholderModalComponent } from './create-shareholder-modal/create-shareholder-modal.component';

interface Shareholder {
  shareholderType: 'individual' | 'corporate';
  title?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  companyNumber?: string;
  nationality: string;
  address: string;
  email: string;
  phone: string;
  shareClass: string;
  sharesHeld: number;
  nominalValue: number;
  acquisitionDate: string;
  status: 'active' | 'transferred' | 'deceased';
}

interface Activity {
  type: 'addition' | 'transfer' | 'update' | 'removal';
  description: string;
  user: string;
  time: string;
}

@Component({
  selector: 'app-shareholders',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule, CreateShareholderModalComponent],
  templateUrl: './shareholders.component.html',
  styleUrls: ['./shareholders.component.scss']
})
export class ShareholdersComponent {
  shareholders: Shareholder[] = [];
  recentActivities: Activity[] = [];

  constructor(
    private modalService: NgbModal,
    private router: Router
  ) {
    this.loadData();
  }

  private loadData(): void {
    const savedShareholders = localStorage.getItem('shareholders');
    if (savedShareholders) {
      this.shareholders = JSON.parse(savedShareholders);
    }

    const savedActivities = localStorage.getItem('shareholderActivities');
    if (savedActivities) {
      this.recentActivities = JSON.parse(savedActivities);
    }
  }

  openAddShareholderModal(): void {
    const modalRef = this.modalService.open(CreateShareholderModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (newShareholder: Shareholder) => {
        this.shareholders.push(newShareholder);
        localStorage.setItem('shareholders', JSON.stringify(this.shareholders));

        this.addActivity({
          type: 'addition',
          description: `${this.getShareholderName(newShareholder)} added as shareholder`,
          user: 'System',
          time: new Date().toLocaleString()
        });
      },
      () => {} // Modal dismissed
    );
  }

  removeShareholder(index: number): void {
    const shareholder = this.shareholders[index];
    this.shareholders.splice(index, 1);
    localStorage.setItem('shareholders', JSON.stringify(this.shareholders));

    this.addActivity({
      type: 'removal',
      description: `${this.getShareholderName(shareholder)} removed from shareholders register`,
      user: 'System',
      time: new Date().toLocaleString()
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB');
  }

  getShareholderName(shareholder: Shareholder): string {
    if (shareholder.shareholderType === 'individual') {
      return `${shareholder.title} ${shareholder.firstName} ${shareholder.lastName}`;
    }
    return `Company #${shareholder.companyNumber}`;
  }

  getTotalShareholdersCount(): number {
    return this.shareholders.filter(s => s.status === 'active').length;
  }

  getIndividualShareholdersCount(): number {
    return this.shareholders.filter(s => 
      s.status === 'active' && s.shareholderType === 'individual'
    ).length;
  }

  getCorporateShareholdersCount(): number {
    return this.shareholders.filter(s => 
      s.status === 'active' && s.shareholderType === 'corporate'
    ).length;
  }

  getTotalShares(): number {
    return this.shareholders.reduce((total, s) => total + s.sharesHeld, 0);
  }

  getTotalShareValue(): number {
    return this.shareholders.reduce((total, s) => 
      total + (s.sharesHeld * s.nominalValue), 0);
  }

  calculateSharePercentage(sharesHeld: number): string {
    const totalShares = this.getTotalShares();
    if (totalShares === 0) return '0%';
    return `${((sharesHeld / totalShares) * 100).toFixed(2)}%`;
  }

  viewShareholderDetails(shareholder: Shareholder, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const index = this.shareholders.indexOf(shareholder);
    this.router.navigate(['statutory', 'shareholders', index], { state: { shareholder } });
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'addition':
        return 'bi bi-person-plus';
      case 'transfer':
        return 'bi bi-arrow-left-right';
      case 'update':
        return 'bi bi-pencil';
      case 'removal':
        return 'bi bi-trash';
      default:
        return 'bi bi-activity';
    }
  }

  private addActivity(activity: Activity): void {
    this.recentActivities.unshift(activity);
    if (this.recentActivities.length > 10) {
      this.recentActivities.pop();
    }
    localStorage.setItem('shareholderActivities', JSON.stringify(this.recentActivities));
  }
}
