import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class CreateInvoiceComponent {
  today = new Date().toISOString().split('T')[0];
  defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  invoiceItems: InvoiceItem[] = [
    {
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    }
  ];

  get subtotal(): number {
    return this.invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  }

  get tax(): number {
    return this.subtotal * 0.1;
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  updateAmount(item: InvoiceItem): void {
    item.amount = item.quantity * item.rate;
  }

  addItem(): void {
    this.invoiceItems.push({
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    });
  }
}
