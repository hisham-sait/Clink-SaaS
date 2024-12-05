import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'transfer';
  color?: string;
  icon?: string;
  parentId?: string;
  subcategories?: Category[];
}

export interface CategoryRule {
  id: string;
  categoryId: string;
  pattern: string;
  merchantName?: string;
  minAmount?: number;
  maxAmount?: number;
  priority: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Category CRUD operations
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/banking/categories`);
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/banking/categories`, category);
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/banking/categories/${id}`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/banking/categories/${id}`);
  }

  // Category Rules CRUD operations
  getCategoryRules(): Observable<CategoryRule[]> {
    return this.http.get<CategoryRule[]>(`${this.apiUrl}/banking/category-rules`);
  }

  createCategoryRule(rule: Partial<CategoryRule>): Observable<CategoryRule> {
    return this.http.post<CategoryRule>(`${this.apiUrl}/banking/category-rules`, rule);
  }

  updateCategoryRule(id: string, rule: Partial<CategoryRule>): Observable<CategoryRule> {
    return this.http.patch<CategoryRule>(`${this.apiUrl}/banking/category-rules/${id}`, rule);
  }

  deleteCategoryRule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/banking/category-rules/${id}`);
  }

  // Transaction categorization
  categorizeTransaction(transactionId: string, categoryId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/banking/transactions/${transactionId}/categorize`, { categoryId });
  }

  bulkCategorizeTransactions(transactionIds: string[], categoryId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/banking/transactions/bulk-categorize`, { transactionIds, categoryId });
  }

  // Auto-categorization
  applyRulesToTransaction(transactionId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/banking/transactions/${transactionId}/apply-rules`, {});
  }

  applyRulesToAllTransactions(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/banking/transactions/apply-rules-all`, {});
  }

  // Category suggestions
  getSuggestedCategories(transactionId: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/banking/transactions/${transactionId}/suggested-categories`);
  }

  // Category statistics
  getCategorySpending(params: {
    startDate: string;
    endDate: string;
    categoryIds?: string[];
  }): Observable<any> {
    return this.http.get(`${this.apiUrl}/banking/categories/spending`, { params });
  }

  getCategoryTrends(params: {
    startDate: string;
    endDate: string;
    categoryIds?: string[];
    groupBy: 'day' | 'week' | 'month';
  }): Observable<any> {
    return this.http.get(`${this.apiUrl}/banking/categories/trends`, { params });
  }

  // Category management
  mergeCategoriesInto(sourceIds: string[], targetId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/banking/categories/${targetId}/merge`, { sourceIds });
  }

  moveCategoryToParent(categoryId: string, newParentId: string | null): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/banking/categories/${categoryId}/move`, { parentId: newParentId });
  }

  // Category import/export
  importCategories(categories: Category[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/banking/categories/import`, { categories });
  }

  exportCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/banking/categories/export`);
  }

  // Default categories
  resetToDefaultCategories(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/banking/categories/reset-defaults`, {});
  }
}
