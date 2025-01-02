import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

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

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  shareholder?: Shareholder;
  shareholderIndex: number = -1;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.shareholder = navigation.extras.state['shareholder'] as Shareholder;
    }
  }

  ngOnInit(): void {
    this.shareholderIndex = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.shareholder) {
      const savedShareholders = localStorage.getItem('shareholders');
      if (savedShareholders) {
        const shareholders = JSON.parse(savedShareholders);
        this.shareholder = shareholders[this.shareholderIndex];
      }
    }

    if (!this.shareholder) {
      this.router.navigate(['/statutory/shareholders']);
    }
  }

  getShareholderName(): string {
    if (!this.shareholder) return '';
    
    if (this.shareholder.shareholderType === 'individual') {
      return `${this.shareholder.title} ${this.shareholder.firstName} ${this.shareholder.lastName}`;
    }
    return `Company #${this.shareholder.companyNumber}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB');
  }

  calculateShareValue(): number {
    if (!this.shareholder) return 0;
    return this.shareholder.sharesHeld * this.shareholder.nominalValue;
  }

  goBack(): void {
    this.router.navigate(['/statutory/shareholders']);
  }
}
