import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AccountingComponent } from './components/accounting/accounting.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { PayrollComponent } from './components/payroll/payroll.component';
import { ExpensesComponent } from './components/expenses/expenses.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { BankingComponent } from './components/banking/banking.component';
import { InvoicingComponent } from './components/invoicing/invoicing.component';
import { BillsComponent } from './components/bills/bills.component';
import { FilesComponent } from './components/files/files.component';
import { ContactsComponent } from './components/contacts/contacts.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'accounting', component: AccountingComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'payroll', component: PayrollComponent },
  { path: 'expenses', component: ExpensesComponent },
  { path: 'reports', component: AnalyticsComponent },
  { path: 'banking', component: BankingComponent },
  { path: 'invoicing', component: InvoicingComponent },
  { path: 'bills', component: BillsComponent },
  { path: 'files', component: FilesComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: '**', redirectTo: 'dashboard' } // Fallback route
];
