import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface ShareClass {
  name: string;
  nominalValue: number;
  totalShares: number;
  votingRights: boolean;
  dividendRights: boolean;
}

interface ShareTransfer {
  date: string;
  shareClass: string;
  transferor: string;
  transferee: string;
  numberOfShares: number;
  consideration: number;
  certificateNumber: string;
}

@Component({
  selector: 'app-shares',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shares.component.html',
  styleUrls: ['./shares.component.scss']
})
export class SharesComponent implements OnInit {
  shareClassForm: FormGroup;
  transferForm: FormGroup;
  shareClasses: ShareClass[] = [];
  transfers: ShareTransfer[] = [];

  constructor(private fb: FormBuilder) {
    this.shareClassForm = this.fb.group({
      name: ['', Validators.required],
      nominalValue: ['', [Validators.required, Validators.min(0.01)]],
      totalShares: ['', [Validators.required, Validators.min(1)]],
      votingRights: [false],
      dividendRights: [false]
    });

    this.transferForm = this.fb.group({
      date: ['', Validators.required],
      shareClass: ['', Validators.required],
      transferor: ['', Validators.required],
      transferee: ['', Validators.required],
      numberOfShares: ['', [Validators.required, Validators.min(1)]],
      consideration: ['', [Validators.required, Validators.min(0)]],
      certificateNumber: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load any saved data from storage
    const savedShareClasses = localStorage.getItem('shareClasses');
    const savedTransfers = localStorage.getItem('shareTransfers');

    if (savedShareClasses) {
      this.shareClasses = JSON.parse(savedShareClasses);
    }

    if (savedTransfers) {
      this.transfers = JSON.parse(savedTransfers);
    }
  }

  onShareClassSubmit(): void {
    if (this.shareClassForm.valid) {
      this.shareClasses.push(this.shareClassForm.value);
      this.shareClassForm.reset({
        votingRights: false,
        dividendRights: false
      });
      localStorage.setItem('shareClasses', JSON.stringify(this.shareClasses));
    }
  }

  onTransferSubmit(): void {
    if (this.transferForm.valid) {
      this.transfers.push(this.transferForm.value);
      this.transferForm.reset();
      localStorage.setItem('shareTransfers', JSON.stringify(this.transfers));
    }
  }

  removeShareClass(index: number): void {
    this.shareClasses.splice(index, 1);
    localStorage.setItem('shareClasses', JSON.stringify(this.shareClasses));
  }

  removeTransfer(index: number): void {
    this.transfers.splice(index, 1);
    localStorage.setItem('shareTransfers', JSON.stringify(this.transfers));
  }

  calculateTotalShareCapital(): number {
    return this.shareClasses.reduce((total, shareClass) => 
      total + (shareClass.nominalValue * shareClass.totalShares), 0);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(value);
  }
}
