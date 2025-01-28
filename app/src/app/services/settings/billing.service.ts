import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BillingDetails, PaymentMethod, Invoice, Payment, Plan } from '../../components/settings/settings.types';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  // Billing Details
  getBillingDetails(companyId: string): Observable<BillingDetails> {
    return this.http.get<BillingDetails>(`${this.apiUrl}/billing/${companyId}`);
  }

  updateBillingDetails(companyId: string, details: Partial<BillingDetails>): Observable<BillingDetails> {
    return this.http.put<BillingDetails>(`${this.apiUrl}/billing/${companyId}`, details);
  }

  // Payment Methods
  getPaymentMethods(companyId: string): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/billing/${companyId}/payment-methods`);
  }

  addPaymentMethod(companyId: string, method: Partial<PaymentMethod>): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(`${this.apiUrl}/billing/${companyId}/payment-methods`, method);
  }

  updatePaymentMethod(companyId: string, methodId: string, method: Partial<PaymentMethod>): Observable<PaymentMethod> {
    return this.http.put<PaymentMethod>(`${this.apiUrl}/billing/${companyId}/payment-methods/${methodId}`, method);
  }

  deletePaymentMethod(companyId: string, methodId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/billing/${companyId}/payment-methods/${methodId}`);
  }

  setDefaultPaymentMethod(companyId: string, methodId: string): Observable<PaymentMethod> {
    return this.http.put<PaymentMethod>(`${this.apiUrl}/billing/${companyId}/payment-methods/${methodId}/default`, {});
  }

  // Invoices
  getInvoices(companyId: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/billing/${companyId}/invoices`);
  }

  getInvoice(companyId: string, invoiceId: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/billing/${companyId}/invoices/${invoiceId}`);
  }

  createInvoice(companyId: string, invoice: Partial<Invoice>): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/billing/${companyId}/invoices`, invoice);
  }

  updateInvoice(companyId: string, invoiceId: string, invoice: Partial<Invoice>): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/billing/${companyId}/invoices/${invoiceId}`, invoice);
  }

  deleteInvoice(companyId: string, invoiceId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/billing/${companyId}/invoices/${invoiceId}`);
  }

  // Payments
  getPayments(companyId: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/billing/${companyId}/payments`);
  }

  getPayment(companyId: string, paymentId: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/billing/${companyId}/payments/${paymentId}`);
  }

  createPayment(companyId: string, invoiceId: string, payment: Partial<Payment>): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/billing/${companyId}/invoices/${invoiceId}/payments`, payment);
  }

  // Platform Admin Operations
  getAllInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/billing/invoices`);
  }

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/billing/payments`);
  }

  generateInvoiceNumber(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/billing/generate-invoice-number`);
  }

  // Plan Operations
  getCurrentPlan(companyId: string): Observable<Plan> {
    return this.http.get<Plan>(`${this.apiUrl}/billing/${companyId}/plan`);
  }

  changePlan(companyId: string, planId: string): Observable<Plan> {
    return this.http.post<Plan>(`${this.apiUrl}/billing/${companyId}/plan`, { planId });
  }
}
