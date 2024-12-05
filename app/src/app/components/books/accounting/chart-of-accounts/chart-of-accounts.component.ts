import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AccountCategory {
  id: string;
  name: string;
  type: string;
  accounts: Account[];
  isExpanded?: boolean;
}

interface Account {
  code: string;
  name: string;
  balance: number;
  lastUpdated: string;
}

@Component({
  selector: 'app-chart-of-accounts',
  templateUrl: './chart-of-accounts.component.html',
  styleUrls: ['../../books.shared.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ChartOfAccountsComponent {
  accountCategories: AccountCategory[] = [
    {
      id: '1',
      name: 'Assets',
      type: 'Asset',
      isExpanded: true,
      accounts: [
        {
          code: '1000',
          name: 'Cash and Bank',
          balance: 25430.00,
          lastUpdated: '2024-01-15'
        },
        {
          code: '1100',
          name: 'Accounts Receivable',
          balance: 15750.00,
          lastUpdated: '2024-01-14'
        }
      ]
    },
    {
      id: '2',
      name: 'Liabilities',
      type: 'Liability',
      isExpanded: false,
      accounts: [
        {
          code: '2000',
          name: 'Accounts Payable',
          balance: 15680.00,
          lastUpdated: '2024-01-12'
        }
      ]
    },
    {
      id: '3',
      name: 'Equity',
      type: 'Equity',
      isExpanded: false,
      accounts: [
        {
          code: '3000',
          name: 'Owner\'s Equity',
          balance: 50000.00,
          lastUpdated: '2024-01-10'
        }
      ]
    },
    {
      id: '4',
      name: 'Revenue',
      type: 'Revenue',
      isExpanded: false,
      accounts: [
        {
          code: '4000',
          name: 'Sales Revenue',
          balance: 150750.00,
          lastUpdated: '2024-01-14'
        }
      ]
    },
    {
      id: '5',
      name: 'Expenses',
      type: 'Expense',
      isExpanded: false,
      accounts: [
        {
          code: '5000',
          name: 'Cost of Goods Sold',
          balance: 82900.00,
          lastUpdated: '2024-01-13'
        }
      ]
    }
  ];
}
